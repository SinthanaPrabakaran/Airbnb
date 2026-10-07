# Airbnb Clone - Fullstack Vacation Rental Marketplace

A fullstack vacation rental marketplace replicating the core user flows and UX of Airbnb. Built from scratch with an original architecture.

---

## Architecture Overview

The system is cleanly separated into two distinct layers:
- **`frontend/`**: Next.js App Router with TypeScript, Tailwind CSS, centralized API client, toast notifications, and UI primitives.
- **`backend/`**: Python FastAPI with SQLAlchemy 2.0 ORM, SQLite database, and Pydantic v2 data schemas.

```
/
├── frontend/
│   ├── app/                    # Next.js App Router (layout, page, styles)
│   ├── components/
│   │   └── ui/                 # Reusable UI primitives (Button, Card, Input, Spinner, Toast)
│   ├── hooks/                  # Custom React hooks (useAsync, useToast)
│   ├── lib/                    # Centralized API client & endpoint definitions
│   ├── types/                  # Shared TypeScript interfaces & types
│   ├── public/                 # Static assets
│   ├── .env.example            # Environment variables template
│   └── package.json
├── backend/
│   ├── app/
│   │   ├── main.py             # FastAPI app setup, CORS, route mounting
│   │   ├── config.py           # Pydantic Settings & environment variables
│   │   ├── database.py         # SQLAlchemy engine, session maker, get_db dependency
│   │   ├── models/             # SQLAlchemy database models
│   │   ├── schemas/            # Pydantic request / response schemas
│   │   ├── routers/            # FastAPI API route handlers
│   │   ├── services/           # Encapsulated business logic layer
│   │   └── seed/               # Database seeding scripts
│   ├── requirements.txt        # Python backend dependencies
│   ├── .env.example            # Backend environment variables template
│   └── airbnb.db               # SQLite database file (generated on startup)
├── README.md
└── .gitignore
```

---

## Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Patterns**: Clean UI component isolation, typed API contracts, reactive toast notifications, accessible interactive primitives.

### Backend
- **Framework**: Python FastAPI
- **Server**: Uvicorn (ASGI)
- **Database**: SQLite (SQLAlchemy 2.0 ORM)
- **Validation**: Pydantic v2
- **CORS**: Configured for `http://localhost:3000`

---

## Separation of Concerns

1. **UI Components**: Presentational and interaction only. No direct backend URL or HTTP calls inside components.
2. **Centralized API Client (`frontend/lib/api-client.ts`)**: Standardizes HTTP methods, JSON parsing, query parameter serialization, and structured error throwing (`ApiClientError`).
3. **API Catalog (`frontend/lib/api.ts`)**: Single source of truth for all API calls consumed by frontend pages.
4. **Backend Architecture**:
   - `routers/`: Handle HTTP routing, status codes, and input/output schema binding.
   - `services/`: Encapsulate core business logic independently from transport protocols.
   - `schemas/`: Define contract validation rules using Pydantic.
   - `models/`: Define relational persistence schemas using SQLAlchemy.

---

## Quickstart & Setup

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows PowerShell:
.\venv\Scripts\Activate.ps1
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the development server
uvicorn app.main:app --reload --port 8000
```

The API will be available at:
- **API Base**: `http://localhost:8000`
- **Interactive Swagger Docs**: `http://localhost:8000/docs`
- **Health Check Endpoint**: `http://localhost:8000/api/health`

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run the Next.js development server
npm run dev
```

The frontend will be available at `http://localhost:3000`.

---

## Health Check Endpoint

```http
GET /api/health
```

**Response (200 OK)**:
```json
{
  "status": "ok",
  "service": "airbnb-backend"
}
```

---

## Git Workflow Note
All changes are kept in local commits and will be manually pushed to the remote repository.
