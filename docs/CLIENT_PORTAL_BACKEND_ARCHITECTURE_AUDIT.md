# CLIENT PORTAL BACKEND ARCHITECTURE AUDIT

> **CAUTION:**
> This audit reveals that **7 out of 8 desktop portal widgets are empty stubs** (`() => null`). The mobile UI I built reuses those same stubs. Neither desktop nor mobile currently renders real data for Documents, Timeline, Billing, Health, Milestones, or Environments. Only **Overview** and **Credentials** are implemented components. The architectural inconsistency is not "mobile is ahead of desktop"—it's that **almost nothing is implemented on either surface**, despite a fully functional backend.

---

## 1. What Is the Client Portal?

**Answer from the backend:** It is a **read-only project dashboard with credential access**.

The Client Portal has **no dedicated backend**. It directly consumes the same Supabase database that StudioHQ writes to, filtered through Row-Level Security (RLS) policies. The client is scoped to:
- Projects in workspaces they are a member of (`workspace_members`)
- Invoices in organizations they belong to (`organization_members`)
- Timeline events marked `visibility = 'CLIENT'`
- Credentials not marked `visibility = 'AGENCY'`
- Environments not marked `visibility = 'INTERNAL'`

There is no aggregation API, no portal-specific backend, and no portal read model.

---

## 2. End-to-End Request Flow

```
Client Login (Supabase Auth)
        |
        v
JWT (user_id + roles)
        |
        v
Frontend: portalRepository.ts
        |
        +---> supabase.from('projects').select(...)
        +---> supabase.from('milestones').select(...)
        +---> supabase.from('deliverable_files').select(...)
        +---> supabase.from('project_environments').select(...)
        +---> supabase.from('project_credentials').select(...)
        +---> supabase.from('project_activity_projection').select(...)
        |
        v
Supabase PostgREST + RLS
        |
        v
PostgreSQL (RLS Policies filter by workspace_members / organization_members)
        |
        v
Filtered Data --> React Query Cache --> UI
```

**There is no aggregation endpoint.** The frontend makes **6 separate Supabase queries** every time the portal loads:

| Query | Table | Filter |
|-------|-------|--------|
| Projects | `projects` | RLS: `workspace_members.user_id = auth.uid()` |
| Milestones | `milestones` | `project_id` match |
| Documents | `deliverable_files` | `project_id` match |
| Environments | `project_environments` | `visibility != 'INTERNAL'` |
| Credentials | `project_credentials` | `archived_at IS NULL` |
| Timeline | `project_activity_projection` | `is_client_visible = true` |

---

## 3. Complete Entity Relationship Map

```
Organization
  |-- Workspace
  |     |-- Project
  |     |     |-- Milestone
  |     |     |     +-- DeliverableFile (linked)
  |     |     |     +-- ProjectTask (linked)
  |     |     |-- DeliverableFile
  |     |     |-- ProjectEnvironment
  |     |     |-- ProjectCredential
  |     |     |     +-- CredentialPermission
  |     |     |     +-- CredentialAuditLog
  |     |     |-- ProjectTask
  |     |     |-- TimelineEvent (dual visibility)
  |     |     |-- ProjectActivityProjection (granular feed)
  |     |     +-- ProjectInternalNote (admin only)
  |     +-- WorkspaceMember
  |-- Invoice
  |-- Contract
  |-- ClientJourneyEvent
  +-- OrganizationMember
```

### Portal-Relevant Entities

| Entity | Table | Exists in DB | Portal Repository Method |
|--------|-------|:---:|---|
| Project | `projects` | YES | `getClientProjects()` |
| Milestone | `milestones` | YES | `getMilestones()` |
| Document | `deliverable_files` | YES | `getDocuments()` |
| Environment | `project_environments` | YES | `getEnvironments()` |
| Credential | `project_credentials` | YES | `getCredentials()` |
| Timeline | `project_activity_projection` | YES | `getTimeline()` |
| Invoice | `invoices` | YES | **No method** |
| Task | `project_tasks` | YES | **No method** |
| Internal Note | `project_internal_notes` | YES | **No method** (correctly excluded) |
| Meeting / Calendar | -- | NO TABLE | **No table** |
| Notification | -- | NO TABLE | **No table** |
| Message | -- | NO TABLE | **No table** |

---

## 4. StudioHQ to Client Portal Integration

```
StudioHQ (Admin) -- agencyOsService.ts (CQRS Commands)
  |
  |-- crm.submitConsultationLead()
  |-- finance.issueInvoice()
  |-- finance.verifyPayment()
  |-- delivery.completeMilestone()          --> Auto-creates CLIENT timeline event
  |-- delivery.updateProjectLifecycleStage() --> Auto-creates CLIENT timeline event
  |-- assets.registerDeliverableFile()       --> Auto-creates CLIENT timeline event
  |-- communication.appendTimelineEvent()
  |-- audit.logAdminAction()
  |
  |-- provision_client_command() (SQL RPC)
  |     |-- Creates Organization
  |     |-- Creates Workspace
  |     |-- Creates Project(s) from Templates
  |     |-- Creates Milestones from Templates
  |     |-- Creates Environments from Templates
  |     +-- Emits Domain Events to Outbox
  |
  v
Shared PostgreSQL Database (RLS enforces visibility)
  |
  v
Client Portal (Frontend) -- portalRepository.ts (Read-Only Queries)
  |-- getClientProjects()
  |-- getMilestones()
  |-- getDocuments()
  |-- getEnvironments()
  |-- getCredentials()
  +-- getTimeline()
  
  watchPortal() (Realtime Subscriptions)
  |-- projects table changes
  |-- milestones table changes
  |-- project_environments changes
  |-- project_credentials changes
  +-- project_activity_projection changes
```

**Key finding:** The portal has **no dedicated backend**. It shares a database. RLS is the **only** security boundary. This is architecturally valid for a B2B SaaS portal of this scale, but it means:
- There is no portal aggregation API
- There is no portal read model (unlike the CEO Dashboard, which has dedicated projections)
- Every widget independently queries Supabase

---

## 5. Event Flow (What Creates Timeline Entries)

| StudioHQ Action | Auto-Creates Timeline Event? | Visibility |
|---|:---:|---|
| `completeMilestone()` | YES | `CLIENT` (via `timeline_events`) |
| `updateProjectLifecycleStage()` | YES | `CLIENT` (via `timeline_events`) |
| `registerDeliverableFile()` | YES | `CLIENT` (via `timeline_events`) |
| `create_project_credential()` (SQL RPC) | YES | `project_activity_projection` |
| `rotate_project_credential()` (SQL RPC) | YES | `project_activity_projection` |
| `archive_project_credential()` (SQL RPC) | YES | `project_activity_projection` |
| `create_project_task()` (SQL RPC) | YES | `is_client_visible = false` (internal) |
| `update_project_task_status()` (SQL RPC) | YES | `is_client_visible = false` (internal) |

> **IMPORTANT:**
> There are **two separate timeline systems**:
> 1. `timeline_events` -- Dual-visibility (`CLIENT` / `INTERNAL`), queried by `agencyOsService`
> 2. `project_activity_projection` -- Granular activity feed with `is_client_visible` flag, queried by `portalRepository`
>
> The portal reads from `project_activity_projection`, NOT `timeline_events`. These are **different tables** with different schemas and different write paths.

---

## 6. Realtime Event Subscriptions

The portal uses Supabase Realtime via `watchPortal()`:

```
projects                    --> invalidates ['clientProjects']
milestones                  --> invalidates ['milestones', projectId] + ['clientProjects']
project_environments        --> invalidates ['environments', projectId]
project_credentials         --> invalidates ['credentials', projectId]
project_activity_projection --> invalidates ['timeline', projectId]
```

> **WARNING:**
> `deliverable_files` (Documents) has **no realtime subscription**. If StudioHQ uploads a deliverable, the client won't see it until they refresh.

---

## 7. Permission Boundary Matrix

| StudioHQ Module | Client Portal Access | Enforcement |
|---|---|---|
| CRM (Leads, Deals, Proposals) | NO | RLS: No policy grants client access |
| Analytics (CEO Projections) | NO | RLS: No policy grants client access |
| Credentials | Partial | RLS + Visibility column (`AGENCY` hidden) + `reveal_project_credential()` enforces client != AGENCY |
| Timeline Events | Partial | RLS + `visibility = 'CLIENT'` filter |
| Activity Projection | Partial | RLS + `is_client_visible = true` filter |
| Environments | Partial | RLS + `visibility != 'INTERNAL'` filter |
| Milestones | Read-only | RLS: workspace membership |
| Documents | Read-only | RLS: workspace membership |
| Projects | Read-only | RLS: workspace membership |
| Invoices | Read-only | RLS: organization membership |
| Internal Notes | NO | RLS: No policy grants client access |
| Audit Logs | NO | RLS: No policy grants client access |
| Tasks | NO | No client-facing RLS policy found |
| CMS (Portfolio) | NO | Separate domain, not portal-relevant |
| Media | NO | Separate domain |

---

## 8. Desktop vs. Mobile Feature Parity Matrix

> **This is the critical finding.** Out of 8 widgets rendered in the desktop grid, **only 2 have real implementations**. The rest return `null`.

| Feature | Backend Table | Repository Method | Desktop Component | Mobile Component | Actual Status |
|---|---|---|---|---|---|
| Overview | `projects` | `getClientProjects()` | **Implemented** | Wraps desktop | **Working** |
| Credentials | `project_credentials` | `getCredentials()` | **Implemented** (109 lines) | Wraps desktop | **Working** |
| Milestones | `milestones` | `getMilestones()` | `() => null` | Wraps desktop stub | **STUB** |
| Documents | `deliverable_files` | `getDocuments()` | `() => null` | Wraps desktop stub | **STUB** |
| Timeline | `project_activity_projection` | `getTimeline()` | `() => null` | Wraps desktop stub | **STUB** |
| Environments | `project_environments` | `getEnvironments()` | `() => null` | Wraps desktop stub | **STUB** |
| Health | `projects` (health_* columns) | -- | `() => null` | Wraps desktop stub | **STUB** |
| Billing | `invoices` | **No method** | `() => null` | Wraps desktop stub | **STUB + No API** |
| Upload Files | `deliverable_files` | **No upload method** | Not present | FAB only | **No Backend** |
| Meetings | -- | **No table** | Button only | FAB only | **No Backend** |
| Notifications | -- | **No table** | Not present | Not present | **No Backend** |
| Messages | -- | **No table** | Not present | Not present | **No Backend** |

---

## 9. Missing Backend Capabilities

| Capability | Status | What's Needed |
|---|---|---|
| Invoice listing for portal | API exists in `agencyOsService.finance.listInvoices()` but **no portal repository method** | Add `getInvoices()` to `portalRepository` |
| File Upload (Client to Storage) | MISSING | Supabase Storage bucket + upload RPC + `portalRepository.uploadDocument()` |
| Meetings / Calendar | MISSING | New table `meetings`, booking RPC, calendar integration |
| Notifications | MISSING | New table `client_notifications`, push/poll mechanism |
| Messages | MISSING | New table `project_messages`, realtime channel |
| Portal Read Model | MISSING | Dedicated projection like CEO dashboard has |
| Document Realtime | PARTIAL | Missing from `watchPortal()` subscription |

---

## 10. Recommended Architecture Changes Before Continuing UI

> **Do not continue building mobile UI components until the shared widget implementations exist.** Both desktop and mobile currently render the same `() => null` stubs. Building a beautiful mobile shell around empty components is cosmetic debt.

### Priority 1: Implement the 6 stub widgets (shared components)
These components are imported by **both** desktop and mobile layouts:
1. `Milestones.tsx` -- Query `portalRepository.getMilestones()`, render progress
2. `Documents.tsx` -- Query `portalRepository.getDocuments()`, render file list
3. `Timeline.tsx` -- Query `portalRepository.getTimeline()`, render activity feed
4. `Environments.tsx` -- Query `portalRepository.getEnvironments()`, render env cards
5. `Health.tsx` -- Read `health_*` columns from `activeProject`, render status indicators
6. `Billing.tsx` -- Add `getInvoices()` to `portalRepository`, then render

### Priority 2: Add missing portal repository methods
- `portalRepository.getInvoices(organizationId)` -- For Billing widget
- Add `deliverable_files` to `watchPortal()` realtime subscriptions

### Priority 3: Decide on missing backend domains
Before building UI for these, the database schema must exist:
- Meetings / Calendar booking
- Notifications
- Client-to-agency messaging
- Client file upload flow

### Priority 4: Then resume mobile layout polish
Once the shared widgets render real data, both desktop and mobile will automatically come alive. At that point, mobile-specific optimizations (section layouts, progressive disclosure, curated feeds) become meaningful.
