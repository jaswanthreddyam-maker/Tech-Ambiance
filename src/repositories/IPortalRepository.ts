import { QueryClient } from '@tanstack/react-query';
import type { 
  MilestoneItem, 
  DeliverableFile, 
  ProjectActivityEvent, 
  ProjectEnvironment, 
  ProjectCredential 
} from '../types/studioHQ';

export interface IPortalRepository {
  /**
   * Sets up realtime subscriptions for the portal UI.
   */
  watchPortal(projectId: string, queryClient: QueryClient): () => void;

  /**
   * Fetches the core project details (progress, dates, budget health, etc.).
   */
  getProject(projectId: string): Promise<any | null>;

  /**
   * Fetches the milestones (stages) for the project.
   */
  getMilestones(projectId: string): Promise<MilestoneItem[]>;

  /**
   * Fetches the final deliverable files shared with the client.
   */
  getDocuments(projectId: string): Promise<DeliverableFile[]>;

  /**
   * Fetches chronological events (the raw feed).
   */
  getTimeline(projectId: string): Promise<ProjectActivityEvent[]>;

  /**
   * Fetches deploy environments (Staging, Prod).
   */
  getEnvironments(projectId: string): Promise<ProjectEnvironment[]>;

  /**
   * Fetches credentials explicitly shared with the client.
   */
  getCredentials(projectId: string): Promise<ProjectCredential[]>;

  /**
   * Fetches invoices for the client organization.
   */
  getInvoices(): Promise<any[]>;

  /**
   * Fetches client projects (for navigation/context).
   */
  getClientProjects(): Promise<any[]>;
}
