import type { HomeExperienceDTO_v1, NextActionCard, FeedItem, NextMilestoneCard } from '../types/experienceModels';
import type { PortalMilestone, PortalTimelineItem } from '../types/portalModels';
import { differenceInDays } from 'date-fns';

export class HomeExperienceBuilder {
  static build(
    project: any, // Raw project domain object
    actions: any[], // Raw client actions
    feed: PortalTimelineItem[],
    milestones: PortalMilestone[]
  ): HomeExperienceDTO_v1 {
    
    // 1. Primary Action & Needs From You
    const pendingActions = actions.filter(a => a.status === 'PENDING');
    
    // Sort by priority (CRITICAL > IMPORTANT > NORMAL > LOW)
    const priorityWeight = { 'CRITICAL': 4, 'IMPORTANT': 3, 'NORMAL': 2, 'LOW': 1 };
    pendingActions.sort((a, b) => priorityWeight[b.priority as keyof typeof priorityWeight] - priorityWeight[a.priority as keyof typeof priorityWeight]);
    
    const primaryActionRaw = pendingActions.length > 0 ? pendingActions[0] : null;
    const needsFromYouRaw = pendingActions.slice(1);
    
    const mapAction = (raw: any): NextActionCard => ({
      id: raw.id,
      title: raw.title,
      description: raw.description,
      ctaLabel: raw.cta_label || 'Review',
      ctaUrl: raw.cta_url || '#',
      priority: raw.priority,
      dueDate: raw.due_date
    });
    
    // 2. Latest Important Update
    const latestImportantRaw = feed.find(item => item.importance === 'high'); // Fallback to timeline importance for now
    
    let latestImportantUpdate: FeedItem | null = null;
    if (latestImportantRaw) {
      latestImportantUpdate = {
        id: latestImportantRaw.id,
        icon: latestImportantRaw.icon,
        title: latestImportantRaw.title,
        description: latestImportantRaw.description,
        timestamp: latestImportantRaw.timestamp,
        priority: 'IMPORTANT',
        category: 'ANNOUNCEMENT' // Fallback for now until Phase C7.9B
      };
    }

    // 3. Next Milestone
    const activeMilestones = milestones.filter(m => m.status === 'active');
    const nextMilestoneRaw = activeMilestones.length > 0 ? activeMilestones[0] : null;
    
    let nextMilestone: NextMilestoneCard | null = null;
    if (nextMilestoneRaw) {
      const daysRemaining = nextMilestoneRaw.targetDate 
        ? differenceInDays(new Date(nextMilestoneRaw.targetDate), new Date()) 
        : 0;
        
      nextMilestone = {
        id: nextMilestoneRaw.id,
        title: nextMilestoneRaw.title,
        targetDate: nextMilestoneRaw.targetDate || '',
        daysRemaining,
        status: (nextMilestoneRaw.status.toUpperCase() as any)
      };
    }
    
    // 4. Determine Health
    const healthIndicator = project.budget_health === 'on_track' && project.timeline_health === 'on_track' 
      ? 'green' 
      : (project.budget_health === 'at_risk' || project.timeline_health === 'at_risk' ? 'red' : 'amber');

    return {
      version: "1.0",
      generatedAt: new Date().toISOString(),
      greeting: "Welcome back", // Could be dynamic based on time of day
      hero: {
        projectName: project.name,
        progressPercentage: project.progress_percentage || 0,
        currentStage: project.current_stage || 'Active',
        healthIndicator
      },
      primaryAction: primaryActionRaw ? mapAction(primaryActionRaw) : null,
      needsFromYou: needsFromYouRaw.map(mapAction),
      latestImportantUpdate,
      nextMilestone,
      upcomingMeeting: null // Future
    };
  }
}
