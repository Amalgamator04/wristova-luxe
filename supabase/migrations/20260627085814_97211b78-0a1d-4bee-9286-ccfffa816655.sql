
-- Fix set_updated_at search_path
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- Restrict SECURITY DEFINER fn execution
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, app_role) TO authenticated;

-- Tighten permissive policies (newsletter + contact). Replace "true" with explicit, intentional checks.
DROP POLICY "Newsletter: public insert" ON public.newsletter_subscribers;
CREATE POLICY "Newsletter: public insert" ON public.newsletter_subscribers
  FOR INSERT TO anon, authenticated WITH CHECK (email IS NOT NULL AND length(email) BETWEEN 3 AND 320);

DROP POLICY "Contact: public insert" ON public.contact_messages;
CREATE POLICY "Contact: public insert" ON public.contact_messages
  FOR INSERT TO anon, authenticated WITH CHECK (
    name IS NOT NULL AND length(name) BETWEEN 1 AND 120
    AND email IS NOT NULL AND length(email) BETWEEN 3 AND 320
    AND body IS NOT NULL AND length(body) BETWEEN 1 AND 4000
  );
