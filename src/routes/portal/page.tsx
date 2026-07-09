import React, { useState } from "react";
import { useAuth } from "../../providers/AuthProvider";
import { useToast } from "../../providers/ToastProvider";
import { useCursorHover } from "../../hooks/useCursorHover";
import {
  Activity,
  Calendar,
  DollarSign,
  Download,
  ExternalLink,
  FileText,
  Info,
  Send,
  Ticket,
} from "lucide-react";

export const ClientPortal: React.FC = () => {
  const { project } = useAuth();
  const { toast } = useToast();
  const hoverProps = useCursorHover("pointer");
  const inputHoverProps = useCursorHover("hide");

  const [ticketSubject, setTicketSubject] = useState("");
  const [tickets, setTickets] = useState(project?.supportTickets || []);

  if (!project) {
    return (
      <div className="flex items-center justify-center h-[50vh] text-text-secondary">
        No active project configuration found.
      </div>
    );
  }

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
    toast("Support ticket submitted successfully.", "success");
  };

  const mockFiles = [
    { name: "Brand Guidelines (PDF)", size: "4.2 MB", date: "2026-06-12" },
    { name: "UI/UX Layout Prototypes (ZIP)", size: "18.5 MB", date: "2026-06-26" },
    { name: "SEO Keyword Strategy (XLSX)", size: "1.1 MB", date: "2026-07-02" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      {/* LEFT COLUMN: Project Overview, Milestones, Files */}
      <div className="lg:col-span-8 flex flex-col gap-8">
        
        {/* Project Card Progress */}
        <div className="bg-white border border-border-custom shadow-sm p-8 rounded-2xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <span className="text-[9px] uppercase tracking-widest text-gold font-bold">
                Project Name
              </span>
              <h2 className="font-heading text-2xl font-bold text-text-primary mt-1">
                {project.name}
              </h2>
            </div>
            <div className="px-4 py-2 bg-gold/10 border border-gold/20 rounded-lg text-xs font-bold text-gold">
              Status: {project.status}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="flex flex-col gap-2 mb-4">
            <div className="flex justify-between items-center text-xs font-semibold text-text-secondary">
              <span>Overall Build Progress</span>
              <span className="text-gold font-bold">{project.progress}%</span>
            </div>
            <div className="w-full h-2 bg-bg-primary border border-border-custom rounded-full overflow-hidden">
              <div
                style={{ width: `${project.progress}%` }}
                className="h-full bg-gold rounded-full transition-all duration-1000"
              />
            </div>
          </div>

          <p className="text-xs text-text-secondary flex items-start gap-2 mt-4 font-light">
            <Info className="w-4 h-4 text-gold shrink-0 mt-0.5" />
            <span>
              Currently working on: <strong className="font-semibold text-text-primary">{project.activeMilestone}</strong>.
            </span>
          </p>
        </div>

        {/* Timeline & Milestones checklist */}
        <div className="bg-white border border-border-custom shadow-sm p-8 rounded-2xl">
          <h3 className="font-heading text-lg font-bold text-text-primary mb-6 flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gold shrink-0" />
            Project Milestones
          </h3>

          <div className="flex flex-col gap-4">
            {project.milestones.map((milestone) => (
              <div
                key={milestone.id}
                className="flex items-center justify-between gap-4 p-4 border border-border-custom/50 rounded-xl bg-bg-primary/20 hover:bg-bg-primary/40 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                      milestone.status === "completed"
                        ? "bg-gold border-gold text-white"
                        : milestone.status === "active"
                        ? "border-gold bg-gold/5"
                        : "border-border-custom"
                    }`}
                  >
                    {milestone.status === "completed" && <span className="text-[10px]">&bull;</span>}
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

        {/* File Downloads section */}
        <div className="bg-white border border-border-custom shadow-sm p-8 rounded-2xl">
          <h3 className="font-heading text-lg font-bold text-text-primary mb-6 flex items-center gap-3">
            <Download className="w-5 h-5 text-gold shrink-0" />
            Document Downloads
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mockFiles.map((file, idx) => (
              <div
                key={idx}
                className="border border-border-custom hover:border-gold hover:shadow-premium p-5 rounded-xl text-left flex flex-col justify-between aspect-video transition-all duration-300 relative group"
              >
                <div className="p-2.5 bg-bg-primary rounded-lg border border-border-custom/50 text-gold self-start mb-4 group-hover:border-gold/30">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-text-primary truncate">{file.name}</h4>
                  <div className="flex justify-between items-center mt-3 text-[10px] text-text-secondary font-light">
                    <span>{file.size}</span>
                    <button
                      onClick={() => toast(`Simulating file download: ${file.name}`, "success")}
                      className="text-gold font-bold uppercase tracking-widest flex items-center gap-0.5 hover:underline"
                      {...hoverProps}
                    >
                      Get
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: Project Details, Invoices, Support Tickets */}
      <div className="lg:col-span-4 flex flex-col gap-8">
        
        {/* Project Details Panel */}
        <div className="bg-white border border-border-custom shadow-sm p-6 rounded-2xl flex flex-col gap-5">
          <h3 className="font-heading text-base font-bold text-text-primary border-b border-border-custom pb-3">
            Active Parameters
          </h3>

          <div className="flex flex-col gap-1">
            <span className="text-[9px] uppercase tracking-wider font-bold text-text-secondary">
              Budget Terms
            </span>
            <span className="text-xs font-bold text-text-primary">{project.budget}</span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[9px] uppercase tracking-wider font-bold text-text-secondary">
              Estimated Delivery
            </span>
            <span className="text-xs font-bold text-text-primary">{project.deliveryDate}</span>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[9px] uppercase tracking-wider font-bold text-text-secondary">
              Environments
            </span>
            <div className="flex flex-col gap-2">
              {project.sourceCode && (
                <a
                  href={project.sourceCode}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs font-semibold text-text-secondary hover:text-gold transition-colors"
                  {...hoverProps}
                >
                  <svg className="w-4 h-4 shrink-0 text-text-secondary group-hover:text-gold transition-colors" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.479C19.138 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                  </svg>
                  GitHub Repository
                  <ExternalLink className="w-3 h-3 mt-0.5" />
                </a>
              )}
              {project.demoUrl && (
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs font-semibold text-text-secondary hover:text-gold transition-colors"
                  {...hoverProps}
                >
                  <Activity className="w-4 h-4 shrink-0" />
                  Active Staging Build
                  <ExternalLink className="w-3 h-3 mt-0.5" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Invoices List */}
        <div className="bg-white border border-border-custom shadow-sm p-6 rounded-2xl flex flex-col gap-5">
          <h3 className="font-heading text-base font-bold text-text-primary border-b border-border-custom pb-3 flex items-center gap-2">
            <DollarSign className="w-4.5 h-4.5 text-gold shrink-0" />
            Billing Invoices
          </h3>

          <div className="flex flex-col gap-3">
            {project.invoices.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between gap-3 p-3 border border-border-custom/40 rounded-xl hover:bg-bg-primary/20 transition-all"
              >
                <div>
                  <div className="text-xs font-bold text-text-primary">{inv.amount}</div>
                  <div className="text-[9px] text-text-secondary uppercase mt-0.5 font-light">
                    {inv.id} &bull; {inv.date}
                  </div>
                </div>

                <span
                  className={`text-[9px] uppercase font-bold px-2.5 py-1 rounded-md ${
                    inv.status === "Paid"
                      ? "bg-green-500/10 text-green-600"
                      : inv.status === "Pending"
                      ? "bg-gold/10 text-gold border border-gold/20"
                      : "bg-red-500/10 text-red-500"
                  }`}
                >
                  {inv.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Support Tickets */}
        <div className="bg-white border border-border-custom shadow-sm p-6 rounded-2xl flex flex-col gap-5">
          <h3 className="font-heading text-base font-bold text-text-primary border-b border-border-custom pb-3 flex items-center gap-2">
            <Ticket className="w-4.5 h-4.5 text-gold shrink-0" />
            Support Tickets
          </h3>

          {/* Create ticket form */}
          <form onSubmit={handleCreateTicket} className="flex gap-2">
            <input
              type="text"
              placeholder="Ask a question..."
              value={ticketSubject}
              onChange={(e) => setTicketSubject(e.target.value)}
              className="flex-grow bg-bg-primary/30 border border-border-custom focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold rounded-xl py-2 px-3 text-xs font-medium transition-all"
              {...inputHoverProps}
            />
            <button
              type="submit"
              className="p-2.5 bg-gold text-white rounded-xl hover:bg-gold/90 transition-colors shrink-0 shadow-sm"
              {...hoverProps}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Tickets lists */}
          <div className="flex flex-col gap-3">
            {tickets.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between gap-3 p-3 border border-border-custom/40 rounded-xl hover:bg-bg-primary/20 transition-all text-left"
              >
                <div className="overflow-hidden">
                  <div className="text-xs font-bold text-text-primary truncate">{t.subject}</div>
                  <div className="text-[9px] text-text-secondary uppercase mt-0.5 font-light">
                    {t.id} &bull; {t.date}
                  </div>
                </div>

                <span
                  className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded shrink-0 ${
                    t.status === "Resolved"
                      ? "bg-zinc-100 text-zinc-500"
                      : "bg-gold/10 text-gold border border-gold/20"
                  }`}
                >
                  {t.status}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
export default ClientPortal;
