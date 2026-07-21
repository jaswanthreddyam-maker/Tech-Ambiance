import React from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, LogOut, ExternalLink } from "lucide-react";
import { useAuth } from "../providers/AuthProvider";
import { Cursor } from "../components/common/Cursor";
import { useCursorHover } from "../hooks/useCursorHover";
import { useIsMobile } from "../hooks/useIsMobile";
import logoImg from "../assets/logo-opt.webp";

export const ClientLayout: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const hoverProps = useCursorHover("pointer");
  const logoutHoverProps = useCursorHover("pointer");
  const isMobile = useIsMobile();

  React.useEffect(() => {
    // Basic Route Guard: redirect to auth if not logged in
    if (!isAuthenticated) {
      navigate("/auth");
    }
  }, [isAuthenticated, navigate]);

  if (!user) return null;

  const sidebarLinks = [
    { name: "Overview", path: "/portal", icon: LayoutDashboard },
  ];

  if (isMobile) {
    return (
      <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col relative w-full overflow-x-hidden">
        <div className="paper-texture" />
        <Cursor />
        <div className="flex-1 flex flex-col min-w-0 w-full z-10 relative">
          <Outlet />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex relative">
      {/* Paper Texture Overlay */}
      <div className="paper-texture" />

      {/* Custom Cursor */}
      <Cursor />

      {/* Sidebar Panel */}
      <aside className="w-64 border-r border-border-custom bg-white/70 backdrop-blur-md flex flex-col z-20 shrink-0">
        {/* Brand Header */}
        <div className="p-8 border-b border-border-custom">
          <Link
            to="/experience"
            className="flex items-center gap-2 group w-fit"
            {...hoverProps}
          >
            <img
              src={logoImg}
              alt="Tech Ambiance Studio"
              className="block object-contain mix-blend-multiply"
              style={{ height: "32px", width: "58px" }}
            />
          </Link>
          <div className="text-[10px] text-text-secondary tracking-wider font-semibold uppercase mt-1">
            Client Portal
          </div>
        </div>

        {/* Sidebar Nav links */}
        <nav className="flex-1 px-4 py-8 flex flex-col gap-1.5">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs uppercase tracking-widest font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-gold text-white shadow-sm border border-gold"
                    : "text-text-secondary hover:text-text-primary hover:bg-border-custom/40"
                }`}
                {...hoverProps}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {link.name}
              </Link>
            );
          })}

          <div className="h-px bg-border-custom my-4" />

          {/* External Links */}
          <Link
            to="/experience"
            className="flex items-center justify-between px-4 py-3 rounded-xl text-xs uppercase tracking-widest font-semibold text-text-secondary hover:text-text-primary hover:bg-border-custom/40 transition-all duration-200"
            {...hoverProps}
          >
            <span className="flex items-center gap-3">
              <ExternalLink className="w-4 h-4" />
              Visit Studio
            </span>
          </Link>
        </nav>

        {/* User Info & Logout Button */}
        <div className="p-4 border-t border-border-custom flex flex-col gap-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center font-bold text-gold text-sm">
              {user.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-text-primary truncate">{user.name}</div>
              <div className="text-[10px] text-text-secondary truncate">{user.email}</div>
            </div>
          </div>

          <button
            onClick={() => {
              logout();
              navigate("/experience");
            }}
            className="w-full flex items-center justify-center gap-2 py-3 border border-border-custom rounded-xl text-xs uppercase tracking-widest font-bold text-text-secondary hover:text-red-500 hover:border-red-500/20 hover:bg-red-500/5 transition-all duration-200"
            {...logoutHoverProps}
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Node */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto z-10 relative">
        {/* Header */}
        <header className="h-20 border-b border-border-custom bg-white/40 backdrop-blur-md flex items-center justify-between px-8 md:px-12 shrink-0">
          <div>
            <h1 className="font-heading text-xl font-bold text-text-primary">
              Welcome back, {user.name}
            </h1>
            <p className="text-[10px] text-text-secondary tracking-widest uppercase mt-0.5">
              Active Project Environment
            </p>
          </div>
        </header>

        {/* Dynamic page contents render inside Outlet */}
        <main className="flex-grow p-8 md:p-12">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
