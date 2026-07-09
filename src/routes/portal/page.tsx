import React, { useState } from "react";
import { useAuth } from "../../providers/AuthProvider";
import { useToast } from "../../providers/ToastProvider";
import { useCursorHover } from "../../hooks/useCursorHover";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  DollarSign,
  Download,
  ExternalLink,
  FileText,
  Info,
  Send,
  Ticket,
  ChevronDown,
  Check,
  FolderGit2,
  Layers,
  Lock,
  Building2,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

interface PortalProjectData {
  id: string;
  name: string;
  status: string;
  progress: number;
  activeSprint: string;
  budget: string;
  deliveryDate: string;
  sourceCode?: string;
  stagingUrl?: string;
  milestones: {
    id: string;
    name: string;
    date: string;
    status: "completed" | "active" | "pending";
  }[];
  files: {
    name: string;
    size: string;
    date: string;
    type: string;
  }[];
  invoices: {
    id: string;
    amount: string;
    date: string;
    status: "PAID" | "PENDING";
  }[];
}

const WORKSPACE_PROJECTS: PortalProjectData[] = [
  {
    id: "cafe-vistaara-web",
    name: "Cafe Vistaara Premium Website",
    status: "Development",
    progress: 68,
    activeSprint: "Animations & Performance SLAs",
    budget: "$42,000",
    deliveryDate: "Aug 15, 2026",
    sourceCode: "https://github.com/jaswanthreddyam-maker/Tech-Ambiance",
    stagingUrl: "https://cafevistaara.techambiance.studio",
    milestones: [
      { id: "m1", name: "Architecture & Wireframe Sign-Off", date: "Jun 10, 2026", status: "completed" },
      { id: "m2", name: "High-Fidelity Editorial Design System", date: "Jun 24, 2026", status: "completed" },
      { id: "m3", name: "Interactive WebGL & Framer Motion Sprint", date: "Jul 15, 2026", status: "active" },
      { id: "m4", name: "Edge Telemetry & Production Deployment", date: "Aug 10, 2026", status: "pending" },
    ],
    files: [
      { name: "Brand Guidelines & Color Tokens (PDF)", size: "4.2 MB", date: "2026-06-12", type: "PDF" },
      { name: "UI/UX Layout Prototypes (ZIP)", size: "18.5 MB", date: "2026-06-26", type: "ZIP" },
      { name: "Lighthouse Performance Audit (PDF)", size: "1.8 MB", date: "2026-07-04", type: "PDF" },
    ],
    invoices: [
      { id: "INV-2026-081", amount: "$14,000", date: "Jun 01, 2026", status: "PAID" },
      { id: "INV-2026-094", amount: "$14,000", date: "Jul 01, 2026", status: "PAID" },
      { id: "INV-2026-112", amount: "$14,000", date: "Aug 01, 2026", status: "PENDING" },
    ],
  },
  {
    id: "vistaara-qr-ordering",
    name: "QR Table Ordering & Realtime POS",
    status: "Backend Sprint",
    progress: 24,
    activeSprint: "PostgreSQL Realtime Queue & WebSocket Engine",
    budget: "$28,500",
    deliveryDate: "Sep 30, 2026",
    sourceCode: "https://github.com/jaswanthreddyam-maker/Tech-Ambiance",
    milestones: [
      { id: "qm1", name: "POS & Stripe Terminal Specification", date: "Jun 28, 2026", status: "completed" },
      { id: "qm2", name: "Supabase Realtime Order Queue API", date: "Jul 20, 2026", status: "active" },
      { id: "qm3", name: "Customer QR Scan Mobile Interface", date: "Aug 18, 2026", status: "pending" },
      { id: "qm4", name: "Kitchen Display System (KDS) Tablet App", date: "Sep 15, 2026", status: "pending" },
    ],
    files: [
      { name: "POS Integration API Schema (YAML)", size: "480 KB", date: "2026-06-28", type: "YAML" },
      { name: "Table QR Vector Assets (EPS/SVG)", size: "12.4 MB", date: "2026-07-02", type: "ZIP" },
      { name: "Menu Database CSV Template (XLSX)", size: "640 KB", date: "2026-07-05", type: "XLSX" },
    ],
    invoices: [
      { id: "INV-2026-088", amount: "$9,500", date: "Jun 28, 2026", status: "PAID" },
      { id: "INV-2026-105", amount: "$9,500", date: "Jul 28, 2026", status: "PENDING" },
    ],
  },
  {
    id: "vistaara-marketing-ai",
    name: "Marketing & AI Telemetry Dashboard",
    status: "QA & Polish",
    progress: 88,
    activeSprint: "Executive Telemetry Metrics Pipeline",
    budget: "$35,000",
    deliveryDate: "Jul 25, 2026",
    stagingUrl: "https://telemetry.techambiance.studio",
    milestones: [
      { id: "am1", name: "Data Ingestion Pipeline Architecture", date: "May 15, 2026", status: "completed" },
      { id: "am2", name: "ScoutAI Telemetry Analytics Engine", date: "Jun 10, 2026", status: "completed" },
      { id: "am3", name: "Executive Dark Mode Visual Dashboard", date: "Jul 05, 2026", status: "completed" },
      { id: "am4", name: "Penetration Testing & SOC-2 Compliance Prep", date: "Jul 22, 2026", status: "active" },
    ],
    files: [
      { name: "ScoutAI Telemetry Playbook (PDF)", size: "5.6 MB", date: "2026-06-15", type: "PDF" },
      { name: "Executive Metric Definitions (DOCX)", size: "920 KB", date: "2026-06-22", type: "DOCX" },
    ],
    invoices: [
      { id: "INV-2026-062", amount: "$17,500", date: "May 15, 2026", status: "PAID" },
      { id: "INV-2026-099", amount: "$17,500", date: "Jul 01, 2026", status: "PAID" },
    ],
  },
  {
    id: "vistaara-loyalty-app",
    name: "Vistaara Club iOS & Android Loyalty App",
    status: "UI/UX Design",
    progress: 45,
    activeSprint: "Figma Interactive Prototypes & Token Mechanics",
    budget: "$54,000",
    deliveryDate: "Nov 15, 2026",
    milestones: [
      { id: "lm1", name: "Club Tier & Loyalty Point Mechanics", date: "Jun 20, 2026", status: "completed" },
      { id: "lm2", name: "Figma Interactive Design Prototype", date: "Jul 18, 2026", status: "active" },
      { id: "lm3", name: "React Native Bridge & Biometric Auth", date: "Sep 10, 2026", status: "pending" },
      { id: "lm4", name: "App Store & Google Play Submission", date: "Nov 01, 2026", status: "pending" },
    ],
    files: [
      { name: "Vistaara Club App Storyboard (PDF)", size: "8.4 MB", date: "2026-06-20", type: "PDF" },
      { name: "Apple Wallet & Passkit Certificate (ZIP)", size: "2.1 MB", date: "2026-07-03", type: "ZIP" },
    ],
    invoices: [
      { id: "INV-2026-079", amount: "$18,000", date: "Jun 20, 2026", status: "PAID" },
    ],
  },
];

export const ClientPortal: React.FC = () => {
  const { organization, workspace } = useAuth();
  const { toast } = useToast();
  const hoverProps = useCursorHover("pointer");

  const [activeProjectIdx, setActiveProjectIdx] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [ticketSubject, setTicketSubject] = useState("");
  const [tickets, setTickets] = useState([
    {
      id: "t-104",
      subject: "Staging DNS Custom Domain Request",
      status: "Open" as const,
      date: "2026-07-08",
    },
    {
      id: "t-098",
      subject: "Updated Brand Asset Package Uploaded",
      status: "Closed" as const,
      date: "2026-06-29",
    },
  ]);

  const activeProject = WORKSPACE_PROJECTS[activeProjectIdx];

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim()) return;

    const newTicket = {
      id: `t-${Math.floor(Math.random() * 900) + 100}`,
      subject: ticketSubject,
      status: "Open" as const,
      date: new Date().toISOString().split("T")[0],
    };

    setTickets((prev) => [newTicket, ...prev]);
    setTicketSubject("");
    toast("Support ticket submitted to Tech Ambiance StudioHQ.", "success");
  };

  const orgName = organization?.name || "Vistaara Hospitality Pvt Ltd";
  const wsName = workspace?.name || "Vistaara Corporate Workspace";

  return (
    <div className="flex flex-col gap-8 text-left select-none pb-12">
      {/* =========================================================
          WORKSPACE BAR: ORGANIZATION -> WORKSPACE HEADER
      ========================================================= */}
      <div className="bg-forest text-ivory border border-gold/25 rounded-3xl p-6 md:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gold/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-gold/15 border border-gold/30 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6 text-gold" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] font-bold text-gold">
              <span>Client Workspace</span>
              <span className="text-ivory/30">•</span>
              <span className="flex items-center gap-1 text-ivory/80">
                <Lock className="w-3 h-3 text-gold" />
                Read-Only Portal
              </span>
            </div>
            <h1 className="font-heading text-2xl md:text-3xl font-bold text-ivory mt-1">
              {orgName}
            </h1>
            <p className="text-xs text-ivory/60 mt-0.5">
              Workspace: <strong className="text-ivory/90">{wsName}</strong> • Managed by Tech Ambiance StudioHQ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <div className="px-4 py-2.5 rounded-full bg-ivory/10 border border-ivory/15 text-ivory text-xs font-semibold flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-gold" />
            <span>{WORKSPACE_PROJECTS.length} Active Projects</span>
          </div>
        </div>
      </div>

      {/* =========================================================
          MAIN GRID: LEFT COLUMN (PROJECT PROGRESS, SWITCHER, MILESTONES) & RIGHT COLUMN
      ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: PROJECT SWITCHER CARD, PROGRESS & MILESTONES */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          
          {/* HERO PROJECT CARD WITH INTERACTIVE PROJECT SWITCHER */}
          <div className="bg-white border border-border-custom shadow-sm p-8 rounded-2xl relative overflow-visible">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <span className="text-[10px] uppercase tracking-[0.24em] text-gold font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-gold" />
                  Current Project
                </span>

                {/* PROJECT SWITCHER DROPDOWN */}
                <div className="relative mt-2">
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center justify-between gap-3 bg-bg-primary hover:bg-gold/10 border border-border-custom hover:border-gold px-5 py-3 rounded-xl transition-all shadow-sm font-heading text-xl md:text-2xl font-bold text-text-primary"
                    {...hoverProps}
                  >
                    <span>{activeProject.name}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-gold transition-transform duration-300 ${
                        isDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 mt-2 w-full min-w-[320px] bg-white border border-border-custom rounded-2xl shadow-2xl z-50 p-2 overflow-hidden"
                      >
                        <div className="px-3 py-2 text-[9px] uppercase tracking-widest font-bold text-text-secondary border-b border-border-custom/50">
                          Switch Active Project
                        </div>
                        {WORKSPACE_PROJECTS.map((proj, idx) => {
                          const isSelected = idx === activeProjectIdx;
                          return (
                            <button
                              key={proj.id}
                              type="button"
                              onClick={() => {
                                setActiveProjectIdx(idx);
                                setIsDropdownOpen(false);
                                toast(`Switched to ${proj.name}`, "info");
                              }}
                              className={`w-full text-left px-4 py-3 rounded-xl flex items-center justify-between transition-colors ${
                                isSelected
                                  ? "bg-forest text-ivory"
                                  : "hover:bg-bg-primary text-text-primary"
                              }`}
                            >
                              <div>
                                <div className="font-heading font-bold text-sm">
                                  {proj.name}
                                </div>
                                <div
                                  className={`text-[10px] mt-0.5 ${
                                    isSelected ? "text-gold" : "text-text-secondary"
                                  }`}
                                >
                                  {proj.status} • {proj.progress}% Complete
                                </div>
                              </div>
                              {isSelected && <Check className="w-4 h-4 text-gold shrink-0" />}
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="px-4 py-2 bg-gold/10 border border-gold/30 rounded-lg text-xs font-bold text-gold">
                Status: {activeProject.status}
              </div>
            </div>

            {/* PROGRESS BAR */}
            <div className="flex flex-col gap-2 mb-4">
              <div className="flex justify-between items-center text-xs font-semibold text-text-secondary">
                <span>Overall Build Progress</span>
                <span className="text-gold font-bold">{activeProject.progress}%</span>
              </div>
              <div className="w-full h-2.5 bg-bg-primary border border-border-custom rounded-full overflow-hidden">
                <motion.div
                  key={activeProject.id}
                  initial={{ width: 0 }}
                  animate={{ width: `${activeProject.progress}%` }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full bg-gold rounded-full"
                />
              </div>
            </div>

            <p className="text-xs text-text-secondary flex items-start gap-2 mt-4 font-light">
              <Info className="w-4 h-4 text-gold shrink-0 mt-0.5" />
              <span>
                Current Sprint: <strong className="font-semibold text-text-primary">{activeProject.activeSprint}</strong>
              </span>
            </p>
          </div>

          {/* PROJECT MILESTONES SECTION */}
          <div className="bg-white border border-border-custom shadow-sm p-8 rounded-2xl">
            <h3 className="font-heading text-lg font-bold text-text-primary mb-6 flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gold shrink-0" />
              <span>Project Milestones ({activeProject.name})</span>
            </h3>

            <div className="flex flex-col gap-4">
              {activeProject.milestones.map((milestone) => (
                <div
                  key={milestone.id}
                  className="flex items-center justify-between gap-4 p-4 border border-border-custom/50 rounded-xl bg-bg-primary/20 hover:bg-bg-primary/50 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                        milestone.status === "completed"
                          ? "bg-gold border-gold text-white"
                          : milestone.status === "active"
                          ? "border-gold bg-gold/10"
                          : "border-border-custom"
                      }`}
                    >
                      {milestone.status === "completed" && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                      )}
                    </div>
                    <span
                      className={`text-xs font-semibold ${
                        milestone.status === "completed"
                          ? "text-text-secondary line-through font-light"
                          : "text-text-primary"
                      }`}
                    >
                      {milestone.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-[9px] uppercase tracking-wider text-text-secondary font-bold">
                      {milestone.date}
                    </span>
                    <span
                      className={`text-[9px] uppercase font-bold px-2 py-1 rounded ${
                        milestone.status === "completed"
                          ? "bg-zinc-100 text-zinc-500"
                          : milestone.status === "active"
                          ? "bg-gold/10 text-gold border border-gold/20"
                          : "bg-zinc-50 text-zinc-400"
                      }`}
                    >
                      {milestone.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* DOCUMENT DOWNLOADS FOR ACTIVE PROJECT */}
          <div className="bg-white border border-border-custom shadow-sm p-8 rounded-2xl">
            <h3 className="font-heading text-lg font-bold text-text-primary mb-6 flex items-center gap-3">
              <Download className="w-5 h-5 text-gold shrink-0" />
              <span>Document Downloads ({activeProject.name})</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {activeProject.files.map((file, idx) => (
                <div
                  key={idx}
                  className="border border-border-custom hover:border-gold hover:shadow-premium p-5 rounded-xl text-left flex flex-col justify-between transition-all duration-300 relative group"
                >
                  <div className="p-2.5 bg-bg-primary rounded-lg border border-border-custom/50 text-gold self-start mb-4 group-hover:border-gold/30">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-text-primary truncate">{file.name}</h4>
                    <div className="flex justify-between items-center mt-3 text-[10px] text-text-secondary font-light">
                      <span>{file.size}</span>
                      <button
                        type="button"
                        onClick={() => toast(`Downloading ${file.name}...`, "success")}
                        className="text-gold font-bold uppercase tracking-widest flex items-center gap-0.5 hover:underline"
                        {...hoverProps}
                      >
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ACTIVE PARAMETERS, INVOICES & TICKETS */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          
          {/* ACTIVE PARAMETERS PANEL */}
          <div className="bg-white border border-border-custom shadow-sm p-6 rounded-2xl flex flex-col gap-5">
            <h3 className="font-heading text-base font-bold text-text-primary border-b border-border-custom pb-3">
              Active Parameters
            </h3>

            <div className="flex flex-col gap-1">
              <span className="text-[9px] uppercase tracking-wider font-bold text-text-secondary">
                Budget Terms
              </span>
              <span className="text-xs font-bold text-text-primary">{activeProject.budget}</span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[9px] uppercase tracking-wider font-bold text-text-secondary">
                Estimated Delivery
              </span>
              <span className="text-xs font-bold text-text-primary">{activeProject.deliveryDate}</span>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[9px] uppercase tracking-wider font-bold text-text-secondary">
                Environments
              </span>
              <div className="flex flex-col gap-2">
                {activeProject.sourceCode && (
                  <a
                    href={activeProject.sourceCode}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs font-semibold text-text-secondary hover:text-gold transition-colors"
                  >
                    <FolderGit2 className="w-4 h-4 text-gold" />
                    GitHub Repository
                    <ExternalLink className="w-3 h-3 ml-auto text-text-secondary" />
                  </a>
                )}
                {activeProject.stagingUrl && (
                  <a
                    href={activeProject.stagingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs font-semibold text-text-secondary hover:text-gold transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 text-gold" />
                    Live Staging Environment
                    <ExternalLink className="w-3 h-3 ml-auto text-text-secondary" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* INVOICE & PAYMENT STATUS */}
          <div className="bg-white border border-border-custom shadow-sm p-6 rounded-2xl flex flex-col gap-4">
            <h3 className="font-heading text-base font-bold text-text-primary flex items-center gap-2 border-b border-border-custom pb-3">
              <DollarSign className="w-4 h-4 text-gold" />
              Billing & Invoices
            </h3>

            <div className="flex flex-col gap-3">
              {activeProject.invoices.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-border-custom/60 bg-bg-primary/20"
                >
                  <div>
                    <div className="text-xs font-bold text-text-primary">{inv.id}</div>
                    <div className="text-[10px] text-text-secondary">{inv.date}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-text-primary">{inv.amount}</span>
                    <span
                      className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded ${
                        inv.status === "PAID"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {inv.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SUPPORT TICKETS & MESSAGES */}
          <div className="bg-white border border-border-custom shadow-sm p-6 rounded-2xl flex flex-col gap-4">
            <h3 className="font-heading text-base font-bold text-text-primary flex items-center gap-2 border-b border-border-custom pb-3">
              <Ticket className="w-4 h-4 text-gold" />
              StudioHQ Communication
            </h3>

            <form onSubmit={handleCreateTicket} className="flex gap-2">
              <input
                type="text"
                placeholder="Request feature or update..."
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
                className="flex-1 bg-bg-primary border border-border-custom rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-gold transition-colors"
              />
              <button
                type="submit"
                className="bg-forest text-gold px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center hover:bg-forest/90 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

            <div className="flex flex-col gap-2.5 max-h-52 overflow-y-auto pr-1">
              {tickets.map((t) => (
                <div
                  key={t.id}
                  className="p-3 rounded-xl border border-border-custom/50 bg-bg-primary/30 flex items-center justify-between text-xs"
                >
                  <span className="font-medium text-text-primary truncate max-w-[180px]">
                    {t.subject}
                  </span>
                  <span className="text-[9px] uppercase tracking-wider font-bold text-gold shrink-0">
                    {t.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ClientPortal;
