# Portal Read Model Architecture (v1.0 FROZEN)

This document formalizes the CQRS projection strategy for the Client Portal.

## 1. Core Principle
The Portal UI must never fetch data via complex joins against StudioHQ's primary transactional schema. Instead, the UI reads directly from **structured projection tables** maintaining fast-read state. JSON aggregates are NOT permitted; all fields must be relationally structured.

## 2. Infrastructure Flow
```text
StudioHQ Commands -> Outbox Worker -> PortalProjectionDispatcher -> Projection Handlers -> Read Models
```

## 3. Projection State Schema
The system maintains its own operational state within `portal_projection_state`.
- **Metrics Tracked:** `last_processed_event`, `last_processed_at`, `lag_seconds`, `is_rebuild_running`.
- **Runtime Metrics:** Kept in-memory via `ProjectionMetrics.ts`.

## 4. Fallback Mechanism
All projection repositories implement `IPortalRepository`. 
Cutover is gated by a feature flag (`USE_PROJECTION_REPOSITORY`). Reversion is instantaneous.
