# Setup: make Homesly Call Coach live

Plan for about 20 minutes. You only do this once. After that, every push to `main` redeploys everything automatically.

You need three free accounts: **GitHub** (you have it), **Supabase** (logins, results, backend), and **Anthropic** (the AI, pay-as-you-go).

---

## 1. Create the Supabase project

1. Go to https://supabase.com, sign in, and click **New project**.
2. Name it `homesly-call-coach`, choose region **London (eu-west-2)**, and set a strong **database password**. Save the password somewhere safe; you need it in step 4.
3. When the project is ready, open **Project Settings → General** and copy the **Project ID** (the "reference", e.g. `abcdxyzabcdxyzabcd`).
4. Open **Project Settings → API keys** (or **Data API**) and copy:
   - the **Project URL** (e.g. `https://abcdxyz.supabase.co`)
   - the **anon / public** key. If you only see "Publishable" keys, open the **Legacy API keys** tab and copy `anon`.
5. Create an access token for deployments: https://supabase.com/dashboard/account/tokens → **Generate new token** → copy it.

### Sign-in settings (Supabase → Authentication)
- **URL Configuration** → set **Site URL** to the website address from step 5 below (e.g. `https://mubashir-alt.github.io/homesly-call-coach/`) and add the same address under **Redirect URLs**.
- **Sign In / Providers → Email**: Supabase's built-in email service only sends a few emails per hour. For a small team, the easiest option is to switch **Confirm email** off. Sign-ups are already restricted to `@homeslystays.com` addresses by the database. Alternatively, keep it on and add your own SMTP under **Emails → SMTP settings**.

## 2. Get the Claude API key

1. Go to https://console.anthropic.com → **Settings → Billing** and add a payment method.
2. **API keys → Create key**, name it `homesly-call-coach`, and copy it. You only see it once.

Rough cost with the default model (Claude Opus 5.5): about **£0.30–£0.40 per person per day** for the full daily set (2 calls, 3 drills, 1 summary). To cut that sharply, set the variable `COACH_MODEL` to `claude-haiku-5-5` in step 3. There's also a built-in limit of 300 AI calls per person per day.

## 3. Add the secrets to GitHub

In the repository: **Settings → Secrets and variables → Actions**.

**Secrets** tab → **New repository secret** (these stay hidden):

| Name | Value |
|---|---|
| `SUPABASE_ACCESS_TOKEN` | token from step 1.5 |
| `SUPABASE_DB_PASSWORD` | database password from step 1.2 |
| `ANTHROPIC_API_KEY` | key from step 2 |

**Variables** tab → **New repository variable** (these are public-safe):

| Name | Value |
|---|---|
| `SUPABASE_PROJECT_REF` | Project ID from step 1.3 |
| `SUPABASE_URL` | Project URL from step 1.4 |
| `SUPABASE_ANON_KEY` | anon key from step 1.4 |
| `COACH_MODEL` | optional, e.g. `claude-haiku-5-5` (default `claude-opus-5-5`) |

## 4. Deploy

**Actions** tab → **Deploy** → **Run workflow** → `main`. It takes about 2 minutes. Both jobs should go green:
- **Backend (Supabase)** creates the database tables and access rules, stores the AI key, and deploys the `coach` function.
- **Website (GitHub Pages)** publishes the site.

## 5. First sign-in (do this before sharing the link)

1. Open the website: **https://mubashir-alt.github.io/homesly-call-coach/**
2. Click **Create account** and sign up with your `@homeslystays.com` email. **The first account becomes a manager automatically.**
3. Do one practice call to check the AI works.
4. Share the link with the team. Each person creates an account with their company email. Managers see everyone in the **Team** tab and can make someone a manager or move them to the customer support team there.

---

## Changing things later

| To change… | Do this |
|---|---|
| Practice calls, drills, rules | Edit `supabase/functions/_shared/packs/sales.ts` (or `support.ts`) and push to `main`. |
| Allowed email domains, daily AI limit | Supabase → **Table Editor → app_settings**. |
| Who is a manager | **Team** tab in the app (managers only). |
| AI model | GitHub variable `COACH_MODEL`, then re-run **Deploy**. |

## Troubleshooting

| Problem | Fix |
|---|---|
| Website says "Almost ready" | `SUPABASE_URL` / `SUPABASE_ANON_KEY` variables are missing. Add them and re-run Deploy. |
| Yellow banner "The AI isn't connected yet" | `ANTHROPIC_API_KEY` secret missing. Add it and re-run Deploy. |
| "Use your company email address" on sign-up | Only domains in `app_settings.allowed_domains` can sign up. |
| No confirmation email arrives | Switch **Confirm email** off, or add SMTP (step 1). |
| Reset-password link opens the wrong page | Check **Site URL** and **Redirect URLs** in Supabase Authentication. |
| No **Speak** button | Use Chrome or Edge. On Windows, press **Windows key + H** to dictate instead. |
