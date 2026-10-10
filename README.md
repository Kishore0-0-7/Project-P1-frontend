# OpsTriage Console

React/Vite frontend for the OpsTriage workflow. It ships with a local demo dataset so the full operator journey can be exercised before the API is available. Browser-local changes persist in `localStorage` under the `opstriage.demo.*` namespace.

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## Data and API

The UI is deliberately marked as demo-backed. Creating or updating findings, cases, incidents, rules, settings, integration toggles, and report exports operate on local browser data; file import validates CSV/JSON locally but does not ingest it into the database. No real Slack, ServiceNow, Jira, or Prometheus requests are made.

To use the live FastAPI service, copy `frontend/.env.example` to `frontend/.env`. The current example targets `http://localhost:8001/api/v1` and includes the development organization ID. When `VITE_API_URL` is set, findings, cases, assets, incidents, rules, record creation, status mutations, rule toggles, refresh, and JSON ingestion use the backend; when it is absent, the UI remains an explicit local demo. Live request failures are surfaced instead of silently replacing live responses with seed data.

The API client supports bearer tokens stored under `opstriage.auth.access_token`; login UI and organization switching are still separate work. Production deployments must provide an authenticated token and must not rely on the development `VITE_ORG_ID`.

Screen state and page composition are in `src/App.tsx`; reusable presentation styles live in `src/styles.css` and `src/pages.css`; seed records are in `src/data/mockData.ts`; types are centralized in `src/types.ts`.

## Screen inventory

- Command Center — operational health, active signal queue, workload, latency, and system posture
- Signal Intelligence — triage, acknowledgement, assignment, evidence, and finding-to-case conversion
- Casework — human investigation workflow and ownership
- Assets — cross-domain HVAC/IT estate health
- Rules & Automations — rule lifecycle, version, and safety controls
- Reports — SLA, detection, and outcome-feedback metrics
- Integrations — delivery destinations and ingestion surface
- Source Incidents — incident lifecycle and source-to-finding context
- Ingestion Health — source status and CSV/JSON validation
- Settings — local workspace, SLA, access, audit, and notification preferences
