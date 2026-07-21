// Polyfill Deno for Node CLI scripts that import Edge Function code
declare var Deno: any;

if (typeof globalThis.Deno === 'undefined') {
  (globalThis as any).Deno = {
    env: {
      get: (key: string) => {
        // Fallback to import.meta.env (vite) or process.env (node)
        const metaEnv = typeof process !== 'undefined' ? process.env : (import.meta as any).env;
        if (key === 'SUPABASE_URL') return metaEnv?.VITE_SUPABASE_URL;
        if (key === 'SUPABASE_SERVICE_ROLE_KEY') return metaEnv?.VITE_SUPABASE_ANON_KEY;
        return metaEnv?.[key];
      }
    }
  };
}
