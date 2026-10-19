-- VIZCAM Supabase schema. Apply only to an authorized Supabase project.
BEGIN;
CREATE SCHEMA IF NOT EXISTS private;
CREATE TABLE IF NOT EXISTS private.vizcam_admin_members (
 user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
 disabled boolean NOT NULL DEFAULT false
);
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA private TO authenticated;
REVOKE ALL ON private.vizcam_admin_members FROM PUBLIC, anon, authenticated;
CREATE OR REPLACE FUNCTION private.is_vizcam_admin() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
 SELECT EXISTS (SELECT 1 FROM private.vizcam_admin_members m
 WHERE m.user_id=(SELECT auth.uid()) AND NOT m.disabled);
$$;
REVOKE ALL ON FUNCTION private.is_vizcam_admin() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION private.is_vizcam_admin() TO authenticated;
CREATE TABLE IF NOT EXISTS private.vizcam_daily_sequences (
 quote_day date PRIMARY KEY,
 last_number bigint NOT NULL CHECK(last_number>0)
);
REVOKE ALL ON private.vizcam_daily_sequences FROM PUBLIC,anon,authenticated;
CREATE TABLE IF NOT EXISTS public.vizcam_quotations (
 id text PRIMARY KEY CHECK(id ~ '^VC-Q-[0-9]{6}-[0-9]{4,}$'),
 customer text NOT NULL CHECK(length(btrim(customer)) between 1 and 150),
 quote_date date NOT NULL,
 total numeric(14,2) NOT NULL DEFAULT 0 CHECK(total>=0),
 status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','completed','rejected')),
 details jsonb NOT NULL DEFAULT '{}'::jsonb CHECK(jsonb_typeof(details)='object'),
 paid_at timestamptz,
 rejected_at timestamptz,
 created_by uuid REFERENCES auth.users(id),
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 CONSTRAINT vizcam_status_dates CHECK(
  (status='completed' AND rejected_at IS NULL) OR
  (status='rejected' AND paid_at IS NULL) OR
  (status='pending' AND paid_at IS NULL AND rejected_at IS NULL)
 )
);
CREATE INDEX IF NOT EXISTS vizcam_quotations_status_date
 ON public.vizcam_quotations(status,quote_date DESC);
ALTER TABLE public.vizcam_quotations ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.vizcam_quotations FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT,UPDATE ON public.vizcam_quotations TO authenticated;
DROP POLICY IF EXISTS vizcam_admin_select ON public.vizcam_quotations;
DROP POLICY IF EXISTS vizcam_admin_insert ON public.vizcam_quotations;
DROP POLICY IF EXISTS vizcam_admin_update ON public.vizcam_quotations;
CREATE POLICY vizcam_admin_select ON public.vizcam_quotations
 FOR SELECT TO authenticated USING ((SELECT private.is_vizcam_admin()));
CREATE POLICY vizcam_admin_insert ON public.vizcam_quotations
 FOR INSERT TO authenticated WITH CHECK ((SELECT private.is_vizcam_admin()));
CREATE POLICY vizcam_admin_update ON public.vizcam_quotations
 FOR UPDATE TO authenticated USING ((SELECT private.is_vizcam_admin()))
 WITH CHECK ((SELECT private.is_vizcam_admin()));
-- The elevated allocator lives in a non-exposed schema.
CREATE OR REPLACE FUNCTION private.allocate_vizcam_quote_number(p_quote_day date)
RETURNS text LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = '' AS $$
DECLARE n bigint;
BEGIN
 IF (SELECT auth.uid()) IS NULL OR NOT private.is_vizcam_admin() THEN
  RAISE EXCEPTION 'Administrator access required' USING errcode='42501';
 END IF;
 IF p_quote_day IS NULL THEN RAISE EXCEPTION 'Quotation date required'; END IF;
 INSERT INTO private.vizcam_daily_sequences(quote_day,last_number)
 VALUES (p_quote_day,1)
 ON CONFLICT(quote_day) DO UPDATE SET last_number=private.vizcam_daily_sequences.last_number+1
 RETURNING last_number INTO n;
 RETURN 'VC-Q-'||pg_catalog.to_char(p_quote_day,'DDMMYY')||'-'||
 CASE WHEN n<10000 THEN pg_catalog.lpad(n::text,4,'0') ELSE n::text END;
END;
$$;
REVOKE ALL ON FUNCTION private.allocate_vizcam_quote_number(date) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION private.allocate_vizcam_quote_number(date) TO authenticated;
CREATE OR REPLACE FUNCTION public.next_vizcam_quote_number(p_quote_day date)
 RETURNS text LANGUAGE sql VOLATILE SECURITY INVOKER SET search_path = '' AS $$
 SELECT private.allocate_vizcam_quote_number(p_quote_day);
$$;
REVOKE ALL ON FUNCTION public.next_vizcam_quote_number(date) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.next_vizcam_quote_number(date) TO authenticated;
COMMIT;
-- After creating verified admin in Supabase Auth, insert actual user UUID:
-- INSERT INTO private.vizcam_admin_members(user_id)
-- VALUES ('USER_UUID_FROM_AUTH'::uuid) ON CONFLICT(user_id) DO UPDATE SET disabled=false;
