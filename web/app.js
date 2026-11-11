// Homesly Call Coach: web app (no build step).
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm";

const CFG = window.HOMESLY_CONFIG || {};
const $ = (s, el = document) => el.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const tone = (s) => (s >= 80 ? "good" : s >= 60 ? "warn" : "bad");
const store = {
  get(k, d) { try { const v = localStorage.getItem("hcc." + k); return v === null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem("hcc." + k, JSON.stringify(v)); } catch { /* private mode */ } },
};

/* ---------- Dates (computed from the server's UK date) ---------- */
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const parseKey = (k) => { const [y, m, d] = k.split("-").map(Number); return new Date(Date.UTC(y, m - 1, d)); };
const keyOf = (d) => d.toISOString().slice(0, 10);
const addDays = (k, n) => { const d = parseKey(k); d.setUTCDate(d.getUTCDate() + n); return d; };
const ord = (n) => n + (n % 10 === 1 && n !== 11 ? "st" : n % 10 === 2 && n !== 12 ? "nd" : n % 10 === 3 && n !== 13 ? "rd" : "th");
const longDate = (d) => `${DAYS[d.getUTCDay()]} the ${ord(d.getUTCDate())} of ${MONTHS[d.getUTCMonth()]}`;
const shortDate = (d) => `${DAYS[d.getUTCDay()].slice(0, 3)} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()].slice(0, 3)}`;
const prettyKey = (k) => shortDate(parseKey(k));
const money = (n) => "£" + (Math.round(n * 100) / 100).toFixed(2).replace(/\.00$/, "");
function hash(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

/* ---------- State ---------- */
const S = {
  sb: null, session: null, profile: null, today: null, packs: [], packId: "sales", aiReady: true,
  attempts: [], dayNote: null, view: "today", call: null, recovery: false, booted: false,
  team: { people: [], recent: [], sel: null, attempts: [], note: null },
};
const ROUTES = ["today", "progress", "team", "how"];
const pack = () => S.packs.find((p) => p.id === S.packId) || S.packs[0];
const crit = (id) => pack()?.criteria.find((c) => c.id === id) || { id, label: id, tip: "" };
const isManager = () => S.profile?.role === "manager";

/* ---------- Backend ---------- */
async function api(action, payload = {}) {
  const { data, error } = await S.sb.functions.invoke("coach", { body: { action, ...payload } });
  if (error) {
    let msg = "Something went wrong. Try again.";
    try { const body = await error.context.json(); if (body?.error) msg = body.error; } catch { /* network error */ }
    if (error.name === "FunctionsFetchError") msg = "Can't reach the server. Check your internet connection.";
    throw new Error(msg);
  }
  return data;
}
async function loadAttempts(userId) {
  const { data, error } = await S.sb.from("attempts").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(400);
  if (error) throw new Error("Could not load results.");
  return data || [];
}
async function loadNote(userId, day) {
  const { data } = await S.sb.from("day_notes").select("note").eq("user_id", userId).eq("day", day).maybeSingle();
  return data?.note || null;
}

/* ---------- Boot ---------- */
async function boot() {
  if (!CFG.supabaseUrl || !CFG.supabaseAnonKey) return renderSetup();
  S.sb = createClient(CFG.supabaseUrl, CFG.supabaseAnonKey);
  S.view = ROUTES.includes(location.hash.slice(1)) ? location.hash.slice(1) : "today";
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
  $("#app").innerHTML = '<div class="empty">Loading your training desk…</div>';
  try {
    const b = await api("bootstrap");
    S.profile = b.profile; S.today = b.today; S.packs = b.packs; S.aiReady = b.aiReady;
    const mine = S.packs.find((p) => p.id === S.profile.team);
    S.packId = store.get("pack", null) && isManager() ? store.get("pack") : (mine && (mine.roleplays.length || mine.drills.length) ? mine.id : "sales");
    S.attempts = await loadAttempts(S.profile.id);
    S.dayNote = await loadNote(S.profile.id, S.today);
    $("#topbar").hidden = false;
    $("#teamTab").hidden = !isManager();
    renderWho();
    render();
  } catch (e) {
    S.booted = false;
    $("#app").innerHTML = `<div class="notice warn" style="margin-top:24px">${esc(e.message)}</div><button class="btn" id="retry">Try again</button> <button class="btn" id="out">Sign out</button>`;
    $("#retry").onclick = startApp;
    $("#out").onclick = () => S.sb.auth.signOut();
  }
}

function renderWho() {
  const packSel = isManager() && S.packs.length > 1
    ? `<select id="packSel" aria-label="Training pack">${S.packs.map((p) => `<option value="${esc(p.id)}" ${p.id === S.packId ? "selected" : ""}>${esc(p.name)}</option>`).join("")}</select>` : "";
  $("#who").innerHTML = `${packSel}<span>${esc(S.profile.full_name || S.profile.email)}</span><button class="btn small" id="signout">Sign out</button>`;
  $("#signout").onclick = () => { stopVoice(); S.sb.auth.signOut(); };
  const ps = $("#packSel");
  if (ps) ps.onchange = () => { S.packId = ps.value; store.set("pack", ps.value); go(S.view); };
}

/* ---------- Routing ---------- */
function go(v) {
  if (!ROUTES.includes(v) || (v === "team" && !isManager())) v = "today";
  stopVoice(); S.call = null; S.view = v;
  try { history.replaceState(null, "", "#" + v); } catch { /* ignore */ }
  window.scrollTo(0, 0);
  render();
}
$("#tabs").addEventListener("click", (e) => { const a = e.target.closest("a[data-view]"); if (!a) return; e.preventDefault(); go(a.dataset.view); });
window.addEventListener("hashchange", () => { const h = location.hash.slice(1); if (S.profile && ROUTES.includes(h) && h !== S.view) go(h); });

function render() {
  if (!S.profile) return;
  document.querySelectorAll("#tabs a").forEach((a) => a.setAttribute("aria-current", a.dataset.view === S.view && !S.call ? "page" : "false"));
  const app = $("#app");
  try {
    if (S.call) return renderCall(app);
    if (S.view === "progress") return renderProgress(app, S.attempts, "My progress");
    if (S.view === "team") return renderTeam(app);
    if (S.view === "how") return renderHow(app);
    renderToday(app);
  } catch (e) {
    console.error(e);
    app.innerHTML = '<div class="notice warn">This page could not be shown. Reload; if it keeps happening, tell your manager.</div>';
  }
}

/* ---------- Setup + auth screens ---------- */
function renderSetup() {
  $("#app").innerHTML = `<div class="auth setup" style="max-width:640px"><p class="eyebrow">Almost ready</p><h1>Homesly Call Coach</h1>
  <div class="panel"><p>The website is live, but it isn't connected to its backend yet. A manager needs to finish the setup in <strong>SETUP.md</strong> in the GitHub repository:</p>
  <ol><li>Create a free Supabase project.</li><li>Add the repository secrets and variables (<code>SUPABASE_URL</code>, <code>SUPABASE_ANON_KEY</code>, and the others listed).</li><li>Push to <code>main</code> or re-run the Deploy action.</li></ol>
  <p class="muted" style="margin-bottom:0">After that, this page shows the sign-in screen.</p></div></div>`;
}

function renderAuth(mode) {
  $("#topbar").hidden = true;
  const app = $("#app");
  if (mode === "reset") {
    app.innerHTML = `<div class="auth"><p class="eyebrow">Homesly Call Coach</p><h1>Set a new password</h1><div class="panel">
      <form id="resetForm"><div class="field"><label for="np">New password (8+ characters)</label><input id="np" type="password" minlength="8" autocomplete="new-password" required></div>
      <button class="btn primary" type="submit">Save password</button><p class="msg" id="m"></p></form></div></div>`;
    $("#resetForm").onsubmit = async (e) => {
      e.preventDefault();
      const { error } = await S.sb.auth.updateUser({ password: $("#np").value });
      if (error) { $("#m").className = "msg err"; $("#m").textContent = error.message; return; }
      S.recovery = false; history.replaceState(null, "", location.pathname + "#today"); startApp();
    };
    return;
  }
  const tabs = `<div class="seg" role="group"><button type="button" data-m="signin" aria-pressed="${mode === "signin"}">Sign in</button><button type="button" data-m="signup" aria-pressed="${mode === "signup"}">Create account</button></div>`;
  let form = "";
  if (mode === "signin") form = `<form id="f">
      <div class="field"><label for="em">Work email</label><input id="em" type="email" autocomplete="email" required></div>
      <div class="field"><label for="pw">Password</label><input id="pw" type="password" autocomplete="current-password" required></div>
      <button class="btn primary" type="submit" style="width:100%">Sign in</button>
      <p class="msg"><button type="button" class="linkbtn" id="forgot">Forgot password?</button></p><p class="msg" id="m"></p></form>`;
  if (mode === "signup") form = `<form id="f">
      <div class="field"><label for="fn">Your name</label><input id="fn" autocomplete="name" required></div>
      <div class="field"><label for="em">Work email (@homeslystays.com)</label><input id="em" type="email" autocomplete="email" required></div>
      <div class="field"><label for="pw">Password (8+ characters)</label><input id="pw" type="password" minlength="8" autocomplete="new-password" required></div>
      <button class="btn primary" type="submit" style="width:100%">Create account</button><p class="msg" id="m"></p></form>`;
  app.innerHTML = `<div class="auth"><p class="eyebrow">Homesly</p><h1>Call Coach</h1><p class="muted">Daily AI role-play practice for the reservations and support teams.</p><div class="panel">${tabs}${form}</div></div>`;
  app.querySelectorAll("[data-m]").forEach((b) => (b.onclick = () => renderAuth(b.dataset.m)));
  const m = $("#m");
  const say = (t, ok) => { m.className = "msg " + (ok ? "ok" : "err"); m.textContent = t; };
  $("#f").onsubmit = async (e) => {
    e.preventDefault();
    const btn = e.submitter || $("#f button[type=submit]"); btn.disabled = true;
    const email = $("#em").value.trim(), password = $("#pw").value;
    try {
      if (mode === "signin") {
        const { error } = await S.sb.auth.signInWithPassword({ email, password });
        if (error) say(error.message === "Invalid login credentials" ? "Email or password is wrong." : error.message);
      } else {
        const { data, error } = await S.sb.auth.signUp({ email, password, options: { data: { full_name: $("#fn").value.trim() }, emailRedirectTo: location.origin + location.pathname } });
        if (error) say(/database error/i.test(error.message) ? "Use your company email address (@homeslystays.com)." : error.message);
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

/* ---------- Daily plan ---------- */
function stats(list) {
  const per = {};
  pack().criteria.forEach((c) => (per[c.id] = { met: 0, n: 0 }));
  list.forEach((a) => {
    if (a.kind === "roleplay" && Array.isArray(a.criteria)) a.criteria.forEach((c) => {
      if (!per[c.id] || c.result === "na") return;
      per[c.id].n++; per[c.id].met += c.result === "met" ? 1 : c.result === "partial" ? 0.5 : 0;
    });
    if (a.kind === "drill" && a.targets) a.targets.forEach((t) => { if (per[t]) { per[t].n++; per[t].met += (a.score || 0) / 100; } });
  });
  return per;
}
function weakest(list) {
  const per = stats(list.slice(0, 40));
  const ranked = pack().criteria.map((c) => ({ id: c.id, pct: per[c.id].n ? per[c.id].met / per[c.id].n : null })).filter((x) => x.pct !== null).sort((a, b) => a.pct - b.pct);
  return ranked[0] || null;
}
function dailyPlan() {
  const p = pack(), mine = S.attempts.filter((a) => a.pack === p.id);
  const seed = hash(S.today + S.profile.id + p.id);
  const items = [];
  const weak = weakest(mine);
  if (p.roleplays.length) {
    const recent = new Set(mine.filter((a) => a.day !== S.today).slice(0, 12).map((a) => a.item_id));
    const pool = p.roleplays.filter((r) => !recent.has(r.id));
    const usable = pool.length >= 2 ? pool : p.roleplays;
    const first = (weak && usable.find((r) => r.targets.includes(weak.id))) || usable[seed % usable.length];
    items.push({ kind: "roleplay", ref: first });
    const rest = usable.filter((r) => r !== first);
    if (rest.length) items.push({ kind: "roleplay", ref: rest[(seed >>> 3) % rest.length] });
  }
  if (p.drills.length) {
    const dayIndex = Math.floor(parseKey(S.today).getTime() / 86400000);
    const picks = [];
    for (let i = 0; picks.length < Math.min(3, p.drills.length) && i < p.drills.length * 2; i++) {
      const d = p.drills[(dayIndex * 3 + i + (seed % 5)) % p.drills.length];
      if (!picks.includes(d)) picks.push(d);
    }
    if (weak) { const wd = p.drills.find((d) => d.targets.includes(weak.id)); if (wd && !picks.includes(wd)) picks[picks.length - 1] = wd; }
    picks.forEach((d) => items.push({ kind: "drill", ref: d }));
  }
  return { items, weak };
}
function streak(list) {
  const days = new Set(list.map((a) => a.day));
  let k = days.has(S.today) ? S.today : keyOf(addDays(S.today, -1)), n = 0;
  while (days.has(k)) { n++; k = keyOf(addDays(k, -1)); }
  return n;
}

/* ---------- Today ---------- */
function renderToday(app) {
  const p = pack();
  if (!p.roleplays.length && !p.drills.length) {
    app.innerHTML = `<div class="panel empty"><h2 style="font-size:20px;margin-bottom:6px">${esc(p.name)}</h2>This pack has no practice calls yet. They are added in <code>supabase/functions/_shared/packs/${esc(p.id)}.ts</code> once the knowledge base is ready.</div>`;
    return;
  }
  const plan = dailyPlan();
  const todays = S.attempts.filter((a) => a.day === S.today && a.pack === p.id);
  const best = {};
  todays.forEach((a) => { if (!best[a.item_id] || best[a.item_id].score < a.score) best[a.item_id] = a; });
  const done = plan.items.filter((it) => best[it.ref.id]).length;
  const avg = todays.length ? Math.round(todays.reduce((s, a) => s + a.score, 0) / todays.length) : null;
  const first = (S.profile.full_name || "").split(" ")[0];
  const hour = Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", hour: "numeric", hour12: false }).format(new Date()));
  const hello = hour < 12 ? "Morning" : hour < 17 ? "Afternoon" : "Evening";
  let html = "";
  if (!S.aiReady) html += '<div class="notice warn">The AI isn\'t connected yet (the ANTHROPIC_API_KEY secret is missing). A manager needs to finish SETUP.md.</div>';
  html += `<div class="hello"><div><p class="eyebrow">${esc(p.name)} · ${esc(prettyKey(S.today))}</p><h1>${first ? esc(hello + ", " + first) + "." : "Today's training"} ${done === plan.items.length ? "All done for today." : `${plan.items.length} sessions, about 20 minutes.`}</h1></div>
    <div class="kpis"><div class="kpi"><b>${done}/${plan.items.length}</b><span>done today</span></div><div class="kpi"><b>${avg ?? "–"}</b><span>today's average</span></div><div class="kpi"><b>${streak(S.attempts)}</b><span>day streak</span></div></div></div>`;
  if (plan.weak) {
    const c = crit(plan.weak.id), pct = Math.round(plan.weak.pct * 100);
    html += `<div class="focus"><p class="eyebrow">Today's focus</p><strong>${esc(c.label)}</strong> <span class="chip ${tone(pct)}">${pct}% recently</span><p>${esc(c.tip)}</p></div>`;
  } else {
    html += `<div class="focus"><p class="eyebrow">Getting started</p><strong>Today's calls are built from real recorded calls.</strong><p>The AI plays the guest. You speak or type as you would on a real call. At the end you get a score and the exact lines to say better next time.</p></div>`;
  }
  html += '<ol class="set">' + plan.items.map((it, i) => {
    const r = it.ref, b = best[r.id];
    const chips = (it.kind === "roleplay" ? '<span class="chip acc">Practice call</span>' : '<span class="chip">Quick drill</span>') + r.targets.map((t) => `<span class="chip">${esc(crit(t).label)}</span>`).join("");
    const sub = it.kind === "roleplay" ? `${esc(r.scenario)} · ${esc(r.hotel)}${r.town ? ", " + esc(r.town) : ""} · ${esc(r.from)}` : esc(r.from);
    const right = b ? `<span class="chip ${tone(b.score)}">Scored ${b.score}</span> <button class="btn small" data-start="${it.kind}:${esc(r.id)}">Again</button>` : `<button class="btn primary" data-start="${it.kind}:${esc(r.id)}">Start</button>`;
    return `<li class="item ${b ? "done" : ""}"><span class="n">${b ? "✓" : i + 1}</span><div><h3>${esc(r.title)}</h3><p>${sub}</p><div class="tags">${chips}</div></div><div>${right}</div></li>`;
  }).join("") + "</ol>";
  if (todays.length) {
    html += `<div class="panel"><h3>Today's coaching summary</h3>${S.dayNote ? `<p style="white-space:pre-wrap;margin:0">${esc(S.dayNote)}</p>` : `<p class="muted" style="margin:0 0 10px">A short summary of today: what improved, what to fix, and one line to practise tomorrow.</p><button class="btn" id="gennote">Write today's summary</button><p class="msg" id="notemsg"></p>`}</div><div style="height:14px"></div>`;
  }
  html += `<details class="lib"><summary>Practise anything else (${p.roleplays.length} calls, ${p.drills.length} drills)</summary><div class="libgrid">` +
    p.roleplays.map((r) => `<button data-start="roleplay:${esc(r.id)}"><strong>${esc(r.title)}</strong><small>Call · ${esc(r.hotel)} · ${esc(r.scenario)}</small></button>`).join("") +
    p.drills.map((d) => `<button data-start="drill:${esc(d.id)}"><strong>${esc(d.title)}</strong><small>Drill · ${esc(d.from)}</small></button>`).join("") + "</div></details>";
  app.innerHTML = html;
  app.querySelectorAll("[data-start]").forEach((b) => (b.onclick = () => { const [k, id] = b.dataset.start.split(":"); startCall(k, id); }));
  const gn = $("#gennote");
  if (gn) gn.onclick = async () => {
    gn.disabled = true; $("#notemsg").className = "msg"; $("#notemsg").textContent = "Writing your summary…";
    try { const r = await api("summary"); S.dayNote = r.note; render(); }
    catch (e) { gn.disabled = false; $("#notemsg").className = "msg err"; $("#notemsg").textContent = e.message; }
  };
}

/* ---------- Voice (browser speech) ---------- */
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
const voice = { rec: null, on: false, sendTimer: null };
function pickVoice(gender) {
  const all = (window.speechSynthesis?.getVoices() || []).filter((v) => /^en[-_]GB/i.test(v.lang));
  const re = gender === "male" ? /\b(male|ryan|george|thomas|daniel|oliver|arthur|harry|james|brian|alfie)\b/i : /\b(female|libby|sonia|maisie|hazel|susan|kate|serena|martha|emily|amy|fiona|stephanie)\b/i;
  return all.find((v) => re.test(v.name)) || all[0] || null;
}
function speak(text, gender) {
  return new Promise((resolve) => {
    if (!window.speechSynthesis || !S.call?.speakOn) return resolve();
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const v = pickVoice(gender); if (v) u.voice = v;
    u.lang = "en-GB"; u.rate = 1;
    u.onend = u.onerror = () => resolve();
    speechSynthesis.speak(u);
  });
}
function startListening() {
  if (!SR || voice.on || !S.call || S.call.busy || S.call.ended) return;
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
    if (S.call?.handsFree) voice.sendTimer = setTimeout(() => { if ($("#say")?.value.trim() && !interim) { stopVoice(); send(); } }, 1600);
  };
  rec.onerror = (e) => { if (e.error === "not-allowed" || e.error === "service-not-allowed") { S.call && (S.call.micBlocked = true); } };
  rec.onend = () => { voice.rec = null; voice.on = false; updateMic(); };
  try { rec.start(); voice.rec = rec; voice.on = true; } catch { voice.on = false; }
  updateMic();
}
function stopVoice() {
  clearTimeout(voice.sendTimer);
  try { voice.rec && voice.rec.stop(); } catch { /* ignore */ }
  voice.on = false;
  try { window.speechSynthesis?.cancel(); } catch { /* ignore */ }
}
function updateMic() {
  const b = $("#mic"); if (!b) return;
  b.classList.toggle("on", voice.on);
  b.textContent = voice.on ? "Stop mic" : "Speak";
  const l = $("#listening"); if (l) l.hidden = !voice.on;
  const n = $("#micnote"); if (n && S.call?.micBlocked) { n.hidden = false; n.textContent = "The browser blocked the microphone. Click the padlock in the address bar, allow the microphone, then try again."; }
}

/* ---------- Practice calls & drills ---------- */
function startCall(kind, id) {
  const p = pack();
  const ref = (kind === "roleplay" ? p.roleplays : p.drills).find((x) => x.id === id);
  if (!ref) return;
  stopVoice();
  S.call = { kind, ref, turns: [], busy: false, ended: false, result: null, err: "", speakOn: store.get("speak", true), handsFree: store.get("handsFree", false) };
  window.scrollTo(0, 0);
  render();
  if (kind === "roleplay" && ref.dir === "in") guestTurn();
}
async function guestTurn() {
  const c = S.call; c.busy = true; c.err = ""; render();
  try {
    const r = await api("guest", { pack: S.packId, itemId: c.ref.id, turns: c.turns });
    if (S.call !== c) return;
    if (r.text) c.turns.push({ who: "guest", text: r.text });
    c.ended = !!r.ended; c.busy = false; render();
    if (r.text) await speak(r.text, c.ref.voice);
    if (S.call === c && c.handsFree && !c.ended) startListening();
  } catch (e) { if (S.call !== c) return; c.busy = false; c.err = e.message; render(); }
}
function send() {
  const c = S.call, box = $("#say");
  const text = (box?.value || "").trim();
  if (!c || !text || c.busy) return;
  stopVoice();
  c.turns.push({ who: "me", text }); box.value = "";
  if (c.kind === "roleplay") guestTurn(); else scoreDrill(text);
}
async function scoreCall() {
  const c = S.call; stopVoice();
  c.busy = true; c.scoring = true; c.err = ""; render();
  try {
    const r = await api("assess", { pack: S.packId, itemId: c.ref.id, turns: c.turns });
    if (S.call !== c) return;
    c.result = r.attempt; S.attempts.unshift(r.attempt); S.dayNote = null;
  } catch (e) { if (S.call === c) c.err = e.message; }
  if (S.call === c) { c.busy = false; c.scoring = false; render(); }
}
async function scoreDrill(answer) {
  const c = S.call; c.busy = true; c.err = ""; render();
  try {
    const r = await api("drill", { pack: S.packId, itemId: c.ref.id, answer });
    if (S.call !== c) return;
    c.result = r.attempt; S.attempts.unshift(r.attempt); S.dayNote = null;
  } catch (e) { if (S.call !== c) return; c.err = e.message; c.turns.pop(); setTimeout(() => { const b = $("#say"); if (b) b.value = answer; }); }
  if (S.call === c) { c.busy = false; render(); }
}

function rateLines(r) {
  if (!r.rates.length) return ["(no booking on this call)"];
  const a = addDays(S.today, r.arrive), d = addDays(S.today, r.arrive + r.nights);
  return r.rates.map((x) => `${x.room}: ${money(x.perNight)}/night × ${r.nights} = ${money(x.perNight * r.nights)} total, ${x.breakfast ? "breakfast included" : "room only"}\n  ${x.cancel}`)
    .concat([`Dates: ${longDate(a)} → ${longDate(d)} (${r.nights} night${r.nights > 1 ? "s" : ""})`]);
}

function renderCall(app) {
  const c = S.call, r = c.ref;
  let left;
  if (c.kind === "roleplay") {
    const a = addDays(S.today, r.arrive);
    left = `<div class="panel brief"><p class="eyebrow">${esc(r.scenario)} · ${r.dir === "out" ? "You are calling" : "They are calling you"}</p><h2 style="font-size:20px">${esc(r.title)}</h2>
      <p><strong>${esc(r.hotel)}${r.town ? ", " + esc(r.town) : ""}</strong></p>
      <p>${r.dir === "out" ? `You're calling <strong>${esc(r.guest)}</strong>, who started a booking on the website but didn't finish.` : `<strong>${esc(r.guest)}</strong> is calling the hotel.`}</p>
      ${r.nights ? `<p class="muted">Their enquiry: ${esc(longDate(a))}, ${r.nights} night${r.nights > 1 ? "s" : ""}, ${r.adults} adult${r.adults > 1 ? "s" : ""}${r.children.length ? ", child aged " + r.children.join(", ") : ""}.</p>` : ""}
      <p class="muted" style="font-size:13px">Based on: ${esc(r.from)}</p></div>
      <div class="panel"><h3>Live system (practice data)</h3><div class="sys">${rateLines(r).map((l) => `<div>${esc(l)}</div>`).join("")}${Object.keys(r.kb).length ? '<div class="k">— knowledge base —</div>' + Object.entries(r.kb).map(([k, v]) => `<div><span class="k">${esc(k)}:</span> ${esc(v)}</div>`).join("") : ""}</div>
      <p class="muted" style="font-size:12.5px;margin:8px 0 0">Practice values only. On real calls, prices come from the live rate tool and facts from the hotel's knowledge base.</p></div>
      <details class="panel"><summary style="cursor:pointer;font-weight:600">What you're scored on</summary><ul class="rules">${pack().criteria.map((x) => `<li${r.targets.includes(x.id) ? ' style="font-weight:600"' : ""}>${esc(x.label)}: ${esc(x.tip)}</li>`).join("")}</ul></details>`;
  } else {
    left = `<div class="panel brief"><p class="eyebrow">Quick drill · ${esc(r.from)}</p><h2 style="font-size:20px">${esc(r.title)}</h2>
      <p><strong>Guest:</strong> ${esc(r.guest)}</p><p><strong>On the real call:</strong> <span class="muted">${esc(r.was)}</span></p><p><strong>Your task:</strong> ${esc(r.task)}</p></div>
      <div class="panel"><h3>Rules for this one</h3><ul class="rules">${r.targets.map((t) => `<li>${esc(crit(t).tip)}</li>`).join("")}</ul></div>`;
  }
  const guestName = c.kind === "drill" ? "Your answer" : esc(r.guest.split(" (")[0]);
  const thread = c.turns.map((t) => `<div class="bubble ${t.who === "me" ? "me" : "guest"}"><span class="who2">${t.who === "me" ? "You" : guestName}</span>${esc(t.text)}</div>`).join("");
  let right;
  if (c.result) {
    right = `<div class="panel">${feedbackHtml(c.result)}<div class="row" style="margin-top:14px"><button class="btn primary" id="back">Back to today</button><button class="btn" id="again">Try this one again</button></div></div>
      ${c.kind === "roleplay" ? `<details class="panel"><summary style="cursor:pointer;font-weight:600">Call transcript</summary><div class="thread" style="margin-top:10px">${thread}</div></details>` : ""}`;
  } else {
    const busy = c.busy ? `<div class="typing">${c.scoring ? "Scoring your call against the rules… this can take up to a minute." : c.kind === "drill" ? "Checking your answer…" : "The guest is answering…"}</div>` : "";
    const ph = c.kind === "drill" ? "Type or speak exactly what you would say…" : c.turns.length === 0 && r.dir === "out" ? "Start the call: your opening line…" : "Your reply…";
    const myTurns = c.turns.filter((t) => t.who === "me").length;
    right = `<div class="panel call"><div class="row" style="justify-content:space-between;margin-bottom:10px"><h3 style="margin:0">${c.kind === "roleplay" ? "The call" : "Your answer"}</h3>
      <div class="row">${c.kind === "roleplay" && window.speechSynthesis ? `<label class="tog"><input type="checkbox" id="speakT" ${c.speakOn ? "checked" : ""}> Guest speaks aloud</label>` : ""}
      ${c.kind === "roleplay" && SR ? `<label class="tog"><input type="checkbox" id="handsT" ${c.handsFree ? "checked" : ""}> Hands-free</label>` : ""}</div></div>
      <div class="thread">${thread || (c.kind === "roleplay" && r.dir === "out" ? '<div class="typing">The phone is ringing. They answer: "Hello?"</div>' : "")}${busy}${c.ended ? '<div class="typing">The guest has ended the call.</div>' : ""}</div>
      ${c.err ? `<div class="notice warn">${esc(c.err)}</div>` : ""}
      <div class="compose">
        ${c.ended ? "" : `<textarea id="say" placeholder="${esc(ph)}" ${c.busy ? "disabled" : ""}></textarea><div class="row"><span id="listening" class="listening" hidden>Listening</span><span id="partial" class="muted" style="font-size:13px"></span></div><p id="micnote" class="msg err" hidden></p>`}
        <div class="row">
          ${c.ended ? "" : `<button class="btn primary" id="send" ${c.busy ? "disabled" : ""}>${c.kind === "drill" ? "Check my answer" : "Send"}</button>`}
          ${!c.ended && SR ? `<button class="btn mic" id="mic" ${c.busy ? "disabled" : ""}>Speak</button>` : ""}
          <span class="grow"></span>
          ${c.kind === "roleplay" ? `<button class="btn ${c.ended ? "primary" : ""}" id="end" ${c.busy || myTurns < 1 ? "disabled" : ""}>End call &amp; get feedback</button>` : ""}
          <button class="btn" id="quit">Leave</button>
        </div>
        ${!SR && !c.ended ? '<p class="muted" style="font-size:12.5px;margin:0">Voice input needs Chrome or Edge. On Windows you can also press <strong>Windows key + H</strong> to dictate into the box.</p>' : ""}
        ${c.kind === "roleplay" && !c.ended && SR ? '<p class="muted" style="font-size:12.5px;margin:0">Hands-free: the mic opens after the guest speaks and sends when you pause. Ctrl+Enter also sends.</p>' : ""}
      </div></div>`;
  }
  app.innerHTML = `<div class="desk"><div>${left}</div><div>${right}</div></div>`;
  const say = $("#say");
  if (say) { say.onkeydown = (e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); send(); } }; if (!c.busy && !voice.on) say.focus({ preventScroll: true }); }
  const on = (id, fn) => { const el = $("#" + id); if (el) el.onclick = fn; };
  on("send", send); on("end", scoreCall); on("quit", () => go("today")); on("back", () => go("today")); on("again", () => startCall(c.kind, r.id));
  on("mic", () => { if (voice.on) { stopVoice(); updateMic(); } else { try { window.speechSynthesis?.cancel(); } catch { /* ignore */ } startListening(); } });
  const st = $("#speakT"); if (st) st.onchange = () => { c.speakOn = st.checked; store.set("speak", st.checked); if (!st.checked) window.speechSynthesis?.cancel(); };
  const hf = $("#handsT"); if (hf) hf.onchange = () => { c.handsFree = hf.checked; store.set("handsFree", hf.checked); };
  updateMic();
}

function resultChip(r) { return r === "met" ? '<span class="chip good">Met</span>' : r === "partial" ? '<span class="chip warn">Partly</span>' : r === "missed" ? '<span class="chip bad">Missed</span>' : '<span class="chip">N/A</span>'; }
function feedbackHtml(a) {
  const lines = (a.better_lines || []).filter((b) => b.better);
  if (a.kind === "drill") {
    return `<div class="score"><div class="dial ${tone(a.score)}">${a.score}</div><div style="min-width:0;flex:1"><p class="eyebrow">Drill score</p><p style="margin:0">${esc(a.summary)}</p></div></div>
      <div class="grid2" style="margin-top:14px"><div><h3>What worked</h3><p>${esc((a.strengths || [])[0])}</p></div><div><h3>Fix</h3><p>${esc((a.improvements || [])[0])}</p></div></div>
      ${lines[0] ? `<div class="better"><small class="muted">A strong answer</small><div class="now">${esc(lines[0].better)}</div></div>` : ""}`;
  }
  const order = { missed: 0, partial: 1, met: 2, na: 3 };
  const cr = [...(a.criteria || [])].sort((x, y) => order[x.result] - order[y.result]);
  return `<div class="score"><div class="dial ${tone(a.score)}">${a.score}</div><div style="min-width:0;flex:1"><p class="eyebrow">Call score${a.outcome ? " · outcome: " + esc(a.outcome) : ""}</p><p style="margin:0">${esc(a.summary)}</p></div></div>
    ${lines.length ? '<h3 style="margin-top:18px">Say it better</h3>' + lines.map((b) => `<div class="better"><div class="was">${esc(b.original)}</div><div class="now">${esc(b.better)}</div>${b.why ? `<small class="muted">${esc(b.why)}</small>` : ""}</div>`).join("") : ""}
    <div class="grid2" style="margin-top:14px"><div><h3>Keep doing</h3><ul class="tight">${(a.strengths || []).map((x) => `<li>${esc(x)}</li>`).join("") || '<li class="muted">–</li>'}</ul></div><div><h3>Fix next</h3><ul class="tight">${(a.improvements || []).map((x) => `<li>${esc(x)}</li>`).join("") || '<li class="muted">–</li>'}</ul></div></div>
    <h3 style="margin-top:14px">Rules check</h3><ul class="crit">${cr.map((x) => `<li>${resultChip(x.result)}<div><strong>${esc(crit(x.id).label)}</strong>${x.note ? `<small>${esc(x.note)}</small>` : ""}</div></li>`).join("")}</ul>`;
}

/* ---------- Progress ---------- */
function renderProgress(app, all, heading, intro = "") {
  const list = all.filter((a) => a.pack === S.packId);
  if (!list.length) { app.innerHTML = `${intro}<div class="panel empty"><h2 style="font-size:20px;margin-bottom:6px">${esc(heading)}</h2>No ${esc(pack().name)} sessions yet. Results appear here after the first practice call or drill.</div>`; bindIntro(app); return; }
  const per = stats(list.slice(0, 60));
  const days = []; for (let i = 13; i >= 0; i--) days.push(keyOf(addDays(S.today, -i)));
  const byDay = days.map((k) => { const xs = list.filter((a) => a.day === k); return xs.length ? Math.round(xs.reduce((s, a) => s + a.score, 0) / xs.length) : null; });
  const W = 640, H = 180, pl = 30, pr = 12, pt = 12, pb = 26;
  const x = (i) => pl + (i * (W - pl - pr)) / 13, y = (v) => pt + ((100 - v) * (H - pt - pb)) / 100;
  const pts = byDay.map((v, i) => (v === null ? null : [x(i), y(v)])).filter(Boolean);
  let svg = `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Daily average score, last 14 days">`;
  [0, 50, 80, 100].forEach((v) => { svg += `<line x1="${pl}" x2="${W - pr}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line)" ${v === 80 ? 'stroke-dasharray="4 4"' : ""}/><text x="${pl - 6}" y="${y(v) + 4}" text-anchor="end">${v}</text>`; });
  days.forEach((k, i) => { if (i % 2 === 1 || i === 13) svg += `<text x="${x(i)}" y="${H - 8}" text-anchor="middle">${i === 13 ? "Today" : prettyKey(k).split(" ").slice(1).join(" ")}</text>`; });
  if (pts.length > 1) svg += `<path d="M${pts.map((p) => p.join(",")).join("L")}" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linejoin="round"/>`;
  pts.forEach((p, i) => (svg += `<circle cx="${p[0]}" cy="${p[1]}" r="${i === pts.length - 1 ? 5 : 3.5}" fill="var(--accent)" stroke="var(--surface)" stroke-width="2"/>`));
  svg += "</svg>";
  const av = (xs) => (xs.length ? Math.round(xs.reduce((s, a) => s + a.score, 0) / xs.length) : null);
  const wk = keyOf(addDays(S.today, -6)), pwk = keyOf(addDays(S.today, -13));
  const d7 = av(list.filter((a) => a.day >= wk)), p7 = av(list.filter((a) => a.day < wk && a.day >= pwk));
  const bars = pack().criteria.map((c) => ({ c, pct: per[c.id].n ? Math.round((per[c.id].met / per[c.id].n) * 100) : null })).sort((a, b) => (a.pct ?? 101) - (b.pct ?? 101));
  const practise = list.filter((a) => (a.better_lines || []).some((b) => b.better)).slice(0, 6);
  const rows = list.slice(0, 60);
  app.innerHTML = `${intro}<div class="hello"><div><p class="eyebrow">${esc(pack().name)}</p><h1>${esc(heading)}</h1></div>
    <div class="kpis"><div class="kpi"><b>${list.length}</b><span>sessions</span></div><div class="kpi"><b>${av(list)}</b><span>average score</span></div><div class="kpi"><b>${d7 ?? "–"}</b><span>last 7 days${d7 !== null && p7 !== null ? ` (${d7 >= p7 ? "+" : ""}${d7 - p7})` : ""}</span></div><div class="kpi"><b>${streak(all)}</b><span>day streak</span></div></div></div>
    <div class="grid2"><div class="panel"><h3>Daily average, last 14 days</h3><div class="tw">${svg}</div><p class="muted" style="font-size:12.5px;margin:4px 0 0">Dashed line = 80, the go-live standard.</p></div>
    <div class="panel"><h3>Rules, weakest first</h3><div class="bars">${bars.map((b) => `<div class="bar"><span>${esc(b.c.label)}</span><div class="track"><div class="fill" style="width:${b.pct ?? 0}%;background:var(--${b.pct === null ? "line" : tone(b.pct)})"></div></div><b>${b.pct === null ? "–" : b.pct + "%"}</b></div>`).join("")}</div></div></div>
    ${practise.length ? `<div class="panel" style="margin-top:14px"><h3>Lines to practise</h3>${practise.map((a) => { const b = a.better_lines.find((z) => z.better); return `<div class="better"><small class="muted">${esc(a.title)} · ${esc(prettyKey(a.day))}</small><div class="was">${esc(b.original)}</div><div class="now">${esc(b.better)}</div></div>`; }).join("")}</div>` : ""}
    <div class="panel" style="margin-top:14px"><h3>History</h3><div class="tw"><table class="hist"><thead><tr><th>Date</th><th>Session</th><th>Score</th><th>Feedback</th></tr></thead><tbody>
    ${rows.map((a, i) => `<tr><td>${esc(prettyKey(a.day))}</td><td>${esc(a.title)}<br><span class="chip">${a.kind === "drill" ? "Drill" : "Call"}</span></td><td class="num"><span class="chip ${tone(a.score)}">${a.score}</span></td><td>${esc(a.summary || "")} <button class="btn small" data-open="${i}">Details</button></td></tr>`).join("")}
    </tbody></table></div></div><div id="detail"></div>`;
  app.querySelectorAll("[data-open]").forEach((b) => (b.onclick = () => {
    const a = rows[Number(b.dataset.open)], box = $("#detail");
    box.innerHTML = `<div class="panel" style="margin-top:14px"><div class="row" style="justify-content:space-between"><h3 style="margin:0">${esc(a.title)} · ${esc(prettyKey(a.day))}</h3><button class="btn small" id="closeD">Close</button></div>${feedbackHtml(a)}
      ${a.kind === "roleplay" ? `<h3 style="margin-top:14px">Transcript</h3><div class="thread">${(a.transcript || []).map((t) => `<div class="bubble ${t.who === "me" ? "me" : "guest"}"><span class="who2">${t.who === "me" ? "Agent" : "Guest"}</span>${esc(t.text)}</div>`).join("")}</div>` : ""}</div>`;
    $("#closeD").onclick = () => (box.innerHTML = "");
    box.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }));
  bindIntro(app);
}
function bindIntro(app) { app.querySelectorAll("[data-person]").forEach((b) => (b.onclick = () => openPerson(b.dataset.person))); }

/* ---------- Team (managers) ---------- */
async function renderTeam(app) {
  app.innerHTML = '<div class="empty">Loading the team…</div>';
  const since = keyOf(addDays(S.today, -13));
  const [{ data: people, error: e1 }, { data: recent, error: e2 }] = await Promise.all([
    S.sb.from("profiles").select("*").order("full_name"),
    S.sb.from("attempts").select("user_id, score, day, pack").gte("day", since).limit(5000),
  ]);
  if (S.view !== "team" || S.call) return;
  if (e1 || e2) { app.innerHTML = '<div class="notice warn">Could not load the team. Reload the page.</div>'; return; }
  S.team.people = people; S.team.recent = recent;
  const wk = keyOf(addDays(S.today, -6));
  const rowsHtml = people.map((p) => {
    const mine = recent.filter((a) => a.user_id === p.id && a.pack === S.packId);
    const w = mine.filter((a) => a.day >= wk);
    const avg = w.length ? Math.round(w.reduce((s, a) => s + a.score, 0) / w.length) : null;
    const last = mine.map((a) => a.day).sort().pop();
    const self = p.id === S.profile.id;
    return `<tr><td><button class="linkbtn" data-person="${esc(p.id)}">${esc(p.full_name || p.email)}</button><br><small class="muted">${esc(p.email)}</small></td>
      <td class="num">${w.length}</td><td>${avg === null ? "–" : `<span class="chip ${tone(avg)}">${avg}</span>`}</td><td>${last ? esc(prettyKey(last)) : "–"}</td>
      <td><select data-team="${esc(p.id)}" aria-label="Team for ${esc(p.full_name || p.email)}"><option value="sales" ${p.team === "sales" ? "selected" : ""}>Sales</option><option value="support" ${p.team === "support" ? "selected" : ""}>Customer support</option></select></td>
      <td><select data-role="${esc(p.id)}" ${self ? "disabled" : ""} aria-label="Role for ${esc(p.full_name || p.email)}"><option value="trainee" ${p.role === "trainee" ? "selected" : ""}>Trainee</option><option value="manager" ${p.role === "manager" ? "selected" : ""}>Manager</option></select></td></tr>`;
  }).join("");
  app.innerHTML = `<div class="hello"><div><p class="eyebrow">${esc(pack().name)} · managers only</p><h1>Team</h1></div></div>
    <div class="panel"><h3>People</h3><p class="muted" style="margin-top:0">Click a name to see their scores, transcripts and daily summaries. New people appear here after they create an account with their company email.</p>
    <div class="tw"><table class="roster"><thead><tr><th>Name</th><th>Sessions (7 days)</th><th>Avg (7 days)</th><th>Last practised</th><th>Team</th><th>Role</th></tr></thead><tbody>${rowsHtml}</tbody></table></div><p class="msg" id="teammsg"></p></div>
    <div id="person"></div>`;
  bindIntro(app);
  const setField = async (id, field, value) => {
    const m = $("#teammsg");
    const { error } = await S.sb.from("profiles").update({ [field]: value }).eq("id", id);
    m.className = "msg " + (error ? "err" : "ok"); m.textContent = error ? "Could not save: " + error.message : "Saved.";
  };
  app.querySelectorAll("[data-team]").forEach((s) => (s.onchange = () => setField(s.dataset.team, "team", s.value)));
  app.querySelectorAll("[data-role]").forEach((s) => (s.onchange = () => setField(s.dataset.role, "role", s.value)));
  if (S.team.sel) openPerson(S.team.sel);
}
async function openPerson(id) {
  S.team.sel = id;
  const box = $("#person"); if (!box) return;
  box.innerHTML = '<div class="empty">Loading results…</div>';
  try {
    const [list, note] = await Promise.all([loadAttempts(id), loadNote(id, S.today)]);
    if (S.view !== "team" || S.team.sel !== id) return;
    const p = S.team.people.find((x) => x.id === id);
    const intro = note ? `<div class="focus"><p class="eyebrow">Today's coaching summary</p><p style="white-space:pre-wrap">${esc(note)}</p></div>` : "";
    const holder = document.createElement("div");
    renderProgress(holder, list, (p?.full_name || p?.email || "Trainee") + ": progress", intro);
    box.innerHTML = '<div style="height:18px"></div>'; box.appendChild(holder);
    box.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  } catch (e) { box.innerHTML = `<div class="notice warn">${esc(e.message)}</div>`; }
}

/* ---------- How it works ---------- */
function renderHow(app) {
  app.innerHTML = `<div class="panel" style="max-width:780px"><p class="eyebrow">How it works</p><h1 style="font-size:28px;margin-bottom:10px">Twenty minutes a day, built from real calls</h1>
  <p>Every day you get <strong>two practice calls</strong> and <strong>three quick drills</strong>. They come from real recorded calls and from the Homesly Shared Library rules. The first call targets your weakest rule from recent sessions.</p>
  <h3 style="margin-top:16px">Practice calls</h3><p>The AI plays the guest, with a real personality and hidden goals. Press <strong>Speak</strong> and talk, or type, exactly as on the phone. Turn on <strong>Hands-free</strong> for a natural call: the guest speaks aloud, the mic opens, and your reply sends when you pause. The left panel shows the live rate and knowledge base you would see on a real call. Quote only what's there.</p>
  <p>When the call ends, press <strong>End call &amp; get feedback</strong>. You get a score out of 100, every rule marked Met, Partly or Missed, and the exact lines to say better next time.</p>
  <h3 style="margin-top:16px">Quick drills</h3><p>One real moment from a recorded call: what the guest said, and what was said back. You give a better reply and get a score, a fix and a model answer.</p>
  <h3 style="margin-top:16px">What gets scored (${esc(pack().name)})</h3><ul class="rules">${pack().criteria.map((c) => `<li><strong>${esc(c.label)}:</strong> ${esc(c.tip)}</li>`).join("")}</ul>
  <h3 style="margin-top:16px">Voice tips</h3><ul class="rules"><li>Use Chrome or Edge on a computer, with a headset if you can.</li><li>Allow the microphone when the browser asks.</li><li>No mic button? On Windows, press <strong>Windows key + H</strong> to dictate into the reply box.</li></ul>
  <h3 style="margin-top:16px">Who sees results</h3><p>Your results are private to you and to managers. Managers see everyone's scores, transcripts and daily summaries in the Team tab.</p>
  <p class="muted" style="font-size:13px">The coach scores the words you say, not your tone of voice or accent. Practice prices and facts are made up for training. Never use them on a real call.</p></div>`;
}

boot();
