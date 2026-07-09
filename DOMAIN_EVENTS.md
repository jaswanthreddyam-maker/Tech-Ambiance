# StudioHQ & Client Portal: Event-Driven Domain Architecture & Event Catalog

> **Status:** ARCHITECTURE FROZEN  
> **Approach:** CQRS / Event-Driven Agency Operating System (`Command → Handler → Business Rule Verification → DB Transaction → Domain Event → Projection & Subscriber Updates`)

---

## 1. Architectural Bounded Contexts (`backend/app/`)

```text
backend/app/
├── auth/            # Identity & Security (Users, Organizations, Workspaces, Roles, PKCE)
├── crm/             # Commercial Pipeline (Leads, Deals, Consultations, Proposals)
├── delivery/        # Production & Execution (Projects, Milestones, Project Templates)
├── finance/         # Financial Gatekeeper (Invoices, Payment Verification, Contracts)
├── communication/   # Client Engagement (Executive Timelines, Notifications, Announcements)
├── assets/          # Digital Vault (Storage Buckets, Deliverable Versioning v1/v2/Final)
├── audit/           # Compliance (Immutable Admin Audit Logs)
├── automation/      # Autonomous Workers (Celery/Cron Jobs, Auto Follow-ups, ScoutAI Scans)
├── rules/           # Centralized Business Rules Engine
└── events/          # First-Class Domain Event Schemas & Event Bus
```

---

## 2. Strict Sequential Implementation Protocol

```text
1. Business Rules Registry (backend/app/rules/)
        ↓
2. PostgreSQL Database Schema & RLS Policies
        ↓
3. ORM Domain Models & Aggregates
        ↓
4. Domain Event Catalog & Event Bus
        ↓
5. RESTful & RPC API Contracts
        ↓
6. Frontend React Query & Realtime Binding
```

---

## 3. Standard Naming Conventions

* **Commands:** Imperative action verbs ending in `Command`
  * `CreateLeadCommand`, `IssueInvoiceCommand`, `VerifyPaymentCommand`, `ActivateClientCommand`, `CompleteMilestoneCommand`
* **Command Handlers:** Command name suffixed with `Handler`
  * `CreateLeadHandler`, `ActivateClientHandler`, `CompleteMilestoneHandler`
* **Domain Events:** Past-tense domain changes ending in `Event` or explicit noun
  * `LeadCreated`, `ProposalAccepted`, `InvoiceIssued`, `PaymentVerified`, `ClientActivated`, `MilestoneCompleted`

---

## 4. Centralized Business Rules (`backend/app/rules/`)

Business rules are decoupled from REST controllers and stored as standalone policy guards:

| Rule Code | Rule Description | Enforcing Domain |
| :--- | :--- | :--- |
| **`RULE-AUTH-001`** | Only `OWNER` or senior agency `ADMIN` can activate a client workspace. | `auth/` & `rules/` |
| **`RULE-CRM-001`** | A proposal cannot be accepted if `proposal_expires_at < current_timestamp`. | `crm/` & `rules/` |
| **`RULE-FIN-001`** | Finance owns activation: A client cannot be activated until Advance Payment is verified (`Invoice.status == 'PAID'`). | `finance/` & `rules/` |
| **`RULE-FIN-002`** | An invoice cannot be marked `PAID` more than once (idempotent receipt check). | `finance/` |
| **`RULE-DEL-001`** | Project cannot transition to `PRODUCTION` if any `QA` milestone is incomplete. | `delivery/` |
| **`RULE-DEL-002`** | A workspace cannot be archived while active projects (`status != ARCHIVED`) exist. | `delivery/` |

---

## 5. Project State Machine & Valid Transitions

Projects enforce a strict state machine preventing illegal skips (e.g., `DISCOVERY → PRODUCTION` is forbidden):

```text
DISCOVERY
  │
  ▼
PLANNING
  │
  ▼
DESIGN
  │
  ▼
DEVELOPMENT
  │
  ▼
QA
  │
  ▼
STAGING
  │
  ▼
PRODUCTION
  │
  ▼
MAINTENANCE
  │
  ▼
ARCHIVED
```

* **Valid Transitions:** Only adjacent states or explicit regression flags (*e.g., `STAGING → QA` on regression block*) are permitted.

---

## 6. Authoritative Domain Event Catalog

### `LeadCreated`
* **Publisher:** `CRM` (`CreateLeadHandler`)
* **Trigger:** Prospect submits `/intro` consultation form
* **Subscribers:**
  * `Notifications`: Sends Slack/email alert to StudioHQ sales team
  * `Audit`: Records lead intake timestamp
  * `Automation`: Schedules 3-day automated consultation follow-up worker

### `ProposalAccepted`
* **Publisher:** `CRM` (`AcceptProposalHandler`)
* **Trigger:** Prospect signs MSA proposal
* **Subscribers:**
  * `Finance`: Triggers `IssueInvoiceCommand` for initial Advance Payment deposit
  * `Audit`: Logs commercial agreement sign-off

### `InvoicePaid`
* **Publisher:** `Finance` (`VerifyPaymentHandler`)
* **Trigger:** Stripe webhook or Finance manager verifies Advance Payment receipt
* **Subscribers:**
  * `Auth` / `Delivery`: Emits `ActivateClientCommand` (Finance acts as Gatekeeper)
  * `Communication`: Dispatches formal PDF payment receipt email to client
  * `Audit`: Logs immutable financial ledger receipt

### `ClientActivated`
* **Publisher:** `Finance` / `Auth` (`ActivateClientHandler`)
* **Trigger:** Advance payment verified & contract signed
* **Subscribers:**
  * `Auth`: Provisions `Organization` + `Workspace` + Client User account
  * `Communication`: Emits welcome invitation email with secure one-time magic link
  * `Communication`: Appends entry to **Client Relationship Timeline** (`Workspace Activated`)
  * `Audit`: Records organization provisioning

### `ProjectCreated`
* **Publisher:** `Delivery` (`CreateProjectHandler`)
* **Trigger:** StudioHQ Admin instantiates project from template (*e.g., Luxury Website Template*)
* **Subscribers:**
  * `Delivery`: Instantiates structured project milestone roadmap from template
  * `Communication`: Appends entry to **Client Relationship Timeline**
  * `Audit`: Records project scope creation

### `MilestoneCompleted`
* **Publisher:** `Delivery` (`CompleteMilestoneHandler`)
* **Trigger:** StudioHQ developer/designer marks sprint milestone completed
* **Subscribers:**
  * `Delivery`: Recalculates milestone-driven Progress % (`completed_milestones / total_milestones`)
  * `Communication`: Appends entry to **Client Timeline**
  * `Audit`: Records sprint sign-off

### `DeliverableUploaded`
* **Publisher:** `Assets` (`UploadDeliverableHandler`)
* **Trigger:** Team member registers file deliverable tied to a Milestone (`v1`, `v2`, `Final`)
* **Subscribers:**
  * `Communication`: Adds deliverable notification to Portal feed
  * `Audit`: Logs asset upload & version hash

### `DeploymentStarted` & `DeploymentFinished`
* **Publisher:** `Automation` / `Delivery`
* **Trigger:** CI/CD pipeline or staging build triggered
* **Subscribers:**
  * `Communication`: Appends live deployment dispatch to Studio Updates feed
  * `Audit`: Records build digest

### `ProjectCompleted`
* **Publisher:** `Delivery` (`CompleteProjectHandler`)
* **Trigger:** Final milestone completed & client signs off production deployment
* **Subscribers:**
  * `Finance`: Triggers final retaining/delivery invoice audit
  * `Communication`: Sends multi-channel executive completion dispatch (Email + WhatsApp + Portal Banner)
  * `Audit`: Records project delivery close-out
