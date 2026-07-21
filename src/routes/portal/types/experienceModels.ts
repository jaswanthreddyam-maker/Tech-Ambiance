import type { 
  PortalHealth, 
  PortalDocument, 
  PortalEnvironment, 
  PortalCredential, 
  PortalInvoice
} from './portalModels';

// =============================================================================
// EXPERIENCE DTOs (v1)
// These are the permanent, versioned API contracts for the Client Portal.
// They are assembled by Experience Builders and consumed by the UI.
// =============================================================================

export interface NextActionCard {
  id: string;
  title: string;
  description?: string;
  ctaLabel: string;
  ctaUrl: string;
  priority: 'CRITICAL' | 'IMPORTANT' | 'NORMAL' | 'LOW';
  dueDate?: string;
}

export interface FeedItem {
  id: string;
  icon: string;
  title: string;
  description?: string;
  timestamp: string;
  priority: 'CRITICAL' | 'IMPORTANT' | 'NORMAL' | 'LOW';
  category: 'DOCUMENT' | 'INVOICE' | 'DEPLOYMENT' | 'MEETING' | 'CREDENTIAL' | 'MILESTONE' | 'ANNOUNCEMENT';
}

export interface NextMilestoneCard {
  id: string;
  title: string;
  targetDate: string;
  daysRemaining: number;
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED';
}

export interface MeetingCard {
  id: string;
  title: string;
  scheduledTime: string;
  durationMinutes: number;
  provider: 'zoom' | 'google_meet' | 'teams' | 'other';
  joinUrl: string;
}

// -----------------------------------------------------------------------------
// Home Experience
// -----------------------------------------------------------------------------
export interface HomeExperienceDTO_v1 {
  version: "1.0";
  generatedAt: string;
  greeting: string;
  hero: {
    projectName: string;
    progressPercentage: number;
    currentStage: string;
    healthIndicator: 'green' | 'amber' | 'red';
  };
  primaryAction: NextActionCard | null;
  needsFromYou: NextActionCard[];
  latestImportantUpdate: FeedItem | null;
  nextMilestone: NextMilestoneCard | null;
  upcomingMeeting: MeetingCard | null;
}

// -----------------------------------------------------------------------------
// Project Experience
// -----------------------------------------------------------------------------
export interface ProjectExperienceDTO_v1 {
  version: "1.0";
  generatedAt: string;
  context: {
    progress: number;
    completionEstimate: string | null;
    projectHealth: PortalHealth;
  };
  deliverablesSummary: { 
    count: number; 
    recent: PortalDocument[];
  };
  environments: PortalEnvironment[];
  credentials: PortalCredential[];
}

// -----------------------------------------------------------------------------
// Updates Experience (Feed)
// -----------------------------------------------------------------------------
export interface UpdatesExperienceDTO_v1 {
  version: "1.0";
  generatedAt: string;
  feedGroups: {
    label: string; // e.g. "Today", "Yesterday", "Last Week"
    items: FeedItem[];
  }[];
}

// -----------------------------------------------------------------------------
// Billing Experience
// -----------------------------------------------------------------------------
export interface BillingExperienceDTO_v1 {
  version: "1.0";
  generatedAt: string;
  summary: { 
    totalOutstanding: string; 
    nextDueDate: string | null;
  };
  pendingInvoices: PortalInvoice[];
  paidInvoices: PortalInvoice[];
}
