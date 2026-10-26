"""FastAPI application entry point."""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Import database
from models import connect_db, disconnect_db

# Import controllers
from controllers.user_controller import router as user_router
from controllers.wallet_controller import router as wallet_router
from controllers.envelope_controller import router as envelope_router
from controllers.allocation_controller import router as allocation_router
from controllers.transaction_controller import router as transaction_router
from controllers.payee_controller import router as payee_router
from controllers.disbursement_controller import router as disbursement_router

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifespan - startup and shutdown events."""
    # Startup: Connect to database
    await connect_db()
    print("✅ Connected to database")
    yield
    # Shutdown: Disconnect from database
    await disconnect_db()
    print("👋 Disconnected from database")


app = FastAPI(
    title="WiseHaven API",
    description="Smart Time-Locked Envelope Wallet Backend API for Rwanda (Clerk Auth)",
    version="0.2.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(user_router)
app.include_router(wallet_router)
app.include_router(envelope_router)
app.include_router(allocation_router)
app.include_router(transaction_router)
app.include_router(payee_router)
app.include_router(disbursement_router)


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "WiseHaven API", "auth": "Clerk"}


@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "WiseHaven API - Smart Time-Locked Envelope Wallet",
        "version": "0.2.0",
        "auth": "Clerk Authentication",
        "docs": "/docs",
        "redoc": "/redoc",
        "health": "/health",
        "endpoints": {
            "users": "/users",
            "wallet": "/wallet",
            "envelopes": "/envelopes",
            "allocation_plans": "/allocation-plans",
            "transactions": "/transactions",
            "payees": "/payees",
            "disbursements": "/disbursements"
        },
        "notes": {
            "authentication": "Use Clerk for user authentication (register/login handled by frontend)",
            "authorization": "All endpoints require Bearer token from Clerk",
            "user_sync": "User automatically synced to database on first API call"
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
