"""CLI entrypoint for running: python -m app.seed [--reset]"""

import argparse
import sys
from app.seed.seeder import seed_database


def main():
    parser = argparse.ArgumentParser(
        description="Seed the Airbnb SQLite database with realistic marketplace data."
    )
    parser.add_argument(
        "--reset",
        action="store_true",
        help="Drop and recreate all tables before seeding (cleans existing data).",
    )
    args = parser.parse_args()

    try:
        result = seed_database(reset=args.reset)
        print(f"\n[SUMMARY] Result: {result}")
    except Exception as e:
        print(f"\n[FAILED] Database seeding encountered an error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
