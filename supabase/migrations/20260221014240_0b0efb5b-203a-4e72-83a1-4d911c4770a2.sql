
-- Add preferences to existing profiles table (covers user_profiles requirement)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS preferences_json jsonb NOT NULL DEFAULT '{}'::jsonb;

-- Owner-specific profile data
CREATE TABLE public.owner_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  verification_status text NOT NULL DEFAULT 'unverified',
  trust_level text NOT NULL DEFAULT 'new',
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.owner_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own owner profile"
  ON public.owner_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own owner profile"
  ON public.owner_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own owner profile"
  ON public.owner_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Watched entities (minerals, wells, leases, counties the user is tracking)
CREATE TABLE public.watched_entities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  entity_id text NOT NULL,
  entity_type text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, entity_id, entity_type)
);

ALTER TABLE public.watched_entities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own watched entities"
  ON public.watched_entities FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own watched entities"
  ON public.watched_entities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own watched entities"
  ON public.watched_entities FOR DELETE
  USING (auth.uid() = user_id);

-- Session context (tracks what the user is currently looking at)
CREATE TABLE public.session_context (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  active_entity_id text,
  active_entity_type text,
  active_view text NOT NULL DEFAULT 'intelligence',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.session_context ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own session context"
  ON public.session_context FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own session context"
  ON public.session_context FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own session context"
  ON public.session_context FOR UPDATE
  USING (auth.uid() = user_id);

-- Auto-create owner_profile and session_context on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'owner');

  INSERT INTO public.owner_profiles (user_id)
  VALUES (NEW.id);

  INSERT INTO public.session_context (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$;

-- Trigger for updated_at on owner_profiles
CREATE TRIGGER update_owner_profiles_updated_at
  BEFORE UPDATE ON public.owner_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for updated_at on session_context
CREATE TRIGGER update_session_context_updated_at
  BEFORE UPDATE ON public.session_context
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
