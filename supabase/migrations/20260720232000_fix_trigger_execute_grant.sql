-- Supabase grants EXECUTE on every new public-schema function directly to
-- anon and authenticated by default (not inherited via PUBLIC), which is
-- why the prior migration's `REVOKE ... FROM PUBLIC` didn't actually clear
-- it. sync_partner_walk_on_insert is trigger-only (RETURNS TRIGGER, fired
-- from the trigger on `walks`) -- revoking direct EXECUTE from these two
-- roles doesn't affect the trigger, which doesn't need it to fire.
REVOKE EXECUTE ON FUNCTION sync_partner_walk_on_insert() FROM anon, authenticated;
