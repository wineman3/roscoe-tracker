-- Mechanical hardening only -- no behavior change for any existing caller.
-- Does not touch where business logic lives (see project notes); that's a
-- separate decision from closing these specific gaps.

-- combined_miles currently runs with its creator's privileges rather than
-- the querying user's, which would bypass RLS on `walks` if that table were
-- ever locked down to a subset of rows. In practice this changes nothing
-- today: `walks` already grants SELECT USING (true) to both anon and
-- authenticated, so every querying role already sees every row. This just
-- removes the latent bypass so a future RLS tightening on `walks` doesn't
-- silently fail to apply to this view.
ALTER VIEW combined_miles SET (security_invoker = true);

-- An unset search_path lets a function resolve unqualified table/function
-- names against whatever schema happens to be first on the caller's search
-- path, which is the classic function-search-path-hijack vector for
-- SECURITY DEFINER functions especially. All three already only ever
-- reference public-schema objects, so pinning it changes nothing they do.
ALTER FUNCTION refresh_user_stats() SET search_path = public;
ALTER FUNCTION check_and_award_badges(uuid) SET search_path = public;
ALTER FUNCTION miles_between(double precision, double precision, double precision, double precision) SET search_path = public;

-- sync_partner_walk_on_insert is SECURITY DEFINER and trigger-only (RETURNS
-- TRIGGER, fired from the trigger on `walks`) -- there's no legitimate
-- direct caller. Postgres grants EXECUTE to PUBLIC by default on new
-- functions, which is what exposed it at /rest/v1/rpc/sync_partner_walk_on_insert.
-- Revoking direct EXECUTE doesn't affect the trigger itself; trigger firing
-- doesn't require the invoking role to hold EXECUTE on the trigger function.
REVOKE EXECUTE ON FUNCTION sync_partner_walk_on_insert() FROM PUBLIC;
