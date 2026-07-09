import React from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

// Layout wrappers
import { LandingLayout } from "./layouts/LandingLayout";
import { AuthLayout } from "./layouts/AuthLayout";
import { WebsiteLayout } from "./layouts/WebsiteLayout";
import { ClientLayout } from "./layouts/ClientLayout";

// Onboarding & Auth Pages
import LandingPage from "./routes/landing/page";
import AuthPage from "./routes/auth/page";
import { CallbackPage } from "./routes/auth/CallbackPage";
import { ResetPasswordPage } from "./routes/auth/ResetPasswordPage";
import IntroPage from "./routes/intro/page";

// Enterprise Auth Guard
import { AuthGuard } from "./auth/AuthGuard";

// Marketing Pages
import MarketingPage from "./routes/marketing/page";
import PortfolioDetails from "./routes/marketing/PortfolioDetails";

// Portal Pages
import ClientPortal from "./routes/portal/page";

// 404 Page
import NotFoundPage from "./routes/NotFound";

// Tech Ambiance StudioHQ Executive Console (/admin/*)
import { StudioHQLayout } from "./layouts/StudioHQLayout";
import { DashboardPage } from "./routes/admin/DashboardPage";
import { WorkspacesPage } from "./routes/admin/WorkspacesPage";
import { CrmPipelinePage } from "./routes/admin/CrmPipelinePage";
import { CmsEditorPage } from "./routes/admin/CmsEditorPage";
import { AiCenterPage } from "./routes/admin/AiCenterPage";
import { MediaPage } from "./routes/admin/MediaPage";
import { TimelinePage } from "./routes/admin/TimelinePage";
import { SettingsPage } from "./routes/admin/SettingsPage";

export const App: React.FC = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Redirect root to /landing */}
        <Route path="/" element={<Navigate to="/landing" replace />} />

        {/* Onboarding Flow: Stage 1 - Landing */}
        <Route element={<LandingLayout />}>
          <Route path="/landing" element={<LandingPage />} />
        </Route>

        {/* Onboarding Flow: Stage 2 - Auth & Recovery */}
        <Route element={<AuthLayout />}>
          <Route path="/auth" element={<AuthPage />} />
        </Route>
        <Route path="/auth/callback" element={<CallbackPage />} />
        <Route path="/auth/reset-password" element={<ResetPasswordPage />} />

        {/* Onboarding Flow: Stage 3 - Intro Video (Brand Film) */}
        <Route path="/intro" element={<IntroPage />} />

        {/* Marketing Studio Website */}
        <Route element={<WebsiteLayout />}>
          <Route path="/experience" element={<MarketingPage />} />
          <Route path="/experience/portfolio/:id" element={<PortfolioDetails />} />
          <Route path="/experience/case-studies/:id" element={<PortfolioDetails />} />
          <Route path="/privacy" element={<div className="py-40 text-center font-heading text-2xl font-bold">Privacy Policy Staging Environment</div>} />
          <Route path="/terms" element={<div className="py-40 text-center font-heading text-2xl font-bold">Terms of Service Staging Environment</div>} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Client Portal Panel (Protected) */}
        <Route
          element={
            <AuthGuard>
              <ClientLayout />
            </AuthGuard>
          }
        >
          <Route path="/portal" element={<ClientPortal />} />
        </Route>

        {/* Tech Ambiance StudioHQ Executive Console (/admin/*) (Protected) */}
        <Route
          path="/admin"
          element={
            <AuthGuard requiredRole={["OWNER", "ADMIN", "DEVELOPER", "DESIGNER", "PROJECT_MANAGER", "STRATEGIST", "SALES"]}>
              <StudioHQLayout />
            </AuthGuard>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="timeline" element={<TimelinePage />} />
          <Route path="workspaces" element={<WorkspacesPage />} />
          <Route path="workspaces/:slug" element={<WorkspacesPage />} />
          <Route path="crm" element={<CrmPipelinePage />} />
          <Route path="cms" element={<CmsEditorPage />} />
          <Route path="ai-center" element={<AiCenterPage />} />
          <Route path="media" element={<MediaPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
};

export default App;
