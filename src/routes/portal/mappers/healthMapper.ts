import type { PortalHealth, PortalHealthIndicator } from '../types/portalModels';

// =============================================================================
// HEALTH MAPPER
// Converts raw project health text columns → semantic PortalHealth DTO.
// Today reads from project object. Tomorrow may read from health_projection.
// =============================================================================

const POSITIVE_STATUSES = new Set([
  'Healthy', 'On Track', 'Locked', 'Excellent',
]);

const WARNING_STATUSES = new Set([
  'At Risk', 'Expanding', 'Slow', 'Moderate',
]);

function resolveColor(status: string): 'emerald' | 'amber' | 'red' {
  if (POSITIVE_STATUSES.has(status)) return 'emerald';
  if (WARNING_STATUSES.has(status)) return 'amber';
  return 'red';
}

function toIndicator(label: string, rawStatus: string): PortalHealthIndicator {
  const status = rawStatus || 'Unknown';
  return {
    label,
    status,
    color: resolveColor(status),
  };
}

/**
 * Map the raw health columns from the active project into a PortalHealth DTO.
 * The project object is passed in directly — the caller decides where it comes from
 * (ProjectContext today, Portal Projection tomorrow).
 */
export function mapProjectToHealth(project: any): PortalHealth {
  return {
    budget: toIndicator('Budget', project?.health_budget),
    timeline: toIndicator('Timeline', project?.health_timeline),
    scope: toIndicator('Scope', project?.health_scope),
    clientResponse: toIndicator('Client Response', project?.health_client_response),
  };
}
