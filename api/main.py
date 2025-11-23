from contextlib import asynccontextmanager

from fastapi import FastAPI
from dotenv import load_dotenv

from app.core.firebase import initialize_firebase_from_env
from app.routers.health import router as health_router
from app.routers.profile import router as profile_router
from app.routers.matching import router as matching_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load environment variables from .env if present BEFORE initializing services
    load_dotenv()

    # Initialize services on startup (Firebase Admin SDK)
    ok = initialize_firebase_from_env()
    if not ok:
        # Fail fast so we don't run without auth/db available
        raise RuntimeError("Failed to initialize Firebase Admin SDK. Check credentials environment variables.")
    yield
    # Optionally, perform cleanup on shutdown


app = FastAPI(lifespan=lifespan)


# Include routers
app.include_router(health_router)
app.include_router(profile_router)
app.include_router(matching_router)
