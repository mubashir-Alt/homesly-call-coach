# Homesly Call Coach: handover to Vamshi

**Status (11 Nov 2026): live and working.** Staff sign up, do AI practice calls and drills, and get scored. Managers see everyone in the Team tab. Built on Supabase (free plan) + GitHub Pages. This document covers what exists, how to run it, what to watch, and how to move it to AWS later.

---

## 1. At a glance

| What | Where |
|---|---|
| Live app | https://mubashir-alt.github.io/homesly-call-coach/ |
| Code | https://github.com/mubashir-Alt/homesly-call-coach (public; no keys or guest data in it) |
| Backend | Supabase project **homesly-call-coach**, ref `zbhlbdwjeqzaillxldqq`, region **eu-west-1 (Ireland)**, org **Homesly**, **Free** plan |
| AI | Claude API (Anthropic Console, org "Homesly Group", Default workspace), key name `homesly-call-coach`, default model `claude-opus-5-5` |
| Deploys | GitHub Actions workflow **Deploy**: every push to `main` updates the database, backend function and website |

### What a user sees
Sign up with an `@homeslystays.com` email (other domains are refused) → **Today**: 2 AI practice calls + 3 drills, picked daily and aimed at their weakest rule → a score out of 100 per session, each rule marked Met / Partly / Missed, "say it better" rewrites → **My progress** (14-day trend, history, transcripts) → daily coaching summary. Managers also get **Team** (everyone's results, set role and team).

---

## 2. Access Vamshi needs (ask the current owner to invite you)

| System | How to add Vamshi |
|---|---|
| GitHub repo | Repo → Settings → Collaborators → add Vamshi (Write or Admin) |
| Supabase | Organization **Homesly** → Team → Invite (Developer or Owner) |
| Anthropic Console | Settings → Members → Invite (Developer) |
| App (manager rights) | Sign up in the app, then an existing manager sets your Role to **Manager** in the Team tab |

---

## 3. How it's built

```
web/                         Static site (HTML/CSS/JS, no build step) → GitHub Pages
  app.js                     All UI: auth, Today, call screen, voice, progress, team
  config.js                  Overwritten at deploy with SUPABASE_URL + SUPABASE_ANON_KEY
supabase/
  migrations/…_init.sql      Tables, row-level security, sign-up rules, AI usage limit
  functions/coach/index.ts   Backend (Deno Edge Function): AI guest, scoring, summaries
  functions/_shared/packs/   Training content: sales.ts (live), support.ts (empty, ready)
.github/workflows/deploy.yml CI/CD
```

**Request flow.** The browser signs in with Supabase Auth, then calls the `coach` function with the user's JWT. The function checks the user, calls Claude with the API key (held only on the server), writes the result to Postgres with the service role, and returns it. The browser reads its own results directly from Postgres; row-level security limits each person to their own rows, and managers see all.

**Backend actions** (`POST /functions/v1/coach`, body `{action, …}`): `bootstrap`, `guest` (AI guest's next line), `assess` (score a call and save it), `drill` (score a drill and save it), `summary` (daily coaching note).

**Database** (`public` schema):
| Table | Purpose |
|---|---|
| `profiles` | One row per user: email, name, `role` (trainee/manager), `team` (sales/support) |
| `attempts` | Every scored session: score, per-rule results, feedback, transcript |
| `day_notes` | Daily coaching summary per user |
| `ai_usage` | AI calls per user per day (limit enforced by `bump_ai_usage()`) |
| `app_settings` | `allowed_domains` (default `homeslystays.com`), `daily_ai_limit` (default 300) |

**Security rules built in:** company-email-only sign-up (DB trigger); the first ever account becomes manager; only managers can change roles or teams (trigger); scores are written only by the backend, so they can't be faked; nobody can change their own role.

---

## 4. Where the keys live (values are NOT in this file)

GitHub → repo **Settings → Secrets and variables → Actions**:

| Name | Type | Notes |
|---|---|---|
| `SUPABASE_ACCESS_TOKEN` | Secret | Scoped to this project only. **Expires around 9 Feb 2027** (90 days); see section 6 |
| `SUPABASE_DB_PASSWORD` | Secret | Postgres password set when the project was created |
| `ANTHROPIC_API_KEY` | Secret | Copied into Supabase function secrets at each deploy |
| `SUPABASE_PROJECT_REF` | Variable | `zbhlbdwjeqzaillxldqq` |
| `SUPABASE_URL` | Variable | `https://zbhlbdwjeqzaillxldqq.supabase.co` |
| `SUPABASE_ANON_KEY` | Variable | Legacy anon key (public by design) |
| `COACH_MODEL` | Variable (optional) | Not set, so the default `claude-opus-5-5` is used |

Supabase Auth settings already done: **Confirm email OFF**; **Site URL** and **Redirect URL** set to the live app address.

---

## 5. Everyday operations

| Task | How |
|---|---|
| Deploy a change | Push to `main` (or Actions → Deploy → Run workflow). Takes about 1 minute |
| Add or edit practice calls / drills | Edit `supabase/functions/_shared/packs/sales.ts`, push |
| Launch customer support training | Fill `support.ts` (knowledgeBase, roleplays, drills), push, then set people's Team to "Customer support" |
| Make someone a manager | Team tab → Role → Manager (managers can't change their own role) |
| Change allowed domains / daily AI limit | Supabase → Table Editor → `app_settings` |
| Cut AI cost | Set variable `COACH_MODEL` = `claude-haiku-5-5`, then re-run Deploy |
| See backend errors | Supabase → Edge Functions → `coach` → Logs |
| See AI spend | Anthropic Console → Usage / Billing |
| Remove a user | Supabase → Authentication → Users → delete (their results go with them) |

---

## 6. Things to watch (known limits)

1. **Supabase access token expires around 9 Feb 2027.** After that, deploys fail at "Link project". Fix: Supabase → Account → Access Tokens → generate a new token (project `homesly-call-coach`, Full access) and replace the `SUPABASE_ACCESS_TOKEN` secret.
2. **Free plan pauses after 1 week with no use.** The app then stops working until someone clicks **Restore** in the Supabase dashboard. Upgrade to Pro ($25/month) to stop this.
3. **No automatic backups on the free plan.** Export the `attempts` table occasionally, or upgrade to Pro (daily backups).
4. **Legacy API keys retire in early 2027** (Supabase notice). Before then, switch `SUPABASE_ANON_KEY` to the new publishable key, test sign-in, and confirm the function still receives `SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` (or move it to the new secret key).
5. **AI cost.** About £0.30–£0.40 per active trainee per day on Opus 5.5 (an estimate). The account had $200 of credit at launch. Set a spend limit in the Anthropic Console.
6. **Voice** uses the browser's own speech recognition and speech: it works in Chrome and Edge. Firefox users type, or use Windows + H.
7. **The repo is under a personal account (mubashir-Alt).** Transfer it to the Homesly GitHub account when convenient (Settings → Transfer). GitHub Pages and the URL change with it, so update the Supabase Site URL and Redirect URL afterwards.
8. **Runner warnings** about Node 20 / Ubuntu in Actions are harmless for now. Bump `actions/*` versions when convenient.

---

## 7. Moving to AWS (optional, later)

Roughly 2–4 days of work. The AI prompts, scoring and content don't change.

| Supabase today | AWS replacement |
|---|---|
| Supabase Auth | **Cognito** user pool. A pre-sign-up Lambda enforces `@homeslystays.com`; a post-confirmation Lambda inserts `profiles` (first user = manager) |
| Postgres + RLS | **RDS Postgres**: run the migration minus `auth.users` references, RLS policies and the Supabase-only triggers; enforce access in the API instead |
| Edge Function `coach` | **Lambda + API Gateway** (Node 20+, timeout of 90 s or more). `Deno.serve` becomes a handler, `Deno.env` becomes `process.env`, the Supabase client becomes `pg`; the key goes in **Secrets Manager** |
| Direct table reads in `web/app.js` | New routes: `GET /attempts?user=`, `GET /notes?user=&day=`, `GET /team`, `PATCH /team/:id` (managers only, not self) |
| `config.js` | `{ apiUrl, cognitoUserPoolId, cognitoClientId, region }`, written by the workflow |

**Data move:** export `profiles`, `attempts` and `day_notes` from Supabase (Table Editor → Export CSV, or `pg_dump`), and map user ids to the Cognito `sub`.

**Go-live checks on AWS:** non-company email refused · a trainee can't read another trainee's attempts · guest / assess / drill / summary all work · the daily AI limit blocks call 301.

---

## 8. Background

- Training content comes from 22 recorded reservation calls (26 Oct – 10 Nov 2026) and the "Homesly Voice Agents – Shared Library (all 7 scenarios)" Core Rules. Guest names and prices in the scenarios are invented, and real call moments are paraphrased.
- The recordings themselves are **not** in this repo. Two of them contained full card details; they were flagged for deletion under PCI DSS.
- Setup steps from scratch are in [SETUP.md](SETUP.md).
