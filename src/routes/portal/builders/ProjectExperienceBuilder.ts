import type { ProjectExperienceDTO_v1 } from '../types/experienceModels';
import type { PortalDocument, PortalEnvironment, PortalCredential, PortalHealth } from '../types/portalModels';

export class ProjectExperienceBuilder {
  static build(
    project: any,
    health: PortalHealth,
    documents: PortalDocument[],
    environments: PortalEnvironment[],
    credentials: PortalCredential[]
  ): ProjectExperienceDTO_v1 {
    return {
      version: "1.0",
      generatedAt: new Date().toISOString(),
      context: {
        progress: project.progress_percentage || 0,
        completionEstimate: project.target_completion_date ? new Date(project.target_completion_date).toLocaleDateString() : null,
        projectHealth: health
      },
      deliverablesSummary: {
        count: documents.length,
        recent: documents.slice(0, 5) // Just the 5 most recent
      },
      environments,
      credentials
    };
  }
}
