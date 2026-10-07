"""Seed module for initializing and populating Airbnb sample data."""

from app.seed.seeder import auto_seed_if_empty, seed_database

__all__ = ["seed_database", "auto_seed_if_empty"]
