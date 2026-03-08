
-- Store last 5 conversation exchanges per user
CREATE TABLE public.conversation_memory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  question TEXT NOT NULL,
  summary TEXT NOT NULL,
  mode TEXT NOT NULL DEFAULT 'general',
  entity_type TEXT,
  entity_id TEXT,
  entity_label TEXT,
  confidence_level TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.conversation_memory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own conversation memory"
  ON public.conversation_memory FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversation memory"
  ON public.conversation_memory FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversation memory"
  ON public.conversation_memory FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_conversation_memory_user_created
  ON public.conversation_memory (user_id, created_at DESC);

-- Add explanation_depth preference to session_context
ALTER TABLE public.session_context
  ADD COLUMN explanation_depth TEXT NOT NULL DEFAULT 'standard';

-- Add last_entity columns to session_context for persistent entity context
ALTER TABLE public.session_context
  ADD COLUMN last_entity_type TEXT,
  ADD COLUMN last_entity_id TEXT,
  ADD COLUMN last_entity_label TEXT;
