import type { ProjectEnvironment } from '../../../types/studioHQ';
import type { PortalEnvironment } from '../types/portalModels';

const STATUS_LABELS: Record<string, string> = {
  active: 'Live',
  inactive: 'Offline',
  deploying: 'Deploying',
  healthy: 'Healthy',
  degraded: 'Degraded',
};

export function mapEnvironmentToPortal(row: ProjectEnvironment): PortalEnvironment {
  const rawStatus = (row.status || 'active').toLowerCase();

  return {
    id: row.id,
    name: (row as any).name || row.type,
    type: row.type,
    url: row.url,
    status: rawStatus,
    statusLabel: STATUS_LABELS[rawStatus] || row.status || 'Unknown',
    visibility: row.visibility,
    lastDeployedAt: row.last_deployed || null,
  };
}
