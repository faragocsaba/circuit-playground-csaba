CREATE TABLE public.ai_access_state (feature text PRIMARY KEY, message text NOT NULL, status integer NOT NULL DEFAULT 403, updated_at timestamptz NOT NULL DEFAULT now());
GRANT ALL ON public.ai_access_state TO service_role;
ALTER TABLE public.ai_access_state ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.ai_access_state IS 'Server-only AI access circuit breaker; contains no learner conversations. Clear a provider denial only after access is restored.';