// Homesly Call Coach backend (Supabase Edge Function).
// One endpoint, several actions. The Claude API key lives only here, as the
// ANTHROPIC_API_KEY secret, and is never sent to the browser.
//
// Actions (POST JSON {action, ...}):
//   bootstrap -> profile, today's date (UK) and the training packs (without hidden guest notes)
//   guest     -> the AI guest's next line in a practice call
//   assess    -> scores a finished practice call and saves it
//   drill     -> scores a drill answer and saves it
//   summary   -> writes and saves today's coaching summary

import Anthropic from "npm:@anthropic-ai/sdk@1.8.0";
import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2.45.4";
import sales from "../_shared/packs/sales.ts";
import support from "../_shared/packs/support.ts";
import type { Pack, Roleplay } from "../_shared/types.ts";

const PACKS: Record<string, Pack> = { sales, support };
const MODEL = Deno.env.get("COACH_MODEL") || "claude-opus-5-5";
const anthropic = new Anthropic({ apiKey: Deno.env.get("ANTHROPIC_API_KEY") });

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });

/* ---------- Dates (UK) ---------- */
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
function ukToday(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}
function addDays(key: string, n: number): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n));
}
const ord = (n: number) => n + (n % 10 === 1 && n !== 11 ? "st" : n % 10 === 2 && n !== 12 ? "nd" : n % 10 === 3 && n !== 13 ? "rd" : "th");
const longDate = (d: Date) => `${DAYS[d.getUTCDay()]} the ${ord(d.getUTCDate())} of ${MONTHS[d.getUTCMonth()]}`;
const money = (n: number) => "£" + (Math.round(n * 100) / 100).toFixed(2).replace(/\.00$/, "");

function rateLines(rp: Roleplay, today: string): string[] {
  if (!rp.rates.length) return ["(no booking on this call)"];
  const a = addDays(today, rp.arrive), d = addDays(today, rp.arrive + rp.nights);
  return rp.rates.map((r) =>
    `${r.room}: ${money(r.perNight)}/night x ${rp.nights} = ${money(r.perNight * rp.nights)} total, ${r.breakfast ? "breakfast included" : "room only"}. ${r.cancel}`
  ).concat([`Dates: ${longDate(a)} to ${longDate(d)} (${rp.nights} night${rp.nights > 1 ? "s" : ""})`]);
}

/* ---------- Input checks ---------- */
type Turn = { who: "me" | "guest"; text: string };
function cleanTurns(raw: unknown): Turn[] {
  if (!Array.isArray(raw) || raw.length > 80) throw new HttpError(400, "Invalid call transcript.");
  return raw.map((t) => {
    const who = (t as Turn)?.who, text = String((t as Turn)?.text ?? "").trim().slice(0, 1200);
    if ((who !== "me" && who !== "guest") || !text) throw new HttpError(400, "Invalid call transcript.");
    return { who, text };
  });
}
function getPack(id: unknown): Pack {
  const p = PACKS[String(id)];
  if (!p) throw new HttpError(400, "Unknown training pack.");
  return p;
}
function getRoleplay(pack: Pack, id: unknown): Roleplay {
  const r = pack.roleplays.find((x) => x.id === id);
  if (!r) throw new HttpError(400, "Unknown practice call.");
  return r;
}

/* ---------- Claude calls ---------- */
async function askText(system: string, messages: Anthropic.Beta.BetaMessageParam[], effort: "low" | "medium", maxTokens = 4000): Promise<string> {
  const r = await anthropic.beta.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system,
    messages,
    output_config: { effort },
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
  });
  if (r.stop_reason === "refusal") throw new HttpError(422, "The AI declined to answer this one. Try rephrasing.");
  const text = r.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("").trim();
  if (!text) throw new HttpError(502, "The AI returned an empty answer. Try again.");
  return text;
}
async function askJson<T>(system: string, prompt: string, schema: Record<string, unknown>, effort: "low" | "medium"): Promise<T> {
  const r = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 16000,
    system,
    messages: [{ role: "user", content: prompt }],
    output_config: { effort, format: { type: "json_schema", schema } },
  });
  if (r.stop_reason === "refusal") throw new HttpError(422, "The AI declined to score this one.");
  if (r.stop_reason === "max_tokens") throw new HttpError(502, "The feedback was cut short. Try again.");
  const text = r.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("");
  try { return JSON.parse(text) as T; } catch { throw new HttpError(502, "The feedback came back in the wrong format. Try again."); }
}

/* ---------- Prompts ---------- */
function guestSystem(rp: Roleplay, today: string): string {
  const a = addDays(today, rp.arrive), d = addDays(today, rp.arrive + rp.nights);
  const kids = rp.children.length ? ` and ${rp.children.length} child${rp.children.length > 1 ? "ren" : ""} aged ${rp.children.join(", ")}` : "";
  const stay = rp.nights
    ? `The stay: arriving ${longDate(a)}, leaving ${longDate(d)}, ${rp.adults} adult${rp.adults > 1 ? "s" : ""}${kids}.`
    : "This call is about a past stay, not a new booking.";
  return `You are role-playing a phone call to train a hotel reservations agent at Homesly, a group of independent UK hotels. You play the OTHER PERSON on the call and stay fully in character.

Hotel: ${rp.hotel}${rp.town ? ", " + rp.town : ""}.
Call type: ${rp.dir === "out" ? "OUTBOUND. The agent is calling you about a booking you started on the hotel website but did not finish." : "INBOUND. You are calling the hotel, and you speak first."}
Your name: ${rp.guest}.
Who you are: ${rp.persona}
${stay}
How you behave: ${rp.behaviour}
Today is ${longDate(addDays(today, 0))}.

How to reply:
- Reply only with the words you say out loud: one to three short sentences of natural British English. No stage directions, quotation marks or narration.
- React realistically. If the agent is pushy or confusing, become cooler. If they ask for card details by phone, be suspicious. If they are clear and kind, warm up.
- Never coach or help the agent, and never mention training, scoring or AI.
- When the call has clearly finished (goodbyes said, or you would hang up), end your reply with the tag [END].`;
}

function guestMessages(rp: Roleplay, turns: Turn[]): Anthropic.Beta.BetaMessageParam[] {
  const msgs: Anthropic.Beta.BetaMessageParam[] = [];
  const opener = rp.dir === "in" ? "(The hotel picks up the phone. Say your opening line.)" : "(Your phone rings and you answer.)";
  if (!turns.length) return [{ role: "user", content: opener }];
  turns.forEach((t, i) => {
    const content = i === 0 && t.who === "me" ? `${opener}\nThe agent says: ${t.text}` : t.text;
    msgs.push({ role: t.who === "me" ? "user" : "assistant", content });
  });
  if (msgs[0].role === "assistant") msgs.unshift({ role: "user", content: opener });
  if (msgs[msgs.length - 1].role === "assistant") msgs.push({ role: "user", content: "(The agent pauses for a moment.)" });
  return msgs;
}

const COACH_SYSTEM = "You are an experienced, fair and encouraging hotel reservations coach for Homesly, a group of independent UK hotels. You are strict about compliance: card details, live prices, invented facts and privacy. Write in plain British English.";

function assessPrompt(pack: Pack, rp: Roleplay, turns: Turn[], today: string): string {
  const transcript = turns.map((t) => (t.who === "me" ? "AGENT: " : "OTHER PERSON: ") + t.text).join("\n");
  return `Score this practice call.

SCENARIO: ${rp.scenario}: "${rp.title}". Hotel: ${rp.hotel}${rp.town ? ", " + rp.town : ""}. ${rp.dir === "out" ? "Outbound: the agent called the guest." : "Inbound: the person called the hotel."}
Person on the call: ${rp.guest}. ${rp.persona}

WHAT THE AGENT COULD SEE ON SCREEN (the only prices and facts they may use):
Live rate (check_rate result):
${rateLines(rp, today).join("\n")}
Knowledge base:
${Object.entries(rp.kb).map(([k, v]) => `${k}: ${v}`).join("\n") || "(nothing)"}
Anything marked "Not in knowledge base" must not be answered from memory; the right move is "I'll check that with the team and text you back".

RULES (score each one):
${pack.criteria.map((c) => `- ${c.id}: ${c.tip}`).join("\n")}

TRANSCRIPT (typed or dictated; ignore small dictation errors):
${transcript}

Scoring guidance:
- Mark each rule "met", "partial", "missed" or "na" (did not come up). Include every rule once.
- An outbound opening without the hotel name and the recorded line is "missed" for disclosure.
- Quoting a price or total that is not on the live rate panel, or a wrong total, is "missed" for live_price.
- Asking for or accepting card details is "missed" for no_card.
- score is 0 to 100 overall.
- better_lines: up to 3 of the agent's weakest moments. "original" quotes the agent exactly; "better" is under 30 words; "why" is under 12 words.
- strengths: up to 2. improvements: up to 3 short, specific actions. summary: two sentences.`;
}

function assessSchema(pack: Pack) {
  return {
    type: "object",
    additionalProperties: false,
    required: ["score", "outcome", "summary", "criteria", "strengths", "improvements", "better_lines"],
    properties: {
      score: { type: "integer" },
      outcome: { type: "string", enum: ["booked", "link-sent", "callback-scheduled", "transferred", "message-taken", "not-interested", "wrong-number", "no-outcome"] },
      summary: { type: "string" },
      criteria: {
        type: "array",
        items: {
          type: "object", additionalProperties: false, required: ["id", "result", "note"],
          properties: {
            id: { type: "string", enum: pack.criteria.map((c) => c.id) },
            result: { type: "string", enum: ["met", "partial", "missed", "na"] },
            note: { type: "string" },
          },
        },
      },
      strengths: { type: "array", items: { type: "string" } },
      improvements: { type: "array", items: { type: "string" } },
      better_lines: {
        type: "array",
        items: {
          type: "object", additionalProperties: false, required: ["original", "better", "why"],
          properties: { original: { type: "string" }, better: { type: "string" }, why: { type: "string" } },
        },
      },
    },
  };
}

const DRILL_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["score", "verdict", "good", "fix", "model_answer"],
  properties: {
    score: { type: "integer" },
    verdict: { type: "string" },
    good: { type: "string" },
    fix: { type: "string" },
    model_answer: { type: "string" },
  },
};

/* ---------- Usage limit ---------- */
async function bumpUsage(admin: SupabaseClient, userId: string, today: string) {
  const { data, error } = await admin.rpc("bump_ai_usage", { p_user: userId, p_day: today });
  if (error) throw new HttpError(500, "Could not record usage.");
  const { calls, daily_limit } = (data as { calls: number; daily_limit: number }[])[0];
  if (calls > daily_limit) throw new HttpError(429, `Daily AI limit reached (${daily_limit} calls). It resets at midnight.`);
}

const clampScore = (n: unknown) => Math.max(0, Math.min(100, Math.round(Number(n) || 0)));

/* ---------- Handler ---------- */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: authHeader } } });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) throw new HttpError(401, "Please sign in again.");
    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { data: profile } = await admin.from("profiles").select("id, email, full_name, role, team").eq("id", user.id).single();
    if (!profile) throw new HttpError(403, "Your account has no profile. Ask a manager to check your sign-up.");

    const body = await req.json().catch(() => ({}));
    const today = ukToday();

    switch (body.action) {
      case "bootstrap": {
        const packs = Object.values(PACKS).map((p) => ({
          ...p,
          roleplays: p.roleplays.map(({ behaviour: _hidden, ...rest }) => rest),
        }));
        return json({ profile, today, packs, model: MODEL, aiReady: !!Deno.env.get("ANTHROPIC_API_KEY") });
      }

      case "guest": {
        const pack = getPack(body.pack), rp = getRoleplay(pack, body.itemId), turns = cleanTurns(body.turns);
        await bumpUsage(admin, user.id, today);
        let text = await askText(guestSystem(rp, today), guestMessages(rp, turns), "low");
        const ended = /\[END\]/i.test(text);
        text = text.replace(/\[END\]/gi, "").trim();
        return json({ text, ended });
      }

      case "assess": {
        const pack = getPack(body.pack), rp = getRoleplay(pack, body.itemId), turns = cleanTurns(body.turns);
        if (!turns.some((t) => t.who === "me")) throw new HttpError(400, "Say something on the call before asking for feedback.");
        await bumpUsage(admin, user.id, today);
        type Fb = { score: number; outcome: string; summary: string; criteria: { id: string; result: string; note: string }[]; strengths: string[]; improvements: string[]; better_lines: { original: string; better: string; why: string }[] };
        const fb = await askJson<Fb>(COACH_SYSTEM, assessPrompt(pack, rp, turns, today), assessSchema(pack), "medium");
        const row = {
          user_id: user.id, pack: pack.id, kind: "roleplay", item_id: rp.id, title: rp.title, score: clampScore(fb.score),
          outcome: fb.outcome, summary: fb.summary, criteria: fb.criteria, strengths: fb.strengths.slice(0, 2),
          improvements: fb.improvements.slice(0, 3), better_lines: fb.better_lines.slice(0, 3), transcript: turns, targets: rp.targets, day: today,
        };
        const { data, error } = await admin.from("attempts").insert(row).select().single();
        if (error) throw new HttpError(500, "Your score was worked out but could not be saved.");
        return json({ attempt: data });
      }

      case "drill": {
        const pack = getPack(body.pack);
        const d = pack.drills.find((x) => x.id === body.itemId);
        if (!d) throw new HttpError(400, "Unknown drill.");
        const answer = String(body.answer ?? "").trim().slice(0, 1200);
        if (!answer) throw new HttpError(400, "Type or say your answer first.");
        await bumpUsage(admin, user.id, today);
        const prompt = `A trainee is practising one moment taken from a real recorded call.
What the guest said: ${d.guest}
What was said on the real call (the mistake): ${d.was}
Task: ${d.task}
Rules that apply:
${d.targets.map((t) => "- " + (pack.criteria.find((c) => c.id === t)?.tip ?? t)).join("\n")}
General: staff speak as the hotel, in warm British English, under 25 words per turn, one question at a time. They never take card details by phone and never invent facts, prices or discounts.
Trainee's answer: "${answer}"
Give a score from 0 to 100, a one-sentence verdict, what worked (under 20 words), the most important fix (under 25 words), and an ideal reply (under 35 words).`;
        type Dfb = { score: number; verdict: string; good: string; fix: string; model_answer: string };
        const fb = await askJson<Dfb>(COACH_SYSTEM, prompt, DRILL_SCHEMA, "low");
        const row = {
          user_id: user.id, pack: pack.id, kind: "drill", item_id: d.id, title: d.title, score: clampScore(fb.score),
          summary: fb.verdict, strengths: [fb.good], improvements: [fb.fix],
          better_lines: [{ original: answer, better: fb.model_answer, why: "" }], transcript: [{ who: "me", text: answer }], targets: d.targets, day: today,
        };
        const { data, error } = await admin.from("attempts").insert(row).select().single();
        if (error) throw new HttpError(500, "Your score was worked out but could not be saved.");
        return json({ attempt: data });
      }

      case "summary": {
        const { data: rows } = await admin.from("attempts").select("kind, title, score, summary, improvements").eq("user_id", user.id).eq("day", today).order("created_at");
        if (!rows?.length) throw new HttpError(400, "Finish at least one session today first.");
        await bumpUsage(admin, user.id, today);
        const lines = rows.map((a) => `- ${a.kind} "${a.title}": score ${a.score}. ${a.summary ?? ""} Fixes: ${(a.improvements ?? []).join(" | ")}`).join("\n");
        const note = await askText(COACH_SYSTEM,
          [{ role: "user", content: `Write today's coaching summary for the trainee, addressed to them as "you", under 120 words. Use this structure: one sentence on how today went; "Keep doing:" one point; "Fix next:" two points; "Practise this line tomorrow:" one exact sentence they can say on calls. Base it only on these results:\n${lines}` }],
          "low");
        const { error } = await admin.from("day_notes").upsert({ user_id: user.id, day: today, note });
        if (error) throw new HttpError(500, "The summary could not be saved.");
        return json({ note });
      }

      default:
        throw new HttpError(400, "Unknown action.");
    }
  } catch (e) {
    if (e instanceof HttpError) return json({ error: e.message }, e.status);
    if (e instanceof Anthropic.RateLimitError) return json({ error: "The AI is busy right now. Try again in a minute." }, 429);
    if (e instanceof Anthropic.AuthenticationError) return json({ error: "The AI key is missing or wrong. A manager needs to check the ANTHROPIC_API_KEY secret." }, 503);
    if (e instanceof Anthropic.APIError) return json({ error: "The AI service had a problem. Try again." }, 502);
    console.error(e);
    return json({ error: "Something went wrong. Try again." }, 500);
  }
});
