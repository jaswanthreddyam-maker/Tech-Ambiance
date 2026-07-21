// =============================================================================
// PORTAL QUERY KEYS
// Deterministic factory for React Query cache keys.
// Ensures granular invalidation (e.g., when a document is uploaded, only the 
// documents cache is invalidated, not the entire portal).
// =============================================================================

export const portalQueryKeys = {
  all: ['portal'] as const,
  home: (id: string) => [...portalQueryKeys.all, 'home', id] as const,
  updates: (id: string) => [...portalQueryKeys.all, 'updates', id] as const,
  project: (id: string) => [...portalQueryKeys.all, 'project', id] as const,
  billing: () => [...portalQueryKeys.all, 'billing'] as const,
};
