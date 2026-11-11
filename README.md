# Homesly Call Coach

Daily AI role-play practice for Homesly's reservations team, with a customer support pack ready to fill.

**Live app:** https://mubashir-alt.github.io/homesly-call-coach/ · **First-time setup:** [SETUP.md](SETUP.md) · **Backend handover (Supabase or AWS):** [HANDOVER.md](HANDOVER.md)

## What it does

- **Practice calls.** The AI plays a guest built from real recorded calls: "needs to ask my husband", "is this a scam?", the guest who starts reading out a card, parking for a partner who can't walk far, wrong numbers, complaints and more. Trainees speak or type. With **Hands-free** on, the guest talks back aloud and the reply sends when the trainee pauses.
- **Quick drills.** One real moment from a recorded call: what the guest said, and what was said back. The trainee gives a better reply.
- **Scoring against the Homesly Core Rules.** Opening and recorded line, right person, live prices only, no card by phone, dates with weekday, facts from the knowledge base, no freebies, objections, next step, close, clarity. Each session gets a score out of 100, every rule marked Met / Partly / Missed, and "say it better" rewrites of the trainee's own lines.
- **A daily plan.** 2 calls + 3 drills a day. The first call targets each person's weakest rule.
- **Progress.** 14-day trend, weakest rules, lines to practise, full history with transcripts, and a daily coaching summary.
- **Team view for managers.** Everyone's scores, transcripts and summaries. Set roles and teams.
- **Packs.** `sales` is live. `support` (customer support) is ready for scenarios and a knowledge base.

## How it's built

| Part | Where | Notes |
|---|---|---|
| Website | `web/` → GitHub Pages | Plain HTML/CSS/JS, no build step. Voice uses the browser's own speech recognition and speech (Chrome / Edge). |
| Backend | `supabase/functions/coach/` → Supabase Edge Function | Plays the guest, scores sessions and writes results. Holds the Claude API key, which never reaches the browser. |
| Training content | `supabase/functions/_shared/packs/*.ts` | Calls, drills and rules per pack. Hidden guest instructions stay on the server. |
| Database & logins | `supabase/migrations/` → Supabase Postgres + Auth | Company-email sign-up only; the first account is a manager. Row-level security: people see only their own results, managers see everyone's. Scores are written only by the backend, so they can't be faked. |
| Deploy | `.github/workflows/deploy.yml` | Every push to `main` updates the database, function and website. |

## Adding content

- **New practice call:** copy an entry in `roleplays` in `supabase/functions/_shared/packs/sales.ts`, give it a new `id`, and push.
- **New drill:** same, in `drills`.
- **Customer support:** fill `knowledgeBase`, `roleplays` and `drills` in `support.ts`, then set people's team to *Customer support* in the Team tab.

## Privacy

This repository contains no call recordings, transcripts, guest details or keys. Practice calls use invented names and practice prices. Real call moments are paraphrased.

© Homesly. All rights reserved.
