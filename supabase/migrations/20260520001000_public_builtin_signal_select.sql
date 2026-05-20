-- Built-in signals are product catalog data, not user-owned workspace data.
-- Allow anonymous Supabase clients to read only built-in/public signal rows so
-- browser-rendered pages can show the catalog even before user-owned campaign
-- data is fetched through authenticated routes.

drop policy if exists "signals_public_select" on signals;

create policy "signals_public_select"
  on signals
  for select
  to anon
  using (is_builtin = true or is_public = true);
