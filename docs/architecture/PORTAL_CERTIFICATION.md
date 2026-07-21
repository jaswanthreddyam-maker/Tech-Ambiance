# Portal Certification (v1.0 FROZEN)

This outlines the standard certification suite (`npm run certify:portal`) for the Client Portal bounded context.
All deployments MUST pass this suite.

## The Certification Checklist

```text
Portal Certification

Architecture ........ PASS
Replay .............. PASS
DTO Parity .......... PASS
Coverage ............ PASS
Projection Health ... PASS
RLS ................. PASS
Performance ......... PASS
Overall ............. PASS
```

## Checks Explained

1. **Architecture:** Verifies strict boundaries (UI components never import `supabase` types, etc).
2. **Replay Determinism:** The projection manager can successfully rebuild read models from the outbox.
3. **DTO Parity:** Given the same project ID, `RawPortalRepository` and `ProjectionPortalRepository` MUST return functionally identical DTOs (enforced via strict JSON equivalence, excluding `generatedAt`).
4. **Coverage:** All defined domain events that are client-visible must be processed by the Dispatcher without unhandled exception.
5. **Projection Health:** Ensures there are no persistent crashes recorded in the `portal_projection_state` or `ProjectionMetrics`.
6. **RLS:** Verifies all `portal_*_projection` tables have Row Level Security explicitly enabled.
7. **Performance:** Database query times for read models must remain under 50ms baseline.
