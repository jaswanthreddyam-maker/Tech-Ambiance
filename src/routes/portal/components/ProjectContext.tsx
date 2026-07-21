import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { portalService } from '../services/portalService';
import { supabase } from '../../../lib/supabase';
import { useAuthContext } from '../../../auth/providers/AuthProvider';

interface ProjectContextType {
  activeProjectId: string | null;
  setActiveProjectId: (id: string) => void;
  projects: any[];
  isLoading: boolean;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { authUser } = useAuthContext();
  const queryClient = useQueryClient();

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['portal', 'projects'],
    queryFn: async () => {
      return await portalService.getClientProjects() || [];
    }
  });

  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  // Auto-select first project
  useEffect(() => {
    if (projects.length > 0 && !activeProjectId) {
      setActiveProjectId(projects[0].id);
    }
  }, [projects, activeProjectId]);

  // Realtime subscription for workspace access provisioned to this specific user
  useEffect(() => {
    if (!authUser?.id) return;

    const channel = supabase.channel('portal_workspace_members')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'workspace_members', filter: `user_id=eq.${authUser.id}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ['portal', 'projects'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [authUser?.id, queryClient]);

  return (
    <ProjectContext.Provider value={{ activeProjectId, setActiveProjectId, projects, isLoading }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjectContext = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjectContext must be used within a ProjectProvider');
  }
  return context;
};
