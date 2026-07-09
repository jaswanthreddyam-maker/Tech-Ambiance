import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Lock, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { useAuth } from "../../auth/useAuth";
import { useToast } from "../../providers/ToastProvider";
import { Logo } from "../../components/atoms/Logo";
import { MarbleVeins } from "../../components/ui/MarbleVeins";

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { updatePassword } = useAuth();
  const { toast } = useToast();

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    setIsSubmitting(true);
    try {
      await updatePassword(data.password);
      toast("Your security credentials have been updated. Please sign in.", "success");
      navigate("/auth?mode=login");
    } catch (err: any) {
      toast(err?.message || "Could not update password. Token may have expired.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#FAF7F0] text-text-primary flex flex-col justify-between relative overflow-hidden select-none">
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <MarbleVeins />
      </div>

      {/* Header */}
      <header className="w-full px-8 py-6 flex items-center justify-between relative z-10">
        <div onClick={() => navigate("/landing")} className="cursor-pointer">
          <Logo size="md" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-forest/15 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-6">
            <h1 className="font-heading font-bold text-2xl text-forest uppercase tracking-wider">
              Set New Password
            </h1>
            <p className="text-xs text-text-secondary mt-1">
              Enter your updated enterprise security passphrase below.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-[10px] font-heading font-bold uppercase tracking-[0.2em] text-forest/80 mb-1.5">
                New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-forest/40 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  {...register("password")}
                  className="w-full bg-[#FAF7F0]/80 border border-forest/20 rounded-xl pl-10 pr-10 py-2.5 text-xs text-forest placeholder-forest/30 focus:outline-none focus:border-gold transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-forest/40 hover:text-forest"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[10px] text-red-600 mt-1 font-medium">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-heading font-bold uppercase tracking-[0.2em] text-forest/80 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-forest/40 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  {...register("confirmPassword")}
                  className="w-full bg-[#FAF7F0]/80 border border-forest/20 rounded-xl pl-10 pr-10 py-2.5 text-xs text-forest placeholder-forest/30 focus:outline-none focus:border-gold transition-colors"
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-[10px] text-red-600 mt-1 font-medium">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-full bg-forest text-gold font-heading font-bold uppercase tracking-[0.2em] text-xs shadow-lg hover:shadow-xl disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-4"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-gold" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <span>Save Password</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      <footer className="w-full py-4 text-center text-[10px] text-forest/50 uppercase tracking-[0.24em] relative z-10">
        Tech Ambiance Studio • Enterprise Security
      </footer>
    </div>
  );
};
