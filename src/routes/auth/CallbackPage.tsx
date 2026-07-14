import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase, isSupabaseConfigured } from "../../lib/supabase";

export const CallbackPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    async function handleAuthCallback() {
      if (!isSupabaseConfigured) {
        if (active) navigate("/auth?error=supabase_not_configured", { replace: true });
        return;
      }

      try {
        const searchParams = new URLSearchParams(window.location.search);
        const code = searchParams.get("code");

        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            console.error("[Callback] Error exchanging OAuth code:", exchangeError);
            if (active) navigate("/auth?error=oauth_exchange_failed", { replace: true });
            return;
          }
        }

        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("[Callback] Error reading session:", error);
          if (active) navigate("/auth?error=callback_failed", { replace: true });
          return;
        }

        if (session && active) {
          const params = new URLSearchParams(window.location.search);
          if (params.get("redirect") === "consultation") {
            navigate("/experience?openConsultation=true", { replace: true });
          } else {
            navigate("/portal", { replace: true });
          }
        } else if (active) {
          navigate("/auth", { replace: true });
        }
      } catch (err) {
        console.error("[Callback] Unexpected error:", err);
        if (active) navigate("/auth", { replace: true });
      }
    }

    handleAuthCallback();

    return () => {
      active = false;
    };
  }, [navigate]);

  return (
    <div className="min-h-screen w-full bg-[#FAF7F0] flex flex-col items-center justify-center select-none">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border border-forest/20 bg-forest/5 flex items-center justify-center">
          <Loader2 className="w-5 h-5 text-forest animate-spin" />
        </div>
        <div className="text-center">
          <h3 className="font-heading font-bold text-sm uppercase tracking-[0.24em] text-forest">
            Finalizing Google Authentication...
          </h3>
          <p className="text-[10px] uppercase tracking-[0.18em] text-forest/60 mt-1 font-medium">
            Entering Curated Studio Workspace
          </p>
        </div>
      </div>
    </div>
  );
};
