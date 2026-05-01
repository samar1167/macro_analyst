# Macro Analyst

Macro Analyst is a monorepo for a Macro Intelligence Platform POC. It combines a Django REST backend with a Next.js analyst workbench for macro reasoning, scenario simulation, opportunity review, divergence analysis, and engine audit tracing.

## Current Architecture

- `backend/`: Django + Django REST Framework + SQLite
- `frontend/`: Next.js App Router + React + TypeScript + Tailwind
- `docker-compose.yml`: local development orchestration for backend and frontend

## What Exists Today

- Modular backend apps:
  - `indicators`
  - `drivers`
  - `causal_rules`
  - `divergence`
  - `regimes`
  - `opportunities`
  - `engine`
- CRUD APIs for core models
- Seeded prototype macro knowledge base
- Weighted causal inference engine
- Divergence detection and explanation layer
- Django admin
- Next.js frontend workbench with:
  - Dashboard
  - Scenario Simulator
  - Opportunity Detail
  - Causal Graph Explorer
  - Divergence Monitor
  - Audit Trace View

## 1. Configure The Code In A New Environment

### Prerequisites

- Docker
- Docker Compose

### Initial Setup

1. Clone the repository.
2. Create backend env file:

```bash
cp backend/.env.example backend/.env
```

3. Create frontend env file if needed:

```bash
cp frontend/.env.example frontend/.env
```

4. Review the most important local env values:

`backend/.env`

```env
DEBUG=False
SECRET_KEY=change-me
ALLOWED_HOSTS=localhost,127.0.0.1
SQLITE_DB_NAME=db.sqlite3
DJANGO_SUPERUSER_USERNAME=admin
DJANGO_SUPERUSER_EMAIL=admin@example.com
DJANGO_SUPERUSER_PASSWORD=change-this-password
```

`frontend/.env`

```env
NEXT_PUBLIC_APP_NAME=Macro Intelligence Platform
NEXT_PUBLIC_USE_MOCKS=false
BACKEND_API_ORIGIN=http://backend:8000
NEXT_PUBLIC_BACKEND_API_PROXY=/api/backend
```

### Start The Platform

```bash
docker compose up --build
```

This brings up:

- Backend API at `http://localhost:8000/api/`
- Django admin at `http://localhost:8000/admin/`
- Frontend workbench at `http://localhost:3000/`

### First-Time Backend Bootstrapping

The backend container startup already does these automatically:

- `python manage.py migrate`
- `python manage.py collectstatic`
- `python manage.py ensure_admin_user`

If you want to run them manually:

```bash
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py collectstatic --noinput
docker compose exec backend python manage.py ensure_admin_user
```

### Seed The Prototype Macro Knowledge Base

```bash
docker compose exec backend python manage.py seed_generated_macro_knowledge
```

### Frontend Notes

- The frontend proxies browser API requests through `/api/backend/...`
- Server-side frontend fetches talk directly to `http://backend:8000`
- If the frontend container has dependency issues, rebuild fresh:

```bash
docker compose down -v
docker compose up --build
```

### Common Verification Steps

Check backend:

```bash
curl http://localhost:8000/api/engine/runs/
```

Check frontend:

```bash
curl http://localhost:3000/api/health
```

Check admin:

- Open `http://localhost:8000/admin/`
- Log in with the values from `backend/.env`

## How To Use The System

### Scenario Simulation

Use the frontend at `http://localhost:3000/scenario` or call:

`POST /api/engine/runs/execute/`

Example payload:

```json
{
  "triggered_by": "manual-test",
  "persist_opportunities": true,
  "indicator_values": {
    "CORE_PCE_YOY": { "signal": 0.7, "value": 2.9 },
    "UNEMP_RATE": { "signal": 0.3, "value": 4.2 },
    "ISM_MFG_PMI": { "signal": -0.5, "value": 48.1 },
    "HY_OAS": { "signal": 0.8, "value": 425 },
    "DXY": { "signal": 0.35, "value": 105.1 }
  }
}
```

### Divergence Analysis

Use the frontend at `http://localhost:3000/divergence` or call:

`POST /api/divergence/events/analyze/`

Example payload:

```json
{
  "engine_run_audit_id": 1,
  "persist": true,
  "notes": "Observed market pricing deteriorated faster than expected.",
  "observed_outcomes": {
    "observed_regime": {
      "code": "REG_HARD_LANDING",
      "score": 0.82
    },
    "observed_driver_scores": {
      "CREDIT_STRESS": { "signal": 0.81 },
      "GROWTH_MOMENTUM": { "signal": -0.68 }
    },
    "observed_opportunity_outcomes": {
      "REG_STAGFLATION_CREDIT_STRESS_DIV_12": { "signal": 0.35 }
    },
    "observed_indicator_values": {
      "HY_OAS": { "signal": 0.92, "value": 468 },
      "DXY": { "signal": 0.44, "value": 106.3 },
      "CORE_PCE_YOY": { "signal": 0.48, "value": 3.1 }
    }
  }
}
```

## 2. Prompts Used To Create The System

Below is the project-building prompt history distilled from the work used to create this repo. These are the prompts that shaped the current system.

### Prompt 1: Backend Architecture

```text
Build a production-grade Django REST Framework backend with MySQL for a Macro Intelligence POC.

Goal:
Scaffold backend architecture and database schema only.

Requirements:

1. Modular Django apps:

   * indicators
   * drivers
   * causal_rules
   * divergence
   * regimes
   * opportunities
   * engine

2. Models for:

   * Indicator
   * DerivedDriver
   * CausalRule
   * DivergencePattern
   * Regime
   * Opportunity
   * EngineRunAudit

3. CRUD APIs for all models.

4. Service-layer architecture:

   * No business logic in views/models.

5. Docker + MySQL setup.

Do NOT seed data yet.
Do NOT implement inference logic yet.
Only create architecture and clean project structure.
```

### Prompt 2: Seeded Macro Knowledge Base

```text
Extend the backend by generating and seeding an initial macro knowledge base.

Objective:
Use your internal knowledge and general macroeconomic/market understanding to synthesize a realistic starter dataset for the macro intelligence engine.

Requirements:

1. Create a Django management command:

   * seed_generated_macro_knowledge

2. Generate and seed structured starter knowledge for:

   * Indicators
   * Derived Drivers
   * Causal Rules
   * Divergence Patterns
   * Regime Definitions

3. Seed data must be based on broadly accepted macroeconomic relationships and market heuristics.

4. Include at minimum:

   * 10+ Indicators
   * 10+ Derived Drivers
   * 30+ Causal Rules
   * 10+ Divergence Patterns
   * 5+ Macro Regimes

5. For every seeded record include:

   * rationale/explanation
   * confidence score
   * weight/strength
   * lag assumptions where relevant

6. Organize seed data into structured JSON/Python files separate from code.

7. Ensure idempotent seeding.

8. Add comments explaining the reasoning behind seeded rules.

This is prototype seed knowledge only and should be structured for later replacement/refinement.
```

### Prompt 3: Weighted Causal Inference Engine

```text
Implement the weighted causal inference engine using the seeded macro knowledge base.

Requirements:

1. Derived Driver Computation Engine
2. Weighted Causal Propagation Engine
3. Regime Classification Engine
4. Opportunity Scoring Engine

Behavior:

* Read seeded rules from database
* Aggregate active weighted causal effects
* Compute net directional scores
* Generate explanation trace for each inference

Persist full engine audit logs.
Keep engine modular and extensible.
```

### Prompt 4: Divergence Detection Layer

```text
Implement divergence detection and explanation layer using the seeded divergence pattern knowledge base.

Requirements:

1. Compare expected engine outcomes vs observed market outcomes.

2. Detect deviations.

3. Match deviations against seeded divergence patterns.

4. Return ranked candidate explanations.

5. Store divergence events and matched explanations.

Keep implementation modular for future adaptive learning upgrades.
```

### Prompt 5: Frontend Workbench

```text
Build a production-grade frontend for the Macro Intelligence Platform using Next.js (latest App Router), React, TypeScript, and Tailwind CSS.

Goal:
Create an interactive macro decision-making workbench that integrates with the existing Django REST backend APIs.

Core UX Principle:
This is NOT a simple recommendation dashboard.
It is an interactive macro reasoning and scenario analysis platform.

Requirements:

1. Tech Stack

* Next.js latest with App Router
* React + TypeScript
* Tailwind CSS
* shadcn/ui components
* React Query / TanStack Query for API state
* Zustand or Context for scenario state management
* Recharts for charts/visualizations
* React Flow or similar for causal graph visualization

2. Main Pages / Modules

A. Dashboard

* Display macro indicators
* Display derived drivers
* Display active macro regime
* Display ranked opportunities
* Display active divergences/anomalies

B. Scenario Simulator

* Allow user to modify hypothetical indicator values
* Trigger backend simulation endpoint
* Display recalculated outputs in real time

C. Opportunity Detail View

* Show rationale for each opportunity
* Show supporting/contradicting drivers
* Show confidence/weight/score breakdown

D. Causal Graph Explorer

* Interactive graph of drivers → rules → targets
* Highlight active pathways

E. Divergence Monitor

* Show expected vs observed divergences
* Display candidate explanations

F. Audit Trace View

* Step-by-step engine reasoning trace

3. API Integration
   Integrate with backend REST APIs for:

* Indicators
* Drivers
* Rules
* Regimes
* Opportunities
* Simulation Engine
* Divergence Events
* Audit Logs

4. UX / Design Requirements

* Professional institutional/macroeconomic terminal aesthetic
* Dense but readable data presentation
* Responsive layout
* Filter/sort/search support
* Collapsible reasoning panels
* Tooltips for explanations
* Color-coded directional indicators

5. Architecture Requirements

* Modular component structure
* API abstraction layer
* Reusable chart/graph components
* Strong typing throughout
* Clean separation of presentation vs data logic

6. Deliverables
   Generate:

* Full frontend project structure
* Page layouts
* Components
* API hooks/services
* State management setup
* Styling/theme system
* Sample mock integration with backend endpoints

Prioritize usability for serious analytical decision-making over flashy visuals.
```

### Important Implementation Notes

- The backend was originally scaffolded for MySQL, then switched to SQLite for easier POC setup.
- The frontend uses mock fallbacks for resilience, but is wired to the live backend APIs by default.
- The frontend is meant to feel like an institutional research workstation, not a consumer dashboard.

## 3. Prompt Required To Start Extending This System Further

Use the prompt below as the default continuation prompt when the team is ready to extend the platform.

```text
You are continuing work on an existing Macro Intelligence Platform monorepo.

Repository context:
- Backend: Django REST Framework, SQLite for local POC, modular apps under backend/apps
- Frontend: Next.js App Router, React, TypeScript, Tailwind, TanStack Query, Zustand, Recharts, React Flow
- Existing capabilities:
  - seeded macro knowledge base
  - weighted causal inference engine
  - divergence detection and explanation layer
  - Django admin
  - frontend dashboard, scenario simulator, opportunity detail, causal graph, divergence monitor, and audit trace views

Working rules:
- Preserve the modular backend service-layer architecture
- Preserve strong typing and API abstraction on the frontend
- Keep explanation traces and auditability first-class
- Do not remove prototype knowledge structures unless explicitly requested
- Maintain Docker-based local setup
- Favor extensibility for future adaptive learning, richer market data integration, and more advanced scenario analysis

Before making changes:
1. Inspect the current repo structure and existing implementation.
2. Explain the extension plan briefly.
3. Implement the requested feature end-to-end.
4. Update README if setup, architecture, or usage changes.
5. Verify changed code paths as much as possible.

My next extension request is:
[INSERT THE NEW FEATURE REQUEST HERE]
```

## Suggested Future Extension Areas

- Real market and macro data ingestion pipelines
- Historical scenario replay and backtesting
- User-authenticated saved scenarios
- Richer causal graph activation overlays
- Regime transition probabilities
- Opportunity portfolio construction layer
- Adaptive rule tuning and learning workflows
- Exportable audit and research reports

## Key Files

### Backend

- `backend/config/settings.py`
- `backend/config/urls.py`
- `backend/common/models.py`
- `backend/common/services.py`
- `backend/common/viewsets.py`
- `backend/apps/engine/runtime.py`
- `backend/apps/divergence/runtime.py`
- `backend/apps/engine/management/commands/seed_generated_macro_knowledge.py`
- `backend/apps/engine/management/commands/ensure_admin_user.py`
- `backend/seed_data/generated_macro_knowledge.py`

### Frontend

- `frontend/app/layout.tsx`
- `frontend/app/page.tsx`
- `frontend/app/scenario/page.tsx`
- `frontend/app/causal-graph/page.tsx`
- `frontend/app/divergence/page.tsx`
- `frontend/app/audit/[id]/page.tsx`
- `frontend/lib/api.ts`
- `frontend/hooks/use-platform-data.ts`
- `frontend/store/scenario-store.ts`
- `frontend/components/layout/app-shell.tsx`

## Current Limitations

- SQLite is used for local simplicity, not multi-user production scale
- Frontend runtime was scaffolded and wired, but should still be validated in the running container after dependency installation and live API exercise
- Knowledge base and inference logic are prototype heuristics, not calibrated production research models
- There is no authentication or user/tenant separation yet
- No historical ingestion or live market data feeds yet
