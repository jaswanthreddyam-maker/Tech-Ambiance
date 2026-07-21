import React from "react";
import { ProjectProvider, useProjectContext } from "./components/ProjectContext";

import { Outlet } from "react-router-dom";
import { useIsMobile } from "../../hooks/useIsMobile";
import { PortalDesktopLayout } from "./components/PortalDesktopLayout";
import { PortalMobileLayout } from "./components/mobile/layout/PortalMobileLayout";
import { DesktopDashboard } from "./components/DesktopDashboard";
import { usePortalRealtime } from "./hooks/portalQueries";

const PortalDashboard: React.FC = () => {
  const { activeProjectId } = useProjectContext();
  const isMobile = useIsMobile();

  usePortalRealtime(activeProjectId);

  if (isMobile) {
    return (
      <PortalMobileLayout>
        <Outlet />
      </PortalMobileLayout>
    );
  }

  return (
    <PortalDesktopLayout>
      <DesktopDashboard />
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
