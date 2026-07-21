import { RawPortalRepository } from '../../../repositories/RawPortalRepository';
import { ProjectionPortalRepository } from '../../../repositories/ProjectionPortalRepository';
import type { IPortalRepository } from '../../../repositories/IPortalRepository';
import { HomeExperienceBuilder } from '../builders/HomeExperienceBuilder';
import { UpdatesExperienceBuilder } from '../builders/UpdatesExperienceBuilder';
import { ProjectExperienceBuilder } from '../builders/ProjectExperienceBuilder';
import { BillingExperienceBuilder } from '../builders/BillingExperienceBuilder';
import { mapMilestoneToPortal } from '../mappers/milestoneMapper';
import { mapDocumentToPortal } from '../mappers/documentMapper';
import { mapActivityToTimeline } from '../mappers/timelineMapper';
import { mapEnvironmentToPortal } from '../mappers/environmentMapper';
import { mapInvoiceToPortal } from '../mappers/invoiceMapper';
import { mapProjectToHealth } from '../mappers/healthMapper';
import { formatMoney } from '../utils/moneyFormatter';
import type { MilestoneItem, DeliverableFile, ProjectActivityEvent, ProjectEnvironment, ProjectCredential } from '../../../types/studioHQ';

import { QueryClient } from '@tanstack/react-query';

// Feature Flag for C7.9B Cutover
const USE_PROJECTION_REPOSITORY = false;

function getRepository(): IPortalRepository {
  return USE_PROJECTION_REPOSITORY ? ProjectionPortalRepository : RawPortalRepository;
}

export const portalService = {
  // ---------------------------------------------------------------------------
  // REALTIME
  // ---------------------------------------------------------------------------
  watchPortal(projectId: string, queryClient: QueryClient) {
    return getRepository().watchPortal(projectId, queryClient);
  },

  // ---------------------------------------------------------------------------
  // RAW DOMAIN FETCHERS (Used by Builders or direct queries)
  // ---------------------------------------------------------------------------
  async getProject(projectId: string) {
    return getRepository().getProject(projectId);
  },

  async getClientProjects() {
    return getRepository().getClientProjects();
  },

  async getMilestones(projectId: string): Promise<MilestoneItem[]> {
    return getRepository().getMilestones(projectId);
  },

  async getDocuments(projectId: string): Promise<DeliverableFile[]> {
    return getRepository().getDocuments(projectId);
  },

  async getTimeline(projectId: string): Promise<ProjectActivityEvent[]> {
    return getRepository().getTimeline(projectId);
  },

  /**
   * Get non-internal environments for a project.
   */
  async getEnvironments(projectId: string): Promise<ProjectEnvironment[]> {
    return getRepository().getEnvironments(projectId);
  },

  /**
   * Get non-archived credentials for a project.
   */
  async getCredentials(projectId: string): Promise<ProjectCredential[]> {
    return getRepository().getCredentials(projectId);
  },

  /**
   * Get invoices for the authenticated client's organization.
   * No organizationId parameter — RLS decides tenant boundary.
   */
  async getInvoices() {
    return getRepository().getInvoices();
  },

  /**
   * Get project health from the project object.
   * Today: reads health_* columns directly.
   * Tomorrow: may read from a health_projection table.
   */
  getHealth(project: any) {
    return {
      health_budget: project?.health_budget || 'Unknown',
      health_timeline: project?.health_timeline || 'Unknown',
      health_scope: project?.health_scope || 'Unknown',
      health_client_response: project?.health_client_response || 'Unknown',
    };
  },

  // Mock actions for C7.9A bootstrap
  async getClientActions(_projectId: string) {
    return [
      {
        id: 'mock-action-1',
        title: 'Approve Homepage Design',
        description: 'Please review the latest Figma deliverables.',
        cta_label: 'Review in Figma',
        cta_url: '#',
        priority: 'CRITICAL',
        status: 'PENDING',
        due_date: new Date(Date.now() + 86400000).toISOString()
      },
      {
        id: 'mock-action-2',
        title: 'Upload Brand Assets',
        description: 'We need your high-res logo.',
        cta_label: 'Upload',
        cta_url: '#',
        priority: 'NORMAL',
        status: 'PENDING'
      }
    ];
  },

  // ---------------------------------------------------------------------------
  // EXPERIENCE BUILDERS
  // ---------------------------------------------------------------------------
  
  async getHomeExperience(projectId: string) {
    const [project, actionsRaw, timelineRaw, milestonesRaw] = await Promise.all([
      this.getProject(projectId),
      this.getClientActions(projectId),
      this.getTimeline(projectId),
      this.getMilestones(projectId)
    ]);
    
    if (!project) throw new Error('Project not found');
    
    return HomeExperienceBuilder.build(
      project,
      actionsRaw,
      timelineRaw.map(mapActivityToTimeline),
      milestonesRaw.map(mapMilestoneToPortal)
    );
  },

  async getUpdatesExperience(projectId: string) {
    const timelineRaw = await this.getTimeline(projectId);
    return UpdatesExperienceBuilder.build(timelineRaw.map(mapActivityToTimeline));
  },

  async getProjectExperience(projectId: string) {
    const [project, docsRaw, envsRaw, credsRaw] = await Promise.all([
      this.getProject(projectId),
      this.getDocuments(projectId),
      this.getEnvironments(projectId),
      this.getCredentials(projectId)
    ]);
    
    if (!project) throw new Error('Project not found');
    
    const health = mapProjectToHealth(project);
    
    return ProjectExperienceBuilder.build(
      project,
      health,
      docsRaw.map(mapDocumentToPortal),
      envsRaw.map(mapEnvironmentToPortal),
      credsRaw.map((c: any) => ({
        id: c.id,
        name: c.name,
        username: c.username || 'Unknown',
        secret: '********',
        rotationStatus: 'valid'
      }))
    );
  },

  async getBillingExperience() {
    const invoicesRaw = await this.getInvoices();
    const invoices = invoicesRaw.map(mapInvoiceToPortal);
    
    const builder = BillingExperienceBuilder.build(invoices);
    
    // Fix the total outstanding amount using raw values
    const pendingRaw = invoicesRaw.filter((i: any) => i.status === 'PENDING' || i.status === 'OVERDUE');
    const totalAmount = pendingRaw.reduce((sum: number, inv: any) => sum + (Number(inv.amount) || 0), 0);
    const currency = pendingRaw.length > 0 ? pendingRaw[0].currency : 'USD';
    
    builder.summary.totalOutstanding = formatMoney(totalAmount, currency);
    
    return builder;
  }
};
