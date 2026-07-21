import type { MilestoneItem } from '../../../types/studioHQ';
import type { PortalMilestone, PortalMilestoneStatus } from '../types/portalModels';

const STATUS_LABELS: Record<PortalMilestoneStatus, string> = {
  pending: 'Upcoming',
  active: 'In Progress',
  completed: 'Completed',
  archived: 'Archived',
};

export function mapMilestoneToPortal(row: MilestoneItem): PortalMilestone {
  const status = (row.status || 'pending') as PortalMilestoneStatus;

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status,
    statusLabel: STATUS_LABELS[status] || status,
    targetDate: row.target_date,
    completedAt: row.completed_at,
    displayOrder: row.display_order,
  };
}
