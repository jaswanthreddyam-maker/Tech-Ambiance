

// =============================================================================
// PORTAL UI DTOs — Presentation-safe models. No raw DB columns leak into widgets.
// =============================================================================

// --- Milestones ---
export type PortalMilestoneStatus = 'pending' | 'active' | 'completed' | 'archived';

export interface PortalMilestone {
  id: string;
  title: string;
  description: string | null;
  status: PortalMilestoneStatus;
  statusLabel: string;
  targetDate: string;
  completedAt: string | null;
  displayOrder: number;
}

// --- Documents ---
export interface PortalDocument {
  id: string;
  fileName: string;
  category: string;
  versionTag: string;
  fileType: string;
  fileSize: string;
  uploadedBy: string | null;
  uploadedAt: string;
  storagePath: string;
}

// --- Timeline ---
export type PortalTimelineImportance = 'high' | 'medium' | 'low';

export interface PortalTimelineItem {
  id: string;
  icon: string; // lucide icon name
  title: string;
  description: string;
  timestamp: string;
  importance: PortalTimelineImportance;
  eventType: string;
}

// --- Environments & Credentials ---
export interface PortalEnvironment {
  id: string;
  name: string;
  type: string;
  url: string;
  status: string;
  statusLabel: string;
  visibility: string;
  lastDeployedAt: string | null;
}

export interface PortalCredential {
  id: string;
  name: string;
  username: string;
  secret: string; // revealable
  rotationStatus: string;
}

// --- Invoices ---
export interface PortalInvoice {
  id: string;
  invoiceNumber: string;
  title: string;
  amount: number;
  formattedAmount: string;
  currency: string;
  status: string;
  statusLabel: string;
  statusColor: string;
  dueDate: string;
  paidAt: string | null;
}

// --- Health ---
export interface PortalHealthIndicator {
  label: string;
  status: 'Healthy' | 'On Track' | 'Locked' | 'Excellent' | 'At Risk' | 'Over Budget' | 'Delayed' | 'Expanding' | 'Slow' | string;
  color: 'emerald' | 'amber' | 'red';
}

export interface PortalHealth {
  budget: PortalHealthIndicator;
  timeline: PortalHealthIndicator;
  scope: PortalHealthIndicator;
  clientResponse: PortalHealthIndicator;
}

// --- Future-proofed stubs (interface only, no implementation yet) ---
export interface PortalNotification {
  id: string;
  title: string;
  body: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface PortalMeeting {
  id: string;
  title: string;
  scheduledAt: string;
  duration: number; // minutes
  attendees: string[];
  meetingUrl: string | null;
  status: 'scheduled' | 'completed' | 'cancelled';
}
