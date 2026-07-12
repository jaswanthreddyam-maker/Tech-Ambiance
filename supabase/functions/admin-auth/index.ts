// @ts-nocheck
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// ---------------------------------------------------------------------------
// CORS — Environment-driven origin allowlist + Vercel preview pattern
// ---------------------------------------------------------------------------
// Configuration (set via `supabase secrets set`):
//   ALLOWED_ORIGINS         — Comma-separated exact origins
//                             e.g. "http://localhost:5173,https://techambiance.in,https://www.techambiance.in"
//   VERCEL_PROJECT_PREFIX   — Project slug used in Vercel preview URLs
//                             e.g. "tech-ambiance" matches https://tech-ambiance-*.vercel.app
// ---------------------------------------------------------------------------

const DEFAULT_ORIGINS = "http://localhost:5173,http://127.0.0.1:5173";

const isAllowedOrigin = (origin: string | null): string | null => {
  if (!origin) return null;

  // 1. Check exact matches from the allowlist
  const allowedOrigins = (Deno.env.get("ALLOWED_ORIGINS") || DEFAULT_ORIGINS)
    .split(",")
    .map((o: string) => o.trim())
    .filter(Boolean);

  if (allowedOrigins.includes(origin)) return origin;

  // 2. Check Vercel preview pattern: https://<prefix>-*.vercel.app
  const vercelPrefix = Deno.env.get("VERCEL_PROJECT_PREFIX");
  if (vercelPrefix) {
    try {
      const url = new URL(origin);
      if (
        url.protocol === "https:" &&
        url.hostname.endsWith(".vercel.app") &&
        url.hostname.startsWith(vercelPrefix + "-")
      ) {
        return origin;
      }
    } catch {
      // Invalid URL — reject
    }
  }

  return null;
};

const getCorsHeaders = (req: Request) => {
  const origin = req.headers.get("Origin");
  const allowedOrigin = isAllowedOrigin(origin) || "";

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Credentials": "true",
  };
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req) });
  }

  try {
    const url = new URL(req.url);
    const segments = url.pathname.split('/').filter(Boolean);
    let lastSegment = segments[segments.length - 1];
    let action = lastSegment !== 'admin-auth' ? lastSegment : '';
    if (!action) action = url.searchParams.get('action') || '';

    let bodyData: any = {};
    if (req.method === 'POST') {
      try { bodyData = await req.json(); } catch (_) {}
    }
    if (!action && bodyData.action) action = bodyData.action;

    let supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    // Fix for local docker loopback hang:
    if (supabaseUrl.includes('127.0.0.1') || supabaseUrl.includes('localhost')) {
      supabaseUrl = 'http://host.docker.internal:54321';
    }
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    
    // Inherit identity
    const authHeader = req.headers.get('Authorization');
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader || '' } }
    });

    const getCookie = (name: string) => {
      const value = `; ${req.headers.get('cookie')}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return null;
    };

    if (action === 'create-pin') {
      const pin = bodyData.pin;
      const { error } = await supabase.rpc('rpc_create_admin_pin', { p_pin: pin });
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' }
      });
    }

    if (action === 'verify') {
      const { pin, metadata } = bodyData;
      
      const { data: isValid, error: verifyError } = await supabase.rpc('rpc_verify_admin_pin', { p_pin: pin });
      if (verifyError) throw verifyError;
      
      if (!isValid) {
        return new Response(JSON.stringify({ success: false, error: 'Invalid PIN or locked.' }), {
          status: 401,
          headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' }
        });
      }

      const { data: sessionId, error: sessionError } = await supabase.rpc('rpc_create_executive_session', { p_metadata: metadata || {} });
      if (sessionError) throw sessionError;

      const headers = new Headers(getCorsHeaders(req) as Record<string, string>);
      headers.set('Content-Type', 'application/json');
      headers.append('Set-Cookie', `admin_session_id=${sessionId}; HttpOnly; Secure; Path=/; Max-Age=28800; SameSite=Lax`);

      return new Response(JSON.stringify({ success: true }), { headers });
    }

    if (action === 'validate' || action === 'refresh') {
      const sessionId = getCookie('admin_session_id');
      if (!sessionId) {
        return new Response(JSON.stringify({ success: false, error: 'No session cookie.' }), {
          status: 401,
          headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' }
        });
      }

      const rpcName = action === 'validate' ? 'rpc_validate_executive_session' : 'rpc_refresh_executive_session';
      const { data: isValid, error } = await supabase.rpc(rpcName, { p_session_id: sessionId });
      if (error) throw error;

      if (!isValid) {
        return new Response(JSON.stringify({ success: false, error: 'Session invalid.' }), {
          status: 401,
          headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' }
        });
      }

      const headers = new Headers(getCorsHeaders(req) as Record<string, string>);
      headers.set('Content-Type', 'application/json');
      if (action === 'refresh') {
         headers.append('Set-Cookie', `admin_session_id=${sessionId}; HttpOnly; Secure; Path=/; Max-Age=28800; SameSite=Lax`);
      }

      return new Response(JSON.stringify({ success: true }), { headers });
    }

    if (action === 'logout') {
      const sessionId = getCookie('admin_session_id');
      if (sessionId) {
         await supabase.rpc('rpc_revoke_executive_session', { p_session_id: sessionId, p_reason: 'User logout' });
      }
      
      const headers = new Headers(getCorsHeaders(req) as Record<string, string>);
      headers.set('Content-Type', 'application/json');
      headers.append('Set-Cookie', `admin_session_id=; HttpOnly; Secure; Path=/; Max-Age=0; SameSite=Lax`);
      return new Response(JSON.stringify({ success: true }), { headers });
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), {
      status: 400,
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Admin Auth Error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' }
    });
  }
});
