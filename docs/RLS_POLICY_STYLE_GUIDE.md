# RLS Policy Style Guide

This guide defines the architectural standards for writing Row Level Security (RLS) policies in the StudioHQ database. By adhering to these principles, we ensure that authorization remains fast, testable, and consistently aligned with the frontend identity contract.

## 1. Zero Direct JWT Parsing
Never parse `request.jwt.claims` directly inside a policy. JWT parsing is brittle and should be isolated.
**❌ Incorrect:**
```sql
USING ( (current_setting('request.jwt.claims')::jsonb -> 'app_metadata' ->> 'organization_id')::uuid = tenant_id )
```
**✅ Correct:**
```sql
USING ( tenant_id = public.current_organization_id() )
```

## 2. Zero Permission Table Joins in Policies
Never join `user_roles` or `role_permissions` directly in an RLS policy. Permission resolution happens at authentication (JWT creation). RLS should only inspect the token.
**❌ Incorrect:**
```sql
USING ( EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role_id = '...') )
```
**✅ Correct:**
```sql
USING ( public.has_permission('workspace:read') )
```

## 3. Two Axes of Authorization
Authorization evaluates Identity Capability (Permission) and Resource Scope (Tenant). Policies should almost always check both.
**✅ Correct:**
```sql
USING (
  public.can_access_tenant(tenant_id)
  AND 
  public.has_permission('workspace:read')
)
```

## 4. Policy Naming Convention
Every policy must follow a strict naming convention: `[module]_[public|admin]_[read|insert|update|delete]`.
**❌ Incorrect:**
```sql
CREATE POLICY "Portfolio Read Policy" ON portfolio_projects ...
```
**✅ Correct:**
```sql
CREATE POLICY "portfolio_public_read" ON portfolio_projects ...
CREATE POLICY "portfolio_admin_read" ON portfolio_projects ...
CREATE POLICY "portfolio_admin_insert" ON portfolio_projects ...
CREATE POLICY "portfolio_admin_update" ON portfolio_projects ...
CREATE POLICY "portfolio_admin_delete" ON portfolio_projects ...
```
Never combine public unauthenticated access and admin authenticated access into a single massive `OR` statement. Separation of intent makes policies easier to audit and test.

## 5. Keep Policies Declarative (No Business Workflows)
RLS is for **Access Control (CRUD)**, not Business Logic. Do not enforce complex workflow validations (e.g. checking if a hero image is uploaded before allowing a status change to `PUBLISHED`) inside `WITH CHECK`. State transitions should be validated by PostgreSQL Triggers or the application layer.

## 6. Helper Function Rules
To keep policies tiny and fast, rely on global helper functions (`current_user_id()`, `current_organization_id()`, `current_roles()`, `has_permission()`, `is_authenticated()`, `is_anonymous()`, `can_access_tenant()`).

When writing helper functions, you must strictly follow these rules:
- **Be STABLE** where possible.
- **Be SECURITY DEFINER** only when required.
- **Have fixed `search_path`** (e.g., `SET search_path = public, pg_temp`).
- **Never mutate data**.
- **Never raise exceptions** during authorization.
- **Return deterministic results**.
- **No Recursive Authorization**: A helper function must never query a table that has RLS enabled which in turn calls the same helper function (infinite recursion).

## 7. Migration Strategy (Zero Downtime)
**Never modify legacy policies in place. Every authorization change must be additive first, destructive later.**
1. Add new policy (`portfolio_admin_read`) alongside legacy (`Admins can manage portfolio`).
2. Run `pgTAP` tests and verify application functionality.
3. Drop legacy policy in a subsequent migration phase.
