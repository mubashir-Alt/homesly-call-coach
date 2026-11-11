// Homesly Call Coach backend (Supabase Edge Function).
// The Claude API key lives only here (ANTHROPIC_API_KEY secret) and never reaches the browser.
//
// Actions (POST JSON {action, ...}):
//   bootstrap -> profile, UK date, course (levels + lessons, hidden guest notes removed); records attendance
//   start     -> a unique scenario variant for this trainee (new, or the same one again) + the guest's first line
//   guest     -> the AI guest's next line in a practice call
//   assess    -> scores a finished practice call and saves it
//   drill     -> scores a drill answer and saves it
//   summary   -> writes and saves today's coaching summary

import Anthropic from "npm:@anthropic-ai/sdk@1.8.0";
import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2.45.4";
import sales from "../_shared/packs/sales.ts";
import support from "../_shared/packs/support.ts";
import type { Drill, Pack, Rate, Roleplay } from "../_shared/types.ts";

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
const ukToday = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
function addDays(key: string, n: number): Date { const [y, m, d] = key.split("-").map(Number); return new Date(Date.UTC(y, m - 1, d + n)); }
const ord = (n: number) => n + (n % 10 === 1 && n !== 11 ? "st" : n % 10 === 2 && n !== 12 ? "nd" : n % 10 === 3 && n !== 13 ? "rd" : "th");
const longDate = (d: Date) => `${DAYS[d.getUTCDay()]} the ${ord(d.getUTCDate())} of ${MONTHS[d.getUTCMonth()]}`;
const money = (n: number) => "£" + (Math.round(n * 100) / 100).toFixed(2).replace(/\.00$/, "");

/* ---------- Variants ---------- */
const FEMALE = ["Sarah", "Emma", "Claire", "Laura", "Rachel", "Helen", "Fiona", "Karen", "Joanne", "Nicola", "Gemma", "Louise", "Amy", "Kirsty", "Lisa", "Anne", "Sophie", "Hannah", "Catherine", "Ruth", "Megan", "Zoe", "Alison", "Jill", "Moira", "Shona", "Eilidh", "Priya", "Aisha", "Grace"];
const MALE = ["James", "David", "Paul", "Mark", "Gary", "Stephen", "Andrew", "Neil", "Craig", "Simon", "Ian", "Graham", "Martin", "Peter", "Colin", "Ross", "Euan", "Callum", "Tom", "Ben", "Chris", "Daniel", "Rob", "Alan", "Kevin", "Stuart", "Hamish", "Raj", "Omar", "Liam"];
const SURNAMES = ["Hughes", "Fraser", "Barnes", "Price", "Doyle", "Kerr", "Watt", "Robson", "Reid", "Morgan", "Ellis", "Hall", "Campbell", "Stewart", "Murray", "Patel", "Thomson", "Clarke", "Walker", "Young", "Wilson", "Bell", "Scott", "Grant", "Hunter", "Shaw", "Ross", "Lloyd", "Evans", "Begum", "Mackay", "Turner", "Dixon", "Ward", "Fleming", "Burns", "Moffat", "Elliot", "Armstrong", "Nicholson"];
const pick = <T,>(xs: T[]) => xs[Math.floor(Math.random() * xs.length)];
const fill = (s: string, name: string) => s.replaceAll("{name}", name);
/** The guest's display name: templates with "{name}" keep their label (e.g. "(lead name)"); others use the generated name. */
const guestName = (t: Roleplay, name: string): string => (t.guest.includes("{name}") ? fill(t.guest, name) : name);

type CallVariant = {
  kind: "call"; name: string; arrive: number; rates: Rate[]; personaDetail: string; twist: string; firstLine: string;
};
type DrillVariant = { kind: "drill"; guestLine: string; context: string };

function findLesson(pack: Pack, id: string): { kind: "call"; t: Roleplay } | { kind: "drill"; t: Drill } {
  const r = pack.roleplays.find((x) => x.id === id);
  if (r) return { kind: "call", t: r };
  const d = pack.drills.find((x) => x.id === id);
  if (d) return { kind: "drill", t: d };
  throw new HttpError(400, "Unknown lesson.");
}
const levelOf = (pack: Pack, id: string) => pack.levels.find((l) => l.lessons.includes(id))?.id ?? 0;

/** What the browser may see of a call variant (no hidden behaviour or twist). */
function publicCall(t: Roleplay, v: CallVariant, today: string, id: string) {
  const a = addDays(today, v.arrive), d = addDays(today, v.arrive + t.nights);
  return {
    variantId: id, kind: "call", lessonId: t.id, title: t.title, scenario: t.scenario, hotel: t.hotel, town: t.town, dir: t.dir, voice: t.voice,
    guest: guestName(t, v.name), persona: fill(t.persona, v.name), from: t.from, nights: t.nights, adults: t.adults, children: t.children,
    arriveText: t.nights ? longDate(a) : "", departText: t.nights ? longDate(d) : "", rates: v.rates, kb: t.kb, targets: t.targets, firstLine: v.firstLine,
  };
}
function publicDrill(t: Drill, v: DrillVariant, id: string) {
  return { variantId: id, kind: "drill", lessonId: t.id, title: t.title, from: t.from, guestLine: v.guestLine, context: v.context, was: t.was, task: t.task, targets: t.targets };
}

async function createCallVariant(admin: SupabaseClient, pack: Pack, t: Roleplay, userId: string): Promise<{ id: string; data: CallVariant }> {
  const { data: prev } = await admin.from("scenario_variants").select("signature, data").eq("pack", pack.id).eq("lesson_id", t.id).order("created_at", { ascending: false }).limit(40);
  const used = new Set((prev ?? []).map((p) => p.signature));
  const recentTwists = (prev ?? []).slice(0, 15).map((p) => (p.data as CallVariant).twist).filter(Boolean);
  const gender = t.nameGender ?? t.voice;
  let name = "", arrive = t.arrive;
  for (let i = 0; i < 40; i++) {
    name = `${pick(gender === "male" ? MALE : FEMALE)} ${pick(SURNAMES)}`;
    arrive = t.fixedDates || !t.nights ? t.arrive : Math.max(1, t.arrive + Math.floor(Math.random() * 15) - 5);
    if (!used.has(`${name}|${arrive}`)) break;
  }
  const rates = t.rates.map((r) => ({ ...r, perNight: Math.round(r.perNight * (0.9 + Math.random() * 0.2)) }));
  const a = addDays(ukToday(), arrive);
  type Gen = { persona_detail: string; twist: string; first_line: string };
  const gen = await askJson<Gen>(
    "You write realistic, varied practice-call scenarios for hotel reservation staff training in the UK. Plain British English.",
    `Create a fresh variation of this practice call so that no two trainees get the same call.

Scenario: ${t.title} (${t.scenario}). Hotel: ${t.hotel}${t.town ? ", " + t.town : ""}.
Direction: ${t.dir === "out" ? "the hotel agent phones this person" : "this person phones the hotel"}.
Person: ${guestName(t, name)}. ${fill(t.persona, name)}
Core behaviour that must stay true: ${fill(t.behaviour, name)}
${t.nights ? `Stay: arriving ${longDate(a)} for ${t.nights} night(s), ${t.adults} adult(s)${t.children.length ? ", children aged " + t.children.join(", ") : ""}.` : ""}
Twists already used for other trainees (do not repeat or closely copy): ${recentTwists.length ? recentTwists.map((x) => `"${x}"`).join("; ") : "none yet"}

Return:
- persona_detail: one new, specific, realistic detail about the person (under 20 words), e.g. job, reason for travel, mood.
- twist: one extra realistic wrinkle for this call that keeps the core behaviour (under 30 words), e.g. a time pressure, a second question, a small misunderstanding.
- first_line: the very first thing the person says (${t.dir === "out" ? "answering their phone, under 12 words, often just a greeting with their name or company" : "opening the call with their reason, under 30 words"}). Spoken words only.`,
    { type: "object", additionalProperties: false, required: ["persona_detail", "twist", "first_line"], properties: { persona_detail: { type: "string" }, twist: { type: "string" }, first_line: { type: "string" } } },
    "low",
  );
  const data: CallVariant = { kind: "call", name, arrive, rates, personaDetail: gen.persona_detail, twist: gen.twist, firstLine: gen.first_line.replace(/^["']|["']$/g, "") };
  for (let i = 0; i < 3; i++) {
    const sig = i === 0 ? `${name}|${arrive}` : `${name}|${arrive}|${crypto.randomUUID().slice(0, 6)}`;
    const { data: row, error } = await admin.from("scenario_variants").insert({ pack: pack.id, lesson_id: t.id, kind: "call", user_id: userId, signature: sig, data }).select("id").single();
    if (!error && row) return { id: row.id, data };
  }
  throw new HttpError(500, "Could not save the new scenario. Try again.");
}

async function createDrillVariant(admin: SupabaseClient, pack: Pack, t: Drill, userId: string): Promise<{ id: string; data: DrillVariant }> {
  const { data: prev } = await admin.from("scenario_variants").select("signature, data").eq("pack", pack.id).eq("lesson_id", t.id).order("created_at", { ascending: false }).limit(40);
  const used = (prev ?? []).map((p) => (p.data as DrillVariant).guestLine).filter(Boolean);
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const usedSet = new Set(used.map(norm));
  for (let attempt = 0; attempt < 3; attempt++) {
    type Gen = { guest_line: string; context: string };
    const gen = await askJson<Gen>(
      "You write realistic, varied guest lines for hotel reservation staff training in the UK. Plain British English.",
      `Write a NEW version of this training moment so each trainee gets a different one.
Situation: ${t.title}. Original guest line: ${t.guest}
What went wrong on the real call: ${t.was}
Trainee's task: ${t.task}
Keep the same underlying situation and the same test, but change the wording, the guest's circumstances and the Homesly hotel (e.g. Coach House Otterburn, Station Hotel Portsoy, Central Hotel Gloucester, George Hotel Montrose, County Hotel Selkirk, Hampton Hotel Wells, Park Hotel, The Woodman Inn, Homesly Guestrooms Berwick). If the task names a specific fact (a date, a rate's terms), keep that fact unchanged.
Lines already used (do not repeat or closely copy): ${used.slice(0, 20).map((x) => `"${x}"`).join("; ") || "none yet"}
Return guest_line (what the guest says, under 35 words, spoken words only) and context (one sentence setting the scene for the trainee, under 25 words).`,
      { type: "object", additionalProperties: false, required: ["guest_line", "context"], properties: { guest_line: { type: "string" }, context: { type: "string" } } },
      "low",
    );
    const data: DrillVariant = { kind: "drill", guestLine: gen.guest_line.replace(/^["']|["']$/g, ""), context: gen.context };
    const sig = norm(data.guestLine).slice(0, 180);
    if (usedSet.has(sig)) continue;
    const { data: row, error } = await admin.from("scenario_variants").insert({ pack: pack.id, lesson_id: t.id, kind: "drill", user_id: userId, signature: sig, data }).select("id").single();
    if (!error && row) return { id: row.id, data };
  }
  throw new HttpError(500, "Could not create a new version of this drill. Try again.");
}

async function loadVariant(admin: SupabaseClient, id: unknown, userId: string) {
  const { data } = await admin.from("scenario_variants").select("*").eq("id", String(id)).maybeSingle();
  if (!data || data.user_id !== userId) throw new HttpError(404, "This practice scenario was not found. Start the lesson again.");
  const pack = PACKS[data.pack];
  if (!pack) throw new HttpError(400, "Unknown training pack.");
  return { row: data, pack, lesson: findLesson(pack, data.lesson_id) };
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

/* ---------- Claude calls ---------- */
async function askText(system: string, messages: Anthropic.Beta.BetaMessageParam[], effort: "low" | "medium", maxTokens = 4000): Promise<string> {
  const r = await anthropic.beta.messages.create({
    model: MODEL, max_tokens: maxTokens, system, messages, output_config: { effort },
    betas: ["server-side-fallback-2026-07-01"], fallbacks: "default",
  });
  if (r.stop_reason === "refusal") throw new HttpError(422, "The AI declined to answer this one. Try rephrasing.");
  const text = r.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("").trim();
  if (!text) throw new HttpError(502, "The AI returned an empty answer. Try again.");
  return text;
}
async function askJson<T>(system: string, prompt: string, schema: Record<string, unknown>, effort: "low" | "medium"): Promise<T> {
  const r = await anthropic.messages.create({
    model: MODEL, max_tokens: 16000, system, messages: [{ role: "user", content: prompt }],
    output_config: { effort, format: { type: "json_schema", schema } },
  });
  if (r.stop_reason === "refusal") throw new HttpError(422, "The AI declined this one.");
  if (r.stop_reason === "max_tokens") throw new HttpError(502, "The answer was cut short. Try again.");
  const text = r.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("");
  try { return JSON.parse(text) as T; } catch { throw new HttpError(502, "The AI answer came back in the wrong format. Try again."); }
}

/* ---------- Prompts ---------- */
function rateLines(t: Roleplay, v: CallVariant, today: string): string[] {
  if (!v.rates.length) return ["(no booking on this call)"];
  const a = addDays(today, v.arrive), d = addDays(today, v.arrive + t.nights);
  return v.rates.map((r) => `${r.room}: ${money(r.perNight)}/night x ${t.nights} = ${money(r.perNight * t.nights)} total, ${r.breakfast ? "breakfast included" : "room only"}. ${r.cancel}`)
    .concat([`Dates: ${longDate(a)} to ${longDate(d)} (${t.nights} night${t.nights > 1 ? "s" : ""})`]);
}
function guestSystem(t: Roleplay, v: CallVariant, today: string): string {
  const a = addDays(today, v.arrive), d = addDays(today, v.arrive + t.nights);
  const kids = t.children.length ? ` and ${t.children.length} child${t.children.length > 1 ? "ren" : ""} aged ${t.children.join(", ")}` : "";
  const stay = t.nights ? `The stay: arriving ${longDate(a)}, leaving ${longDate(d)}, ${t.adults} adult${t.adults > 1 ? "s" : ""}${kids}.` : "This call is about a past stay, not a new booking.";
  return `You are role-playing a phone call to train a hotel reservations agent at Homesly, a group of independent UK hotels. You play the OTHER PERSON on the call and stay fully in character.

Hotel: ${t.hotel}${t.town ? ", " + t.town : ""}.
Call type: ${t.dir === "out" ? "OUTBOUND. The agent is calling you about a booking you started on the hotel website but did not finish. You have already answered the phone." : "INBOUND. You called the hotel and have already said your opening line."}
Your name: ${guestName(t, v.name)}.
Who you are: ${fill(t.persona, v.name)} ${v.personaDetail}
${stay}
How you behave: ${fill(t.behaviour, v.name)}
Extra detail for this call: ${v.twist}
Today is ${longDate(addDays(today, 0))}.

How to reply:
- Reply only with the words you say out loud: one to three short sentences of natural British English. No stage directions, quotation marks or narration.
- React realistically. If the agent is pushy or confusing, become cooler. If they ask for card details by phone, be suspicious. If they are clear and kind, warm up.
- Never coach or help the agent, and never mention training, scoring or AI.
- When the call has clearly finished (goodbyes said, or you would hang up), end your reply with the tag [END].`;
}
function guestMessages(firstLine: string, turns: Turn[]): Anthropic.Beta.BetaMessageParam[] {
  const msgs: Anthropic.Beta.BetaMessageParam[] = [{ role: "user", content: "(The call connects.)" }];
  const all = turns.length && turns[0].who === "guest" ? turns : [{ who: "guest" as const, text: firstLine }, ...turns];
  for (const t of all) msgs.push({ role: t.who === "me" ? "user" : "assistant", content: t.text });
  if (msgs[msgs.length - 1].role === "assistant") msgs.push({ role: "user", content: "(The agent pauses for a moment.)" });
  return msgs;
}

const COACH_SYSTEM = "You are an experienced, fair and encouraging hotel reservations coach for Homesly, a group of independent UK hotels. You are strict about compliance: card details, live prices, invented facts and privacy. Write in plain British English.";

function assessPrompt(pack: Pack, t: Roleplay, v: CallVariant, turns: Turn[], today: string): string {
  const transcript = turns.map((x) => (x.who === "me" ? "AGENT: " : "OTHER PERSON: ") + x.text).join("\n");
  return `Score this practice call.

SCENARIO: ${t.scenario}: "${t.title}". Hotel: ${t.hotel}${t.town ? ", " + t.town : ""}. ${t.dir === "out" ? "Outbound: the agent called the guest (the guest answered first)." : "Inbound: the person called the hotel and spoke first."}
Person on the call: ${guestName(t, v.name)}. ${fill(t.persona, v.name)} ${v.personaDetail} Extra detail: ${v.twist}

WHAT THE AGENT COULD SEE ON SCREEN (the only prices and facts they may use):
Live rate (check_rate result):
${rateLines(t, v, today).join("\n")}
Knowledge base:
${Object.entries(t.kb).map(([k, val]) => `${k}: ${val}`).join("\n") || "(nothing)"}
Anything marked "Not in knowledge base" must not be answered from memory; the right move is "I'll check that with the team and text you back".

RULES (score each one):
${pack.criteria.map((c) => `- ${c.id}: ${c.tip}`).join("\n")}

TRANSCRIPT (typed or dictated; ignore small dictation errors):
${transcript}

Scoring guidance:
- Mark each rule "met", "partial", "missed" or "na" (did not come up). Include every rule once.
- An outbound call where the agent never says the hotel name and that the line is recorded is "missed" for disclosure.
- Quoting a price or total not on the live rate panel, or a wrong total, is "missed" for live_price.
- Asking for or accepting card details is "missed" for no_card.
- score is 0 to 100 overall.
- better_lines: up to 3 of the agent's weakest moments. "original" quotes the agent exactly; "better" is under 30 words; "why" under 12 words.
- strengths: up to 2. improvements: up to 3 short, specific actions. summary: two sentences.`;
}
function assessSchema(pack: Pack) {
  return {
    type: "object", additionalProperties: false,
    required: ["score", "outcome", "summary", "criteria", "strengths", "improvements", "better_lines"],
    properties: {
      score: { type: "integer" },
      outcome: { type: "string", enum: ["booked", "link-sent", "callback-scheduled", "transferred", "message-taken", "not-interested", "wrong-number", "no-outcome"] },
      summary: { type: "string" },
      criteria: { type: "array", items: { type: "object", additionalProperties: false, required: ["id", "result", "note"], properties: { id: { type: "string", enum: pack.criteria.map((c) => c.id) }, result: { type: "string", enum: ["met", "partial", "missed", "na"] }, note: { type: "string" } } } },
      strengths: { type: "array", items: { type: "string" } },
      improvements: { type: "array", items: { type: "string" } },
      better_lines: { type: "array", items: { type: "object", additionalProperties: false, required: ["original", "better", "why"], properties: { original: { type: "string" }, better: { type: "string" }, why: { type: "string" } } } },
    },
  };
}
const DRILL_SCHEMA = {
  type: "object", additionalProperties: false, required: ["score", "verdict", "good", "fix", "model_answer"],
  properties: { score: { type: "integer" }, verdict: { type: "string" }, good: { type: "string" }, fix: { type: "string" }, model_answer: { type: "string" } },
};

/* ---------- Usage limit + attendance ---------- */
async function bumpUsage(admin: SupabaseClient, userId: string, today: string) {
  const { data, error } = await admin.rpc("bump_ai_usage", { p_user: userId, p_day: today });
  if (error) throw new HttpError(500, "Could not record usage.");
  const { calls, daily_limit } = (data as { calls: number; daily_limit: number }[])[0];
  if (calls > daily_limit) throw new HttpError(429, `Daily AI limit reached (${daily_limit} calls). It resets at midnight.`);
}
const clampScore = (n: unknown) => Math.max(0, Math.min(100, Math.round(Number(n) || 0)));

/** Course as the browser sees it: hidden guest behaviour removed. */
function publicPack(p: Pack) {
  return {
    id: p.id, name: p.name, description: p.description, passMark: p.passMark, dailyGoal: p.dailyGoal, criteria: p.criteria, levels: p.levels,
    lessons: [
      ...p.roleplays.map((r) => ({ id: r.id, kind: "call", title: r.title, subtitle: `${r.scenario} · ${r.hotel}${r.town ? ", " + r.town : ""}`, from: r.from, minutes: 4, targets: r.targets, dir: r.dir })),
      ...p.drills.map((d) => ({ id: d.id, kind: "drill", title: d.title, subtitle: "Quick drill", from: d.from, minutes: 1, targets: d.targets })),
    ],
  };
}

/* ---------- Handler ---------- */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const userClient = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } } });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) throw new HttpError(401, "Please sign in again.");
    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: profile } = await admin.from("profiles").select("id, email, full_name, role, team").eq("id", user.id).single();
    if (!profile) throw new HttpError(403, "Your account has no profile. Ask a manager to check your sign-up.");

    const body = await req.json().catch(() => ({}));
    const today = ukToday();

    switch (body.action) {
      case "bootstrap": {
        await admin.from("attendance").upsert({ user_id: user.id, day: today, last_seen: new Date().toISOString() }, { onConflict: "user_id,day", ignoreDuplicates: false });
        return json({ profile, today, packs: Object.values(PACKS).map(publicPack), model: MODEL, aiReady: !!Deno.env.get("ANTHROPIC_API_KEY") });
      }

      case "start": {
        const pack = PACKS[String(body.pack)];
        if (!pack) throw new HttpError(400, "Unknown training pack.");
        const lessonId = String(body.lessonId ?? "");
        const lesson = findLesson(pack, lessonId);
        if (body.variantId) {
          const v = await loadVariant(admin, body.variantId, user.id);
          if (v.row.lesson_id !== lessonId) throw new HttpError(400, "That scenario belongs to another lesson.");
          return json({ variant: lesson.kind === "call" ? publicCall(lesson.t as Roleplay, v.row.data as CallVariant, today, v.row.id) : publicDrill(lesson.t as Drill, v.row.data as DrillVariant, v.row.id) });
        }
        await bumpUsage(admin, user.id, today);
        if (lesson.kind === "call") {
          const v = await createCallVariant(admin, pack, lesson.t, user.id);
          return json({ variant: publicCall(lesson.t, v.data, today, v.id) });
        }
        const v = await createDrillVariant(admin, pack, lesson.t, user.id);
        return json({ variant: publicDrill(lesson.t, v.data, v.id) });
      }

      case "guest": {
        const { row, lesson } = await loadVariant(admin, body.variantId, user.id);
        if (lesson.kind !== "call") throw new HttpError(400, "Not a practice call.");
        const turns = cleanTurns(body.turns);
        await bumpUsage(admin, user.id, today);
        const v = row.data as CallVariant;
        let text = await askText(guestSystem(lesson.t, v, today), guestMessages(v.firstLine, turns), "low");
        const ended = /\[END\]/i.test(text);
        text = text.replace(/\[END\]/gi, "").trim();
        return json({ text, ended });
      }

      case "assess": {
        const { row, pack, lesson } = await loadVariant(admin, body.variantId, user.id);
        if (lesson.kind !== "call") throw new HttpError(400, "Not a practice call.");
        const turns = cleanTurns(body.turns);
        if (!turns.some((x) => x.who === "me")) throw new HttpError(400, "Say something on the call before asking for feedback.");
        await bumpUsage(admin, user.id, today);
        const t = lesson.t, v = row.data as CallVariant;
        type Fb = { score: number; outcome: string; summary: string; criteria: { id: string; result: string; note: string }[]; strengths: string[]; improvements: string[]; better_lines: { original: string; better: string; why: string }[] };
        const fb = await askJson<Fb>(COACH_SYSTEM, assessPrompt(pack, t, v, turns, today), assessSchema(pack), "medium");
        const insert = {
          user_id: user.id, pack: pack.id, kind: "roleplay", item_id: t.id, title: t.title, score: clampScore(fb.score), level: levelOf(pack, t.id), variant_id: row.id,
          outcome: fb.outcome, summary: fb.summary, criteria: fb.criteria, strengths: fb.strengths.slice(0, 2), improvements: fb.improvements.slice(0, 3),
          better_lines: fb.better_lines.slice(0, 3), transcript: turns, targets: t.targets, day: today,
        };
        const { data, error } = await admin.from("attempts").insert(insert).select().single();
        if (error) throw new HttpError(500, "Your score was worked out but could not be saved.");
        return json({ attempt: data });
      }

      case "drill": {
        const { row, pack, lesson } = await loadVariant(admin, body.variantId, user.id);
        if (lesson.kind !== "drill") throw new HttpError(400, "Not a drill.");
        const answer = String(body.answer ?? "").trim().slice(0, 1200);
        if (!answer) throw new HttpError(400, "Type or say your answer first.");
        await bumpUsage(admin, user.id, today);
        const d = lesson.t, v = row.data as DrillVariant;
        const prompt = `A trainee is practising one moment based on a real recorded call.
Scene: ${v.context}
What the guest says: "${v.guestLine}"
What went wrong on the original real call: ${d.was}
Task: ${d.task}
Rules that apply:
${d.targets.map((x) => "- " + (pack.criteria.find((c) => c.id === x)?.tip ?? x)).join("\n")}
General: staff speak as the hotel, in warm British English, under 25 words per turn, one question at a time. They never take card details by phone and never invent facts, prices or discounts.
Trainee's answer: "${answer}"
Give a score from 0 to 100, a one-sentence verdict, what worked (under 20 words), the most important fix (under 25 words), and an ideal reply (under 35 words).`;
        type Dfb = { score: number; verdict: string; good: string; fix: string; model_answer: string };
        const fb = await askJson<Dfb>(COACH_SYSTEM, prompt, DRILL_SCHEMA, "low");
        const insert = {
          user_id: user.id, pack: pack.id, kind: "drill", item_id: d.id, title: d.title, score: clampScore(fb.score), level: levelOf(pack, d.id), variant_id: row.id,
          summary: fb.verdict, strengths: [fb.good], improvements: [fb.fix], better_lines: [{ original: answer, better: fb.model_answer, why: "" }],
          transcript: [{ who: "guest", text: v.guestLine }, { who: "me", text: answer }], targets: d.targets, day: today,
        };
        const { data, error } = await admin.from("attempts").insert(insert).select().single();
        if (error) throw new HttpError(500, "Your score was worked out but could not be saved.");
        return json({ attempt: data });
      }

      case "summary": {
        const { data: rows } = await admin.from("attempts").select("kind, title, score, summary, improvements").eq("user_id", user.id).eq("day", today).order("created_at");
        if (!rows?.length) throw new HttpError(400, "Finish at least one session today first.");
        await bumpUsage(admin, user.id, today);
        const lines = rows.map((a) => `- ${a.kind} "${a.title}": score ${a.score}. ${a.summary ?? ""} Fixes: ${(a.improvements ?? []).join(" | ")}`).join("\n");
        const note = await askText(COACH_SYSTEM,
          [{ role: "user", content: `Write today's coaching summary for the trainee, addressed to them as "you", under 120 words, in plain text with no markdown symbols (no asterisks, hashes or headings). Use this structure: one sentence on how today went; "Keep doing:" one point; "Fix next:" two points; "Practise this line tomorrow:" one exact sentence they can say on calls. Base it only on these results:\n${lines}` }],
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
