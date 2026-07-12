import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { portalRepository } from '../../../repositories/portalRepository';

interface ProjectContextType {
  activeProjectId: string | null;
  setActiveProjectId: (id: string) => void;
  projects: any[];
  isLoading: boolean;
}

const ProjectContext = createContext<ProjectContextType>({
  activeProjectId: null,
  setActiveProjectId: () => {},
  projects: [],
  isLoading: true,
});

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['clientProjects'],
    queryFn: portalRepository.getClientProjects
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

export const useProjectContext = () => useContext(ProjectContext);
