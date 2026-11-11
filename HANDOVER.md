# Backend handover

**Status (11 Nov 2026):** the website is live on GitHub Pages, but no backend is connected yet, so the site shows "Almost ready". The frontend was tested against a mocked backend. The real database, logins and AI calls have never run.

There are two ways to make it live. Option A takes about 20 minutes with no code changes. Option B moves everything onto Homesly's AWS and takes roughly 2–4 days of work.

---

## Option A: Supabase (as built)

Follow [SETUP.md](SETUP.md). It needs a Supabase project, a Claude API key and six GitHub secrets/variables, then **Actions → Deploy**. Nothing else changes. You can go live on A now and move to B later: export the `profiles`, `attempts` and `day_notes` tables to AWS when you switch.

## Option B: AWS (RDS Postgres + Cognito + Lambda)

### What the app needs from a backend
| Need | Supabase today | AWS equivalent |
|---|---|---|
| Company-email sign-up, sign-in, password reset | Supabase Auth | **Cognito** user pool (pre-sign-up Lambda trigger enforces `@homeslystays.com`) |
| Tables `profiles`, `attempts`, `day_notes`, `ai_usage`, `app_settings` | Postgres | **RDS Postgres** (the existing Homesly DB, or a new schema in it) |
| Per-user access (own results; managers see all) | Row-level security | Checks in the Lambda using the Cognito `sub` + `profiles.role` |
| AI calls + scoring (Claude API key stays server-side) | Edge Function `coach` | **Lambda** behind **API Gateway**, key in **Secrets Manager** |

### 1. Database
`supabase/migrations/20261111000000_init.sql` runs on RDS Postgres with these edits:
- `profiles.id`: drop `references auth.users`, keep `uuid` and store the Cognito `sub` (or switch to `text`).
- Remove `handle_new_user`, `protect_profile`, `is_manager` and every `create policy` / `enable row level security`. Supabase-specific; the Lambda enforces this now.
- Keep `app_settings` and `bump_ai_usage()`. Plain Postgres.
- Profile creation: a Cognito **post-confirmation** trigger inserts the `profiles` row. The first user becomes `manager`; use the same logic as `handle_new_user`.

### 2. API (Lambda, Node 20+)
Port `supabase/functions/coach/index.ts`. The Claude logic, prompts, schemas and packs don't change.
- `Deno.serve(handler)` → `export const handler = async (event) => …`. `Deno.env.get` → `process.env`.
- Imports: `npm:@anthropic-ai/sdk@1.8.0` → `@anthropic-ai/sdk@1.8.0`. Supabase client → `pg` against RDS.
- Auth: verify the Cognito JWT (API Gateway JWT authorizer). The user id is `claims.sub`.
- Keep the five actions (`bootstrap`, `guest`, `assess`, `drill`, `summary`) and add the read/admin routes the frontend currently does directly with supabase-js:

| Route | Who | Replaces in `web/app.js` |
|---|---|---|
| `GET /attempts?user=<id>` | self, or a manager for anyone | `loadAttempts()` |
| `GET /notes?user=<id>&day=<date>` | self, or a manager | `loadNote()` |
| `GET /team` (profiles + last 14 days of `user_id, score, day, pack`) | managers | `renderTeam()` |
| `PATCH /team/<id>` `{role?, team?}` | managers (not yourself) | `setField()` in `renderTeam()` |

- Env and secrets: `ANTHROPIC_API_KEY` (Secrets Manager), `COACH_MODEL` (optional, default `claude-opus-5-5`), DB connection.
- Timeout: at least **90 s**. Scoring a call can take up to a minute.

### 3. Frontend (`web/app.js`)
- Replace `createClient(...)` and `S.sb.auth.*` (sign-in, sign-up, reset, `updateUser`, `onAuthStateChange`) with Cognito, e.g. `amazon-cognito-identity-js` or Amplify Auth loaded from a CDN.
- Replace `api()` to `fetch(API_URL, { headers: { Authorization: "Bearer " + idToken } })`, and the four direct table reads/writes with the routes above.
- `config.js` becomes `{ apiUrl, cognitoUserPoolId, cognitoClientId, region }`. Update the "Build site" step in `.github/workflows/deploy.yml` to write those from repo variables, and delete the Supabase backend job.

### 4. Checks before go-live
- Sign-up with a non-company email is refused.
- A trainee can't read another trainee's attempts via `GET /attempts?user=…`.
- The guest, assess, drill and summary actions all work; a score appears in the Team tab.
- `ai_usage` increments and the daily limit (300) blocks call 301.

---

## Where things are
| What | Path |
|---|---|
| Training content (calls, drills, rules) | `supabase/functions/_shared/packs/sales.ts`, `support.ts` |
| AI prompts, scoring schemas, actions | `supabase/functions/coach/index.ts` |
| Database schema | `supabase/migrations/20261111000000_init.sql` |
| Website | `web/` (no build step) |
| Deploy | `.github/workflows/deploy.yml` |
