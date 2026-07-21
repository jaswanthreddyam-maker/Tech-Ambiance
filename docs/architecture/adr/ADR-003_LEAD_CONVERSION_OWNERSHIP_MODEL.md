# ADR-003: Lead Conversion Ownership Model

**Status:** Accepted  
**Date:** 2026-07-22  
**Authors:** Tech Ambiance Engineering  

## Context

The platform has three distinct surfaces that share tenant state:

1. **CRM Pipeline** (StudioHQ) — where leads are captured and qualified.
2. **Workspaces Engine** (StudioHQ) — where organizations, workspaces, and projects are managed.
3. **Client Portal** (`/portal`) — where clients view their project status, deliverables, and invoices.

The question this ADR answers:

> When a lead becomes a paying customer, how is tenant ownership established, and how does that ownership surface in the Client Portal?

## Decision

### 1. Provisioning is centralized in a single database RPC

All tenant provisioning happens atomically inside `convert_lead_to_workspace()`. This single function creates:

```
Organization → Workspace → Project → Admin Membership → Client Membership → Profile Update → Audit Record
```

No frontend code, background job, or webhook is involved. The RPC is the **single source of truth** for provisioning.

### 2. `user_id` (UUID) is the authoritative identity link

The `lead_consultations.user_id` column records the authenticated user who submitted the consultation. This UUID is the **only trusted identity link** between a CRM lead and an auth account.

We explicitly avoid email-based matching:
- Emails change.
- Typos happen.
- Duplicate accounts happen.
- UUIDs are immutable.

### 3. Memberships define ownership, not `profiles.active_*`

Authorization is determined **exclusively** by rows in:
- `organization_members` — links user → organization
- `workspace_members` — links user → workspace

RLS policies on `projects`, `milestones`, `invoices`, etc. all check these tables.

`profiles.active_organization_id` and `profiles.active_workspace_id` are **UI convenience state** — they track the user's last-active context for navigation purposes. They are:
- Set **only** during first-time provisioning (when currently NULL).
- Never used as authorization predicates.
- Never overwritten when a user already has an active context.

### 4. Unlinked leads enter a pending state

When a lead is converted but has no `user_id` (anonymous submission or pre-registration lead):
- `provisioning_status` is set to `MANUAL_LINK_REQUIRED`.
- The admin sees a "Provision Client Access" banner in the Lead Details panel.
- The admin can manually link a client user account via `provision_client_access()` RPC.

### 5. All operations are idempotent and fully transactional

- `ON CONFLICT DO NOTHING` on all membership inserts prevents duplicate key violations on repeat conversions.
- The entire RPC runs inside a single transaction. If any step fails, everything rolls back — no half-provisioned tenants.
- Re-pressing "Mark as Won" on an already-WON lead returns a success response with `already_provisioned: true`.

## Consequences

### Positive
- Single point of provisioning eliminates scattered state management.
- RLS automatically gates portal access via membership tables.
- No frontend code changes needed when portal authorization logic evolves.
- Full audit trail via `lead_events` enables provenance tracking.

### Negative
- Manual linking is required for leads submitted before authentication was enforced.
- The `provision_client_access` RPC requires the admin to know the client's UUID (found in Supabase Auth dashboard).

### Future Considerations
- **Multi-workspace clients:** A client can belong to multiple organizations/workspaces. The portal should list all workspaces where the user has membership, not just `profiles.active_workspace_id`.
- **Invitation flow:** Instead of requiring the admin to know the UUID, a future enhancement could send an email invitation that auto-provisions on acceptance.
- **Organization reuse:** Current policy creates a new organization per conversion. A future policy could detect and reuse existing organizations if the client already has one.

## References

- Migration: `supabase/migrations/0050_centralize_lead_to_portal.sql`
- RPC: `convert_lead_to_workspace(p_lead_id, p_admin_user_id)`
- RPC: `provision_client_access(p_lead_id, p_client_user_id, p_admin_user_id)`
- RLS: `0044_fix_projects_rls.sql` → `is_workspace_member()` check
