# OpsTriage Console

React and Vite frontend for the OpsTriage operational workflow. The application signs users in through the FastAPI service and loads workspace data from its authenticated API.

## Run

```bash
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:5173`. Start the backend separately and configure its database and Gemini settings as described in [the backend README](../backend/README.md).

## API configuration

Set `VITE_API_URL` to the backend API root, including `/api/v1`; `.env.example` uses `http://localhost:8001/api/v1`. The API client otherwise defaults to `http://localhost:8081/api/v1`. `VITE_ORG_ID` is a development default used by organization-scoped requests; authenticated deployments should use the organization associated with the signed-in account and must not rely on the sample value.

The frontend stores the access token, refresh token, and signed-in profile in browser local storage. Workspace requests use the bearer token. Backend authorization and tenant isolation remain enforced by the API. AI assistance, including support chat, requires Gemini to be enabled and configured on the backend.

Help & Guides opens workflow instructions and the replayable platform tour. The tour can focus the current page while keeping the guide available. Support chat answers product-usage questions and does not load workspace records or perform actions. Integration cards and local import previews should not be taken as proof of a live third-party connection; verify delivery through the backend integration/ingestion endpoints.

## Main screens

- Command Center — operational health, active signal queue, workload, latency, and system posture
- Signal Intelligence — triage, evidence, acknowledgement, and finding-to-case workflow
- Casework — investigation ownership and resolution
- Assets and Source Incidents — equipment registry and incident lifecycle
- Rules & Automations — detection rule lifecycle and safety controls
- Insights & AI Reports — SLA, detection, and outcome metrics
- Ingestion Health — event intake and pipeline status
- Integrations — configured ingress and delivery bridges
- Settings & Security — account and workspace controls

Screen composition is in `src/App.tsx`; reusable styles are in `src/styles.css` and `src/pages.css`; API requests are in `src/lib/api.ts`.
