-- Support anonymous / guest sign-in
-- Anonymous auth.users rows have no email; public.users.email was NOT NULL.

ALTER TABLE public.users ALTER COLUMN email DROP NOT NULL;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_email text;
  user_name text;
BEGIN
  user_email := COALESCE(
    NULLIF(trim(new.email), ''),
    'guest-' || replace(new.id::text, '-', '') || '@dmpilot.local'
  );

  user_name := COALESCE(
    NULLIF(trim(new.raw_user_meta_data->>'full_name'), ''),
    CASE WHEN COALESCE(new.is_anonymous, false) THEN 'Guest' ELSE NULL END
  );

  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    new.id,
    user_email,
    user_name,
    new.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
