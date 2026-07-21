# Client Portal Domain Model (v1.0 FROZEN)

This document defines the first-class domain concepts for the Client Portal. These concepts form a stable, permanent API contract that insulates the portal experience from the underlying StudioHQ database schemas.

---

## 1. Core Domain Objects

These are the fundamental entities that the portal reasons about.

### Project
The root aggregate of the client's workspace.
- **Attributes:** ID, Title, Status, Progress Percentage, Current Stage, Health Metrics.
- **Behavior:** Acts as the boundary for all other domain objects.

### Feed (Event-Driven Projection)
A unified, chronological stream of everything that happens in a project. Generated via domain events, not table joins.
- **Attributes:** ID, Icon, Title, Description, Timestamp, Priority, Category.
- **Category:** `DOCUMENT`, `INVOICE`, `DEPLOYMENT`, `MEETING`, `CREDENTIAL`, `MILESTONE`, `ANNOUNCEMENT`.
- **Priority:** `CRITICAL`, `IMPORTANT`, `NORMAL`, `LOW`.

### Client Action (Event-Driven Projection)
An explicit, actionable task required from the client. Generated automatically from StudioHQ domain events (e.g., `InvoiceIssued` → `Pay Invoice`).
- **Attributes:** ID, Title, Description, Action Type (e.g., `APPROVE_DESIGN`, `PAY_INVOICE`), Priority, Status (`PENDING`, `COMPLETED`), CTA URL, CTA Label, Due Date.
- **Audit Fields:** `created_by`, `completed_by`, `completion_source` (e.g., `client`, `automation`, `admin`).

### Milestone
A major phase or deliverable target.
- **Attributes:** ID, Title, Description, Status (`PENDING`, `ACTIVE`, `COMPLETED`), Target Date.

### Deliverable (formerly Document)
An artifact produced by the agency for the client.
- **Attributes:** ID, File Name, Category, Version, File Type, Size, Upload Date, Download URL.

### Invoice
A financial request.
- **Attributes:** ID, Number, Title, Formatted Amount, Status, Due Date, Paid Date.

### Environment & Credential
Technical resources shared with the client.
- **Environment:** Name, URL, Status (Live, Deploying), Last Deployed.
- **Credential:** Name, Username, Secret (revealable), Rotation Status.

### Meeting
An abstract scheduled sync between the client and the agency.
- **Attributes:** ID, Title, Scheduled Time, Duration, Provider (e.g., `zoom`, `google_meet`, `teams`), Join URL, Status.

---

## 2. Experience DTOs (Versioned Contracts)

The portal UI consumes tailored view models assembled specifically for each screen. These contracts are versioned to provide stability for web and mobile clients.

### `HomeExperienceDTO_v1`
Optimized for the "Decision Dense" mobile view and the curated desktop dashboard.
```ts
interface HomeExperienceDTO_v1 {
  greeting: string;                     // "Good Morning, Jeshu"
  hero: {
    projectName: string;
    progressPercentage: number;
    currentStage: string;
    healthIndicator: 'green' | 'amber' | 'red';
  };
  primaryAction: NextActionCard | null; // The single most important task (from client_actions)
  needsFromYou: NextActionCard[];       // Secondary pending client actions
  latestImportantUpdate: FeedCard | null; // Most recent CRITICAL or IMPORTANT feed event
  nextMilestone: NextMilestoneCard | null;
  upcomingMeeting: MeetingCard | null;
}
```

### `ProjectExperienceDTO_v1`
Optimized for deep-dives into resources with necessary project context.
```ts
interface ProjectExperienceDTO_v1 {
  context: {
    progress: number;
    completionEstimate: string | null;
    projectHealth: PortalHealth;
  };
  deliverablesSummary: { count: number; recent: DeliverableCard[] };
  environments: EnvironmentCard[];
  credentials: CredentialCard[];
}
```

### `UpdatesExperienceDTO_v1` (The Unified Feed)
Optimized for scanning history.
```ts
interface UpdatesExperienceDTO_v1 {
  feedGroups: {
    label: string; // "Today", "Yesterday", "Last Week", "October 2026"
    items: FeedItem[];
  }[];
}
```

### `BillingExperienceDTO_v1`
Optimized for financial clarity.
```ts
interface BillingExperienceDTO_v1 {
  summary: { totalOutstanding: string; nextDueDate: string | null };
  pendingInvoices: InvoiceCard[];
  paidInvoices: InvoiceCard[];
}
```

---

## 3. The Architecture (Experience Projections)

The portal architecture aligns with StudioHQ's event-driven philosophy.

```text
                    StudioHQ
                         │
                  Domain Events
                         │
                Projection Workers
                         │
         Portal Experience Projections (Feed, Actions)
                         │
                Portal Repository
                         │
             Portal Domain Service
                         │
            Experience Builders (pure assembly)
                         │
             Experience DTOs (v1)
                         │
                React Query Hooks
                         │
          Desktop + Mobile Portal
```

By defining these concepts as first-class domain objects and event-driven projections, the Client Portal is completely insulated from schema changes and ready for mobile apps, push notifications, and AI summaries.
