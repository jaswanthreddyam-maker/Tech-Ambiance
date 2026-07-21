import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { portalService } from '../services/portalService';
import { portalQueryKeys } from './portalQueryKeys';

// =============================================================================
// EXPERIENCE QUERIES
// Single namespace for all Portal data access.
// These hooks consume the Portal Domain Service, which returns fully assembled 
// Experience DTOs ready for the UI.
// =============================================================================

export function usePortalRealtime(projectId: string | null) {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    if (projectId) {
      const unsubscribe = portalService.watchPortal(projectId, queryClient);
      return () => unsubscribe();
    }
  }, [projectId, queryClient]);
}

export function useHomeExperience(projectId: string | null) {
  const query = useQuery({
    queryKey: projectId ? portalQueryKeys.home(projectId) : [],
    queryFn: async () => {
      if (!projectId) return null;
      return await portalService.getHomeExperience(projectId);
    },
    enabled: !!projectId,
  });

  return {
    homeExperience: query.data || null,
    isLoading: query.isLoading,
    error: query.error,
  };
}

export function useUpdatesExperience(projectId: string | null) {
  const query = useQuery({
    queryKey: projectId ? portalQueryKeys.updates(projectId) : [],
    queryFn: async () => {
      if (!projectId) return null;
      return await portalService.getUpdatesExperience(projectId);
    },
    enabled: !!projectId,
  });

  return {
    updatesExperience: query.data || null,
    isLoading: query.isLoading,
    error: query.error,
  };
}

export function useProjectExperience(projectId: string | null) {
  const query = useQuery({
    queryKey: projectId ? portalQueryKeys.project(projectId) : [],
    queryFn: async () => {
      if (!projectId) return null;
      return await portalService.getProjectExperience(projectId);
    },
    enabled: !!projectId,
  });

  return {
    projectExperience: query.data || null,
    isLoading: query.isLoading,
    error: query.error,
  };
}

export function useBillingExperience() {
  const query = useQuery({
    queryKey: portalQueryKeys.billing(),
    queryFn: async () => {
      return await portalService.getBillingExperience();
    },
  });

  return {
    billingExperience: query.data || null,
    isLoading: query.isLoading,
    error: query.error,
  };
}
