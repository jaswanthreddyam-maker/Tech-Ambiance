import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { portalService } from '../services/portalService';

interface ProjectContextType {
  activeProjectId: string | null;
  setActiveProjectId: (id: string) => void;
  projects: any[];
  isLoading: boolean;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['portal', 'projects'],
    queryFn: async () => {
      return await portalService.getClientProjects() || [];
    }
  });

  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  useEffect(() => {
    if (projects.length > 0 && !activeProjectId) {
      setActiveProjectId(projects[0].id);
    }
  }, [projects, activeProjectId]);

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
