import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Mail, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { useAuth } from "../../providers/AuthProvider";
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
  const { login, signup } = useAuth();
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

  // Handlers
  const onLogin = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      toast("Welcome Back to Tech Ambiance Portal", "success");

      setTimeout(() => {
        login(data.email, "mock-token");
        navigate("/intro");
      }, 1000);
    }, 1200);
  };

  const onSignup = async (data: SignupFormValues) => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      toast("Portal Environment Created Successfully", "success");

      setTimeout(() => {
        signup(data.email, data.name, "mock-token");
        navigate("/intro");
      }, 1000);
    }, 1200);
  };

  const handleGoogleAuth = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      toast("Authenticated via Google SSO", "success");
      setTimeout(() => {
        login("client@techambiance.com", "mock-token");
        navigate("/intro");
      }, 1000);
    }, 1200);
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
            <div className="text-center">
              <span className="font-heading font-black text-6xl tracking-wider text-gold block mb-2">TA</span>
              <p className="text-ivory/70 text-xs uppercase tracking-[0.3em]">Entering Client Portal</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LEFT COLUMN: Emerald Architectural Canvas (50% split) */}
      <div className="relative bg-forest text-ivory flex flex-col justify-between p-8 md:p-14 lg:p-16 overflow-hidden select-none min-h-[440px] lg:min-h-screen">
        {/* Subtle Marble Veins inside Emerald Stone */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <MarbleVeins />
        </div>

        {/* Radial Warm Ambient Light Reflection */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(circle at 35% 50%, rgba(197, 165, 114, 0.12) 0%, transparent 70%)"
          }}
        />

        {/* Large Faded Architectural Watermark */}
        <div className="absolute right-0 bottom-16 translate-x-12 opacity-5 pointer-events-none font-heading font-black text-8xl lg:text-[11rem] leading-none uppercase tracking-tighter text-gold">
          TECH<br />AMBIANCE
        </div>

        {/* Top Studio Brand Bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, ease: [0.19, 1, 0.22, 1] }}
          className="relative z-10 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Logo size="md" />
          </div>
          <span className="text-[10px] uppercase tracking-[0.28em] text-gold/80 font-semibold">
            Client Portal Environment
          </span>
        </motion.div>

        {/* Middle Editorial Storytelling */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: [0.19, 1, 0.22, 1], delay: 0.15 }}
          className="relative z-10 max-w-lg my-12 lg:my-auto"
        >
          {/* Animated Gold Editorial Line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.9, ease: [0.19, 1, 0.22, 1] }}
            className="h-px w-16 bg-gold/50 mb-8 origin-left"
          />

          {activeTab === "login" ? (
            <>
              <h1 className="font-heading font-bold text-4xl sm:text-5xl lg:text-6xl text-ivory leading-[1.12] mb-6 tracking-tight">
                Great work <br />
                begins with <br />
                <span className="font-serif italic text-gold font-normal">great clients.</span>
              </h1>
              <p className="text-ivory/70 text-xs sm:text-sm leading-relaxed max-w-md font-light tracking-wide">
                Welcome to your private studio workspace. Review live project builds, inspect architectural blueprints, sign off milestones, and download production assets in real-time.
              </p>
            </>
          ) : (
            <>
              <h1 className="font-heading font-bold text-4xl sm:text-5xl lg:text-6xl text-ivory leading-[1.12] mb-6 tracking-tight">
                Crafting Digital <br />
                <span className="font-serif italic text-gold font-normal">Experiences.</span>
              </h1>
              <p className="text-ivory/70 text-xs sm:text-sm leading-relaxed max-w-md font-light tracking-wide mb-3">
                Built in India. Designed for the World.
              </p>
              <p className="text-ivory/60 text-xs leading-relaxed max-w-md font-light">
                Initialize your dedicated client portal environment and partner with our engineering & design team.
              </p>
            </>
          )}
        </motion.div>

        {/* Bottom Architectural Studio Coordinates */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ duration: 1.2, delay: 0.3 }}
          className="relative z-10 flex items-center justify-between text-[9px] uppercase tracking-[0.28em] text-ivory/60 font-medium"
        >
          <span>Crafted in India</span>
          <span className="text-gold">•</span>
          <span>MMXXVI</span>
          <span className="text-gold">•</span>
          <span>Studio Portal</span>
        </motion.div>
      </div>

      {/* RIGHT COLUMN: Clean Ivory Workspace (50% split) */}
      <div className="relative bg-[#FAF7F0] flex items-center justify-center p-6 sm:p-10 lg:p-16 min-h-screen">
        {/* Subtle Studio Grid Overlay */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(6, 41, 30, 0.024) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(6, 41, 30, 0.024) 1px, transparent 1px)
            `,
            backgroundSize: "64px 64px"
          }}
        />

        {/* Form Container Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: [0.19, 1, 0.22, 1], delay: 0.2 }}
          className="relative z-10 w-full max-w-md bg-white/95 border border-forest/[0.1] shadow-premium rounded-3xl p-8 sm:p-11"
        >
          {/* Header & Tabs */}
          <div className="flex items-center justify-between border-b border-forest/[0.08] pb-5 mb-7">
            <div>
              <h2 className="font-heading font-bold text-xl text-forest">
                {activeTab === "login" ? "Welcome Back" : "Join Studio Portal"}
              </h2>
              <p className="text-[11px] text-text-secondary mt-0.5">
                {activeTab === "login" ? "Access your active project portal" : "Initialize a client workspace"}
              </p>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setActiveTab("login")}
                className={`text-xs font-bold uppercase tracking-widest pb-1 transition-colors relative ${
                  activeTab === "login" ? "text-forest" : "text-text-secondary hover:text-forest"
                }`}
                {...hoverProps}
              >
                Sign In
                {activeTab === "login" && (
                  <motion.div layoutId="authTabUnderline" className="absolute bottom-0 left-0 w-full h-0.5 bg-gold" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("signup")}
                className={`text-xs font-bold uppercase tracking-widest pb-1 transition-colors relative ${
                  activeTab === "signup" ? "text-forest" : "text-text-secondary hover:text-forest"
                }`}
                {...hoverProps}
              >
                Sign Up
                {activeTab === "signup" && (
                  <motion.div layoutId="authTabUnderline" className="absolute bottom-0 left-0 w-full h-0.5 bg-gold" />
                )}
              </button>
            </div>
          </div>

          {/* Social SSO Button */}
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={isSubmitting}
            className="w-full bg-[#FAF7F0] border border-forest/[0.14] hover:border-gold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-3 text-xs font-bold text-forest tracking-wider uppercase transition-all mb-6"
            {...hoverProps}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-forest/[0.08]" />
            </div>
            <span className="relative bg-white px-3 text-[10px] uppercase font-bold tracking-widest text-text-secondary">
              Or with email
            </span>
          </div>

          {/* Forms */}
          <AnimatePresence mode="wait">
            {activeTab === "login" ? (
              <motion.form
                key="login-form"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleLoginSubmit(onLogin)}
                className="flex flex-col gap-4"
              >
                {/* Email */}
                <div className="flex flex-col gap-1.5 text-left">
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
                <div className="flex flex-col gap-1.5 text-left">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-text-secondary">
                      Password
                    </label>
                    <button
                      type="button"
                      className="text-[10px] font-semibold text-gold hover:underline"
                      {...hoverProps}
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-gold transition-colors" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••••••"
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

                {/* Remember me */}
                <div className="flex items-center gap-2 mt-1">
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
                transition={{ duration: 0.3 }}
                onSubmit={handleSignupSubmit(onSignup)}
                className="flex flex-col gap-3.5"
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
