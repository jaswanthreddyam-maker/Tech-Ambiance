import type {
  WorkspaceItem,
  LinearTaskItem,
  StudioEventItem,
} from '../types/studioHQ';

export const MOCK_WORKSPACES: WorkspaceItem[] = [
  {
    id: 'ws-1',
    workspaceName: 'Cafe Vistaara Flagship',
    slug: 'cafe-vistaara',
    clientCompany: 'Cafe Vistaara Hospitality Pvt. Ltd.',
    primaryContactName: 'Aarav Sharma',
    primaryContactEmail: 'aarav@cafevistaara.com',
    status: 'ACTIVE',
    projectCount: 3,
    activeStage: 'DEVELOPMENT',
    createdAt: '2026-06-15T09:00:00Z',
  },
  {
    id: 'ws-2',
    workspaceName: 'CoffyMine Luxury Experience',
    slug: 'coffymine',
    clientCompany: 'CoffyMine Roasters',
    primaryContactName: 'Rhea Kapoor',
    primaryContactEmail: 'rhea@coffymine.in',
    status: 'ACTIVE',
    projectCount: 2,
    activeStage: 'DESIGN',
    createdAt: '2026-06-28T14:30:00Z',
  },
  {
    id: 'ws-3',
    workspaceName: 'BrewBakes Digital Studio',
    slug: 'brewbakes',
    clientCompany: 'BrewBakes India Group',
    primaryContactName: 'Vikram Mehta',
    primaryContactEmail: 'vikram@brewbakes.co',
    status: 'ACTIVE',
    projectCount: 1,
    activeStage: 'TESTING',
    createdAt: '2026-05-10T11:15:00Z',
  },
  {
    id: 'ws-4',
    workspaceName: 'Lumina Bespoke Flagship',
    slug: 'lumina-bespoke',
    clientCompany: 'Lumina Luxury Interiors',
    primaryContactName: 'Simran Gill',
    primaryContactEmail: 'sgill@lumina.luxury',
    status: 'COMPLETED',
    projectCount: 2,
    activeStage: 'MAINTENANCE',
    createdAt: '2026-04-01T10:00:00Z',
  },
];

export const MOCK_LINEAR_TASKS: LinearTaskItem[] = [
  {
    id: 'task-101',
    workspaceId: 'ws-1',
    title: 'Architect Apple-grade Glassmorphism Consultation Modal with scroll locking',
    priority: 'HIGH',
    status: 'DONE',
    assigneeName: 'Antigravity AI',
    dueDate: '2026-07-09',
  },
  {
    id: 'task-102',
    workspaceId: 'ws-1',
    title: 'Implement TanStack Query v5 optimistic server-state cache for leads',
    priority: 'URGENT',
    status: 'IN_PROGRESS',
    assigneeName: 'Dev Lead',
    dueDate: '2026-07-12',
  },
  {
    id: 'task-103',
    workspaceId: 'ws-2',
    title: 'Design high-contrast editorial typography system in Figma',
    priority: 'HIGH',
    status: 'IN_REVIEW',
    assigneeName: 'Art Director',
    dueDate: '2026-07-11',
  },
  {
    id: 'task-104',
    workspaceId: 'ws-1',
    title: 'Connect Cloudflare R2 edge image CDN transformation pipeline',
    priority: 'MEDIUM',
    status: 'TODO',
    assigneeName: 'Backend Dev',
    dueDate: '2026-07-15',
  },
];

export const MOCK_SECRETS: any[] = [
  {
    id: 'cred-1',
    serviceName: 'Cloudflare Edge DNS & Production SSL',
    usernameOrEmail: 'admin@techambiance.com',
    maskedPayload: '••••••••••••••••••••••••AES256GCM••••••••••••••••',
    requiredRole: 'Owner',
  },
  {
    id: 'cred-2',
    serviceName: 'Supabase PostgreSQL Production Cluster',
    usernameOrEmail: 'service_role_key',
    maskedPayload: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.••••••••••••••',
    requiredRole: 'Admin',
  },
  {
    id: 'cred-3',
    serviceName: 'GitHub Enterprise Organization Access Token',
    usernameOrEmail: 'techambiance-bot',
    maskedPayload: 'ghp_••••••••••••••••••••••••••••••••••••••••••••',
    requiredRole: 'Developer',
  },
];



export const MOCK_STUDIO_TIMELINE: StudioEventItem[] = [
  {
    id: 'evt-1',
    eventKey: 'scout.scan.completed',
    title: 'ScoutAI Diagnostic Scan Completed',
    description: 'Autonomous audit finished for Cafe Vistaara Flagship — Overall Telemetry Score: 88/100.',
    timestampLabel: 'Today, 12:05 PM',
    tag: 'AI Center',
  },
  {
    id: 'evt-2',
    eventKey: 'website.published',
    title: 'Website Published to Production CDN',
    description: 'Lumina Bespoke Portfolio v3 snapshot cutover approved by Owner & live on edge.',
    timestampLabel: 'Today, 10:15 AM',
    tag: 'Website Engine',
  },
  {
    id: 'evt-3',
    eventKey: 'proposal.generated',
    title: 'Interactive Multi-Currency SOW Generated',
    description: 'Generated $65,000 USD Bespoke Flagship proposal for Apex Dining Group.',
    timestampLabel: 'Today, 09:40 AM',
    tag: 'CRM Pipeline',
  },
  {
    id: 'evt-4',
    eventKey: 'lead.created',
    title: 'New Consultation Lead Captured',
    description: 'Apex Dining Group submitted Strategy Consultation Modal (Scorecard: 88/100).',
    timestampLabel: 'Today, 09:12 AM',
    tag: 'Leads',
  },
  {
    id: 'evt-5',
    eventKey: 'task.completed',
    title: 'Linear Task Completed #101',
    description: 'Antigravity AI completed: Architect Apple-grade Glassmorphism Consultation Modal.',
    timestampLabel: 'Yesterday, 06:30 PM',
    tag: 'Workspaces',
  },
];
