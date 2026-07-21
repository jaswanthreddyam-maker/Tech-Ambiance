// Polyfill Deno for Node CLI scripts that import Edge Function code
declare var Deno: any;

if (typeof globalThis.Deno === 'undefined') {
  (globalThis as any).Deno = {
    env: {
      get: (key: string) => {
        // Fallback to process.env (like VITE_SUPABASE_URL) for local Node scripts
        if (key === 'SUPABASE_URL') return process.env.VITE_SUPABASE_URL;
        if (key === 'SUPABASE_SERVICE_ROLE_KEY') return process.env.VITE_SUPABASE_ANON_KEY;
        return process.env[key];
      }
    }
  };
}
