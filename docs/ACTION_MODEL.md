# StudioHQ Action Architecture Model

This document specifies the architecture, lifecycle, and strict implementation rules for authorization-gated interactions within the StudioHQ admin interface.

## Core Philosophy
Every user action that modifies state, initiates a destructive workflow, or interacts with sensitive data MUST be completely declarative. No UI component or page should independently implement loading states, permission checks, confirmation dialogs, or analytics logging for these actions.

## The Dual Registry Model

To prevent the Action Registry from becoming an unmanageable monolith, authorization policy is strictly separated from UI behavior.

### 1. Action Authorization Metadata (`src/auth/registry/actions.ts`)
This registry defines **WHAT** the action is and **WHO** can perform it.

```ts
export interface ActionDefinition {
  id: string; // e.g., 'portfolio.publish'
  requiredPermission: PermissionId; // e.g., Permission.PORTFOLIO_PUBLISH
}
```

### 2. Action Behavior Metadata (`src/auth/registry/actionBehavior.ts`)
This registry defines **HOW** the action behaves in the UI.

```ts
export interface ActionBehaviorDefinition {
  id: string;
  category?: ActionCategory;
  requiresConfirmation?: boolean;
  confirmationStyle?: "default" | "warning" | "danger";
  confirmationTitle?: string;
  confirmationMessage?: string;
  confirmButtonLabel?: string;
  successMessage?: string | ((data?: any) => string);
  failureToast?: string;
  analyticsEvent?: string;
  visibility?: "hidden" | "disabled";
  audit?: boolean;
  featureFlag?: string;
  onSuccess?: 'invalidate' | 'redirect' | 'refresh' | 'none';
}
```

## The Action Lifecycle
When a user interacts with an `<ActionButton>`, the following exact lifecycle is enforced:

```text
Click
  ↓
1. Permission Check (Registry evaluates against User Claims)
  ↓
2. Confirmation Dialog (If `requiresConfirmation` is true)
  ↓
3. Loading State (`isExecuting` prevents double-clicks)
  ↓
4. Analytics Logging (If `analyticsEvent` is configured)
  ↓
5. Mutation Execution (The `onAction` promise)
  ↓
6. Success/Failure Toast (Triggered by Registry behavior)
  ↓
7. Cache Invalidation (If `onSuccess: 'invalidate'`)
  ↓
Done
```

## Strict Implementation Rules

1. **No Ad-Hoc Confirmations:** Feature pages must NEVER implement their own "Are you sure?" dialogs for actions.
2. **No Ad-Hoc Toasts:** Feature pages must NEVER call `toast.success()` or `toast.error()` for mutations that exist in the registry.
3. **No Direct Permission Checks for UI State:** Feature pages must NEVER use `disabled={!can(Permission.X)}`. That logic belongs inside the `<ActionButton>`. (Note: The `can()` hook is still permitted inside foundational routing or layout infrastructure).
4. **No Raw Strings:** Feature pages must NEVER reference raw permission strings like `'portfolio:publish'`. Always use the `Permission` enum constants.
5. **No Orphan Actions:** Every action in `ACTION_REGISTRY` MUST reference a valid, generated `PermissionId`.
6. **Pure Metadata Component:** `<ActionButton>` must NEVER contain hardcoded switch statements like `if (action === 'workspace.create')`. It must rely purely on resolving the `actionId` against the dual registries.
