import type { LucideIcon } from 'lucide-react';
import { Calendar, Upload, MessageSquare } from 'lucide-react';

export interface MobileRouteConfig {
  fab: {
    label: string;
    icon: LucideIcon;
    action: string;
  };
}

export const MOBILE_ROUTE_CONFIG: Record<string, MobileRouteConfig> = {
  home: {
    fab: { 
      label: "Book Meeting", 
      icon: Calendar, 
      action: "open_consultation" 
    }
  },
  project: {
    fab: { 
      label: "Upload Files", 
      icon: Upload, 
      action: "open_upload" 
    }
  },
  updates: {
    fab: { 
      label: "Message Team", 
      icon: MessageSquare, 
      action: "open_message" 
    }
  }
};
