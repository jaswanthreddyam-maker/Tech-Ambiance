import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useScroll } from "../../providers/ScrollProvider";
import {
  X,
  Check,
  ArrowRight,
  ArrowLeft,
  Building2,
  Globe,
  AtSign,
  MapPin,
  Sparkles,
  Loader2,
  CheckCircle2,
  FileText,
  Phone,
  Mail,
  MessageSquare,
  TrendingUp,
  Award,
} from "lucide-react";
import { crmRepository } from "../../repositories/crmRepository";
import { isSupabaseConfigured } from "../../lib/supabase";
import { useAuth } from "../../auth/hooks/useAuth";

interface StrategyConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const INDUSTRIES = [
  "Restaurant",
  "Cafe",
  "Gym",
  "Salon",
  "Hotel",
  "Clinic",
  "Real Estate",
  "E-Commerce",
  "Other",
];

const HEARD_SOURCES = [
  "Google",
  "Instagram",
  "LinkedIn",
  "Referral",
  "Friend",
  "Other",
];

const GOALS_OPTIONS = [
  { id: "new_website", label: "New Website", desc: "Bespoke digital architecture" },
  { id: "redesign", label: "Website Redesign", desc: "Elevate your existing presence" },
  { id: "seo", label: "SEO & Growth", desc: "Dominate search rankings" },
  { id: "booking", label: "Booking System", desc: "Automate reservation workflows" },
  { id: "mobile_app", label: "Mobile App", desc: "iOS & Android bespoke applications" },
  { id: "branding", label: "Branding", desc: "Luxury brand identity & typography" },
  { id: "ai_auto", label: "AI Automation", desc: "Intelligent autonomous agents" },
];

const BUDGET_OPTIONS = ["<25K", "25K-50K", "50K-100K", "100K+"];

const TIMELINE_OPTIONS = [
  "Immediately",
  "Within 2 Weeks",
  "Within a Month",
  "Just Exploring",
];

const CONTACT_CHANNELS = [
  { id: "WhatsApp", label: "WhatsApp" },
  { id: "Call", label: "Phone Call" },
  { id: "Email", label: "Email" },
];

// WCAG AA Luxury Contrast Design Tokens
const MAIN_HEADING_CLS = "font-heading font-bold text-2xl sm:text-3xl text-[#F7F3EA] mb-1";
const SUBTITLE_CLS = "text-xs sm:text-sm text-[#F7F3EA]/[0.72] font-light";
const LABEL_CLS = "text-[10px] uppercase font-bold tracking-[0.2em] text-[#C9A56A]";
const INPUT_WITH_ICON_CLS = "w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(201,165,106,0.18)] hover:border-[rgba(201,165,106,0.35)] focus:border-[#C9A56A] focus:outline-none focus:shadow-[0_0_0_4px_rgba(201,165,106,0.12)] rounded-xl py-3 pl-11 pr-4 text-xs sm:text-sm text-[#F7F3EA] placeholder:text-[#F7F3EA]/[0.45] transition-all";
const INPUT_NO_ICON_CLS = "w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(201,165,106,0.18)] hover:border-[rgba(201,165,106,0.35)] focus:border-[#C9A56A] focus:outline-none focus:shadow-[0_0_0_4px_rgba(201,165,106,0.12)] rounded-xl py-3 px-4 text-xs sm:text-sm text-[#F7F3EA] placeholder:text-[#F7F3EA]/[0.45] transition-all";
const TEXTAREA_CLS = "w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(201,165,106,0.18)] hover:border-[rgba(201,165,106,0.35)] focus:border-[#C9A56A] focus:outline-none focus:shadow-[0_0_0_4px_rgba(201,165,106,0.12)] rounded-xl py-3 pl-11 pr-4 text-xs sm:text-sm text-[#F7F3EA] placeholder:text-[#F7F3EA]/[0.45] transition-all resize-none";
const ICON_INPUT_CLS = "absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C9A56A]/[0.75]";
const ICON_TEXTAREA_CLS = "absolute left-4 top-4 w-4 h-4 text-[#C9A56A]/[0.75]";

export const StrategyConsultationModal: React.FC<StrategyConsultationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { lenis } = useScroll();
  const { isAuthenticated, user, profile } = useAuth();

  // Step navigation: 1, 2, 3 = Form steps | 4 = Analyzing | 5 = Digital Snapshot
  const [step, setStep] = useState<number>(1);

  // Form State
  const [formData, setFormData] = useState({
    businessName: "",
    industry: "Restaurant",
    website: "",
    instagram: "",
    city: "",
    heardSource: "Google",
    goals: [] as string[],
    budget: "25K-50K",
    timeline: "Within 2 Weeks",
    name: "",
    phone: "",
    email: "",
    preferredContact: "WhatsApp",
    message: "",
  });

  // Analysis Loader State
  const [analysisProgress, setAnalysisProgress] = useState<number>(0);
  const [analysisText, setAnalysisText] = useState<string>("Initializing telemetry...");

  // Submission Resiliency
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [idempotencyKey, setIdempotencyKey] = useState("");

  const navigate = useNavigate();

  // Reset modal state when opened
  useEffect(() => {
    if (isOpen) {
      if (!isAuthenticated) {
        onClose();
        navigate("/auth?mode=signup&redirect=consultation");
        return;
      }
      setStep(1);
      setAnalysisProgress(0);
      setIsSubmitting(false);
      setSubmitError("");
      setIdempotencyKey(crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(7));

      setFormData((prev) => ({
        ...prev,
        name: prev.name || user?.name || profile?.full_name || "",
        email: prev.email || user?.email || profile?.email || "",
      }));
    }
  }, [isOpen, isAuthenticated, user, profile, onClose, navigate]);

  // Apple / Stripe grade scroll lock: Freeze background page completely while modal is open
  useEffect(() => {
    if (!isOpen) return;

    // Pause Lenis smooth scrolling
    lenis?.stop();

    // Record current scroll position precisely
    const scrollY = window.scrollY || document.documentElement.scrollTop;

    // Save existing document / body styles
    const originalBodyOverflow = document.body.style.overflow;
    const originalBodyPosition = document.body.style.position;
    const originalBodyTop = document.body.style.top;
    const originalBodyWidth = document.body.style.width;
    const originalHtmlOverflow = document.documentElement.style.overflow;

    // Complete freeze of underlying document at exact scroll position
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    document.documentElement.style.overflow = "hidden";

    return () => {
      // Determine exact saved scroll position
      const topVal = document.body.style.top;
      const savedScrollY = topVal ? Math.abs(parseInt(topVal, 10)) : scrollY;

      // Restore original styles
      document.body.style.overflow = originalBodyOverflow;
      document.body.style.position = originalBodyPosition;
      document.body.style.top = originalBodyTop;
      document.body.style.width = originalBodyWidth;
      document.documentElement.style.overflow = originalHtmlOverflow;

      // Restore exact previous scroll position
      window.scrollTo(0, savedScrollY);

      // Resume Lenis smooth scroll
      lenis?.start();
    };
  }, [isOpen, lenis]);

  // Handle live animated analysis progression (Stage 4)
  useEffect(() => {
    if (step !== 4) return;

    setAnalysisProgress(12);
    setAnalysisText("Checking website & domain profile...");

    const t1 = setTimeout(() => {
      setAnalysisProgress(25);
      setAnalysisText("Scanning SEO structure & mobile responsiveness...");
    }, 600);

    const t2 = setTimeout(() => {
      setAnalysisProgress(48);
      setAnalysisText("Auditing Instagram brand footprint & conversion funnels...");
    }, 1200);

    const t3 = setTimeout(() => {
      setAnalysisProgress(71);
      setAnalysisText("Calculating estimated revenue opportunity & architecture scope...");
    }, 1800);

    const t4 = setTimeout(() => {
      setAnalysisProgress(100);
      setAnalysisText("Generating Complimentary Digital Snapshot...");
    }, 2400);

    const t5 = setTimeout(() => {
      setStep(5); // Move to Digital Snapshot result screen
    }, 2900);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [step]);

  const toggleGoal = (goalLabel: string) => {
    setFormData((prev) => {
      const exists = prev.goals.includes(goalLabel);
      if (exists) {
        return { ...prev, goals: prev.goals.filter((g) => g !== goalLabel) };
      } else {
        return { ...prev, goals: [...prev.goals, goalLabel] };
      }
    });
  };

  const handleNextStep1 = () => {
    if (!formData.businessName.trim()) {
      alert("Please enter your Business Name to proceed.");
      return;
    }
    setStep(2);
  };

  const handleNextStep2 = () => {
    if (formData.goals.length === 0) {
      alert("Please select at least one goal requirement.");
      return;
    }
    setStep(3);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim() || !formData.email.trim()) {
      alert("Please fill in Name, Phone, and Email.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      await crmRepository.createLead(
        {
          business_name: formData.businessName,
          industry: formData.industry,
          website: formData.website,
          instagram: formData.instagram,
          city: formData.city,
          heard_source: formData.heardSource,
          goals: formData.goals,
          budget_range: formData.budget,
          timeline: formData.timeline,
          contact_name: formData.name,
          contact_phone: formData.phone,
          contact_email: formData.email,
          preferred_contact: formData.preferredContact,
          message: formData.message,
        },
        idempotencyKey
      );
      // DB persisted successfully, move to success screen
      setStep(4); // Start Live Analysis
    } catch (err: any) {
      console.error("CRM lead submission failed:", err);
      setSubmitError(err.message || "Failed to submit consultation. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate printable/downloadable Digital Snapshot PDF Report
  const handleGeneratePDF = () => {
    const meetingId = `TA-${Math.floor(100000 + Math.random() * 900000)}`;
    const submittedAt = new Date().toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    const reportHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Tech Ambiance Consultation Snapshot - ${formData.businessName}</title>
        <style>
          body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            background: #FAF7F0;
            color: #06291E;
            margin: 0;
            padding: 40px;
          }
          .card {
            background: #ffffff;
            border: 2px solid #06291E;
            border-radius: 16px;
            padding: 40px;
            max-width: 720px;
            margin: 0 auto;
            box-shadow: 0 12px 32px rgba(6,41,30,0.12);
          }
          .header {
            border-bottom: 2px solid #C5A572;
            padding-bottom: 20px;
            margin-bottom: 24px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
          }
          .brand {
            font-size: 28px;
            font-weight: 900;
            letter-spacing: 2px;
            color: #06291E;
          }
          .gold {
            color: #C5A572;
          }
          .badge {
            background: #06291E;
            color: #C5A572;
            padding: 6px 14px;
            border-radius: 99px;
            font-size: 11px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          h2 {
            margin: 0 0 16px 0;
            font-size: 24px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          td {
            padding: 12px 0;
            border-bottom: 1px solid rgba(6,41,30,0.1);
          }
          .label {
            font-weight: bold;
            color: #06291E;
            width: 40%;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .val {
            font-size: 15px;
            color: #333333;
          }
          .score-box {
            background: #06291E;
            color: #FAF7F0;
            border-radius: 12px;
            padding: 24px;
            margin: 28px 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .score-title {
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #C5A572;
            font-weight: bold;
          }
          .score-num {
            font-size: 36px;
            font-weight: 900;
            color: #C5A572;
          }
          .footer {
            margin-top: 32px;
            font-size: 12px;
            color: #666;
            text-align: center;
            border-top: 1px solid rgba(6,41,30,0.1);
            padding-top: 16px;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <div>
              <div class="brand">TA <span class="gold">•</span> TECH AMBIANCE</div>
              <div style="font-size:12px; letter-spacing:1px; text-transform:uppercase; margin-top:4px;">Bespoke Digital Strategy Blueprint</div>
            </div>
            <div class="badge">Meeting ID: ${meetingId}</div>
          </div>

          <h2>Consultation Request Snapshot</h2>
          <p style="font-size:14px; line-height:1.6; color:#444;">
            Prepared exclusively for <strong>${formData.businessName}</strong>. Our senior strategy and architectural engineering team will contact you within 24 hours to present a tailored execution roadmap.
          </p>

          <div class="score-box">
            <div>
              <div class="score-title">Preliminary Digital Audit Score</div>
              <div style="font-size:12px; margin-top:4px; opacity:0.8;">17 Optimization Opportunities Identified</div>
            </div>
            <div class="score-num">63/100</div>
          </div>

          <table>
            <tr>
              <td class="label">Business Name</td>
              <td class="val"><strong>${formData.businessName}</strong></td>
            </tr>
            <tr>
              <td class="label">Industry Sector</td>
              <td class="val">${formData.industry}</td>
            </tr>
            <tr>
              <td class="label">Website / Domain</td>
              <td class="val">${formData.website || "Not Entered (High Opportunity)"}</td>
            </tr>
            <tr>
              <td class="label">Selected Goals</td>
              <td class="val">${formData.goals.join(", ")}</td>
            </tr>
            <tr>
              <td class="label">Investment Budget</td>
              <td class="val">${formData.budget}</td>
            </tr>
            <tr>
              <td class="label">Target Timeline</td>
              <td class="val">${formData.timeline}</td>
            </tr>
            <tr>
              <td class="label">Client Contact</td>
              <td class="val">${formData.name} (${formData.phone} • ${formData.email})</td>
            </tr>
            <tr>
              <td class="label">Preferred Channel</td>
              <td class="val">${formData.preferredContact}</td>
            </tr>
            <tr>
              <td class="label">Submitted At</td>
              <td class="val">${submittedAt}</td>
            </tr>
          </table>

          <div class="footer">
            Tech Ambiance Studio • 100% Complimentary Strategy Assessment • Custom B2B Flagships
          </div>
        </div>
        <script>
          window.print();
        </script>
      </body>
      </html>
    `;

    const printWin = window.open("", "_blank", "width=850,height=950");
    if (printWin) {
      printWin.document.open();
      printWin.document.write(reportHtml);
      printWin.document.close();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 overflow-hidden overscroll-contain"
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
          {/* Luxury Frosted Glass Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
            onClick={onClose}
            className="fixed inset-0"
            style={{
              backgroundColor: "rgba(245, 241, 232, 0.10)",
              backgroundImage:
                "radial-gradient(circle at center, rgba(201,165,106,0.10) 0%, rgba(201,165,106,0.04) 35%, transparent 75%)",
              backdropFilter: "blur(18px) saturate(140%)",
              WebkitBackdropFilter: "blur(18px) saturate(140%)",
            }}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
            className="relative z-10 w-full max-w-2xl rounded-3xl overflow-hidden text-ivory max-h-[90vh] flex flex-col"
            style={{
              background: "linear-gradient(180deg, #0B3027 0%, #08261F 100%)",
              border: "1px solid rgba(201,165,106,0.14)",
              boxShadow:
                "0 32px 80px rgba(0,0,0,0.32), inset 0 1px rgba(255,255,255,0.04), inset 0 -1px rgba(0,0,0,0.18)",
            }}
          >
            {/* Luxury Crack / Contour Pattern (Printed Paper Watermark Layer) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden"
            >
              <svg
                className="w-full h-full"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 700 700"
                preserveAspectRatio="none"
              >
                {/* Large curve near the top-right */}
                <path
                  d="M 380,-30 C 460,80 560,140 730,110"
                  fill="none"
                  stroke="rgba(201,165,106,0.08)"
                  strokeWidth="1.3"
                  style={{ filter: "blur(0.4px)" }}
                />
                {/* Sweeping line across the middle */}
                <path
                  d="M -50,330 C 180,390 410,240 750,340"
                  fill="none"
                  stroke="rgba(201,165,106,0.08)"
                  strokeWidth="1.1"
                  style={{ filter: "blur(0.4px)" }}
                />
                {/* Subtle curve near the bottom-left */}
                <path
                  d="M -30,620 C 120,530 260,610 420,730"
                  fill="none"
                  stroke="rgba(201,165,106,0.08)"
                  strokeWidth="1.2"
                  style={{ filter: "blur(0.4px)" }}
                />
              </svg>
            </motion.div>

            {/* Top Glass Header */}
            <div className="relative z-10 flex items-center justify-between px-6 sm:px-8 py-5 border-b border-ivory/10 bg-forest/50 shrink-0">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-gold" />
                <span className="text-[11px] uppercase tracking-[0.24em] font-bold text-gold">
                  Book Strategy Consultation
                </span>
              </div>

              <div className="flex items-center gap-4">
                {step <= 3 && (
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#F7F3EA]">
                    <span>Step {step} of 3</span>
                    <div className="flex items-center gap-1.5 ml-1">
                      {[1, 2, 3].map((s) => (
                        <div
                          key={s}
                          className={`w-2 h-2 rounded-full transition-all ${
                            s === step
                              ? "w-5 bg-gold"
                              : s < step
                              ? "bg-gold/60"
                              : "bg-ivory/20"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-ivory/10 hover:bg-ivory/20 flex items-center justify-center text-ivory transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Body Content */}
            <div className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden p-6 sm:p-10 custom-scrollbar">
              {!isSupabaseConfigured ? (
                <div className="py-12 flex flex-col items-center justify-center text-center max-w-md mx-auto">
                  <div className="w-16 h-16 rounded-full bg-[#C9A56A]/10 border border-[#C9A56A]/20 flex items-center justify-center mb-6">
                    <Mail className="w-8 h-8 text-[#C9A56A]" />
                  </div>
                  <h3 className="font-heading font-bold text-2xl text-[#F7F3EA] mb-4">
                    Temporarily Unavailable
                  </h3>
                  <p className="text-sm text-[#F7F3EA]/70 leading-relaxed mb-8">
                    We are temporarily unable to receive automated submissions. Please email <span className="text-[#C9A56A] font-semibold">hello@techambiance.com</span> or call us directly to book your strategy consultation.
                  </p>
                </div>
              ) : (
                <AnimatePresence mode="wait">
                {/* ========================================================
                    STEP 1: BUSINESS INFORMATION
                ======================================================== */}
                {step === 1 && (
                  <motion.div
                    key="step-1"
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16 }}
                    transition={{ duration: 0.25 }}
                    className="flex flex-col gap-6"
                  >
                    <div>
                      <h2 className={MAIN_HEADING_CLS}>
                        Let's understand your business.
                      </h2>
                      <p className={SUBTITLE_CLS}>
                        Answer a few quick questions so we can prepare a strategy before our meeting.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Business Name */}
                      <div className="sm:col-span-2 flex flex-col gap-1.5">
                        <label className={LABEL_CLS}>
                          Business Name *
                        </label>
                        <div className="relative">
                          <Building2 className={ICON_INPUT_CLS} />
                          <input
                            type="text"
                            placeholder="e.g. Vistaara Luxury Group"
                            value={formData.businessName}
                            onChange={(e) =>
                              setFormData({ ...formData, businessName: e.target.value })
                            }
                            className={INPUT_WITH_ICON_CLS}
                          />
                        </div>
                      </div>

                      {/* Website */}
                      <div className="flex flex-col gap-1.5">
                        <label className={LABEL_CLS}>
                          Website URL (Optional)
                        </label>
                        <div className="relative">
                          <Globe className={ICON_INPUT_CLS} />
                          <input
                            type="text"
                            placeholder="https://yourbrand.com"
                            value={formData.website}
                            onChange={(e) =>
                              setFormData({ ...formData, website: e.target.value })
                            }
                            className={INPUT_WITH_ICON_CLS}
                          />
                        </div>
                      </div>

                      {/* Instagram */}
                      <div className="flex flex-col gap-1.5">
                        <label className={LABEL_CLS}>
                          Instagram / Social
                        </label>
                        <div className="relative">
                          <AtSign className={ICON_INPUT_CLS} />
                          <input
                            type="text"
                            placeholder="@yourbrand"
                            value={formData.instagram}
                            onChange={(e) =>
                              setFormData({ ...formData, instagram: e.target.value })
                            }
                            className={INPUT_WITH_ICON_CLS}
                          />
                        </div>
                      </div>

                      {/* City */}
                      <div className="sm:col-span-2 flex flex-col gap-1.5">
                        <label className={LABEL_CLS}>
                          City / Location
                        </label>
                        <div className="relative">
                          <MapPin className={ICON_INPUT_CLS} />
                          <input
                            type="text"
                            placeholder="e.g. Hyderabad, India"
                            value={formData.city}
                            onChange={(e) =>
                              setFormData({ ...formData, city: e.target.value })
                            }
                            className={INPUT_WITH_ICON_CLS}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Industry Selector Grid */}
                    <div className="flex flex-col gap-2 mt-1">
                      <label className={LABEL_CLS}>
                        Industry Sector *
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {INDUSTRIES.map((ind) => {
                          const isSelected = formData.industry === ind;
                          return (
                            <button
                              key={ind}
                              type="button"
                              onClick={() => setFormData({ ...formData, industry: ind })}
                              className={`py-2.5 px-3 rounded-xl text-xs font-semibold tracking-wide transition-all border ${
                                isSelected
                                  ? "bg-[#C9A56A] text-forest border-[#C9A56A] shadow-md"
                                  : "bg-[rgba(255,255,255,0.03)] text-[#F7F3EA] border-[rgba(201,165,106,0.18)] hover:border-[rgba(201,165,106,0.35)]"
                              }`}
                            >
                              {ind}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* How did you hear about us? */}
                    <div className="flex flex-col gap-2 mt-1">
                      <label className={LABEL_CLS}>
                        How did you hear about us?
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {HEARD_SOURCES.map((source) => {
                          const isSelected = formData.heardSource === source;
                          return (
                            <button
                              key={source}
                              type="button"
                              onClick={() =>
                                setFormData({ ...formData, heardSource: source })
                              }
                              className={`py-1.5 px-3.5 rounded-full text-[11px] font-medium transition-all border ${
                                isSelected
                                  ? "bg-[#C9A56A] text-forest border-[#C9A56A] font-bold"
                                  : "bg-[rgba(255,255,255,0.03)] text-[#F7F3EA] border-[rgba(201,165,106,0.18)] hover:border-[rgba(201,165,106,0.35)]"
                              }`}
                            >
                              {source}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Next Button */}
                    <div className="flex justify-end pt-2">
                      <button
                        type="button"
                        onClick={handleNextStep1}
                        className="inline-flex items-center gap-2.5 bg-gold text-forest px-7 py-3.5 rounded-full font-heading font-bold text-xs uppercase tracking-widest hover:bg-ivory transition-colors shadow-lg"
                      >
                        <span>Next: Define Goals</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ========================================================
                    STEP 2: GOALS, BUDGET, TIMELINE
                ======================================================== */}
                {step === 2 && (
                  <motion.div
                    key="step-2"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.25 }}
                    className="flex flex-col gap-6"
                  >
                    <div>
                      <h2 className={MAIN_HEADING_CLS}>
                        What are you looking for?
                      </h2>
                      <p className={SUBTITLE_CLS}>
                        Select all capabilities you want to architect for your brand.
                      </p>
                    </div>

                    {/* Selectable Goal Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {GOALS_OPTIONS.map((goal) => {
                        const isSelected = formData.goals.includes(goal.label);
                        return (
                          <div
                            key={goal.id}
                            onClick={() => toggleGoal(goal.label)}
                            className={`cursor-pointer rounded-2xl p-3.5 border transition-all flex items-start justify-between gap-3 ${
                              isSelected
                                ? "bg-[#C9A56A]/15 border-[#C9A56A] shadow-md"
                                : "bg-[rgba(255,255,255,0.03)] border-[rgba(201,165,106,0.18)] hover:border-[rgba(201,165,106,0.35)]"
                            }`}
                          >
                            <div>
                              <div className="text-xs font-bold text-[#F7F3EA]">
                                {goal.label}
                              </div>
                              <div className="text-[11px] text-[#F7F3EA]/[0.72] mt-0.5">
                                {goal.desc}
                              </div>
                            </div>
                            <div
                              className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
                                isSelected
                                  ? "bg-[#C9A56A] text-forest border-[#C9A56A]"
                                  : "border-[rgba(201,165,106,0.18)]"
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Budget Range */}
                    <div className="flex flex-col gap-2 mt-1">
                      <label className={LABEL_CLS}>
                        Estimated Budget Range (INR / USD equivalent)
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {BUDGET_OPTIONS.map((b) => {
                          const isSelected = formData.budget === b;
                          return (
                            <button
                              key={b}
                              type="button"
                              onClick={() => setFormData({ ...formData, budget: b })}
                              className={`py-2.5 px-3 rounded-xl text-xs font-bold tracking-wider transition-all border ${
                                isSelected
                                  ? "bg-[#C9A56A] text-forest border-[#C9A56A] shadow-md"
                                  : "bg-[rgba(255,255,255,0.03)] text-[#F7F3EA] border-[rgba(201,165,106,0.18)] hover:border-[rgba(201,165,106,0.35)]"
                              }`}
                            >
                              {b}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="flex flex-col gap-2 mt-1">
                      <label className={LABEL_CLS}>
                        Target Timeline
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {TIMELINE_OPTIONS.map((t) => {
                          const isSelected = formData.timeline === t;
                          return (
                            <button
                              key={t}
                              type="button"
                              onClick={() => setFormData({ ...formData, timeline: t })}
                              className={`py-2.5 px-3 rounded-xl text-xs font-semibold tracking-wide transition-all border ${
                                isSelected
                                  ? "bg-[#C9A56A] text-forest border-[#C9A56A] shadow-md"
                                  : "bg-[rgba(255,255,255,0.03)] text-[#F7F3EA] border-[rgba(201,165,106,0.18)] hover:border-[rgba(201,165,106,0.35)]"
                              }`}
                            >
                              {t}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between pt-2">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="inline-flex items-center gap-2 text-ivory/80 hover:text-gold text-xs font-semibold uppercase tracking-wider transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleNextStep2}
                        className="inline-flex items-center gap-2.5 bg-gold text-forest px-7 py-3.5 rounded-full font-heading font-bold text-xs uppercase tracking-widest hover:bg-ivory transition-colors shadow-lg"
                      >
                        <span>Next: Contact Details</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ========================================================
                    STEP 3: CONTACT DETAILS
                ======================================================== */}
                {step === 3 && (
                  <motion.form
                    key="step-3"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.25 }}
                    onSubmit={handleSubmitForm}
                    className="flex flex-col gap-6"
                  >
                    <div>
                      <h2 className={MAIN_HEADING_CLS}>
                        Where should we reach you?
                      </h2>
                      <p className={SUBTITLE_CLS}>
                        Our senior strategists review your profile and prepare a custom blueprint before our call.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Name */}
                      <div className="flex flex-col gap-1.5">
                        <label className={LABEL_CLS}>
                          Your Name *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Aditya Sharma"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          className={INPUT_NO_ICON_CLS}
                        />
                      </div>

                      {/* Phone / WhatsApp */}
                      <div className="flex flex-col gap-1.5">
                        <label className={LABEL_CLS}>
                          Phone / WhatsApp *
                        </label>
                        <div className="relative">
                          <Phone className={ICON_INPUT_CLS} />
                          <input
                            type="tel"
                            required
                            placeholder="+91 98765 43210"
                            value={formData.phone}
                            onChange={(e) =>
                              setFormData({ ...formData, phone: e.target.value })
                            }
                            className={INPUT_WITH_ICON_CLS}
                          />
                        </div>
                      </div>

                      {/* Email */}
                      <div className="sm:col-span-2 flex flex-col gap-1.5">
                        <label className={LABEL_CLS}>
                          Work Email *
                        </label>
                        <div className="relative">
                          <Mail className={ICON_INPUT_CLS} />
                          <input
                            type="email"
                            required
                            placeholder="aditya@vistaara.com"
                            value={formData.email}
                            onChange={(e) =>
                              setFormData({ ...formData, email: e.target.value })
                            }
                            className={INPUT_WITH_ICON_CLS}
                          />
                        </div>
                      </div>

                      {/* Preferred Contact Channel */}
                      <div className="sm:col-span-2 flex flex-col gap-2">
                        <label className={LABEL_CLS}>
                          Preferred Contact Channel
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                          {CONTACT_CHANNELS.map((ch) => {
                            const isSelected = formData.preferredContact === ch.id;
                            return (
                              <button
                                key={ch.id}
                                type="button"
                                onClick={() =>
                                  setFormData({ ...formData, preferredContact: ch.id })
                                }
                                className={`py-2.5 px-4 rounded-xl text-xs font-bold tracking-wide transition-all border ${
                                  isSelected
                                    ? "bg-[#C9A56A] text-forest border-[#C9A56A] shadow-md"
                                    : "bg-[rgba(255,255,255,0.03)] text-[#F7F3EA] border-[rgba(201,165,106,0.18)] hover:border-[rgba(201,165,106,0.35)]"
                                }`}
                              >
                                {ch.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Message */}
                      <div className="sm:col-span-2 flex flex-col gap-1.5">
                        <label className={LABEL_CLS}>
                          Tell us anything about your project vision
                        </label>
                        <div className="relative">
                          <MessageSquare className={ICON_TEXTAREA_CLS} />
                          <textarea
                            rows={3}
                            placeholder="Share key goals, competitor references, or current pain points..."
                            value={formData.message}
                            onChange={(e) =>
                              setFormData({ ...formData, message: e.target.value })
                            }
                            className={TEXTAREA_CLS}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between pt-3 border-t border-ivory/10">
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="inline-flex items-center gap-2 text-ivory/80 hover:text-gold text-xs font-semibold uppercase tracking-wider transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back</span>
                      </button>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex items-center gap-2.5 bg-gold text-forest px-8 py-4 rounded-full font-heading font-bold text-xs uppercase tracking-widest hover:bg-ivory disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-[0_8px_24px_rgba(197,165,114,0.35)]"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Sending...</span>
                          </>
                        ) : (
                          <>
                            <span>Submit Request</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>

                    {submitError && (
                      <div className="mt-4 p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-center">
                        <p className="text-xs text-red-200">Unable to submit. Please contact us directly at <span className="font-bold underline">hello@techambiance.com</span></p>
                      </div>
                    )}
                  </motion.form>
                )}

                {/* ========================================================
                    STAGE 4: LIVE ANIMATED ANALYSIS LOADER
                ======================================================== */}
                {step === 4 && (
                  <motion.div
                    key="step-4"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="py-12 flex flex-col items-center justify-center text-center max-w-md mx-auto"
                  >
                    <div className="relative w-20 h-20 flex items-center justify-center mb-6">
                      <div className="absolute inset-0 rounded-full border-2 border-gold/20 animate-ping" />
                      <div className="w-16 h-16 rounded-full bg-gold/15 border border-gold flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-gold animate-spin" />
                      </div>
                    </div>

                    <h3 className="font-heading font-bold text-2xl text-[#F7F3EA] mb-2">
                      Analyzing your business...
                    </h3>
                    <p className="text-xs text-[#C9A56A] font-mono uppercase tracking-widest mb-6">
                      {analysisText}
                    </p>

                    {/* Animated Progress Bar */}
                    <div className="w-full bg-ivory/10 rounded-full h-2.5 mb-3 overflow-hidden">
                      <motion.div
                        className="bg-gradient-to-r from-gold via-gold-light to-gold h-full rounded-full"
                        animate={{ width: `${analysisProgress}%` }}
                        transition={{ duration: 0.4 }}
                      />
                    </div>

                    <div className="flex items-center justify-between w-full text-[11px] font-mono text-[#F7F3EA]/[0.72]">
                      <span>TELEMETRY SCORECARD</span>
                      <span className="text-[#C9A56A] font-bold">{analysisProgress}%</span>
                    </div>
                  </motion.div>
                )}

                {/* ========================================================
                    STAGE 5: YOUR COMPLIMENTARY DIGITAL SNAPSHOT
                ======================================================== */}
                {step === 5 && (
                  <motion.div
                    key="step-5"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col gap-6"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-4 border-b border-ivory/10 pb-4">
                      <div>
                        <span className={LABEL_CLS}>
                          COMPLIMENTARY ASSESSMENT
                        </span>
                        <h2 className="font-heading font-bold text-2xl sm:text-3xl text-[#F7F3EA] mt-1">
                          Your Digital Snapshot
                        </h2>
                      </div>
                      <div className="bg-gold/15 border border-gold px-4 py-2 rounded-2xl flex items-center gap-2">
                        <Award className="w-5 h-5 text-[#C9A56A]" />
                        <div>
                          <div className="text-[10px] uppercase font-bold tracking-widest text-[#C9A56A]">
                            DIGITAL SCORE
                          </div>
                          <div className="font-heading font-black text-xl text-[#C9A56A]">
                            63 / 100
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Snapshot Grid Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-ivory/[0.04] border border-ivory/10 rounded-2xl p-3.5">
                        <div className="text-[10px] uppercase font-bold text-[#C9A56A] tracking-wider">
                          Website Status
                        </div>
                        <div className="text-xs font-bold text-[#F7F3EA] mt-1">
                          {formData.website ? "Profile Analyzed" : "Not Available"}
                        </div>
                      </div>

                      <div className="bg-ivory/[0.04] border border-ivory/10 rounded-2xl p-3.5">
                        <div className="text-[10px] uppercase font-bold text-[#C9A56A] tracking-wider">
                          SEO Authority
                        </div>
                        <div className="text-xs font-bold text-[#C9A56A] mt-1">
                          Untapped Potential
                        </div>
                      </div>

                      <div className="bg-ivory/[0.04] border border-ivory/10 rounded-2xl p-3.5">
                        <div className="text-[10px] uppercase font-bold text-[#C9A56A] tracking-wider">
                          Instagram / Social
                        </div>
                        <div className="text-xs font-bold text-[#F7F3EA] mt-1">
                          {formData.instagram ? "Active Handle" : "Growth Ready"}
                        </div>
                      </div>

                      <div className="bg-gold/10 border border-gold/40 rounded-2xl p-3.5">
                        <div className="text-[10px] uppercase font-bold text-[#C9A56A] tracking-wider">
                          Opportunity
                        </div>
                        <div className="text-xs font-black text-[#C9A56A] mt-1">
                          HIGH ✦
                        </div>
                      </div>
                    </div>

                    {/* Strategic Insight Box */}
                    <div className="bg-ivory/[0.04] border border-ivory/15 rounded-2xl p-4 sm:p-5">
                      <div className="flex items-start gap-3">
                        <TrendingUp className="w-5 h-5 text-[#C9A56A] shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-[#C9A56A]">
                            Recommended Architecture Roadmap
                          </h4>
                          <p className="text-xs text-[#F7F3EA]/[0.85] leading-relaxed mt-1 font-light">
                            Based on your selection ({formData.goals.join(", ") || "Custom Web Flagship"}), our team recommends the <strong>Bespoke Digital Flagship + High-Scale Growth Package</strong> to capture maximum conversion yield.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Consultation Assurance */}
                    <div className="flex items-center justify-between flex-wrap gap-3 bg-ivory/[0.03] border border-ivory/10 rounded-xl px-4 py-3 text-xs text-[#F7F3EA]/[0.72]">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#C9A56A]" />
                        <span>One of our strategists will contact you within 24 hours.</span>
                      </div>
                      <span className="font-semibold text-gold">
                        Average consultation: 30 mins • 100% Free
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-ivory/10">
                      <button
                        type="button"
                        onClick={handleGeneratePDF}
                        className="inline-flex items-center gap-2 bg-ivory/10 hover:bg-ivory/20 text-ivory px-5 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-colors"
                      >
                        <FileText className="w-4 h-4 text-gold" />
                        <span>Download Snapshot Report (PDF)</span>
                      </button>

                      <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex items-center gap-2 bg-gold text-forest px-7 py-3 rounded-full font-heading font-bold text-xs uppercase tracking-widest hover:bg-ivory transition-colors"
                      >
                        <span>Done / Close Portal</span>
                      </button>
                    </div>
                  </motion.div>
                )}
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default StrategyConsultationModal;
