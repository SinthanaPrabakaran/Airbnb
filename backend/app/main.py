from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import init_db
from app.routers import (
    amenities_router,
    bookings_router,
    favorites_router,
    health_router,
    host_router,
    listings_router,
    users_router,
)
from app.seed import auto_seed_if_empty


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure database schema exists and populate sample data if empty
    init_db()
    auto_seed_if_empty()
    yield


app = FastAPI(
    title="Airbnb Marketplace API",
    description="Production-grade RESTful API backend for the Airbnb full-stack vacation rental marketplace.",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# CORS — configure allowed origins for Next.js frontend
allowed_origins = list(
    {
        settings.frontend_url.rstrip("/"),
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    }
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers under /api prefix
app.include_router(health_router, prefix="/api")
app.include_router(listings_router, prefix="/api")
app.include_router(users_router, prefix="/api")
app.include_router(favorites_router, prefix="/api")
app.include_router(bookings_router, prefix="/api")
app.include_router(host_router, prefix="/api")
app.include_router(amenities_router, prefix="/api")
