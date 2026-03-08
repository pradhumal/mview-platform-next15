
-- Intelligence response logs
CREATE TABLE public.intelligence_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('general', 'personalized')),
  question TEXT NOT NULL,
  objects_used JSONB NOT NULL DEFAULT '[]'::jsonb,
  output TEXT NOT NULL,
  confidence_level TEXT,
  missing_objects JSONB DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.intelligence_logs ENABLE ROW LEVEL SECURITY;

-- Users can only view their own logs
CREATE POLICY "Users can view their own intelligence logs"
  ON public.intelligence_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own logs
CREATE POLICY "Users can insert their own intelligence logs"
  ON public.intelligence_logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Index for fast user lookups
CREATE INDEX idx_intelligence_logs_user ON public.intelligence_logs (user_id, created_at DESC);
