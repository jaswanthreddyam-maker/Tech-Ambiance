import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Mail, Eye, EyeOff, Loader2, ArrowRight, X, CheckCircle2 } from "lucide-react";
import { useAuth } from "../../providers/AuthProvider";
import { authService } from "../../auth/authService";
import { useToast } from "../../providers/ToastProvider";
import { useCursorHover } from "../../hooks/useCursorHover";
import { useSEO } from "../../providers/SEOProvider";
import { Logo } from "../../components/atoms/Logo";
import { MarbleVeins } from "../../components/ui/MarbleVeins";

// Zod validation schemas
const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
});

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  agree: z.boolean().refine((val) => val === true, "You must accept the terms"),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, signup, loginWithGoogle, resetPasswordForEmail, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { setSEO } = React.useRef(useSEO()).current;
  const hoverProps = useCursorHover("pointer");
  const inputHoverProps = useCursorHover("hide");

  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "login";
  const [activeTab, setActiveTab] = useState<"login" | "signup">(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [verificationSentEmail, setVerificationSentEmail] = useState<string | null>(null);

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [isForgotSubmitting, setIsForgotSubmitting] = useState(false);

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate("/portal", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  React.useEffect(() => {
    const mode = searchParams.get("mode");
    if (mode === "signup" || mode === "login") {
      setActiveTab(mode);
    }
  }, [searchParams]);

  React.useEffect(() => {
    setSEO({
      title: "Studio Client Portal | Tech Ambiance",
      description: "Enter your curated Tech Ambiance studio portal environment.",
    });
  }, [setSEO]);

  // Hook forms
  const {
    register: loginRegister,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const {
    register: signupRegister,
    handleSubmit: handleSignupSubmit,
    formState: { errors: signupErrors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  });

  // Enterprise Handlers
  const onLogin = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      await login(data.email, data.password, data.rememberMe);
      setIsSuccess(true);
      toast("Welcome Back to Tech Ambiance Portal", "success");

      setTimeout(() => {
        navigate("/portal");
      }, 1000);
    } catch (err: any) {
      toast(
        err?.message || "Invalid credentials. Please verify your email and password.",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSignup = async (data: SignupFormValues) => {
    setIsSubmitting(true);
    try {
      const res = await signup(data.email, data.name, data.password);

      if (res.requiresVerification) {
        setVerificationSentEmail(data.email);
        toast("Verification email dispatched.", "success");
      } else {
        setIsSuccess(true);
        toast("Portal Environment Created Successfully", "success");
        setTimeout(() => {
          navigate("/portal");
        }, 1000);
      }
    } catch (err: any) {
      toast(
        err?.message || "Account creation failed. An account with this email may already exist.",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsSubmitting(true);
    try {
      await loginWithGoogle();
      
      // Check if we are running in local mock mode
      const { isSupabaseConfigured } = await import("../../lib/supabase");
      const isMockMode = !isSupabaseConfigured;
      
      if (isMockMode) {
        setIsSuccess(true);
        toast("Mock Google Auth Successful", "success");
        setTimeout(() => {
          navigate("/portal");
        }, 1000);
      } else {
        toast("Redirecting to Google SSO...", "info");
      }
    } catch (err: any) {
      toast(err?.message || "Google Single Sign-On cancelled or failed.", "error");
      setIsSubmitting(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;

    setIsForgotSubmitting(true);
    try {
      await resetPasswordForEmail(forgotEmail);
      toast("Password reset link sent to your inbox.", "success");
      setShowForgotModal(false);
      setForgotEmail("");
    } catch (err: any) {
      toast(err?.message || "Could not dispatch reset email.", "error");
    } finally {
      setIsForgotSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen grid grid-cols-1 lg:grid-cols-2 relative">
      {/* SUCCESS TRANSITION OVERLAY */}
      <AnimatePresence>
        {isSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 bg-forest z-[9999] pointer-events-auto flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-center"
            >
              <Logo size="lg" />
              <p className="text-gold uppercase font-heading font-bold text-xs tracking-[0.3em] mt-4">
                Initializing Studio Environment...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* VERIFICATION REQUIRED SCREEN MODAL */}
      <AnimatePresence>
        {verificationSentEmail && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-forest/80 backdrop-blur-xl z-[9999] flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[#FAF7F0] border border-forest/20 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl relative"
            >
              <div className="w-14 h-14 rounded-full bg-forest/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-7 h-7 text-forest" />
              </div>
              <h3 className="font-heading font-bold text-xl text-forest uppercase tracking-wider">
                Verification Email Sent
              </h3>
              <p className="text-xs text-text-secondary mt-2 leading-relaxed">
                We dispatched an executive confirmation link to{" "}
                <span className="font-bold text-forest">{verificationSentEmail}</span>. Please verify your email before accessing StudioHQ.
              </p>
              <button
                type="button"
                onClick={() => {
                  setVerificationSentEmail(null);
                  setActiveTab("login");
                }}
                className="w-full mt-6 py-3.5 rounded-full bg-forest text-gold font-heading font-bold uppercase tracking-[0.2em] text-xs shadow-lg hover:shadow-xl transition-all"
              >
                Return to Sign In
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await authService.resendVerificationEmail(verificationSentEmail);
                    toast("Confirmation link resent successfully.", "success");
                  } catch (err: any) {
                    toast(err?.message || "Could not resend email. Check Supabase rate limits.", "error");
                  }
                }}
                className="w-full mt-2.5 py-2 rounded-full bg-transparent text-forest/70 hover:text-forest font-heading font-bold uppercase tracking-[0.18em] text-[10px] transition-all"
              >
                Resend Confirmation Email
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FORGOT PASSWORD MODAL */}
      <AnimatePresence>
        {showForgotModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-forest/70 backdrop-blur-md z-[9999] flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#FAF7F0] border border-forest/20 rounded-3xl p-8 max-w-md w-full shadow-2xl relative"
            >
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="absolute right-5 top-5 text-forest/40 hover:text-forest"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="font-heading font-bold text-lg text-forest uppercase tracking-wider">
                Reset Password
              </h3>
              <p className="text-xs text-text-secondary mt-1">
                Enter your registered studio email to receive an enterprise recovery link.
              </p>
              <form onSubmit={handleForgotPasswordSubmit} className="mt-5 space-y-4">
                <div>
                  <label className="block text-[10px] font-heading font-bold uppercase tracking-[0.2em] text-forest/80 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="client@company.com"
                    className="w-full bg-white border border-forest/20 rounded-xl px-4 py-2.5 text-xs text-forest focus:outline-none focus:border-gold"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isForgotSubmitting}
                  className="w-full py-3 rounded-full bg-forest text-gold font-heading font-bold uppercase tracking-[0.2em] text-xs shadow-md hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {isForgotSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-gold" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <span>Send Reset Link</span>
                  )}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LEFT COLUMN: BRAND VISUAL & IDENTITY */}
      <div className="hidden lg:flex flex-col justify-between bg-forest p-12 lg:p-16 relative overflow-hidden text-gold">
        {/* Subtle Luxury Marble Layer */}
        <div className="absolute inset-0 opacity-15 pointer-events-none mix-blend-overlay">
          <MarbleVeins />
        </div>

        {/* Luxury Crack / Contour Pattern (Golden Cracks) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
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
              stroke="rgba(201,165,106,0.15)"
              strokeWidth="1.5"
              style={{ filter: "blur(0.5px)" }}
            />
            {/* Sweeping line across the middle */}
            <path
              d="M -50,330 C 180,390 410,240 750,340"
              fill="none"
              stroke="rgba(201,165,106,0.12)"
              strokeWidth="1.2"
              style={{ filter: "blur(0.5px)" }}
            />
            {/* Subtle curve near the bottom-left */}
            <path
              d="M -30,620 C 120,530 260,610 420,730"
              fill="none"
              stroke="rgba(201,165,106,0.15)"
              strokeWidth="1.5"
              style={{ filter: "blur(0.5px)" }}
            />
          </svg>
        </motion.div>

        {/* Ambient Gold Glows */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-gold/15 blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-gold/10 blur-[120px] pointer-events-none" />

        {/* Top bar */}
        <div className="flex items-center justify-between relative z-10">
          <div onClick={() => navigate("/landing")} className="cursor-pointer">
            <Logo size="md" />
          </div>
          <span className="text-[10px] uppercase tracking-[0.3em] font-medium opacity-60">
            Client Portal v2.4
          </span>
        </div>

        {/* Center editorial content */}
        <div className="my-auto max-w-xl relative z-10 py-12">
          <div className="inline-block border border-gold/30 rounded-full px-3.5 py-1 text-[10px] uppercase tracking-widest mb-6 bg-gold/5">
            Restricted Studio Access
          </div>

          <h1 className="font-heading font-bold text-4xl xl:text-5xl tracking-tight leading-[1.1] text-white">
            Where vision meets <br />
            <span className="italic font-serif font-normal text-gold">
              uncompromising execution.
            </span>
          </h1>

          <p className="mt-6 text-sm text-white/70 leading-relaxed font-light max-w-md">
            Review active milestones, inspect staging environments, and manage architectural deliverables directly within your curated workspace.
          </p>

          <div className="mt-10 pt-8 border-t border-gold/20 grid grid-cols-3 gap-6">
            <div>
              <span className="block font-heading font-bold text-xl text-gold">100%</span>
              <span className="text-[11px] text-white/60 uppercase tracking-wider">
                Bespoke Design
              </span>
            </div>
            <div>
              <span className="block font-heading font-bold text-xl text-gold">&lt; 0.4s</span>
              <span className="text-[11px] text-white/60 uppercase tracking-wider">
                Lighthouse TTFB
              </span>
            </div>
            <div>
              <span className="block font-heading font-bold text-xl text-gold">24/7</span>
              <span className="text-[11px] text-white/60 uppercase tracking-wider">
                Concierge Sync
              </span>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="flex items-center justify-between text-xs text-white/40 relative z-10">
          <span>© {new Date().getFullYear()} Tech Ambiance. All rights reserved.</span>
          <span className="uppercase tracking-widest text-[10px]">Encrypted Session</span>
        </div>
      </div>

      {/* RIGHT COLUMN: INTERACTIVE FORM CONTAINER */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12 lg:p-16 bg-[#FAF7F0] relative overflow-y-auto">
        {/* Mobile Logo Header */}
        <div className="lg:hidden w-full max-w-md mb-8 flex items-center justify-between">
          <div onClick={() => navigate("/landing")} className="cursor-pointer">
            <Logo size="md" />
          </div>
          <span className="text-[10px] uppercase tracking-widest font-bold text-forest/60">
            Portal Access
          </span>
        </div>

        {/* Card Form Wrapper */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-white/70 backdrop-blur-xl border border-forest/15 rounded-3xl p-8 sm:p-10 shadow-[0_20px_60px_rgba(6,41,30,0.06)] relative"
        >
          {/* TAB SWITCHER */}
          <div className="flex items-center justify-between border-b border-forest/10 pb-4 mb-6">
            <div>
              <h2 className="font-heading font-bold text-xl text-forest">
                {activeTab === "login" ? "Welcome Back" : "Join Studio Portal"}
              </h2>
              <p className="text-[11px] text-text-secondary mt-0.5">
                {activeTab === "login"
                  ? "Access your active project portal"
                  : "Initialize a client workspace"}
              </p>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setActiveTab("login")}
                className={`text-xs font-bold uppercase tracking-widest pb-1 transition-colors relative ${
                  activeTab === "login"
                    ? "text-forest"
                    : "text-text-secondary hover:text-forest"
                }`}
                {...hoverProps}
              >
                Sign In
                {activeTab === "login" && (
                  <motion.div
                    layoutId="authTabUnderline"
                    className="absolute bottom-0 left-0 w-full h-0.5 bg-gold"
                  />
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("signup")}
                className={`text-xs font-bold uppercase tracking-widest pb-1 transition-colors relative ${
                  activeTab === "signup"
                    ? "text-forest"
                    : "text-text-secondary hover:text-forest"
                }`}
                {...hoverProps}
              >
                Sign Up
                {activeTab === "signup" && (
                  <motion.div
                    layoutId="authTabUnderline"
                    className="absolute bottom-0 left-0 w-full h-0.5 bg-gold"
                  />
                )}
              </button>
            </div>
          </div>

          {/* OAUTH SSO BUTTON */}
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={isSubmitting}
            className="w-full bg-white border border-forest/15 hover:border-forest/30 rounded-full py-3.5 px-4 flex items-center justify-center gap-3 text-xs font-heading font-bold uppercase tracking-widest text-forest shadow-sm hover:shadow transition-all mb-6"
            {...hoverProps}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Continue with Google
          </button>

          {/* DIVIDER */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-forest/10" />
            <span className="text-[10px] uppercase font-bold tracking-widest text-text-secondary">
              Or continue with email
            </span>
            <div className="flex-1 h-px bg-forest/10" />
          </div>

          {/* FORMS */}
          <AnimatePresence mode="wait">
            {activeTab === "login" ? (
              <motion.form
                key="login-form"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleLoginSubmit(onLogin)}
                className="flex flex-col gap-4"
              >
                {/* Email */}
                <div className="flex flex-col gap-1 text-left">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-text-secondary">
                    Email Address
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-gold transition-colors" />
                    <input
                      type="email"
                      placeholder="client@company.com"
                      className="w-full bg-[#FAF7F0] border border-forest/15 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold rounded-xl py-3 pl-11 pr-4 text-xs font-medium text-forest transition-all"
                      {...loginRegister("email")}
                      {...inputHoverProps}
                    />
                  </div>
                  {loginErrors.email && (
                    <span className="text-[10px] font-semibold text-red-500 mt-0.5">
                      {loginErrors.email.message}
                    </span>
                  )}
                </div>

                {/* Password */}
                <div className="flex flex-col gap-1 text-left">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-text-secondary">
                    Password
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-gold transition-colors" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="w-full bg-[#FAF7F0] border border-forest/15 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold rounded-xl py-3 pl-11 pr-11 text-xs font-medium text-forest transition-all"
                      {...loginRegister("password")}
                      {...inputHoverProps}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-forest"
                      {...hoverProps}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {loginErrors.password && (
                    <span className="text-[10px] font-semibold text-red-500 mt-0.5">
                      {loginErrors.password.message}
                    </span>
                  )}
                </div>

                {/* Remember me + Forgot password */}
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      className="w-3.5 h-3.5 rounded border-forest/20 text-gold focus:ring-gold"
                      {...loginRegister("rememberMe")}
                    />
                    <label htmlFor="rememberMe" className="text-xs text-text-secondary select-none">
                      Remember device for 30 days
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-xs font-semibold text-forest/70 hover:text-gold transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Polished Emerald Stone CTA */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group relative w-full bg-forest !text-[#C5A572] border border-gold/35 shadow-[0_12px_32px_rgba(6,41,30,0.22)] py-4 rounded-full text-xs uppercase tracking-widest font-bold hover:border-gold hover:shadow-[0_16px_40px_rgba(6,41,30,0.32)] transition-all flex items-center justify-center gap-2.5 mt-3 overflow-hidden"
                  style={{ color: "#C5A572" }}
                  {...hoverProps}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-gold/0 via-gold/10 to-gold/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin !text-[#C5A572]" />
                  ) : (
                    <>
                      <span className="!text-[#C5A572]">Enter Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5 !text-[#C5A572] group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="signup-form"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSignupSubmit(onSignup)}
                className="flex flex-col gap-4"
              >
                {/* Name */}
                <div className="flex flex-col gap-1 text-left">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-text-secondary">
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="Arjun Mehta"
                    className="w-full bg-[#FAF7F0] border border-forest/15 focus:border-gold focus:outline-none rounded-xl py-3 px-4 text-xs font-medium text-forest"
                    {...signupRegister("name")}
                    {...inputHoverProps}
                  />
                  {signupErrors.name && (
                    <span className="text-[10px] font-semibold text-red-500">
                      {signupErrors.name.message}
                    </span>
                  )}
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1 text-left">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-text-secondary">
                    Work Email
                  </label>
                  <input
                    type="email"
                    placeholder="arjun@company.com"
                    className="w-full bg-[#FAF7F0] border border-forest/15 focus:border-gold focus:outline-none rounded-xl py-3 px-4 text-xs font-medium text-forest"
                    {...signupRegister("email")}
                    {...inputHoverProps}
                  />
                  {signupErrors.email && (
                    <span className="text-[10px] font-semibold text-red-500">
                      {signupErrors.email.message}
                    </span>
                  )}
                </div>

                {/* Password */}
                <div className="flex flex-col gap-1 text-left">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-text-secondary">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Minimum 8 characters"
                      className="w-full bg-[#FAF7F0] border border-forest/15 focus:border-gold focus:outline-none rounded-xl py-3 pl-4 pr-11 text-xs font-medium text-forest"
                      {...signupRegister("password")}
                      {...inputHoverProps}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-forest"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {signupErrors.password && (
                    <span className="text-[10px] font-semibold text-red-500">
                      {signupErrors.password.message}
                    </span>
                  )}
                </div>

                {/* Agree Checkbox */}
                <div className="flex items-start gap-2 mt-1">
                  <input
                    type="checkbox"
                    id="agree"
                    className="w-3.5 h-3.5 rounded border-forest/20 text-gold focus:ring-gold mt-0.5"
                    {...signupRegister("agree")}
                  />
                  <label htmlFor="agree" className="text-[11px] text-text-secondary leading-tight">
                    I accept the <span className="text-forest font-bold">Studio Agreement</span> and{" "}
                    <span className="text-forest font-bold">Privacy Policy</span>.
                  </label>
                </div>
                {signupErrors.agree && (
                  <span className="text-[10px] font-semibold text-red-500">
                    {signupErrors.agree.message}
                  </span>
                )}

                {/* Create Account CTA */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group relative w-full bg-forest !text-[#C5A572] border border-gold/35 shadow-[0_12px_32px_rgba(6,41,30,0.22)] py-4 rounded-full text-xs uppercase tracking-widest font-bold hover:border-gold hover:shadow-[0_16px_40px_rgba(6,41,30,0.32)] transition-all flex items-center justify-center gap-2.5 mt-2 overflow-hidden"
                  style={{ color: "#C5A572" }}
                  {...hoverProps}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-gold/0 via-gold/10 to-gold/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin !text-[#C5A572]" />
                  ) : (
                    <>
                      <span className="!text-[#C5A572]">Initialize Environment</span>
                      <ArrowRight className="w-3.5 h-3.5 !text-[#C5A572] group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Secure Studio badge */}
          <div className="mt-7 text-center">
            <span className="text-[10px] uppercase tracking-[0.24em] font-medium text-text-secondary">
              🔒 End-to-End Encrypted Client Portal
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
export default AuthPage;
