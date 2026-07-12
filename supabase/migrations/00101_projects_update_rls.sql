-- Allow workspace members to UPDATE their projects
-- Required for updating lifecycle_stage from the frontend
CREATE POLICY "Clients can UPDATE projects in their workspaces" ON public.projects
  FOR UPDATE USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
    )
  );
