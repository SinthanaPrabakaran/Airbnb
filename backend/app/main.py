from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import init_db
from app.routers import health
from app.seed import auto_seed_if_empty


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure database tables exist and auto-seed if empty
    init_db()
    auto_seed_if_empty()
    yield


app = FastAPI(
    title="Airbnb Clone API",
    description="Backend API for the Airbnb clone marketplace",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow the Next.js frontend to talk to this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers under /api prefix
app.include_router(health.router, prefix="/api")
