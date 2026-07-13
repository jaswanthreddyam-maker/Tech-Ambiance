import React, { Suspense } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";

// Layout wrappers
import { LandingLayout } from "./layouts/LandingLayout";
import { AuthLayout } from "./layouts/AuthLayout";
import { WebsiteLayout } from "./layouts/WebsiteLayout";
import { ClientLayout } from "./layouts/ClientLayout";

import { AuthGuard } from "./auth/AuthGuard";
import { AdminGuard } from "./auth/AdminGuard";
import { Dashboard } from "./auth/permissions";

// Tech Ambiance StudioHQ Executive Console (/admin/*)
import { StudioHQLayout } from "./layouts/StudioHQLayout";

const lazyNamed = <T extends React.ComponentType<any>>(
  importer: () => Promise<Record<string, T>>,
  exportName: string
) =>
  React.lazy(async () => {
    const module = await importer();
    return { default: module[exportName] };
  });

const LandingPage = React.lazy(() => import("./routes/landing/page"));
const AuthPage = React.lazy(() => import("./routes/auth/page"));
const CallbackPage = lazyNamed(() => import("./routes/auth/CallbackPage"), "CallbackPage");
const ResetPasswordPage = lazyNamed(() => import("./routes/auth/ResetPasswordPage"), "ResetPasswordPage");
const IntroPage = React.lazy(() => import("./routes/intro/page"));
const MarketingPage = React.lazy(() => import("./routes/marketing/page"));
const PortfolioDetails = React.lazy(() => import("./routes/marketing/PortfolioDetails"));
const ClientPortal = React.lazy(() => import("./routes/portal/page"));
const ServicesPage = React.lazy(() => import("./routes/services/page"));
const NotFoundPage = React.lazy(() => import("./routes/NotFound"));
const DashboardPage = lazyNamed(() => import("./routes/admin/DashboardPage"), "DashboardPage");
const WorkspacesPage = lazyNamed(() => import("./routes/admin/WorkspacesPage"), "WorkspacesPage");
const CrmPipelinePage = lazyNamed(() => import("./routes/admin/CrmPipelinePage"), "CrmPipelinePage");
const CmsEditorPage = lazyNamed(() => import("./routes/admin/CmsEditorPage"), "CmsEditorPage");
const AiCenterPage = lazyNamed(() => import("./routes/admin/AiCenterPage"), "AiCenterPage");
const MediaPage = lazyNamed(() => import("./routes/admin/MediaPage"), "MediaPage");
const TimelinePage = lazyNamed(() => import("./routes/admin/TimelinePage"), "TimelinePage");
const StudioTeamPage = lazyNamed(() => import("./routes/admin/components/StudioTeamPage"), "StudioTeamPage");
const AdminAuthPage = lazyNamed(() => import("./routes/auth/admin/page"), "AdminAuthPage");
const PortfolioPage = React.lazy(() => import("./routes/portfolio/page"));
const PortfolioDetailPage = React.lazy(() => import("./routes/portfolio/detail.tsx"));
const AdminPortfolioPage = lazyNamed(() => import("./routes/admin/PortfolioPage.tsx"), "AdminPortfolioPage");
const InsightsPage = React.lazy(() => import("./routes/insights/page.tsx"));
const InsightsDetailPage = React.lazy(() => import("./routes/insights/detail.tsx"));

import { CommandPalette } from "./components/search/CommandPalette";

const RouteFallback: React.FC = () => (
  <div className="min-h-screen w-full bg-[#FAF7F0] flex items-center justify-center">
    <div className="h-10 w-10 rounded-full border border-[#0B3027]/20 border-t-[#0B3027] animate-spin" />
  </div>
);

export const App: React.FC = () => {
  const location = useLocation();

  return (
    <>
      <CommandPalette />
      <Suspense fallback={<RouteFallback />}>
        <Routes location={location}>
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
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/portfolio/:slug" element={<PortfolioDetailPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/insights" element={<InsightsPage />} />
          <Route path="/insights/:slug" element={<InsightsDetailPage />} />
          <Route path="/work" element={<Navigate to="/portfolio" replace />} />
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
        <Route path="/auth/admin" element={<AdminAuthPage />} />
        <Route
          path="/admin"
          element={
            <AdminGuard requiredPermission={Dashboard.READ}>
              <StudioHQLayout />
            </AdminGuard>
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
          <Route path="portfolio" element={<AdminPortfolioPage />} />
          <Route path="settings" element={<StudioTeamPage />} />
        </Route>
        </Routes>
      </Suspense>
    </>
  );
};

export default App;
