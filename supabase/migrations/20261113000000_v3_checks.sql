-- Hard checks on each scored call: auto-fails, the scenario's hidden test, the trainee's
-- wrap-up (outcome + notes), system actions used and turn metrics. Written only by the backend.
alter table public.attempts add column if not exists checks jsonb;
