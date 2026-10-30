"""
WiseHaven Backend Test Suite
============================

Tests cover:
  1.  Health / DB readiness
  2.  Auth enforcement (missing / invalid tokens)
  3.  User provisioning (idempotent get-or-create)
  4.  Wallet initialisation and retrieval
  5.  Simulated deposit – success, validation, idempotency
  6.  Envelope CRUD
  7.  Cross-user access rejection (ownership enforcement)
  8.  Temporal lock creation and lock enforcement
  9.  Disbursement – success, locked rejection, insufficient balance
 10.  Transaction ledger consistency
 11.  Payee CRUD
 12.  Allocation plan CRUD and activation

All tests use isolated Clerk-ID prefixes per test run and clean up after
themselves. Fixtures are function-scoped to avoid event-loop conflicts.

Run:
    cd backend/wisehaven_backend
    source venv/bin/activate
    pytest tests/test_api.py -v
"""

import uuid
from decimal import Decimal
from datetime import datetime, timezone, timedelta

import pytest
import jwt as pyjwt

# ─── Helpers ─────────────────────────────────────────────────────────────────

RUN_ID = uuid.uuid4().hex[:8]


def uid(tag: str) -> str:
    """Unique Clerk-style test user ID."""
    return f"test_{RUN_ID}_{tag}"


def make_token(clerk_id: str) -> str:
    """Build a minimal unsigned JWT accepted by our fallback decoder."""
    payload = {
        "sub": clerk_id,
        "sid": f"sess_{clerk_id}",
        "exp": int((datetime.now(timezone.utc) + timedelta(hours=1)).timestamp()),
        "iat": int(datetime.now(timezone.utc).timestamp()),
        "iss": "https://clerk.wisehaven.test",
    }
    return pyjwt.encode(payload, "test-secret", algorithm="HS256")


def auth(clerk_id: str) -> dict:
    return {"Authorization": f"Bearer {make_token(clerk_id)}"}


# ─── 1. Health ────────────────────────────────────────────────────────────────

async def test_health(client):
    r = await client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "healthy"


async def test_root_has_version(client):
    r = await client.get("/")
    assert r.status_code == 200
    assert "version" in r.json()


# ─── 2. Auth enforcement ─────────────────────────────────────────────────────

async def test_wallet_requires_auth(client):
    r = await client.get("/wallet/")
    assert r.status_code == 403


async def test_wallet_rejects_bad_token(client):
    r = await client.get("/wallet/", headers={"Authorization": "Bearer not.a.jwt"})
    assert r.status_code == 401


async def test_envelopes_requires_auth(client):
    r = await client.get("/envelopes")
    assert r.status_code == 403


# ─── 3. User provisioning ────────────────────────────────────────────────────

async def test_first_request_creates_wallet(client):
    u = uid("prov1")
    r = await client.get("/wallet/", headers=auth(u))
    assert r.status_code == 200
    data = r.json()
    assert data["user_id"] == u
    assert Decimal(str(data["balance"])) == Decimal("0")


async def test_provisioning_is_idempotent(client):
    u = uid("prov2")
    r1 = await client.get("/wallet/", headers=auth(u))
    r2 = await client.get("/wallet/", headers=auth(u))
    assert r1.status_code == r2.status_code == 200
    assert r1.json()["id"] == r2.json()["id"]


async def test_emergency_vault_created_on_first_request(client):
    u = uid("vaultauto")
    await client.get("/wallet/", headers=auth(u))
    r = await client.get("/envelopes", headers=auth(u))
    assert r.status_code == 200
    vaults = [e for e in r.json()["envelopes"] if e["is_emergency_vault"]]
    assert len(vaults) == 1


# ─── 4. Wallet ───────────────────────────────────────────────────────────────

async def test_wallet_fields(client):
    u = uid("wfields")
    r = await client.get("/wallet/", headers=auth(u))
    assert r.status_code == 200
    for field in ("id", "user_id", "balance", "total_deposited", "total_allocated", "version"):
        assert field in r.json()


async def test_balance_endpoint(client):
    u = uid("wbal")
    await client.get("/wallet/", headers=auth(u))
    r = await client.get("/wallet/balance", headers=auth(u))
    assert r.status_code == 200
    assert "balance" in r.json()


# ─── 5. Simulated deposit ────────────────────────────────────────────────────

async def test_deposit_credits_wallet(client):
    u = uid("dep1")
    await client.get("/wallet/", headers=auth(u))
    r = await client.post(
        "/wallet/deposit",
        json={"amount": "50000.00", "description": "Test deposit"},
        headers=auth(u),
    )
    assert r.status_code == 200
    data = r.json()
    assert data["success"] is True
    assert Decimal(str(data["wallet"]["balance"])) == Decimal("50000.00")
    assert Decimal(str(data["wallet"]["total_deposited"])) == Decimal("50000.00")


async def test_deposit_rejects_zero(client):
    u = uid("dep2")
    await client.get("/wallet/", headers=auth(u))
    r = await client.post(
        "/wallet/deposit",
        json={"amount": "0", "description": "Bad"},
        headers=auth(u),
    )
    assert r.status_code == 422


async def test_deposit_rejects_negative(client):
    u = uid("dep3")
    await client.get("/wallet/", headers=auth(u))
    r = await client.post(
        "/wallet/deposit",
        json={"amount": "-100", "description": "Bad"},
        headers=auth(u),
    )
    assert r.status_code == 422


async def test_deposit_idempotency(client):
    u = uid("depidem")
    await client.get("/wallet/", headers=auth(u))
    key = f"idem-{uuid.uuid4().hex}"
    payload = {"amount": "10000.00", "description": "Idem", "idempotency_key": key}
    r1 = await client.post("/wallet/deposit", json=payload, headers=auth(u))
    r2 = await client.post("/wallet/deposit", json=payload, headers=auth(u))
    assert r1.status_code == r2.status_code == 200
    # Same transaction ID — second request was deduplicated
    assert r1.json()["transaction_id"] == r2.json()["transaction_id"]
    # Balance only increased once
    bal = (await client.get("/wallet/balance", headers=auth(u))).json()
    assert Decimal(str(bal["balance"])) == Decimal("10000.00")


# ─── 6. Envelopes ────────────────────────────────────────────────────────────

async def test_create_envelope(client):
    u = uid("env1")
    await client.get("/wallet/", headers=auth(u))
    r = await client.post(
        "/envelopes",
        json={"name": "Test Rent", "category": "Rent"},
        headers=auth(u),
    )
    assert r.status_code == 201
    assert r.json()["name"] == "Test Rent"
    assert r.json()["is_emergency_vault"] is False


async def test_create_envelope_frontend_category_key(client):
    u = uid("envcat")
    await client.get("/wallet/", headers=auth(u))
    r = await client.post(
        "/envelopes",
        json={"name": "Shelter Env", "category": "shelter"},
        headers=auth(u),
    )
    assert r.status_code == 201
    assert r.json()["category"] == "Rent"  # mapped from frontend key


async def test_list_envelopes_includes_vault(client):
    u = uid("envlist")
    await client.get("/wallet/", headers=auth(u))
    r = await client.get("/envelopes", headers=auth(u))
    assert r.status_code == 200
    assert len(r.json()["envelopes"]) >= 1


async def test_get_envelope_by_id(client):
    u = uid("envget")
    await client.get("/wallet/", headers=auth(u))
    env_id = (await client.get("/envelopes", headers=auth(u))).json()["envelopes"][0]["id"]
    r = await client.get(f"/envelopes/{env_id}", headers=auth(u))
    assert r.status_code == 200
    assert r.json()["id"] == env_id


async def test_get_nonexistent_envelope_404(client):
    u = uid("env404")
    await client.get("/wallet/", headers=auth(u))
    r = await client.get(f"/envelopes/{uuid.uuid4()}", headers=auth(u))
    assert r.status_code == 404


# ─── 7. Ownership enforcement ────────────────────────────────────────────────

async def test_cross_user_envelope_rejected(client):
    ua = uid("own_a")
    ub = uid("own_b")
    await client.get("/wallet/", headers=auth(ua))
    await client.get("/wallet/", headers=auth(ub))
    r = await client.post(
        "/envelopes", json={"name": "A Env", "category": "Food"}, headers=auth(ua)
    )
    env_id = r.json()["id"]
    rb = await client.get(f"/envelopes/{env_id}", headers=auth(ub))
    assert rb.status_code == 404


async def test_cross_user_wallet_isolated(client):
    ua = uid("walown_a")
    ub = uid("walown_b")
    await client.get("/wallet/", headers=auth(ua))
    await client.get("/wallet/", headers=auth(ub))
    ra = await client.get("/wallet/balance", headers=auth(ua))
    rb = await client.get("/wallet/balance", headers=auth(ub))
    assert ra.json()["user_id"] == ua
    assert rb.json()["user_id"] == ub


# ─── 8. Temporal locks ───────────────────────────────────────────────────────

async def test_create_lock(client):
    u = uid("lock1")
    await client.get("/wallet/", headers=auth(u))
    env_id = (
        await client.post("/envelopes", json={"name": "Lock Env", "category": "Rent"}, headers=auth(u))
    ).json()["id"]
    maturity = (datetime.now(timezone.utc) + timedelta(days=30)).isoformat()
    r = await client.post(
        f"/envelopes/{env_id}/lock",
        json={"maturity_timestamp": maturity},
        headers=auth(u),
    )
    assert r.status_code == 201
    assert r.json()["status"] == "LOCKED"


async def test_lock_rejects_past_timestamp(client):
    u = uid("lockpast")
    await client.get("/wallet/", headers=auth(u))
    env_id = (
        await client.post("/envelopes", json={"name": "Past Env", "category": "Food"}, headers=auth(u))
    ).json()["id"]
    past = (datetime.now(timezone.utc) - timedelta(hours=1)).isoformat()
    r = await client.post(
        f"/envelopes/{env_id}/lock",
        json={"maturity_timestamp": past},
        headers=auth(u),
    )
    assert r.status_code == 422


# ─── 9. Disbursements ────────────────────────────────────────────────────────

async def _fund_envelope(client, u: str, locked: bool = False, db=None) -> str:
    """Create user, wallet, envelope, set balance to 50000, optionally lock."""
    await client.get("/wallet/", headers=auth(u))
    env_id = (
        await client.post("/envelopes", json={"name": "Disb Env", "category": "Food"}, headers=auth(u))
    ).json()["id"]
    # Set balance directly in DB
    from models import db as prisma_db
    await prisma_db.envelope.update(
        where={"id": env_id}, data={"balance": Decimal("50000.00")}
    )
    if locked:
        maturity = (datetime.now(timezone.utc) + timedelta(days=30)).isoformat()
        await client.post(
            f"/envelopes/{env_id}/lock",
            json={"maturity_timestamp": maturity},
            headers=auth(u),
        )
    return env_id


async def test_disburse_unlocked_succeeds(client):
    u = uid("disbok")
    env_id = await _fund_envelope(client, u, locked=False)
    r = await client.post(
        "/disbursements",
        json={"envelope_id": env_id, "amount": "1000.00", "description": "Demo pay"},
        headers=auth(u),
    )
    assert r.status_code == 201
    data = r.json()
    assert data["status"] == "completed"
    assert Decimal(str(data["amount"])) == Decimal("1000.00")
    assert Decimal(str(data["new_balance"])) == Decimal("49000.00")


async def test_disburse_locked_rejected(client):
    u = uid("disblocked")
    env_id = await _fund_envelope(client, u, locked=True)
    r = await client.post(
        "/disbursements",
        json={"envelope_id": env_id, "amount": "1000.00", "description": "Should fail"},
        headers=auth(u),
    )
    assert r.status_code == 400
    assert "locked" in r.json()["detail"].lower()


async def test_disburse_insufficient_balance(client):
    u = uid("disbinsuf")
    env_id = await _fund_envelope(client, u, locked=False)
    r = await client.post(
        "/disbursements",
        json={"envelope_id": env_id, "amount": "999999.00", "description": "Over"},
        headers=auth(u),
    )
    assert r.status_code == 400
    assert "insufficient" in r.json()["detail"].lower()


# ─── 10. Transaction ledger ───────────────────────────────────────────────────

async def test_deposit_creates_tx(client):
    u = uid("ledger1")
    await client.get("/wallet/", headers=auth(u))
    await client.post(
        "/wallet/deposit",
        json={"amount": "25000.00", "description": "Ledger"},
        headers=auth(u),
    )
    r = await client.get("/transactions", headers=auth(u))
    assert r.status_code == 200
    deposits = [t for t in r.json()["transactions"] if t["transaction_type"] == "MANUAL_DEPOSIT"]
    assert len(deposits) >= 1


async def test_transactions_user_scoped(client):
    ua = uid("led_a")
    ub = uid("led_b")
    await client.get("/wallet/", headers=auth(ua))
    await client.get("/wallet/", headers=auth(ub))
    await client.post(
        "/wallet/deposit", json={"amount": "5000.00", "description": "A"}, headers=auth(ua)
    )
    txs_b = (await client.get("/transactions", headers=auth(ub))).json()["transactions"]
    # B has no MANUAL_DEPOSIT (no deposit made for B)
    assert all(t["transaction_type"] != "MANUAL_DEPOSIT" for t in txs_b)


async def test_balances_endpoint(client):
    u = uid("bals")
    await client.get("/wallet/", headers=auth(u))
    r = await client.get("/transactions/balances", headers=auth(u))
    assert r.status_code == 200
    assert "balances" in r.json()
    assert "total_balance" in r.json()


# ─── 11. Payees ──────────────────────────────────────────────────────────────

async def test_create_and_list_payee(client):
    u = uid("payee1")
    await client.get("/wallet/", headers=auth(u))
    r = await client.post(
        "/payees",
        json={"name": "Test Landlord", "payee_type": "individual"},
        headers=auth(u),
    )
    assert r.status_code == 201
    payee_id = r.json()["id"]
    ids = [p["id"] for p in (await client.get("/payees", headers=auth(u))).json()["payees"]]
    assert payee_id in ids


async def test_payee_ownership_enforced(client):
    ua = uid("payown_a")
    ub = uid("payown_b")
    await client.get("/wallet/", headers=auth(ua))
    await client.get("/wallet/", headers=auth(ub))
    payee_id = (
        await client.post("/payees", json={"name": "A Payee", "payee_type": "merchant"}, headers=auth(ua))
    ).json()["id"]
    rb = await client.get(f"/payees/{payee_id}", headers=auth(ub))
    assert rb.status_code == 404


# ─── 12. Allocation plans ────────────────────────────────────────────────────

async def test_create_and_activate_plan(client):
    u = uid("alloc1")
    await client.get("/wallet/", headers=auth(u))
    e1 = (await client.post("/envelopes", json={"name": "Rent", "category": "Rent"}, headers=auth(u))).json()
    e2 = (await client.post("/envelopes", json={"name": "Food", "category": "Food"}, headers=auth(u))).json()
    plan_r = await client.post(
        "/allocation-plans",
        json={
            "name": "Test Plan",
            "items": [
                {"envelope_id": e1["id"], "percentage": 60.0},
                {"envelope_id": e2["id"], "percentage": 40.0},
            ],
        },
        headers=auth(u),
    )
    assert plan_r.status_code == 201
    plan_id = plan_r.json()["id"]
    act = await client.post(f"/allocation-plans/{plan_id}/activate", headers=auth(u))
    assert act.status_code == 200
    assert act.json()["is_active"] is True


async def test_plan_percentages_must_sum_to_100(client):
    u = uid("alloc_bad")
    await client.get("/wallet/", headers=auth(u))
    e = (await client.post("/envelopes", json={"name": "Bad", "category": "Rent"}, headers=auth(u))).json()
    r = await client.post(
        "/allocation-plans",
        json={"name": "Bad Plan", "items": [{"envelope_id": e["id"], "percentage": 50.0}]},
        headers=auth(u),
    )
    # Service raises ValueError → 400; schema min_items validator may give 422
    assert r.status_code in (400, 422)
