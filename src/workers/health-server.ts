/// <reference types="node" />
import * as http from 'http';
import { supabase } from '../lib/supabase';
import { RuntimeMetrics } from './portal-projections/ProjectionMetrics';

/**
 * Lightweight Health Server for the Worker Daemon
 * Exposes /api/v1/portal/health without requiring Express.
 */
const PORT = process.env.PORT || 3001;

const server = http.createServer(async (req: any, res: any) => {
  if (req.method === 'GET' && req.url === '/api/v1/portal/health') {
    try {
      const { data: state, error } = await supabase
        .from('portal_projection_state')
        .select('*')
        .eq('projection_name', 'master')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      // Feature flag check (ideally read from env or config)
      const useProjectionRepository = true; // Hardcoded for this endpoint simulation

      const payload = {
        status: "healthy",
        projection_version: state?.projection_version || "1.0",
        last_processed_event: state?.last_processed_event || null,
        last_processed_at: state?.last_processed_at || null,
        lag_seconds: RuntimeMetrics.portal_projection_lag_seconds,
        pending_events: 0, // Would query outbox count where created_at > last_processed_at
        rebuild_running: state?.is_rebuild_running || false,
        rebuild_required: false,
        failed_handlers: RuntimeMetrics.portal_projection_failures_total > 0 ? ['unknown'] : [],
        repositories: {
          active: useProjectionRepository ? "projection" : "raw"
        }
      };

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(payload));
    } catch (err: any) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'unhealthy', error: err.message }));
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`Worker Health Server running at http://localhost:${PORT}`);
});
