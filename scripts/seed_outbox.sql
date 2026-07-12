-- Seed Domain Events Outbox to simulate historical agency activity

INSERT INTO domain_events_outbox (aggregate_type, aggregate_id, event_type, payload)
VALUES 
-- Finance Events
('Invoice', gen_random_uuid(), 'InvoicePaid', '{"amount": 12500, "description": "Phase 1 Payment - Website Redesign"}'::jsonb),
('Invoice', gen_random_uuid(), 'InvoicePaid', '{"amount": 8000, "description": "Retainer - SEO Services"}'::jsonb),
('Invoice', gen_random_uuid(), 'InvoicePaid', '{"amount": 28000, "description": "Enterprise Platform Setup"}'::jsonb),
('Invoice', gen_random_uuid(), 'InvoiceOverdue', '{"amount": 4500, "description": "Consulting Retainer - Late"}'::jsonb),

-- CRM Events
('Deal', gen_random_uuid(), 'DealWon', '{"pipeline_value_added": 45000, "client_name": "Cafe Vistaara Flagship"}'::jsonb),
('Deal', gen_random_uuid(), 'DealWon', '{"pipeline_value_added": 12000, "client_name": "CoffyMine"}'::jsonb),
('Deal', gen_random_uuid(), 'DealLost', '{"pipeline_value_lost": 8000, "client_name": "BrewBakes"}'::jsonb),
('Deal', gen_random_uuid(), 'DiscoveryCallScheduled', '{"client_name": "TechNova Corp"}'::jsonb),
('Deal', gen_random_uuid(), 'DiscoveryCallScheduled', '{"client_name": "Global Reach Inc"}'::jsonb),

-- Delivery Events
('Project', gen_random_uuid(), 'ProjectCreated', '{"project_name": "Cafe Vistaara - Main Website", "organization_name": "Cafe Vistaara", "workspace_name": "Flagship"}'),
('Project', gen_random_uuid(), 'ProjectCreated', '{"project_name": "CoffyMine App", "organization_name": "CoffyMine", "workspace_name": "Mobile Dev"}'),
('Project', gen_random_uuid(), 'ProjectCreated', '{"project_name": "BrewBakes SEO", "organization_name": "BrewBakes", "workspace_name": "Marketing"}'),
('Project', gen_random_uuid(), 'ProjectAtRisk', '{"project_name": "BrewBakes SEO", "reason": "Client unresponsive"}'),
('Milestone', gen_random_uuid(), 'MilestoneCompleted', '{"project_name": "Cafe Vistaara - Main Website", "days_to_complete": 14}'),
('Milestone', gen_random_uuid(), 'MilestoneCompleted', '{"project_name": "CoffyMine App", "days_to_complete": 21}'),

-- ScoutAI / Telemetry Events
('Diagnostic', gen_random_uuid(), 'ScoutAIDiagnosticCompleted', '{"target": "Cafe Vistaara Flagship", "score": 88, "actor_name": "ScoutAI Autonomous"}'),

-- Studio Activity (General)
('Deployment', gen_random_uuid(), 'WebsitePublishedToEdge', '{"project_name": "Lumina Bespoke Portfolio v3", "actor_name": "System"}');
