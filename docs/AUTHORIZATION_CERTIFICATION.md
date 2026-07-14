# StudioHQ Frontend Authorization Framework v1.0
## Certification Artifact

**Status**: CERTIFIED & FROZEN
**Framework Version**: 1.0

### Deterministic Certification Hash
- **Git Commit**: `f85962f4e5a27195db8dc14fb6ee4cd5fdba794c`
- **Build Date**: 2026-07-14
- **Permission Dictionary Version**: 1.0
- **Architecture Validator Version**: 1.0
## Certification Summary
The StudioHQ Frontend Authorization Framework has undergone repository-wide verification to ensure strict adherence to declarative, metadata-driven authorization policies. The framework successfully separates routing, UI presentation, and mutation authorization into decentralized, immutable registries.

## Certification Inputs & Automated CI Pipeline
This framework is backed by an automated verification pipeline that runs on every pull request. The successful execution of this pipeline is mandatory to maintain `v1.0` certification.

```text
TypeScript Compiler -> Vite Build -> Architecture Validator -> Role Snapshot Tests -> Dead Code Analyzer
```

### Final Execution Results (2026-07-14)
- **TypeScript (`tsc -b`)**: PASS
- **Build (`vite build`)**: PASS
- **Architecture Validator (`verify-architecture.ts`)**: PASS (0 Missing Metadata, 0 Invalid Permissions, 0 Circular Dependencies)
- **Snapshot Tests (`vitest`)**: PASS (Exact sorted string array match per legacy role)
- **Knip (`knip`)**: PASS (0 unused files/exports in the auth module layer)
- **Coverage Report**: PASS (Generated and reviewed. No orphan permissions outside expected boundaries)

## Verification Checkpoints

✅ **Route Registry (`src/auth/registry/routes.ts`)**: Verified. All `ADMIN_ROUTES` mapped directly to generated `PermissionId`.
✅ **Sidebar Registry (`src/auth/registry/sidebar.ts`)**: Verified. All visible modules map directly to generated `PermissionId`.
✅ **Widget Registry (`src/auth/registry/widgets.tsx`)**: Verified. All dynamic dashboard blocks strictly filter via generated `PermissionId`.
✅ **Action Registry (`src/auth/registry/actions.ts`)**: Verified. All mutating actions resolve to valid generated `PermissionId`.
✅ **Action Behavior Registry (`src/auth/registry/actionBehavior.ts`)**: Verified. Split successfully to isolate UI behaviors (toasts, analytics, invalidations) from core authorization rules.
✅ **Guards (`src/auth/guards/`)**: Verified. `PermissionGuard` and `AuthGuard` isolate enforcement logic from registry definitions.
✅ **Permission Sweeps**: Verified. A full repository sweep confirmed **0** raw permission strings exist in application feature components.
✅ **Compilation**: Verified. `npx tsc -b` succeeds with 0 type violations related to the authorization packages.

## Architectural Freeze Notice
**The structural architecture of the `src/auth/registry` directory is officially frozen.**

No further architectural refactoring or restructuring of the frontend authorization framework is permitted until a future major version update.

### Developer Rules (Post-Freeze):
1. **Read-Only by Convention**: Do not edit `sidebar.ts`, `routes.ts`, or `permissions.ts` to implement custom ad-hoc rules.
2. **Extensions Only**: If a new module is added, extend the registries. Do not build parallel authorization solutions.
3. **No Legacy Fallbacks**: The `user.role === 'OWNER'` legacy compatibility fallback inside `PermissionProvider.tsx` remains strictly for the duration of the backend RLS rollout (Phase C), after which it will be deprecated and removed in Phase C8. It must NOT be replicated elsewhere.
