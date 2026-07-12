-- 0013_ceo_dashboard_projections.sql

-- 1. Finance Projection
CREATE TABLE IF NOT EXISTS finance_dashboard_projection (
    id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    monthly_revenue NUMERIC(12,2) DEFAULT 0,
    mrr NUMERIC(12,2) DEFAULT 0,
    arr NUMERIC(12,2) DEFAULT 0,
    outstanding_invoices NUMERIC(12,2) DEFAULT 0,
    growth_percentage NUMERIC(5,2) DEFAULT 0,
    cash_collected_this_month NUMERIC(12,2) DEFAULT 0,
    average_invoice_value NUMERIC(12,2) DEFAULT 0,
    overdue_invoice_count INT DEFAULT 0,
    projection_version INT DEFAULT 1,
    last_processed_event_id UUID,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Delivery Projection
CREATE TABLE IF NOT EXISTS delivery_dashboard_projection (
    id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    active_organizations INT DEFAULT 0,
    active_workspaces INT DEFAULT 0,
    projects_at_risk INT DEFAULT 0,
    average_milestone_completion_days INT DEFAULT 0,
    projection_version INT DEFAULT 1,
    last_processed_event_id UUID,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CRM Projection
CREATE TABLE IF NOT EXISTS crm_dashboard_projection (
    id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    pipeline_value NUMERIC(12,2) DEFAULT 0,
    open_deals INT DEFAULT 0,
    conversion_rate NUMERIC(5,2) DEFAULT 0,
    discovery_calls INT DEFAULT 0,
    deals_won INT DEFAULT 0,
    deals_lost INT DEFAULT 0,
    projection_version INT DEFAULT 1,
    last_processed_event_id UUID,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Top Projects Projection
CREATE TABLE IF NOT EXISTS top_projects_projection (
    project_id UUID PRIMARY KEY,
    project_name TEXT NOT NULL,
    organization_name TEXT NOT NULL,
    workspace_name TEXT NOT NULL,
    health_status TEXT NOT NULL, -- 'HEALTHY', 'WARNING', 'DEGRADED', 'FAILED', 'MAINTENANCE'
    lifecycle_stage TEXT NOT NULL,
    progress_percentage INT DEFAULT 0,
    owner_name TEXT,
    last_activity_at TIMESTAMPTZ,
    projection_version INT DEFAULT 1,
    last_processed_event_id UUID,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Studio Activity Projection
CREATE TABLE IF NOT EXISTS studio_activity_projection (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    description TEXT,
    tag TEXT,
    actor_name TEXT,
    organization_name TEXT,
    project_name TEXT,
    severity TEXT, -- 'INFO', 'WARNING', 'ERROR'
    source_context TEXT,
    event_timestamp TIMESTAMPTZ DEFAULT NOW(),
    projection_version INT DEFAULT 1,
    last_processed_event_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Operations Health Projection
CREATE TABLE IF NOT EXISTS operations_health_projection (
    context_name TEXT PRIMARY KEY,
    status TEXT NOT NULL, -- 'HEALTHY', 'WARNING', 'DEGRADED', 'FAILED', 'MAINTENANCE'
    last_event_at TIMESTAMPTZ,
    outbox_lag INT DEFAULT 0,
    queue_size INT DEFAULT 0,
    projection_version INT DEFAULT 1,
    last_processed_event_id UUID,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add Realtime to all tables so the Dashboard can subscribe
ALTER PUBLICATION supabase_realtime ADD TABLE finance_dashboard_projection;
ALTER PUBLICATION supabase_realtime ADD TABLE delivery_dashboard_projection;
ALTER PUBLICATION supabase_realtime ADD TABLE crm_dashboard_projection;
ALTER PUBLICATION supabase_realtime ADD TABLE top_projects_projection;
ALTER PUBLICATION supabase_realtime ADD TABLE studio_activity_projection;
ALTER PUBLICATION supabase_realtime ADD TABLE operations_health_projection;

-- Create Recovery/Rebuild RPC
CREATE OR REPLACE FUNCTION rebuild_dashboard_projections()
RETURNS void AS $$
BEGIN
    -- This is a recovery mechanism.
    -- It deletes all projections and resets the outbox so the projection_runner processes them again.
    
    DELETE FROM finance_dashboard_projection;
    DELETE FROM delivery_dashboard_projection;
    DELETE FROM crm_dashboard_projection;
    DELETE FROM top_projects_projection;
    DELETE FROM studio_activity_projection;
    DELETE FROM operations_health_projection;

    -- Reset domain_events_outbox
    UPDATE domain_events_outbox 
    SET status = 'PENDING', processed_at = NULL, last_error = NULL, attempts = 0;

    -- Re-insert default rows for single-row projections
    INSERT INTO finance_dashboard_projection (id) VALUES (1);
    INSERT INTO delivery_dashboard_projection (id) VALUES (1);
    INSERT INTO crm_dashboard_projection (id) VALUES (1);
    
    INSERT INTO operations_health_projection (context_name, status) VALUES 
      ('CRM', 'HEALTHY'),
      ('Delivery', 'HEALTHY'),
      ('Finance', 'HEALTHY'),
      ('Communication', 'HEALTHY');
      
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Initialize tables immediately so they aren't empty on first load before the runner executes
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM finance_dashboard_projection) THEN
    INSERT INTO finance_dashboard_projection (id) VALUES (1);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM delivery_dashboard_projection) THEN
    INSERT INTO delivery_dashboard_projection (id) VALUES (1);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM crm_dashboard_projection) THEN
    INSERT INTO crm_dashboard_projection (id) VALUES (1);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM operations_health_projection) THEN
    INSERT INTO operations_health_projection (context_name, status) VALUES 
      ('CRM', 'HEALTHY'),
      ('Delivery', 'HEALTHY'),
      ('Finance', 'HEALTHY'),
      ('Communication', 'HEALTHY');
  END IF;
END $$;
