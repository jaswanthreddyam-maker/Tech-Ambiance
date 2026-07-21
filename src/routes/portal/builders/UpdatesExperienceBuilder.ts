import type { UpdatesExperienceDTO_v1, FeedItem } from '../types/experienceModels';
import type { PortalTimelineItem } from '../types/portalModels';
import { format, isToday, isYesterday, differenceInDays } from 'date-fns';

export class UpdatesExperienceBuilder {
  static build(feedItems: PortalTimelineItem[]): UpdatesExperienceDTO_v1 {
    const groups = new Map<string, FeedItem[]>();
    
    const mapToFeedItem = (item: PortalTimelineItem): FeedItem => ({
      id: item.id,
      icon: item.icon,
      title: item.title,
      description: item.description,
      timestamp: item.timestamp,
      priority: item.importance === 'high' ? 'IMPORTANT' : 'NORMAL', // Fallback for C7.9A
      category: 'ANNOUNCEMENT' // Fallback for C7.9A
    });
    
    feedItems.forEach(rawItem => {
      const date = new Date(rawItem.timestamp);
      let groupLabel = '';
      
      if (isToday(date)) {
        groupLabel = 'Today';
      } else if (isYesterday(date)) {
        groupLabel = 'Yesterday';
      } else if (differenceInDays(new Date(), date) < 7) {
        groupLabel = 'Previous 7 Days';
      } else {
        groupLabel = format(date, 'MMMM yyyy'); // e.g. "October 2026"
      }
      
      if (!groups.has(groupLabel)) {
        groups.set(groupLabel, []);
      }
      
      groups.get(groupLabel)!.push(mapToFeedItem(rawItem));
    });
    
    // Convert Map to Array format
    const feedGroups = Array.from(groups.entries()).map(([label, items]) => ({
      label,
      items
    }));
    
    return {
      version: "1.0",
      generatedAt: new Date().toISOString(),
      feedGroups
    };
  }
}
