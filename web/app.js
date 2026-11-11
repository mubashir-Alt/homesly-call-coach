// Homesly Call Coach: academy web app (no build step).
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm";

const CFG = window.HOMESLY_CONFIG || {};
const $ = (s, el = document) => el.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const tone = (s) => (s >= 80 ? "good" : s >= 60 ? "warn" : "bad");
const noteHtml = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/^#+\s*/gm, "").replace(/\*\*/g, "");
const store = {
  get(k, d) { try { const v = localStorage.getItem("hcc." + k); return v === null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem("hcc." + k, JSON.stringify(v)); } catch { /* private mode */ } },
};
const reduceMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Icons ---------- */
const P = {
  home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/>',
  course: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5"/><path d="M9 7h6"/>',
  chart: '<path d="M4 20V10"/><path d="M10 20V4"/><path d="M16 20v-7"/><path d="M22 20H2"/>',
  team: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7"/><path d="M18.5 14a6.5 6.5 0 0 1 3 6"/>',
  help: '<circle cx="12" cy="12" r="9.5"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14"/><path d="M12 17.5h.01"/>',
  phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
  bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7"/>',
  mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><path d="M12 18v3"/>',
  send: '<path d="m4 12 16-8-6 16-2.5-6.5z"/>',
  end: '<path d="M3 15c5-5 13-5 18 0l-2.5 2.5-3.5-1.5v-2.5a10 10 0 0 0-6 0V16l-3.5 1.5z"/>',
  flame: '<path d="M12 3s5 4.5 5 10a5 5 0 0 1-10 0c0-2.5 1.5-4 1.5-4S9 12 11 12c0-3 1-6 1-9z"/>',
  star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
  trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H5a3 3 0 0 0 3 4"/><path d="M16 6h3a3 3 0 0 1-3 4"/><path d="M12 13v4"/><path d="M8 21h8"/><path d="M9 17h6v4H9z"/>',
  out: '<path d="M15 4h4v16h-4"/><path d="M10 8l-4 4 4 4"/><path d="M6 12h10"/>',
  arrow: '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>',
  back: '<path d="M19 12H5"/><path d="m11 6-6 6 6 6"/>',
  play: '<path d="M7 4v16l13-8z"/>',
  refresh: '<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/>',
  cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18"/><path d="M8 3v4"/><path d="M16 3v4"/>',
};
const icon = (n, cls = "i") => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n] || ""}</svg>`;
const EYE = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>';
const EYE_OFF = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.6 5.1A10.7 10.7 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-2.2 3.2M6.6 6.6A17.4 17.4 0 0 0 2 12s3.5 7 10 7a9.7 9.7 0 0 0 5.4-1.6"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/><path d="M2 2l20 20"/></svg>';
const AV_COLORS = ["#1d7480", "#a06d12", "#7a4fb3", "#2b7d4f", "#b3471e", "#2f5fae", "#8a3b6b", "#4b6b2a"];
const initials = (name) => String(name || "?").replace(/\(.*?\)/g, "").trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() || "").join("") || "?";
const avColor = (s) => { let h = 0; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return AV_COLORS[h % AV_COLORS.length]; };
const avatar = (name, seed = name) => `<span class="avatar" style="background:${avColor(seed)}">${esc(initials(name))}</span>`;

/* ---------- Dates ---------- */
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const parseKey = (k) => { const [y, m, d] = k.split("-").map(Number); return new Date(Date.UTC(y, m - 1, d)); };
const keyOf = (d) => d.toISOString().slice(0, 10);
const addDays = (k, n) => { const d = parseKey(k); d.setUTCDate(d.getUTCDate() + n); return d; };
const shortDate = (d) => `${DAYS[d.getUTCDay()].slice(0, 3)} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()].slice(0, 3)}`;
const prettyKey = (k) => shortDate(parseKey(k));
const money = (n) => "£" + (Math.round(n * 100) / 100).toFixed(2).replace(/\.00$/, "");

/* ---------- State ---------- */
const S = {
  sb: null, session: null, profile: null, today: null, packs: [], packId: "sales", aiReady: true,
  attempts: [], attendance: [], dayNote: null, view: "home", call: null, recovery: false, booted: false,
  team: { sel: null },
};
const ROUTES = ["home", "course", "progress", "team", "guide"];
const pack = () => S.packs.find((p) => p.id === S.packId) || S.packs[0];
const lessonById = (id) => pack().lessons.find((l) => l.id === id);
const crit = (id) => pack()?.criteria.find((c) => c.id === id) || { id, label: id, tip: "" };
const isManager = () => S.profile?.role === "manager";

/* ---------- Backend ---------- */
async function api(action, payload = {}) {
  const { data, error } = await S.sb.functions.invoke("coach", { body: { action, ...payload } });
  if (error) {
    let msg = "Something went wrong. Try again.";
    try { const body = await error.context.json(); if (body?.error) msg = body.error; } catch { /* network */ }
    if (error.name === "FunctionsFetchError") msg = "Can't reach the server. Check your internet connection.";
    throw new Error(msg);
  }
  return data;
}
async function loadAttempts(userId) {
  const { data, error } = await S.sb.from("attempts").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(500);
  if (error) throw new Error("Could not load results.");
  return data || [];
}
async function loadAttendance(userId) {
  const { data } = await S.sb.from("attendance").select("day").eq("user_id", userId).gte("day", keyOf(addDays(S.today, -70)));
  return (data || []).map((r) => r.day);
}
async function loadNote(userId, day) {
  const { data } = await S.sb.from("day_notes").select("note").eq("user_id", userId).eq("day", day).maybeSingle();
  return data?.note || null;
}

/* ---------- Progress maths ---------- */
function bestScores(list) {
  const b = {};
  list.forEach((a) => { if (a.pack === S.packId && (b[a.item_id] === undefined || a.score > b[a.item_id])) b[a.item_id] = a.score; });
  return b;
}
function courseState(list, managerView = isManager()) {
  const p = pack(), best = bestScores(list);
  let prevComplete = true;
  const levels = p.levels.map((lv) => {
    const passed = lv.lessons.filter((id) => (best[id] ?? -1) >= p.passMark).length;
    const complete = passed === lv.lessons.length && lv.lessons.length > 0;
    const unlocked = managerView || prevComplete;
    prevComplete = complete;
    return { ...lv, passed, complete, unlocked };
  });
  const total = levels.reduce((s, l) => s + l.lessons.length, 0);
  const passedAll = levels.reduce((s, l) => s + l.passed, 0);
  const xp = Object.values(best).reduce((s, v) => s + v, 0);
  const current = levels.find((l) => l.unlocked && !l.complete) || levels[levels.length - 1];
  let next = null;
  for (const l of levels) { if (!l.unlocked) break; const id = l.lessons.find((x) => (best[x] ?? -1) < p.passMark); if (id) { next = { level: l, lesson: lessonById(id) }; break; } }
  return { levels, best, total, passedAll, xp, current, next, reached: levels.filter((l) => l.complete).length };
}
function dayStatus(sessions, loggedIn, goal) {
  if (sessions >= goal) return "present";
  if (sessions > 0) return "partial";
  if (loggedIn) return "login";
  return "absent";
}
function attendanceMap(list, checkins) {
  const m = {};
  list.forEach((a) => { if (a.pack === S.packId) m[a.day] = (m[a.day] || 0) + 1; });
  const seen = new Set(checkins);
  return (k) => dayStatus(m[k] || 0, seen.has(k), pack().dailyGoal || 3);
}
function streak(list) {
  const days = new Set(list.map((a) => a.day));
  let k = days.has(S.today) ? S.today : keyOf(addDays(S.today, -1)), n = 0;
  while (days.has(k)) { n++; k = keyOf(addDays(k, -1)); }
  return n;
}
function ruleStats(list) {
  const per = {};
  pack().criteria.forEach((c) => (per[c.id] = { met: 0, n: 0 }));
  list.filter((a) => a.pack === S.packId).forEach((a) => {
    if (a.kind === "roleplay" && Array.isArray(a.criteria)) a.criteria.forEach((c) => { if (!per[c.id] || c.result === "na") return; per[c.id].n++; per[c.id].met += c.result === "met" ? 1 : c.result === "partial" ? 0.5 : 0; });
    if (a.kind === "drill" && a.targets) a.targets.forEach((t) => { if (per[t]) { per[t].n++; per[t].met += (a.score || 0) / 100; } });
  });
  return pack().criteria.map((c) => ({ c, pct: per[c.id].n ? Math.round((per[c.id].met / per[c.id].n) * 100) : null }));
}

/* ---------- Charts ---------- */
function ring(value, max, size, label, sub, color = "var(--accent)", track = "var(--sunk)") {
  const r = (size - 10) / 2, c = 2 * Math.PI * r, f = Math.max(0, Math.min(1, max ? value / max : 0));
  return `<div class="ring" style="width:${size}px;height:${size}px"><svg width="${size}" height="${size}" aria-hidden="true"><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${track}" stroke-width="8"/><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${color}" stroke-width="8" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - f)}"/></svg><div class="lbl"><b>${label}</b><small>${sub}</small></div></div>`;
}
function barChart(points, { height = 190, aria = "Bar chart" } = {}) {
  const W = 640, H = height, pl = 30, pr = 6, pt = 18, pb = 26, n = points.length;
  const slot = (W - pl - pr) / n, bw = Math.min(30, slot * 0.62);
  const y = (v) => pt + ((100 - v) * (H - pt - pb)) / 100;
  let s = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(aria)}">`;
  [0, 50, 80, 100].forEach((v) => (s += `<line x1="${pl}" x2="${W - pr}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line)" ${v === 80 ? 'stroke-dasharray="4 4"' : ""}/><text x="${pl - 6}" y="${y(v) + 4}" text-anchor="end">${v}</text>`));
  points.forEach((p, i) => {
    const cx = pl + slot * i + slot / 2;
    if (p.value !== null && p.value !== undefined) {
      const top = y(p.value);
      s += `<rect x="${cx - bw / 2}" y="${top}" width="${bw}" height="${Math.max(2, y(0) - top)}" rx="4" fill="var(--${tone(p.value)})"><title>${esc(p.title || p.label)}: ${p.value}</title></rect>`;
      s += `<text class="v" x="${cx}" y="${top - 5}" text-anchor="middle">${p.value}</text>`;
    }
    if (p.label) s += `<text x="${cx}" y="${H - 8}" text-anchor="middle">${esc(p.label)}</text>`;
  });
  return s + "</svg>";
}
function calendar(statusOf, weeks = 5) {
  const t = parseKey(S.today), dow = (t.getUTCDay() + 6) % 7; // Monday = 0
  const start = keyOf(addDays(S.today, -dow - (weeks - 1) * 7));
  let h = '<div class="cal">' + ["M", "T", "W", "T", "F", "S", "S"].map((d) => `<div class="h">${d}</div>`).join("");
  for (let i = 0; i < weeks * 7; i++) {
    const k = keyOf(addDays(start, i)), d = parseKey(k);
    const future = k > S.today, st = future ? "future" : statusOf(k);
    const label = { present: "Daily goal met", partial: "Practised", login: "Logged in only", absent: "No practice", future: "" }[st];
    h += `<div class="d ${st} ${k === S.today ? "today" : ""}" title="${esc(prettyKey(k))}${label ? ": " + label : ""}">${d.getUTCDate()}</div>`;
  }
  return h + "</div>";
}
const LEGEND = '<div class="legend"><span><i style="background:var(--accent)"></i>Goal met</span><span><i style="background:var(--accent-soft)"></i>Practised</span><span><i style="background:var(--brass-soft)"></i>Logged in</span><span><i style="background:var(--sunk)"></i>Absent</span></div>';

/* ---------- Boot ---------- */
async function boot() {
  if (!CFG.supabaseUrl || !CFG.supabaseAnonKey) return renderSetup();
  S.sb = createClient(CFG.supabaseUrl, CFG.supabaseAnonKey);
  S.view = ROUTES.includes(location.hash.slice(1)) ? location.hash.slice(1) : "home";
  S.sb.auth.onAuthStateChange((event, session) => {
    if (event === "PASSWORD_RECOVERY") { S.recovery = true; S.session = session; renderAuth("reset"); return; }
    const was = S.session?.user?.id;
    S.session = session;
    if (!session) { S.booted = false; S.profile = null; renderAuth("signin"); return; }
    if (!S.recovery && (!S.booted || was !== session.user.id)) startApp();
  });
  const { data } = await S.sb.auth.getSession();
  if (!data.session) renderAuth("signin");
}

async function startApp() {
  S.booted = true;
  $("#root").innerHTML = '<div class="empty" style="padding-top:20vh">Loading your academy…</div>';
  try {
    const b = await api("bootstrap");
    S.profile = b.profile; S.today = b.today; S.packs = b.packs; S.aiReady = b.aiReady;
    const mine = S.packs.find((p) => p.id === S.profile.team);
    const saved = store.get("pack", null);
    S.packId = isManager() && saved && S.packs.some((p) => p.id === saved) ? saved : mine && mine.levels.length ? mine.id : "sales";
    [S.attempts, S.attendance, S.dayNote] = await Promise.all([loadAttempts(S.profile.id), loadAttendance(S.profile.id), loadNote(S.profile.id, S.today)]);
    renderShell();
    render();
  } catch (e) {
    S.booted = false;
    $("#root").innerHTML = `<div class="page" style="padding:40px 16px"><div class="notice warn">${esc(e.message)}</div><div class="row"><button class="btn" id="retry">Try again</button><button class="btn" id="out">Sign out</button></div></div>`;
    $("#retry").onclick = startApp;
    $("#out").onclick = () => S.sb.auth.signOut();
  }
}

/* ---------- Shell ---------- */
function renderShell() {
  const nav = [["home", "home", "Home"], ["course", "course", "Course"], ["progress", "chart", "My progress"], ...(isManager() ? [["team", "team", "Team"]] : []), ["guide", "help", "How it works"]];
  const packSel = isManager() && S.packs.length > 1 ? `<div class="side-pack"><select id="packSel" aria-label="Training course">${S.packs.map((p) => `<option value="${esc(p.id)}" ${p.id === S.packId ? "selected" : ""}>${esc(p.name)}</option>`).join("")}</select></div>` : "";
  const name = S.profile.full_name || S.profile.email;
  $("#root").innerHTML = `<div class="shell"><aside class="side">
      <div class="brand"><span class="logo">${icon("phone")}</span><div><b>Homesly Academy</b><small>Call Coach</small></div></div>
      <nav class="nav" id="nav">${nav.map(([v, ic, l]) => `<a href="#${v}" data-view="${v}">${icon(ic)}<span>${l}</span></a>`).join("")}</nav>
      <div class="grow"></div>${packSel}
      <div class="me">${avatar(name, S.profile.id)}<div><b>${esc(name)}</b><small>${esc(S.profile.role)} · ${esc(S.profile.team === "support" ? "Support" : "Sales")}</small></div><button id="signout" title="Sign out" aria-label="Sign out">${icon("out")}</button></div>
    </aside><main class="main"><div class="page" id="app"></div></main></div>`;
  $("#nav").addEventListener("click", (e) => { const a = e.target.closest("a[data-view]"); if (!a) return; e.preventDefault(); go(a.dataset.view); });
  $("#signout").onclick = () => { stopVoice(); S.sb.auth.signOut(); };
  const ps = $("#packSel");
  if (ps) ps.onchange = () => { S.packId = ps.value; store.set("pack", ps.value); go(S.view); };
}
function go(v) {
  if (!ROUTES.includes(v) || (v === "team" && !isManager())) v = "home";
  stopVoice(); stopTimer(); S.call = null; S.view = v;
  try { history.replaceState(null, "", "#" + v); } catch { /* ignore */ }
  window.scrollTo(0, 0);
  render();
}
window.addEventListener("hashchange", () => { const h = location.hash.slice(1); if (S.profile && ROUTES.includes(h) && h !== S.view) go(h); });

function render() {
  if (!S.profile) return;
  document.querySelectorAll("#nav a").forEach((a) => a.setAttribute("aria-current", a.dataset.view === S.view && !S.call ? "page" : "false"));
  const app = $("#app");
  try {
    if (!pack().levels.length && S.view !== "team" && S.view !== "guide") {
      app.innerHTML = `<div class="card empty"><h2 style="font-size:22px;margin-bottom:6px">${esc(pack().name)}</h2>This course has no lessons yet. They will appear here once the knowledge base is added (<code>supabase/functions/_shared/packs/${esc(pack().id)}.ts</code>).</div>`;
      return;
    }
    if (S.call) return renderPlayer(app);
    if (S.view === "course") return renderCourse(app);
    if (S.view === "progress") return renderProgress(app, S.attempts, S.attendance, "My progress");
    if (S.view === "team") return renderTeam(app);
    if (S.view === "guide") return renderGuide(app);
    renderHome(app);
  } catch (e) {
    console.error(e);
    app.innerHTML = '<div class="notice warn">This page could not be shown. Reload; if it keeps happening, tell your manager.</div>';
  }
}

/* ---------- Setup + auth ---------- */
function renderSetup() {
  $("#root").innerHTML = `<div class="page setup" style="max-width:640px;padding:12vh 16px"><p class="eyebrow">Almost ready</p><h1>Homesly Call Coach</h1>
  <div class="card" style="margin-top:16px"><p>The website is live, but it isn't connected to its backend yet. Finish the setup in <strong>SETUP.md</strong> in the GitHub repository (Supabase project, repository secrets and variables, then run Deploy).</p></div></div>`;
}
const pwField = (id, label, auto, min) => `<div class="field"><label for="${id}">${label}</label><div class="pw"><input id="${id}" type="password" autocomplete="${auto}" ${min ? `minlength="${min}"` : ""} required><button type="button" class="eye" data-eye="${id}" aria-label="Show password" aria-pressed="false">${EYE}</button></div></div>`;
function bindEyes(root) {
  root.querySelectorAll("[data-eye]").forEach((b) => (b.onclick = () => {
    const input = document.getElementById(b.dataset.eye), show = input.type === "password";
    input.type = show ? "text" : "password";
    b.innerHTML = show ? EYE_OFF : EYE;
    b.setAttribute("aria-label", show ? "Hide password" : "Show password");
    b.setAttribute("aria-pressed", String(show));
    input.focus();
  }));
}
function renderAuth(mode) {
  const art = `<div class="auth-art"><div><p class="eyebrow">Homesly Academy</p><h1>Practise the call before it's real.</h1><p>AI guests built from real Homesly calls. Six levels, a fresh scenario every time, and instant coaching on every line you say.</p>
    <ul><li>${icon("phone")}Talk to realistic AI guests, out loud</li><li>${icon("star")}Unlock six levels, from openings to complaints</li><li>${icon("chart")}See your scores, streak and attendance</li></ul></div><p class="muted" style="color:#84999f;font-size:13px">For Homesly staff only. Sign in with your company email.</p></div>`;
  let form;
  if (mode === "reset") {
    form = `<h2 style="font-size:24px;margin-bottom:14px">Set a new password</h2><form id="f">${pwField("pw", "New password (8+ characters)", "new-password", 8)}<button class="btn primary lg" type="submit" style="width:100%">Save password</button><p class="msg" id="m"></p></form>`;
  } else {
    const tabs = `<div class="seg" role="group"><button type="button" data-m="signin" aria-pressed="${mode === "signin"}">Sign in</button><button type="button" data-m="signup" aria-pressed="${mode === "signup"}">Create account</button></div>`;
    form = mode === "signin"
      ? `<h2 style="font-size:24px;margin-bottom:14px">Welcome back</h2>${tabs}<form id="f"><div class="field"><label for="em">Work email</label><input id="em" type="email" autocomplete="email" required></div>${pwField("pw", "Password", "current-password")}<button class="btn primary lg" type="submit" style="width:100%">Sign in</button><p class="msg"><button type="button" class="linkbtn" id="forgot">Forgot password?</button></p><p class="msg" id="m"></p></form>`
      : `<h2 style="font-size:24px;margin-bottom:14px">Join the academy</h2>${tabs}<form id="f"><div class="field"><label for="fn">Your name</label><input id="fn" autocomplete="name" required></div><div class="field"><label for="em">Work email (@homeslystays.com)</label><input id="em" type="email" autocomplete="email" required></div>${pwField("pw", "Password (8+ characters)", "new-password", 8)}<button class="btn primary lg" type="submit" style="width:100%">Create account</button><p class="msg" id="m"></p></form>`;
  }
  $("#root").innerHTML = `<div class="auth-wrap">${art}<div class="auth-form"><div class="card">${form}</div></div></div>`;
  const root = $("#root");
  root.querySelectorAll("[data-m]").forEach((b) => (b.onclick = () => renderAuth(b.dataset.m)));
  bindEyes(root);
  const m = $("#m"), say = (t, ok) => { m.className = "msg " + (ok ? "ok" : "err"); m.textContent = t; };
  $("#f").onsubmit = async (e) => {
    e.preventDefault();
    const btn = $("#f button[type=submit]"); btn.disabled = true;
    try {
      if (mode === "reset") {
        const { error } = await S.sb.auth.updateUser({ password: $("#pw").value });
        if (error) return say(error.message);
        S.recovery = false; history.replaceState(null, "", location.pathname + "#home"); startApp(); return;
      }
      const email = $("#em").value.trim(), password = $("#pw").value;
      if (mode === "signin") {
        const { error } = await S.sb.auth.signInWithPassword({ email, password });
        if (error) say(error.message === "Invalid login credentials" ? "Email or password is wrong." : error.message);
      } else {
        const { data, error } = await S.sb.auth.signUp({ email, password, options: { data: { full_name: $("#fn").value.trim() }, emailRedirectTo: location.origin + location.pathname } });
        if (error) say(/database error|company email/i.test(error.message) ? "Use your company email address (@homeslystays.com)." : error.message);
        else if (!data.session) say("Account created. Check your email for the confirmation link, then sign in.", true);
      }
    } finally { btn.disabled = false; }
  };
  const fg = $("#forgot");
  if (fg) fg.onclick = async () => {
    const email = $("#em").value.trim();
    if (!email) return say("Enter your work email first.");
    const { error } = await S.sb.auth.resetPasswordForEmail(email, { redirectTo: location.origin + location.pathname });
    say(error ? error.message : "If that email has an account, a reset link is on its way.", !error);
  };
}

/* ---------- Home ---------- */
function renderHome(app) {
  const p = pack(), cs = courseState(S.attempts);
  const todays = S.attempts.filter((a) => a.day === S.today && a.pack === p.id);
  const goal = p.dailyGoal || 3;
  const first = (S.profile.full_name || "").split(" ")[0];
  const hour = Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", hour: "numeric", hour12: false }).format(new Date()));
  const hello = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const statusOf = attendanceMap(S.attempts, S.attendance);
  const days = []; for (let i = 13; i >= 0; i--) days.push(keyOf(addDays(S.today, -i)));
  const pts = days.map((k) => { const xs = S.attempts.filter((a) => a.day === k && a.pack === p.id); return { label: i14(k), value: xs.length ? Math.round(xs.reduce((s, a) => s + a.score, 0) / xs.length) : null, title: prettyKey(k) }; });
  const n = cs.levels.length, doneCount = cs.levels.filter((l) => l.complete).length;
  const fillPct = n > 1 ? Math.min(doneCount, n - 1) / (n - 1) : 0;
  const nx = cs.next;
  let html = "";
  if (!S.aiReady) html += '<div class="notice warn">The AI isn\'t connected yet (ANTHROPIC_API_KEY missing). A manager needs to finish SETUP.md.</div>';
  html += `<section class="hero"><div><p class="eyebrow">${esc(p.name)} · ${esc(prettyKey(S.today))}</p><h1>${esc(hello)}${first ? ", " + esc(first) : ""}.</h1>
      <p>${todays.length >= goal ? "Daily goal done. Keep going if you like, or come back tomorrow to keep your streak." : `Complete ${goal - Math.min(goal, todays.length)} more session${goal - todays.length === 1 ? "" : "s"} today to hit your daily goal.`}</p></div>
    <div class="hero-stats">${ring(Math.min(todays.length, goal), goal, 96, `${todays.length}/${goal}`, "today", "#e3b866", "rgba(255,255,255,.12)")}
      <div class="stat-mini"><b>${streak(S.attempts)}</b><span>day streak</span></div>
      <div class="stat-mini"><b>${cs.xp}</b><span>XP</span></div>
      <div class="stat-mini"><b>${cs.passedAll}/${cs.total}</b><span>lessons passed</span></div></div></section>`;
  if (nx) {
    const l = nx.lesson;
    html += `<section class="card continue"><span class="lesson-ico ${l.kind === "drill" ? "drill" : ""}">${icon(l.kind === "drill" ? "bolt" : "phone")}</span>
      <div><p class="eyebrow" style="margin:0">Continue · Level ${nx.level.id}: ${esc(nx.level.title)}</p><h2>${esc(l.title)}</h2><p class="muted" style="margin:0">${esc(l.kind === "drill" ? "Quick drill · about 1 minute" : l.subtitle + " · about 4 minutes")}</p></div>
      <button class="btn primary lg" data-start="${esc(l.id)}">${icon("play")}Start lesson</button></section>`;
  } else {
    html += `<section class="card continue"><span class="lesson-ico drill">${icon("trophy")}</span><div><p class="eyebrow" style="margin:0">Course complete</p><h2>You've passed every lesson.</h2><p class="muted" style="margin:0">Keep your skills sharp: every replay is a brand-new scenario.</p></div><button class="btn primary lg" data-go="course">Open course</button></section>`;
  }
  html += `<section class="card"><div class="card-head"><h3>Your path</h3><span class="chip brass">${icon("star")}${cs.reached} of ${n} badges</span></div>
    <div class="path" style="--n:${n}"><span class="fill" style="width:calc((100% - 100% / ${n}) * ${fillPct})"></span>${cs.levels.map((l) => `<div class="step ${l.complete ? "done" : l === cs.current && l.unlocked ? "current" : ""}"><span class="dot">${l.complete ? icon("check") : l.unlocked ? l.id : icon("lock")}</span><b>${esc(l.title)}</b><small>${l.passed}/${l.lessons.length} passed</small></div>`).join("")}</div></section>`;
  html += `<div class="grid2"><section class="card"><div class="card-head"><h3>Your scores, last 14 days</h3><span class="muted" style="font-size:12.5px">Dashed line = 80</span></div>${barChart(pts, { aria: "Daily average score, last 14 days" })}</section>
    <section class="card"><div class="card-head"><h3>Attendance</h3><span class="muted" style="font-size:12.5px">Goal: ${goal} sessions a day</span></div>${calendar(statusOf)}${LEGEND}</section></div>`;
  if (todays.length) html += `<section class="card"><h3>Today's coaching summary</h3>${S.dayNote ? `<p style="white-space:pre-wrap;margin:0">${noteHtml(S.dayNote)}</p>` : `<p class="muted" style="margin:0 0 10px">A short summary of today: what improved, what to fix, and one line to practise tomorrow.</p><button class="btn" id="gennote">Write today's summary</button><p class="msg" id="notemsg"></p>`}</section>`;
  app.innerHTML = html;
  bindStarts(app);
  const gn = $("#gennote");
  if (gn) gn.onclick = async () => {
    gn.disabled = true; $("#notemsg").className = "msg"; $("#notemsg").textContent = "Writing your summary…";
    try { const r = await api("summary"); S.dayNote = r.note; render(); }
    catch (e) { gn.disabled = false; $("#notemsg").className = "msg err"; $("#notemsg").textContent = e.message; }
  };
}
const i14 = (k) => { const d = parseKey(k); return k === S.today ? "Today" : `${d.getUTCDate()}`; };
function bindStarts(root) {
  root.querySelectorAll("[data-start]").forEach((b) => (b.onclick = () => startLesson(b.dataset.start, b.dataset.variant || null)));
  root.querySelectorAll("[data-go]").forEach((b) => (b.onclick = () => go(b.dataset.go)));
}

/* ---------- Course ---------- */
function renderCourse(app) {
  const p = pack(), cs = courseState(S.attempts);
  const pct = cs.total ? Math.round((cs.passedAll / cs.total) * 100) : 0;
  let html = `<div class="course-head"><div><p class="eyebrow">Course</p><h1>${esc(p.name)}</h1><p class="muted" style="margin:6px 0 0;max-width:62ch">${esc(p.description)} Pass a lesson with ${p.passMark}+ to move on. Every attempt is a fresh scenario made just for you.</p></div>
    <div style="min-width:240px"><div class="row" style="justify-content:space-between;font-size:13px;margin-bottom:6px"><span class="muted">${cs.passedAll} of ${cs.total} lessons passed</span><b>${pct}%</b></div><div class="bar"><i style="width:${pct}%"></i></div></div></div>`;
  html += cs.levels.map((l) => {
    const lp = l.lessons.length ? Math.round((l.passed / l.lessons.length) * 100) : 0;
    const state = l.complete ? `<span class="chip good">${icon("check")}Badge earned: ${esc(l.badge)}</span>` : l.unlocked ? `<span class="chip acc">In progress</span>` : `<span class="chip">${icon("lock")}Pass Level ${l.id - 1} to unlock</span>`;
    const rows = l.lessons.map((id) => {
      const ls = lessonById(id); if (!ls) return "";
      const b = cs.best[id], passed = (b ?? -1) >= p.passMark;
      const scoreChip = b === undefined ? "" : `<span class="chip ${passed ? "good" : tone(b)}">${passed ? icon("check") : ""}Best ${b}</span>`;
      const btn = !l.unlocked ? `<span class="chip">${icon("lock")}Locked</span>` : `<button class="btn ${b === undefined ? "primary" : ""} small" data-start="${esc(id)}">${b === undefined ? "Start" : "Practise again"}</button>`;
      return `<div class="lesson"><span class="lesson-ico ${ls.kind === "drill" ? "drill" : ""}">${icon(ls.kind === "drill" ? "bolt" : "phone")}</span>
        <div><h4>${esc(ls.title)}</h4><p>${esc(ls.kind === "drill" ? "Quick drill · " + ls.from : ls.subtitle)} · ${ls.minutes} min</p><div class="tags">${ls.targets.slice(0, 3).map((t) => `<span class="chip">${esc(crit(t).label)}</span>`).join("")}</div></div>
        <div>${scoreChip}</div><div>${btn}</div></div>`;
    }).join("");
    return `<section class="card level ${l.complete ? "complete" : ""} ${l.unlocked ? "unlocked" : "locked"}"><div class="level-head"><span class="level-no">${l.complete ? icon("check") : l.id}</span>
      <div><p class="eyebrow" style="margin:0 0 4px">Level ${l.id} · Badge: ${esc(l.badge)}</p><h2>${esc(l.title)}</h2><p>${esc(l.summary)}</p><div class="level-meta"><div class="bar"><i style="width:${lp}%"></i></div><span>${l.passed}/${l.lessons.length} passed</span></div></div>
      <div>${state}</div></div><div class="lessons">${rows}</div></section>`;
  }).join("");
  app.innerHTML = html;
  bindStarts(app);
}

/* ---------- Voice (browser speech) ---------- */
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
const voice = { rec: null, on: false, sendTimer: null, speaking: false };
function pickVoice(gender) {
  const all = (window.speechSynthesis?.getVoices() || []).filter((v) => /^en[-_]GB/i.test(v.lang));
  const re = gender === "male" ? /\b(male|ryan|george|thomas|daniel|oliver|arthur|harry|james|brian|alfie)\b/i : /\b(female|libby|sonia|maisie|hazel|susan|kate|serena|martha|emily|amy|fiona|stephanie)\b/i;
  return all.find((v) => re.test(v.name)) || all[0] || null;
}
function setEq(on) { voice.speaking = on; const e = $("#eq"); if (e) e.classList.toggle("on", on); }
function speak(text, gender) {
  return new Promise((resolve) => {
    if (!window.speechSynthesis || !S.call?.speakOn) return resolve();
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const v = pickVoice(gender); if (v) u.voice = v;
    u.lang = "en-GB"; u.rate = 1.02;
    u.onstart = () => setEq(true);
    u.onend = u.onerror = () => { setEq(false); resolve(); };
    speechSynthesis.speak(u);
  });
}
function startListening() {
  if (!SR || voice.on || !S.call || S.call.busy || S.call.ended || S.call.result) return;
  const rec = new SR();
  rec.lang = "en-GB"; rec.interimResults = true; rec.continuous = true;
  rec.onresult = (e) => {
    let interim = "";
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const r = e.results[i];
      if (r.isFinal) { const box = $("#say"); if (box) box.value = (box.value ? box.value.trimEnd() + " " : "") + r[0].transcript.trim(); }
      else interim += r[0].transcript;
    }
    const p = $("#partial"); if (p) p.textContent = interim;
    clearTimeout(voice.sendTimer);
    if (S.call?.handsFree) voice.sendTimer = setTimeout(() => { if ($("#say")?.value.trim() && !interim) { stopListening(); send(); } }, 1600);
  };
  rec.onerror = (e) => { if ((e.error === "not-allowed" || e.error === "service-not-allowed") && S.call) { S.call.micBlocked = true; updateMic(); } };
  rec.onend = () => { voice.rec = null; voice.on = false; updateMic(); };
  try { rec.start(); voice.rec = rec; voice.on = true; } catch { voice.on = false; }
  updateMic();
}
function stopListening() { clearTimeout(voice.sendTimer); try { voice.rec && voice.rec.stop(); } catch { /* ignore */ } voice.on = false; updateMic(); }
function stopVoice() { stopListening(); try { window.speechSynthesis?.cancel(); } catch { /* ignore */ } setEq(false); }
function updateMic() {
  const b = $("#mic"); if (!b) return;
  b.classList.toggle("on", voice.on);
  b.setAttribute("aria-label", voice.on ? "Stop listening" : "Speak");
  b.title = voice.on ? "Stop listening" : "Speak";
  const l = $("#listening"); if (l) l.hidden = !voice.on;
  const n = $("#micnote"); if (n && S.call?.micBlocked) { n.hidden = false; n.textContent = "The browser blocked the microphone. Click the padlock in the address bar, allow the microphone, then try again."; }
}
let timerId = null;
function startTimer() {
  stopTimer();
  timerId = setInterval(() => {
    const c = S.call, t = $("#timer");
    if (!c || !c.startedAt || !t) return;
    const s = Math.floor((Date.now() - c.startedAt) / 1000);
    t.textContent = `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  }, 1000);
}
function stopTimer() { clearInterval(timerId); timerId = null; }

/* ---------- Lesson player ---------- */
async function startLesson(lessonId, variantId) {
  const ls = lessonById(lessonId); if (!ls) return;
  stopVoice(); stopTimer();
  S.call = { lesson: ls, kind: ls.kind, variant: null, turns: [], busy: true, connecting: true, ended: false, result: null, err: "", tab: "brief", speakOn: store.get("speak", true), handsFree: store.get("handsFree", true) };
  const c = S.call;
  window.scrollTo(0, 0);
  render();
  try {
    const r = await api("start", { pack: S.packId, lessonId, variantId });
    if (S.call !== c) return;
    c.variant = r.variant; c.connecting = false; c.busy = false; c.startedAt = Date.now();
    if (c.kind === "call") {
      c.turns.push({ who: "guest", text: c.variant.firstLine });
      render(); startTimer();
      await speak(c.variant.firstLine, c.variant.voice);
      if (S.call === c && c.handsFree) startListening();
    } else {
      render();
      await speak(c.variant.guestLine, "female");
      if (S.call === c && c.handsFree) startListening();
    }
  } catch (e) { if (S.call !== c) return; c.connecting = false; c.busy = false; c.err = e.message; render(); }
}
async function guestTurn() {
  const c = S.call; c.busy = true; c.err = ""; render();
  try {
    const r = await api("guest", { variantId: c.variant.variantId, turns: c.turns });
    if (S.call !== c) return;
    if (r.text) c.turns.push({ who: "guest", text: r.text });
    c.ended = !!r.ended; c.busy = false; render();
    if (r.text) await speak(r.text, c.variant.voice);
    if (S.call === c && c.handsFree && !c.ended) startListening();
  } catch (e) { if (S.call !== c) return; c.busy = false; c.err = e.message; render(); }
}
function send() {
  const c = S.call, box = $("#say");
  const text = (box?.value || "").trim();
  if (!c || !text || c.busy || !c.variant) return;
  stopListening();
  try { window.speechSynthesis?.cancel(); } catch { /* ignore */ }
  c.turns.push({ who: "me", text }); box.value = "";
  if (c.kind === "call") guestTurn(); else scoreDrill(text);
}
async function scoreCall() {
  const c = S.call; stopVoice(); stopTimer();
  c.busy = true; c.scoring = true; c.err = ""; render();
  try {
    const r = await api("assess", { variantId: c.variant.variantId, turns: c.turns });
    if (S.call !== c) return;
    c.result = r.attempt; S.attempts.unshift(r.attempt); S.dayNote = null;
  } catch (e) { if (S.call === c) c.err = e.message; }
  if (S.call === c) { c.busy = false; c.scoring = false; render(); }
}
async function scoreDrill(answer) {
  const c = S.call; c.busy = true; c.err = ""; render();
  try {
    const r = await api("drill", { variantId: c.variant.variantId, answer });
    if (S.call !== c) return;
    c.result = r.attempt; S.attempts.unshift(r.attempt); S.dayNote = null;
  } catch (e) { if (S.call !== c) return; c.err = e.message; c.turns.pop(); setTimeout(() => { const b = $("#say"); if (b) b.value = answer; }); }
  if (S.call === c) { c.busy = false; render(); }
}
function nextLessonAfter(id) {
  const cs = courseState(S.attempts); const order = cs.levels.filter((l) => l.unlocked).flatMap((l) => l.lessons);
  const i = order.indexOf(id); return order.slice(i + 1).find((x) => (cs.best[x] ?? -1) < pack().passMark) || null;
}

function renderPlayer(app) {
  const c = S.call, ls = c.lesson, v = c.variant;
  const level = pack().levels.find((l) => l.lessons.includes(ls.id));
  const crumbs = `<div class="crumbs"><button class="btn ghost small" id="back">${icon("back")}Back</button><span>Level ${level?.id}: ${esc(level?.title || "")}</span><span>·</span><b style="color:var(--ink)">${esc(ls.title)}</b></div>`;
  let left = "", right = "";
  if (c.connecting || !v) {
    right = `<div class="card callcard"><div class="thread"><div class="connecting"><span class="pulse">${icon(c.kind === "drill" ? "bolt" : "phone")}</span><b>${c.err ? "Couldn't start" : c.kind === "drill" ? "Preparing your drill…" : "Connecting your call…"}</b><span>${c.err ? esc(c.err) : "Creating a scenario just for you. No colleague gets this exact one."}</span>${c.err ? `<button class="btn primary" id="retryStart">${icon("refresh")}Try again</button>` : ""}</div></div></div>`;
    left = `<div class="card"><p class="eyebrow">${ls.kind === "drill" ? "Quick drill" : "Practice call"}</p><h2 style="font-size:22px">${esc(ls.title)}</h2><p class="muted">${esc(ls.kind === "drill" ? ls.from : ls.subtitle)}</p><h3 style="margin-top:14px">What you're practising</h3><ul class="rules">${ls.targets.map((t) => `<li><b>${esc(crit(t).label)}:</b> ${esc(crit(t).tip)}</li>`).join("")}</ul></div>`;
    app.innerHTML = crumbs + `<div class="player"><div>${left}</div><div>${right}</div></div>`;
    $("#back").onclick = () => go(S.view);
    const rs = $("#retryStart"); if (rs) rs.onclick = () => startLesson(ls.id, null);
    return;
  }
  if (c.kind === "call") {
    const tabs = [["brief", "Brief"], ["system", "Live system"], ["rules", "Scoring"]];
    let body = "";
    if (c.tab === "brief") body = `<div class="brief"><p class="eyebrow">${esc(v.scenario)} · ${v.dir === "out" ? "You called them" : "They called you"}</p><h2 style="font-size:20px">${esc(v.title)}</h2>
      <p><b>${esc(v.hotel)}${v.town ? ", " + esc(v.town) : ""}</b></p><p>${v.dir === "out" ? `You're calling <b>${esc(v.guest)}</b>, who started a booking on the website but didn't finish. They've just picked up.` : `<b>${esc(v.guest)}</b> is calling the hotel.`}</p>
      ${v.nights ? `<p class="muted">Enquiry: ${esc(v.arriveText)}, ${v.nights} night${v.nights > 1 ? "s" : ""}, ${v.adults} adult${v.adults > 1 ? "s" : ""}${v.children.length ? ", child aged " + v.children.join(", ") : ""}.</p>` : ""}
      <p class="muted" style="font-size:13px">Based on: ${esc(v.from)}</p></div>`;
    if (c.tab === "system") body = `<div class="sys">${rateLines(v).map((l) => `<div>${esc(l)}</div>`).join("")}${Object.keys(v.kb).length ? '<div class="k">— knowledge base —</div>' + Object.entries(v.kb).map(([k, x]) => `<div><span class="k">${esc(k)}:</span> ${esc(x)}</div>`).join("") : ""}</div><p class="muted" style="font-size:12.5px;margin:10px 0 0">Practice values for this scenario only. Quote only what's here; if a fact isn't here, say you'll check with the team.</p>`;
    if (c.tab === "rules") body = `<ul class="rules">${pack().criteria.map((x) => `<li${v.targets.includes(x.id) ? ' style="font-weight:600"' : ""}>${esc(x.label)}: ${esc(x.tip)}</li>`).join("")}</ul><p class="muted" style="font-size:12.5px">Bold = the focus of this lesson.</p>`;
    left = `<div class="card"><div class="tabs" role="tablist">${tabs.map(([k, l]) => `<button role="tab" data-tab="${k}" aria-selected="${c.tab === k}">${l}</button>`).join("")}</div>${body}</div>`;
    const thread = c.turns.map((t) => `<div class="bubble ${t.who === "me" ? "me" : "guest"}"><span class="who2">${t.who === "me" ? "You" : esc(v.guest.split(" (")[0])}</span>${esc(t.text)}</div>`).join("");
    const myTurns = c.turns.filter((t) => t.who === "me").length;
    if (c.result) {
      right = resultCard(c.result, ls.id, v.variantId) + `<details class="card"><summary style="cursor:pointer;font-weight:600">Call transcript</summary><div class="thread" style="margin-top:12px;border-radius:10px">${thread}</div></details>`;
    } else {
      const status = c.scoring ? "Scoring your call…" : c.ended ? "Call ended" : c.busy ? `${esc(v.guest.split(" (")[0])} is talking…` : voice.on ? "Listening…" : "On call";
      right = `<div class="card callcard"><div class="callbar">${avatar(v.guest, v.guest)}<div class="who"><b>${esc(v.guest.split(" (")[0])}</b><small>${status} · ${esc(v.hotel)}</small></div><span class="eq" id="eq" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span class="timer" id="timer">00:00</span></div>
        <div class="thread" id="thread">${thread}${c.busy && !c.scoring ? '<div class="typing">…</div>' : ""}${c.scoring ? '<div class="typing">Scoring your call against the Core Rules. This can take up to a minute.</div>' : ""}${c.ended && !c.scoring ? '<div class="typing">The guest has ended the call. Press "End call & get feedback".</div>' : ""}</div>
        ${c.err ? `<div class="notice warn" style="margin:0 20px 10px">${esc(c.err)}</div>` : ""}
        <div class="compose">
          ${c.ended ? "" : `<textarea id="say" placeholder="Your reply… (speak or type)" ${c.busy ? "disabled" : ""}></textarea><div class="row"><span id="listening" class="listening" hidden>Listening</span><span id="partial" class="muted" style="font-size:13px"></span></div><p id="micnote" class="msg err" hidden></p>`}
          <div class="row">
            ${!c.ended && SR ? `<button class="btn micbtn" id="mic" ${c.busy ? "disabled" : ""} aria-label="Speak">${icon("mic")}</button>` : ""}
            ${c.ended ? "" : `<button class="btn primary" id="send" ${c.busy ? "disabled" : ""}>${icon("send")}Send</button>`}
            <span class="grow"></span>
            <button class="btn danger" id="end" ${c.busy || myTurns < 1 ? "disabled" : ""}>${icon("end")}End call &amp; get feedback</button>
          </div>
          <div class="toggles">${window.speechSynthesis ? `<label class="tog"><input type="checkbox" id="speakT" ${c.speakOn ? "checked" : ""}> Guest speaks aloud</label>` : ""}${SR ? `<label class="tog"><input type="checkbox" id="handsT" ${c.handsFree ? "checked" : ""}> Hands-free (mic opens after the guest, sends when you pause)</label>` : '<span class="muted" style="font-size:12.5px">Voice input needs Chrome or Edge. On Windows, Windows key + H dictates into the box.</span>'}</div>
        </div></div>`;
    }
  } else {
    left = `<div class="card"><p class="eyebrow">Quick drill · ${esc(v.from)}</p><h2 style="font-size:20px">${esc(v.title)}</h2><p><b>On the real call:</b> <span class="muted">${esc(v.was)}</span></p><h3 style="margin-top:14px">Rules for this one</h3><ul class="rules">${v.targets.map((t) => `<li>${esc(crit(t).tip)}</li>`).join("")}</ul></div>`;
    if (c.result) right = resultCard(c.result, ls.id, v.variantId);
    else right = `<div class="card drillcard"><div class="scene"><p class="eyebrow" style="margin:0">The scene</p><p style="margin:4px 0 0">${esc(v.context)}</p></div>
      <p class="eyebrow" style="margin:0">The guest says</p><p class="guestline">“${esc(v.guestLine)}”</p><p class="muted" style="margin:10px 0 14px"><b>Your task:</b> ${esc(v.task)}</p>
      ${c.err ? `<div class="notice warn">${esc(c.err)}</div>` : ""}
      <div class="compose" style="padding:0;border:0"><textarea id="say" placeholder="Say or type exactly what you'd say…" ${c.busy ? "disabled" : ""}></textarea><div class="row"><span id="listening" class="listening" hidden>Listening</span><span id="partial" class="muted" style="font-size:13px"></span></div><p id="micnote" class="msg err" hidden></p>
      <div class="row">${SR ? `<button class="btn micbtn" id="mic" ${c.busy ? "disabled" : ""} aria-label="Speak">${icon("mic")}</button>` : ""}<button class="btn primary" id="send" ${c.busy ? "disabled" : ""}>${c.busy ? "Checking…" : "Check my answer"}</button><span class="grow"></span><span id="eq" class="eq" aria-hidden="true" style="display:none"><i></i></span></div></div></div>`;
  }
  app.innerHTML = crumbs + `<div class="player"><div>${left}</div><div>${right}</div></div>`;
  $("#back").onclick = () => go(S.view);
  app.querySelectorAll("[data-tab]").forEach((b) => (b.onclick = () => { c.tab = b.dataset.tab; render(); }));
  const say = $("#say");
  if (say) { say.onkeydown = (e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); send(); } }; if (!c.busy && !voice.on && !reduceMotion()) say.focus({ preventScroll: true }); }
  const on = (id, fn) => { const el = $("#" + id); if (el) el.onclick = fn; };
  on("send", send); on("end", scoreCall);
  on("mic", () => { if (voice.on) stopListening(); else { try { window.speechSynthesis?.cancel(); } catch { /* ignore */ } setEq(false); startListening(); } });
  const st = $("#speakT"); if (st) st.onchange = () => { c.speakOn = st.checked; store.set("speak", st.checked); if (!st.checked) { window.speechSynthesis?.cancel(); setEq(false); } };
  const hf = $("#handsT"); if (hf) hf.onchange = () => { c.handsFree = hf.checked; store.set("handsFree", hf.checked); };
  bindStarts(app);
  const th = $("#thread"); if (th) th.lastElementChild?.scrollIntoView({ block: "nearest" });
  setEq(voice.speaking); updateMic();
}
function rateLines(v) {
  if (!v.rates.length) return ["(no booking on this call)"];
  return v.rates.map((x) => `${x.room}: ${money(x.perNight)}/night × ${v.nights} = ${money(x.perNight * v.nights)} total, ${x.breakfast ? "breakfast included" : "room only"}\n  ${x.cancel}`)
    .concat([`Dates: ${v.arriveText} → ${v.departText} (${v.nights} night${v.nights > 1 ? "s" : ""})`]);
}
function resultChip(r) { return r === "met" ? '<span class="chip good">Met</span>' : r === "partial" ? '<span class="chip warn">Partly</span>' : r === "missed" ? '<span class="chip bad">Missed</span>' : '<span class="chip">N/A</span>'; }
function resultCard(a, lessonId, variantId) {
  const passMark = pack().passMark, passed = a.score >= passMark;
  const nxt = nextLessonAfter(lessonId);
  const actions = `<div class="row" style="margin-top:16px">${nxt && passed ? `<button class="btn primary" data-start="${esc(nxt)}">${icon("arrow")}Next lesson</button>` : ""}
    <button class="btn ${passed ? "" : "primary"}" data-start="${esc(lessonId)}">${icon("refresh")}New scenario</button>
    <button class="btn" data-start="${esc(lessonId)}" data-variant="${esc(variantId)}">Retry same scenario</button><button class="btn ghost" data-go="course">Back to course</button></div>`;
  return `<div class="card">${feedbackHtml(a, passed, passMark)}${actions}</div>`;
}
function feedbackHtml(a, passed = a.score >= pack().passMark, passMark = pack().passMark) {
  const lines = (a.better_lines || []).filter((b) => b.better);
  const top = `<div class="result-top">${ring(a.score, 100, 104, a.score, "score", `var(--${tone(a.score)})`)}<div style="min-width:0;flex:1"><span class="passbadge" style="color:var(--${passed ? "good" : "warn"})">${icon(passed ? "check" : "refresh")}${passed ? "Lesson passed" : `Not passed yet (${passMark} needed)`}</span>${a.outcome ? ` <span class="chip">${esc(a.outcome)}</span>` : ""}<p style="margin:8px 0 0">${esc(a.summary)}</p></div></div>`;
  if (a.kind === "drill") {
    return top + `<div class="grid2" style="margin-top:16px"><div><h3>What worked</h3><p style="margin:0">${esc((a.strengths || [])[0])}</p></div><div><h3>Fix</h3><p style="margin:0">${esc((a.improvements || [])[0])}</p></div></div>
      ${lines[0] ? `<div class="better"><small class="muted">A strong answer</small><div class="now">${esc(lines[0].better)}</div></div>` : ""}`;
  }
  const order = { missed: 0, partial: 1, met: 2, na: 3 };
  const cr = [...(a.criteria || [])].sort((x, y) => order[x.result] - order[y.result]);
  return top + `${lines.length ? '<h3 style="margin-top:18px">Say it better</h3>' + lines.map((b) => `<div class="better"><div class="was">${esc(b.original)}</div><div class="now">${esc(b.better)}</div>${b.why ? `<small class="muted">${esc(b.why)}</small>` : ""}</div>`).join("") : ""}
    <div class="grid2" style="margin-top:14px"><div><h3>Keep doing</h3><ul class="tight">${(a.strengths || []).map((x) => `<li>${esc(x)}</li>`).join("") || '<li class="muted">–</li>'}</ul></div><div><h3>Fix next</h3><ul class="tight">${(a.improvements || []).map((x) => `<li>${esc(x)}</li>`).join("") || '<li class="muted">–</li>'}</ul></div></div>
    <h3 style="margin-top:14px">Core Rules check</h3><ul class="crit">${cr.map((x) => `<li>${resultChip(x.result)}<div><strong>${esc(crit(x.id).label)}</strong>${x.note ? `<small>${esc(x.note)}</small>` : ""}</div></li>`).join("")}</ul>`;
}

/* ---------- Progress ---------- */
function renderProgress(app, all, checkins, heading, intro = "") {
  const list = all.filter((a) => a.pack === S.packId);
  const cs = courseState(all, false);
  const statusOf = attendanceMap(all, checkins);
  const last30 = []; for (let i = 29; i >= 0; i--) last30.push(keyOf(addDays(S.today, -i)));
  const presentDays = last30.filter((k) => ["present", "partial"].includes(statusOf(k))).length;
  const av = (xs) => (xs.length ? Math.round(xs.reduce((s, a) => s + a.score, 0) / xs.length) : null);
  const wk = keyOf(addDays(S.today, -6)), pwk = keyOf(addDays(S.today, -13));
  const d7 = av(list.filter((a) => a.day >= wk)), p7 = av(list.filter((a) => a.day < wk && a.day >= pwk));
  const days = []; for (let i = 13; i >= 0; i--) days.push(keyOf(addDays(S.today, -i)));
  const pts = days.map((k) => { const xs = list.filter((a) => a.day === k); return { label: i14(k), value: av(xs), title: prettyKey(k) }; });
  const levelPts = pack().levels.map((l) => ({ label: `L${l.id}`, value: av(list.filter((a) => a.level === l.id)), title: l.title }));
  const rules = ruleStats(list.slice(0, 80)).sort((a, b) => (a.pct ?? 101) - (b.pct ?? 101));
  const rows = list.slice(0, 60);
  app.innerHTML = `${intro}<div class="course-head"><div><p class="eyebrow">${esc(pack().name)}</p><h1>${esc(heading)}</h1></div></div>
    <div class="kpis"><div class="kpi"><span>Average score</span><b>${av(list) ?? "–"}</b><small>${list.length} sessions</small></div>
      <div class="kpi"><span>Last 7 days</span><b>${d7 ?? "–"}</b><small>${d7 !== null && p7 !== null ? `${d7 >= p7 ? "▲ +" : "▼ "}${d7 - p7} vs previous week` : "Not enough data yet"}</small></div>
      <div class="kpi"><span>Lessons passed</span><b>${cs.passedAll}/${cs.total}</b><small>${cs.reached} badge${cs.reached === 1 ? "" : "s"} · ${cs.xp} XP</small></div>
      <div class="kpi"><span>Attendance (30 days)</span><b>${Math.round((presentDays / 30) * 100)}%</b><small>${presentDays} of 30 days practised · ${streak(all)}-day streak</small></div></div>
    <div class="grid2"><section class="card"><div class="card-head"><h3>Daily average score</h3><span class="muted" style="font-size:12.5px">Last 14 days</span></div>${barChart(pts, { aria: "Daily average score, last 14 days" })}</section>
      <section class="card"><div class="card-head"><h3>Attendance</h3><span class="muted" style="font-size:12.5px">Last 5 weeks</span></div>${calendar(statusOf)}${LEGEND}</section></div>
    <div class="grid2"><section class="card"><div class="card-head"><h3>Average by level</h3></div>${barChart(levelPts, { height: 170, aria: "Average score by level" })}</section>
      <section class="card"><div class="card-head"><h3>Core Rules, weakest first</h3></div><div class="hbars">${rules.map((r) => `<div class="hbar"><span class="nm">${esc(r.c.label)}</span><div class="track"><i style="width:${r.pct ?? 0}%;background:var(--${r.pct === null ? "line" : tone(r.pct)})"></i></div><b>${r.pct === null ? "–" : r.pct + "%"}</b></div>`).join("")}</div></section></div>
    <section class="card"><div class="card-head"><h3>History</h3><span class="muted" style="font-size:12.5px">Latest 60</span></div>${rows.length ? `<div class="tw"><table class="t"><thead><tr><th>Date</th><th>Lesson</th><th>Level</th><th>Score</th><th>Feedback</th><th></th></tr></thead><tbody>
      ${rows.map((a, i) => `<tr><td class="num">${esc(prettyKey(a.day))}</td><td><b>${esc(a.title)}</b><br><span class="chip">${a.kind === "drill" ? "Drill" : "Call"}</span></td><td>${a.level ? "L" + a.level : "–"}</td><td><span class="chip ${tone(a.score)}">${a.score}</span></td><td style="min-width:220px">${esc(a.summary || "")}</td><td><button class="btn small" data-open="${i}">Details</button></td></tr>`).join("")}
      </tbody></table></div>` : '<p class="muted" style="margin:0">No sessions yet.</p>'}</section><div id="detail"></div>`;
  app.querySelectorAll("[data-open]").forEach((b) => (b.onclick = () => {
    const a = rows[Number(b.dataset.open)], box = $("#detail", app);
    box.innerHTML = `<section class="card"><div class="card-head"><h3>${esc(a.title)} · ${esc(prettyKey(a.day))}</h3><button class="btn small" id="closeD">Close</button></div>${feedbackHtml(a)}
      ${a.transcript?.length ? `<h3 style="margin-top:16px">Transcript</h3><div class="thread" style="border-radius:10px">${a.transcript.map((t) => `<div class="bubble ${t.who === "me" ? "me" : "guest"}"><span class="who2">${t.who === "me" ? "Agent" : "Guest"}</span>${esc(t.text)}</div>`).join("")}</div>` : ""}</section>`;
    $("#closeD", box).onclick = () => (box.innerHTML = "");
    box.scrollIntoView({ behavior: reduceMotion() ? "auto" : "smooth" });
  }));
  bindStarts(app);
}

/* ---------- Team (managers) ---------- */
async function renderTeam(app) {
  app.innerHTML = '<div class="empty">Loading the team…</div>';
  const since = keyOf(addDays(S.today, -29));
  const [pr, at, ck] = await Promise.all([
    S.sb.from("profiles").select("*").order("full_name"),
    S.sb.from("attempts").select("user_id, score, day, pack, item_id, level").limit(10000),
    S.sb.from("attendance").select("user_id, day").gte("day", since).limit(10000),
  ]);
  if (S.view !== "team" || S.call) return;
  if (pr.error || at.error) { app.innerHTML = '<div class="notice warn">Could not load the team. Reload the page.</div>'; return; }
  const people = pr.data, allAt = (at.data || []).filter((a) => a.pack === S.packId), checks = ck.data || [];
  const wk = keyOf(addDays(S.today, -6));
  const goal = pack().dailyGoal || 3;
  const days14 = []; for (let i = 13; i >= 0; i--) days14.push(keyOf(addDays(S.today, -i)));
  const per = people.map((p) => {
    const mine = allAt.filter((a) => a.user_id === p.id);
    const w = mine.filter((a) => a.day >= wk);
    const best = {}; mine.forEach((a) => { if (best[a.item_id] === undefined || a.score > best[a.item_id]) best[a.item_id] = a.score; });
    const passed = Object.values(best).filter((s) => s >= pack().passMark).length;
    let lvl = 0; for (const l of pack().levels) { if (l.lessons.every((id) => (best[id] ?? -1) >= pack().passMark)) lvl = l.id; else break; }
    const seen = new Set(checks.filter((c) => c.user_id === p.id).map((c) => c.day));
    const counts = {}; mine.forEach((a) => (counts[a.day] = (counts[a.day] || 0) + 1));
    const statusOf = (k) => dayStatus(counts[k] || 0, seen.has(k), goal);
    const att7 = days14.slice(7).filter((k) => ["present", "partial"].includes(statusOf(k))).length;
    return { p, w, avg: w.length ? Math.round(w.reduce((s, a) => s + a.score, 0) / w.length) : null, passed, lvl, last: mine.map((a) => a.day).sort().pop(), statusOf, att7, today: counts[S.today] || 0 };
  });
  const trainees = per.filter((x) => x.p.role !== "manager");
  const pool = trainees.length ? trainees : per;
  const activeToday = pool.filter((x) => x.today > 0).length;
  const attRate = pool.length ? Math.round((pool.reduce((s, x) => s + x.att7, 0) / (pool.length * 7)) * 100) : 0;
  const teamW = pool.flatMap((x) => x.w);
  const teamAvg = teamW.length ? Math.round(teamW.reduce((s, a) => s + a.score, 0) / teamW.length) : null;
  const totalLessons = pack().levels.reduce((s, l) => s + l.lessons.length, 0);
  const sorted = [...per].sort((a, b) => (b.avg ?? -1) - (a.avg ?? -1));
  app.innerHTML = `<div class="course-head"><div><p class="eyebrow">${esc(pack().name)} · Managers only</p><h1>Team</h1></div><span class="muted" style="font-size:13px">${esc(prettyKey(S.today))}</span></div>
    <div class="kpis"><div class="kpi"><span>Trainees</span><b>${pool.length}</b><small>${people.length - pool.length} manager${people.length - pool.length === 1 ? "" : "s"}</small></div>
      <div class="kpi"><span>Practised today</span><b>${activeToday}/${pool.length}</b><small>Daily goal: ${goal} sessions</small></div>
      <div class="kpi"><span>Attendance (7 days)</span><b>${attRate}%</b><small>Days practised ÷ days</small></div>
      <div class="kpi"><span>Team average (7 days)</span><b>${teamAvg ?? "–"}</b><small>${teamW.length} sessions</small></div></div>
    <div class="grid2"><section class="card"><div class="card-head"><h3>Performance, last 7 days</h3><span class="muted" style="font-size:12.5px">Average score</span></div>
      <div class="hbars">${sorted.map((x) => `<div class="hbar"><span class="nm">${esc(x.p.full_name || x.p.email)}</span><div class="track"><i style="width:${x.avg ?? 0}%;background:var(--${x.avg === null ? "line" : tone(x.avg)})"></i></div><b>${x.avg ?? "–"}</b></div>`).join("")}</div></section>
      <section class="card"><div class="card-head"><h3>Attendance, last 14 days</h3></div><div class="att-grid"><div class="att-row"><span></span>${days14.map((k) => `<span class="hd">${parseKey(k).getUTCDate()}</span>`).join("")}</div>
      ${per.map((x) => `<div class="att-row"><span class="nm">${esc(x.p.full_name || x.p.email)}</span>${days14.map((k) => `<span class="c ${x.statusOf(k)}" title="${esc(prettyKey(k))}"></span>`).join("")}</div>`).join("")}</div>${LEGEND}</section></div>
    <section class="card"><div class="card-head"><h3>People</h3><span class="muted" style="font-size:12.5px">Click a name for scores, transcripts and attendance</span></div>
      <div class="tw"><table class="t"><thead><tr><th>Name</th><th>Level reached</th><th>Lessons passed</th><th>Sessions (7d)</th><th>Avg (7d)</th><th>Last practised</th><th>Team</th><th>Role</th></tr></thead><tbody>
      ${per.map((x) => { const self = x.p.id === S.profile.id; return `<tr><td><div class="row" style="flex-wrap:nowrap">${avatar(x.p.full_name || x.p.email, x.p.id)}<div><button class="linkbtn" data-person="${esc(x.p.id)}">${esc(x.p.full_name || x.p.email)}</button><br><small class="muted">${esc(x.p.email)}</small></div></div></td>
        <td>${x.lvl ? `<span class="chip brass">${icon("star")}Level ${x.lvl}</span>` : '<span class="muted">–</span>'}</td><td class="num">${x.passed}/${totalLessons}</td><td class="num">${x.w.length}</td><td>${x.avg === null ? "–" : `<span class="chip ${tone(x.avg)}">${x.avg}</span>`}</td><td class="num">${x.last ? esc(prettyKey(x.last)) : "–"}</td>
        <td><select data-team="${esc(x.p.id)}" aria-label="Team"><option value="sales" ${x.p.team === "sales" ? "selected" : ""}>Sales</option><option value="support" ${x.p.team === "support" ? "selected" : ""}>Customer support</option></select></td>
        <td><select data-role="${esc(x.p.id)}" ${self ? "disabled title=\"You can't change your own role\"" : ""} aria-label="Role"><option value="trainee" ${x.p.role === "trainee" ? "selected" : ""}>Trainee</option><option value="manager" ${x.p.role === "manager" ? "selected" : ""}>Manager</option></select></td></tr>`; }).join("")}
      </tbody></table></div><p class="msg" id="teammsg"></p></section><div id="person"></div>`;
  const setField = async (id, field, value) => {
    const m = $("#teammsg");
    const { error } = await S.sb.from("profiles").update({ [field]: value }).eq("id", id);
    m.className = "msg " + (error ? "err" : "ok"); m.textContent = error ? "Could not save: " + error.message : "Saved.";
  };
  app.querySelectorAll("[data-team]").forEach((s) => (s.onchange = () => setField(s.dataset.team, "team", s.value)));
  app.querySelectorAll("[data-role]").forEach((s) => (s.onchange = () => setField(s.dataset.role, "role", s.value)));
  app.querySelectorAll("[data-person]").forEach((b) => (b.onclick = () => openPerson(b.dataset.person, people)));
  if (S.team.sel) openPerson(S.team.sel, people);
}
async function openPerson(id, people) {
  S.team.sel = id;
  const box = $("#person"); if (!box) return;
  box.innerHTML = '<div class="empty">Loading results…</div>';
  try {
    const [list, checks, note] = await Promise.all([loadAttempts(id), loadAttendance(id), loadNote(id, S.today)]);
    if (S.view !== "team" || S.team.sel !== id) return;
    const p = people.find((x) => x.id === id);
    const intro = note ? `<section class="card" style="border-left:4px solid var(--brass)"><p class="eyebrow">Today's coaching summary</p><p style="white-space:pre-wrap;margin:0">${noteHtml(note)}</p></section>` : "";
    const holder = document.createElement("div"); holder.className = "page";
    renderProgress(holder, list, checks, (p?.full_name || p?.email || "Trainee"), intro);
    box.innerHTML = ""; box.appendChild(holder);
    box.scrollIntoView({ behavior: reduceMotion() ? "auto" : "smooth" });
  } catch (e) { box.innerHTML = `<div class="notice warn">${esc(e.message)}</div>`; }
}

/* ---------- Guide ---------- */
function renderGuide(app) {
  const p = pack();
  app.innerHTML = `<div class="course-head"><div><p class="eyebrow">How it works</p><h1>Practise the call before it's real</h1></div></div>
  <div class="grid3"><section class="card"><span class="lesson-ico">${icon("course")}</span><h3 style="margin-top:12px">Six levels</h3><p class="muted" style="margin:0">From your opening line to complaints and group bookings. Pass every lesson in a level with ${p.passMark}+ to earn its badge and unlock the next.</p></section>
    <section class="card"><span class="lesson-ico">${icon("phone")}</span><h3 style="margin-top:12px">The guest speaks first</h3><p class="muted" style="margin:0">Press Start and the AI guest picks up, out loud. Answer by speaking (Chrome or Edge) or typing. With hands-free on, it feels like a real call.</p></section>
    <section class="card"><span class="lesson-ico drill">${icon("star")}</span><h3 style="margin-top:12px">Your own scenario</h3><p class="muted" style="margin:0">Every attempt creates a fresh guest, dates, prices and twist just for you. Colleagues never get the same call, so practise, don't copy.</p></section></div>
  <section class="card"><h3>Attendance and your daily goal</h3><p style="margin:0">Do <b>${p.dailyGoal} sessions a day</b> to meet your goal. The calendar shows <b>goal met</b>, <b>practised</b> (1–${p.dailyGoal - 1} sessions), <b>logged in only</b>, or <b>absent</b>. Managers see everyone's attendance and scores in the Team page.</p></section>
  <section class="card"><h3>What gets scored</h3><ul class="rules">${p.criteria.map((c) => `<li><b>${esc(c.label)}:</b> ${esc(c.tip)}</li>`).join("")}</ul></section>
  <section class="card"><h3>Tips</h3><ul class="rules"><li>Use Chrome or Edge with a headset, and allow the microphone when asked.</li><li>Quote only what's in the <b>Live system</b> tab. If a fact isn't there, say you'll check with the team and text back.</li><li>Never take card details by phone, even in practice.</li><li>"Retry same scenario" replays your call; "New scenario" creates a different one.</li></ul>
  <p class="muted" style="font-size:13px;margin-bottom:0">The coach scores the words you say, not your accent. Practice prices and facts are made up for training.</p></section>`;
}

boot();
