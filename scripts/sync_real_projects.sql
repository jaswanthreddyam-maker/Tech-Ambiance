-- Clear all mock data
SELECT rebuild_dashboard_projections();
DELETE FROM domain_events_outbox;

-- Generate real ProjectCreated events for existing projects
INSERT INTO domain_events_outbox (aggregate_type, aggregate_id, event_type, payload)
SELECT 
    'Project',
    p.id,
    'ProjectCreated',
    json_build_object(
        'project_name', p.name,
        'workspace_name', w.name,
        'organization_name', o.name
    )::jsonb
FROM projects p
JOIN workspaces w ON p.workspace_id = w.id
JOIN organizations o ON w.organization_id = o.id;
