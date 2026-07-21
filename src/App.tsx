import React, { Suspense } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";

// Layout wrappers
import { LandingLayout } from "./layouts/LandingLayout";
import { AuthLayout } from "./layouts/AuthLayout";
import { WebsiteLayout } from "./layouts/WebsiteLayout";
import { ClientLayout } from "./layouts/ClientLayout";

import { AuthGuard } from "./auth/guards/AuthGuard";
import { PermissionGuard } from "./auth/guards/PermissionGuard";

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

const MobileHome = React.lazy(() => import("./routes/portal/components/mobile/pages/MobileHome").then(m => ({ default: m.MobileHome })));
const MobileProject = React.lazy(() => import("./routes/portal/components/mobile/pages/MobileProject").then(m => ({ default: m.MobileProject })));
const MobileUpdates = React.lazy(() => import("./routes/portal/components/mobile/pages/MobileUpdates").then(m => ({ default: m.MobileUpdates })));
// Admin components moved to auth/registry/routes.ts
const InsightsPage = React.lazy(() => import("./routes/insights/page.tsx"));
const InsightsDetailPage = React.lazy(() => import("./routes/insights/detail.tsx"));

import { CommandPalette } from "./components/search/CommandPalette";

const RouteFallback: React.FC = () => (
  <div className="min-h-screen w-full bg-[#FAF7F0] flex items-center justify-center">
    <div className="h-10 w-10 rounded-full border border-[#0B3027]/20 border-t-[#0B3027] animate-spin" />
  </div>
);

import { ADMIN_ROUTES } from './auth/registry/routes';
const AdminAuthPage = lazyNamed(() => import("./routes/auth/admin/page"), "AdminAuthPage");
const PortfolioPage = React.lazy(() => import("./routes/portfolio/page"));
const PortfolioDetailPage = React.lazy(() => import("./routes/portfolio/detail.tsx"));
const App: React.FC = () => {
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
          <Route path="/portal" element={<ClientPortal />}>
            <Route index element={<MobileHome />} />
            <Route path="project" element={<MobileProject />} />
            <Route path="updates" element={<MobileUpdates />} />
          </Route>
        </Route>

        {/* Tech Ambiance StudioHQ Executive Console (/admin/*) (Protected) */}
        <Route path="/auth/admin" element={<AdminAuthPage />} />
        <Route path="/admin" element={<StudioHQLayout />}>
          {ADMIN_ROUTES.map((routeConfig, idx) => {
            const Component = routeConfig.component;
            return (
              <Route 
                key={idx}
                index={routeConfig.index}
                path={routeConfig.path} 
                element={
                  <PermissionGuard permission={routeConfig.requiredPermission}>
                    <Component />
                  </PermissionGuard>
                } 
              />
            );
          })}
        </Route>
        </Routes>
      </Suspense>
    </>
  );
};

export default App;


