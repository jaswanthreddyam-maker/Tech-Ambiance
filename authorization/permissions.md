# StudioHQ Permissions Dictionary

> **Auto-generated from `authorization/permissions.yaml`**

## Dashboard

| ID | Name | Description | Dangerous |
|---|---|---|---|
| `dashboard:read` | View Dashboard | Can view the overview dashboard | No |
| `dashboard:export` | Export Dashboard | Can export executive reports and metrics | No |

## Portfolio

| ID | Name | Description | Dangerous |
|---|---|---|---|
| `portfolio:read` | View Portfolio | Can view portfolio projects | No |
| `portfolio:write` | Edit Portfolio | Can create and edit portfolio projects | No |
| `portfolio:delete` | Delete Portfolio | Can permanently delete portfolio projects | ⚠️ Yes |
| `portfolio:publish` | Publish Portfolio | Can change project status to published | No |
| `project:read` | View Projects | Can view internal operational projects | No |

## CRM

| ID | Name | Description | Dangerous |
|---|---|---|---|
| `crm:read` | View CRM | Can view leads and pipelines | No |
| `crm:write` | Edit CRM | Can update lead status and details | No |
| `crm:delete` | Delete Lead | Can delete leads from pipeline | ⚠️ Yes |
| `crm:export` | Export CRM | Can export pipeline data to CSV | No |
| `crm:proposal` | Generate Proposals | Can generate interactive SOWs | No |

## Workspaces

| ID | Name | Description | Dangerous |
|---|---|---|---|
| `workspace:read` | View Workspaces | Can view client workspaces | No |
| `workspace:write` | Edit Workspaces | Can edit workspace details and projects | No |
| `workspace:delete` | Delete Workspaces | Can delete workspaces | ⚠️ Yes |
| `workspace:provision` | Provision Workspace | Can provision new client environments | No |

## Media

| ID | Name | Description | Dangerous |
|---|---|---|---|
| `media:read` | View Media | Can browse the media vault | No |
| `media:upload` | Upload Media | Can upload assets to edge storage | No |
| `media:delete` | Delete Media | Can delete assets from edge storage | ⚠️ Yes |

## AI

| ID | Name | Description | Dangerous |
|---|---|---|---|
| `ai:read` | View AI Center | Can view the AI Center dashboard | No |
| `ai:scout` | Run ScoutAI | Can execute autonomous diagnostic scans | No |
| `ai:generate` | Generate SOW (AI) | Can use AI to generate Executive Summaries | No |

## CMS

| ID | Name | Description | Dangerous |
|---|---|---|---|
| `cms:read` | View CMS | Can view website drafts and diffs | No |
| `cms:edit` | Edit CMS | Can edit website copy and sections | No |
| `cms:publish` | Publish CMS | Can trigger cache invalidation and publish to edge | ⚠️ Yes |
| `cms:rollback` | Rollback CMS | Can rollback website to previous snapshot | ⚠️ Yes |

## System

| ID | Name | Description | Dangerous |
|---|---|---|---|
| `system:read` | View System Settings | Can view system and workspace settings | No |
| `system:audit` | View Audit Logs | Can view security audit logs | No |
| `system:roles` | Manage Roles | Can modify role definitions and assignments | ⚠️ Yes |
| `system:users` | Manage Users | Can invite, revoke, or delete studio users | ⚠️ Yes |
| `system:billing` | Manage Billing | Can view and modify billing information | ⚠️ Yes |

## Analytics

| ID | Name | Description | Dangerous |
|---|---|---|---|
| `analytics:finance` | View Financial Analytics | Can view revenue and financial metrics | No |

