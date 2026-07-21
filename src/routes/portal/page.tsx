import React, { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ProjectProvider, useProjectContext } from "./components/ProjectContext";

import { Overview } from "./components/Overview";
import { Milestones } from "./components/Milestones";
import { Documents } from "./components/Documents";
import { Timeline } from "./components/Timeline";
import { Environments } from "./components/Environments";
import { Credentials } from "./components/Credentials";
import { Billing } from "./components/Billing";
import { Health } from "./components/Health";
import { portalRepository } from "../../repositories/portalRepository";

import { Outlet } from "react-router-dom";
import { useIsMobile } from "../../hooks/useIsMobile";
import { PortalDesktopLayout } from "./components/PortalDesktopLayout";
import { PortalMobileLayout } from "./components/mobile/layout/PortalMobileLayout";

const PortalDashboard: React.FC = () => {
  const { activeProjectId } = useProjectContext();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (activeProjectId) {
      const unsubscribe = portalRepository.watchPortal(activeProjectId, queryClient);
      return () => unsubscribe();
    }
  }, [activeProjectId, queryClient]);

  if (isMobile) {
    return (
      <PortalMobileLayout>
        <Outlet />
      </PortalMobileLayout>
    );
  }

  return (
    <PortalDesktopLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Overview />
          <Health />
          <Milestones />
          <Environments />
          <Credentials />
        </div>
        <div className="space-y-8">
          <Timeline />
          <Documents />
          <Billing />
        </div>
      </div>
    </PortalDesktopLayout>
  );
};

export default function ClientPortal() {
  return (
    <ProjectProvider>
      <PortalDashboard />
    </ProjectProvider>
  );
}
