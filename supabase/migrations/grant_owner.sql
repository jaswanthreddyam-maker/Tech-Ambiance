-- Run this in your Supabase SQL Editor to grant yourself full global Owner access
INSERT INTO public.roles (user_id, role)
SELECT id, 'OWNER'
FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM public.roles WHERE user_id = auth.users.id AND role = 'OWNER'
);
