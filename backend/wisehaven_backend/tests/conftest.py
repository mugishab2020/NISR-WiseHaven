"""Pytest configuration for WiseHaven backend tests.

Each test gets its own event loop (asyncio_mode=auto, function scope).
The Prisma client is connected/disconnected per test to avoid loop conflicts.
The AsyncClient is also per-test so the ASGI transport shares the same loop.
"""
import pytest_asyncio
from httpx import AsyncClient, ASGITransport

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from main import app
from models import db as prisma_db


@pytest_asyncio.fixture()
async def db():
    """Connect Prisma and yield the db client, then disconnect."""
    await prisma_db.connect()
    yield prisma_db
    await prisma_db.disconnect()


@pytest_asyncio.fixture()
async def client(db):
    """ASGI test client — depends on db so Prisma is connected first."""
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://testserver",
    ) as c:
        yield c
