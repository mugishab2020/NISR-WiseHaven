// ============================================================
// WiseHaven — Demo Data & State Management
// IMPORTANT: This is simulated demo data only. No real money.
// State is persisted to localStorage for demo purposes only.
// Do NOT store real credentials, tokens, or sensitive data.
// ============================================================

import type {
  DemoAccount,
  Envelope,
  Transaction,
  DepositPreview,
} from "@/types";
import { isMatured, isUnlockingSoon } from "./dates";

const STORAGE_KEY = "wisehaven_demo_v1";

// ── Demo seed data ─────────────────────────────────────────

function buildSeedData(): DemoAccount {
  const now = new Date();

  // Maturity dates relative to seed time
  const daysFromNow = (d: number, h = 9) => {
    const dt = new Date(now);
    dt.setDate(dt.getDate() + d);
    dt.setHours(h, 0, 0, 0);
    return dt.toISOString();
  };

  const envelopes: Envelope[] = [
    {
      id: "env_rent",
      name: "Rent & Service Charge",
      description: "Monthly rent for Kigali Heights apartment #4B",
      category: "shelter",
      categoryLabel: "Shelter",
      icon: "home_work",
      amount: 100000,
      recipient: "Landlord (Kigali Heights #4B)",
      maturityDate: daysFromNow(9, 9),
      status: "locked",
      createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "env_food",
      name: "Monthly Groceries & Food",
      description: "Bi-weekly grocery replenishment",
      category: "food",
      categoryLabel: "Food & Nutrition",
      icon: "shopping_basket",
      amount: 20000,
      recipient: "Personal Groceries (Kimironko)",
      maturityDate: daysFromNow(3, 12),
      status: "locked",
      createdAt: new Date(now.getTime() - 11 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "env_utilities",
      name: "REG Cashpower & WASAC",
      description: "Monthly electricity and water bills",
      category: "utilities",
      categoryLabel: "Utilities",
      icon: "bolt",
      amount: 15000,
      recipient: "REG Meter #0421-9982-11",
      maturityDate: daysFromNow(1, 8),
      status: "locked",
      createdAt: new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "env_education",
      name: "University Semester Installment",
      description: "Semester tuition for UR College of Science",
      category: "education",
      categoryLabel: "Education",
      icon: "school",
      amount: 25000,
      recipient: "UR College of Science",
      maturityDate: daysFromNow(14, 17),
      status: "locked",
      createdAt: new Date(now.getTime() - 16 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const transactions: Transaction[] = [
    {
      id: "tx_salary",
      type: "deposit",
      amount: 250000,
      direction: "in",
      description: "MoMo Salary Inflow",
      subDescription: "Simulated deposit",
      timestamp: new Date(now.getTime() - 15 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "tx_vault_sweep",
      type: "vault_sweep",
      amount: 25000,
      direction: "out",
      description: "Vault 10% Auto-Sweep",
      subDescription: "Emergency first-sweep on deposit",
      timestamp: new Date(now.getTime() - 15 * 60 * 60 * 1000 + 60000).toISOString(),
    },
    {
      id: "tx_rent_alloc",
      type: "envelope_allocation",
      amount: 100000,
      direction: "out",
      description: "Locked: Rent Oct 2026",
      subDescription: "Committed to envelope",
      envelopeId: "env_rent",
      envelopeName: "Rent & Service Charge",
      timestamp: new Date(now.getTime() - 15 * 60 * 60 * 1000 + 120000).toISOString(),
    },
    {
      id: "tx_food_alloc",
      type: "envelope_allocation",
      amount: 20000,
      direction: "out",
      description: "Locked: Monthly Groceries & Food",
      subDescription: "Committed to envelope",
      envelopeId: "env_food",
      envelopeName: "Monthly Groceries & Food",
      timestamp: new Date(now.getTime() - 15 * 60 * 60 * 1000 + 180000).toISOString(),
    },
    {
      id: "tx_util_alloc",
      type: "envelope_allocation",
      amount: 15000,
      direction: "out",
      description: "Locked: REG Cashpower & WASAC",
      subDescription: "Committed to envelope",
      envelopeId: "env_utilities",
      envelopeName: "REG Cashpower & WASAC",
      timestamp: new Date(now.getTime() - 15 * 60 * 60 * 1000 + 240000).toISOString(),
    },
    {
      id: "tx_edu_alloc",
      type: "envelope_allocation",
      amount: 25000,
      direction: "out",
      description: "Locked: University Semester Installment",
      subDescription: "Committed to envelope",
      envelopeId: "env_education",
      envelopeName: "University Semester Installment",
      timestamp: new Date(now.getTime() - 15 * 60 * 60 * 1000 + 300000).toISOString(),
    },
  ];

  return {
    totalFunds: 250000,
    vaultBalance: 25000,
    envelopes,
    transactions,
    vaultSettings: {
      sweepPercentage: 10,
      targetAmount: 100000,
      isAutoSweepEnabled: true,
    },
    privacyMode: false,
    lastUpdated: now.toISOString(),
  };
}

// ── localStorage helpers ───────────────────────────────────

export function loadAccount(): DemoAccount {
  if (typeof window === "undefined") return buildSeedData();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return buildSeedData();
    const parsed = JSON.parse(raw) as DemoAccount;
    // Migrate status based on current time
    parsed.envelopes = parsed.envelopes.map((e) => {
      if (e.status === "locked" || e.status === "unlocking_soon") {
        if (isMatured(e.maturityDate)) return { ...e, status: "ready_to_pay" };
        if (isUnlockingSoon(e.maturityDate)) return { ...e, status: "unlocking_soon" };
        return { ...e, status: "locked" };
      }
      return e;
    });
    return parsed;
  } catch {
    return buildSeedData();
  }
}

export function saveAccount(account: DemoAccount): void {
  if (typeof window === "undefined") return;
  account.lastUpdated = new Date().toISOString();
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(account));
}

export function resetAccount(): DemoAccount {
  const fresh = buildSeedData();
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
  }
  return fresh;
}

// ── Derived computations ───────────────────────────────────

export function computeAvailableFunds(account: DemoAccount): number {
  const lockedTotal = account.envelopes
    .filter((e) => e.status !== "paid" && e.status !== "cancelled")
    .reduce((sum, e) => sum + e.amount, 0);
  return account.totalFunds - account.vaultBalance - lockedTotal;
}

export function computeLockedTotal(account: DemoAccount): number {
  return account.envelopes
    .filter((e) => e.status !== "paid" && e.status !== "cancelled")
    .reduce((sum, e) => sum + e.amount, 0);
}

// ── State mutation operations ──────────────────────────────

/**
 * Preview a deposit: calculates vault sweep and remaining amount.
 */
export function previewDeposit(
  account: DemoAccount,
  depositAmount: number
): DepositPreview {
  const { sweepPercentage, isAutoSweepEnabled } = account.vaultSettings;
  const vaultSweepAmount = isAutoSweepEnabled
    ? Math.round((depositAmount * sweepPercentage) / 100)
    : 0;
  return {
    depositAmount,
    vaultSweepAmount,
    remainingAmount: depositAmount - vaultSweepAmount,
    sweepPercentage: isAutoSweepEnabled ? sweepPercentage : 0,
  };
}

/**
 * Apply a confirmed deposit: updates totalFunds, vaultBalance, adds transactions.
 * Returns a new account state (immutable).
 */
export function applyDeposit(
  account: DemoAccount,
  depositAmount: number,
  txId: string
): DemoAccount {
  const preview = previewDeposit(account, depositAmount);
  const now = new Date().toISOString();

  const newTxs: Transaction[] = [
    {
      id: txId,
      type: "deposit",
      amount: depositAmount,
      direction: "in",
      description: "Simulated Deposit",
      subDescription: "Demo money added",
      timestamp: now,
    },
  ];

  if (preview.vaultSweepAmount > 0) {
    newTxs.push({
      id: `${txId}_sweep`,
      type: "vault_sweep",
      amount: preview.vaultSweepAmount,
      direction: "out",
      description: `Vault ${preview.sweepPercentage}% Auto-Sweep`,
      subDescription: "Emergency first-sweep on deposit",
      timestamp: new Date(Date.now() + 1000).toISOString(),
    });
  }

  return {
    ...account,
    totalFunds: account.totalFunds + depositAmount,
    vaultBalance: account.vaultBalance + preview.vaultSweepAmount,
    transactions: [...newTxs, ...account.transactions],
  };
}

/**
 * Allocate funds to a new envelope. Returns new account state.
 */
export function allocateEnvelope(
  account: DemoAccount,
  envelope: Omit<Envelope, "id" | "status" | "createdAt">,
  txId: string
): DemoAccount {
  const available = computeAvailableFunds(account);
  if (envelope.amount > available) {
    throw new Error(
      `Allocation of ${envelope.amount} RWF exceeds available funds of ${available} RWF`
    );
  }

  const newEnvelope: Envelope = {
    ...envelope,
    id: `env_${Date.now()}`,
    status: isMatured(envelope.maturityDate)
      ? "ready_to_pay"
      : isUnlockingSoon(envelope.maturityDate)
        ? "unlocking_soon"
        : "locked",
    createdAt: new Date().toISOString(),
  };

  const tx: Transaction = {
    id: txId,
    type: "envelope_allocation",
    amount: envelope.amount,
    direction: "out",
    description: `Locked: ${envelope.name}`,
    subDescription: "Committed to envelope",
    envelopeId: newEnvelope.id,
    envelopeName: envelope.name,
    timestamp: new Date().toISOString(),
  };

  return {
    ...account,
    envelopes: [newEnvelope, ...account.envelopes],
    transactions: [tx, ...account.transactions],
  };
}

/**
 * Confirm a simulated payment for a matured envelope.
 * Returns new account state.
 */
export function confirmPayment(
  account: DemoAccount,
  envelopeId: string,
  txId: string
): DemoAccount {
  const envelope = account.envelopes.find((e) => e.id === envelopeId);
  if (!envelope) throw new Error("Envelope not found");
  if (!isMatured(envelope.maturityDate) && envelope.status !== "ready_to_pay") {
    throw new Error("Envelope is not yet mature");
  }
  if (envelope.status === "paid") throw new Error("Already paid");

  const now = new Date().toISOString();

  const tx: Transaction = {
    id: txId,
    type: "envelope_payment",
    amount: envelope.amount,
    direction: "out",
    description: `Simulated Payment: ${envelope.name}`,
    subDescription: `Demo payment to ${envelope.recipient}`,
    envelopeId: envelope.id,
    envelopeName: envelope.name,
    timestamp: now,
  };

  return {
    ...account,
    totalFunds: account.totalFunds - envelope.amount,
    envelopes: account.envelopes.map((e) =>
      e.id === envelopeId ? { ...e, status: "paid", paidAt: now } : e
    ),
    transactions: [tx, ...account.transactions],
  };
}

/**
 * Update vault settings (sweep percentage, target, auto-sweep toggle).
 */
export function updateVaultSettings(
  account: DemoAccount,
  settings: Partial<DemoAccount["vaultSettings"]>
): DemoAccount {
  return {
    ...account,
    vaultSettings: { ...account.vaultSettings, ...settings },
  };
}

/**
 * Returns a consistent envelope status based on current time.
 */
export function computeEnvelopeStatus(envelope: Envelope): Envelope["status"] {
  if (envelope.status === "paid" || envelope.status === "cancelled") {
    return envelope.status;
  }
  if (isMatured(envelope.maturityDate)) return "ready_to_pay";
  if (isUnlockingSoon(envelope.maturityDate)) return "unlocking_soon";
  return "locked";
}

/**
 * Generate a unique transaction ID.
 */
export function newTxId(): string {
  return `tx_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}
