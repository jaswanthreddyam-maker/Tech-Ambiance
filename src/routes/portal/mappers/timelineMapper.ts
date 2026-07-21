import type { ProjectActivityEvent } from '../../../types/studioHQ';
import type { PortalTimelineItem, PortalTimelineImportance } from '../types/portalModels';

// =============================================================================
// EVENT TYPE REGISTRY
// Maps raw event_type strings → human-readable timeline items.
// This file will grow as more event types are introduced.
// =============================================================================

interface EventTypeConfig {
  icon: string;
  titleTemplate: string;
  importance: PortalTimelineImportance;
}

const EVENT_TYPE_REGISTRY: Record<string, EventTypeConfig> = {
  // Milestone events
  MILESTONE_COMPLETED: {
    icon: 'check-circle',
    titleTemplate: 'Milestone Completed',
    importance: 'high',
  },

  // Credential events
  CREDENTIAL_CREATED: {
    icon: 'key-round',
    titleTemplate: 'Credential Added',
    importance: 'medium',
  },
  CREDENTIAL_ROTATED: {
    icon: 'refresh-cw',
    titleTemplate: 'Credential Rotated',
    importance: 'medium',
  },
  CREDENTIAL_ARCHIVED: {
    icon: 'archive',
    titleTemplate: 'Credential Archived',
    importance: 'low',
  },

  // Task events
  TASK_CREATED: {
    icon: 'list-plus',
    titleTemplate: 'Task Created',
    importance: 'low',
  },
  TASK_STATUS_CHANGED: {
    icon: 'arrow-right-circle',
    titleTemplate: 'Task Updated',
    importance: 'low',
  },

  // Delivery events
  STAGE_TRANSITION: {
    icon: 'trending-up',
    titleTemplate: 'Project Phase Updated',
    importance: 'high',
  },

  // Asset events
  DOCUMENT_UPLOADED: {
    icon: 'file-up',
    titleTemplate: 'Document Uploaded',
    importance: 'medium',
  },

  // Deployment events
  DEPLOYMENT_COMPLETED: {
    icon: 'rocket',
    titleTemplate: 'Deployment Completed',
    importance: 'high',
  },

  // Finance events
  INVOICE_ISSUED: {
    icon: 'receipt',
    titleTemplate: 'Invoice Issued',
    importance: 'high',
  },
  INVOICE_PAID: {
    icon: 'check-circle',
    titleTemplate: 'Payment Confirmed',
    importance: 'high',
  },
};

const DEFAULT_CONFIG: EventTypeConfig = {
  icon: 'activity',
  titleTemplate: 'Update',
  importance: 'low',
};

function extractDescription(_eventType: string, payload: any): string {
  if (!payload || typeof payload !== 'object') return '';

  // Build a human-readable description from the event payload
  if (payload.title) return payload.title;
  if (payload.name) return payload.name;
  if (payload.description) return payload.description;
  if (payload.new_status) return `Status changed to ${payload.new_status}`;
  if (payload.new_version) return `Version ${payload.new_version}`;

  return '';
}

export function mapActivityToTimeline(row: ProjectActivityEvent): PortalTimelineItem {
  const config = EVENT_TYPE_REGISTRY[row.event_type] || DEFAULT_CONFIG;

  return {
    id: row.id,
    icon: config.icon,
    title: config.titleTemplate,
    description: extractDescription(row.event_type, row.payload),
    timestamp: row.created_at,
    importance: config.importance,
    eventType: row.event_type,
  };
}
