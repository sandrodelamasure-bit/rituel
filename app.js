/* ─────────────────────────────────────────────────────────────────
   RITUEL — App logic (vanilla, localStorage, zero deps)
   ───────────────────────────────────────────────────────────────── */

const STORAGE_KEY = "rituel_v2";
const LEGACY_KEYS = ["rituel_v1"];
const THEME_KEY = "rituel_theme";
const SYNC_KEY = "rituel_sync_v1";

/* ── FREQUENCY (array of JS day indices, 0=dim ... 6=sam) ─────── */
const DAYS_ALL     = [0, 1, 2, 3, 4, 5, 6];
const DAYS_WEEKDAY = [1, 2, 3, 4, 5];
const DAYS_WEEKEND = [0, 6];
const FREQ_PRESETS = {
  daily:   DAYS_ALL.slice(),
  weekday: DAYS_WEEKDAY.slice(),
  weekend: DAYS_WEEKEND.slice(),
  none:    [],
};
function legacyFreqToDays(f) {
  if (Array.isArray(f)) return f.slice();
  if (f === "weekday") return DAYS_WEEKDAY.slice();
  if (f === "weekend") return DAYS_WEEKEND.slice();
  return DAYS_ALL.slice();
}
function sameDays(a, b) {
  if (a.length !== b.length) return false;
  const sa = a.slice().sort(), sb = b.slice().sort();
  return sa.every((v, i) => v === sb[i]);
}

/* ── ICON LIBRARY (Phosphor-inspired, hand-tuned) ─────────────── */
const ICONS = {
  spark:   '<path d="M12 3v6M12 15v6M3 12h6M15 12h6M5.5 5.5l4 4M14.5 14.5l4 4M5.5 18.5l4-4M14.5 9.5l4-4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>',
  brain:   '<path d="M9 4a3 3 0 0 0-3 3v1a3 3 0 0 0-2 2.8c0 1.2.7 2.2 1.8 2.7-.5.6-.8 1.4-.8 2.2a3 3 0 0 0 4 2.8c.4 1.4 1.7 2.5 3.2 2.5h.4M15 4a3 3 0 0 1 3 3v1a3 3 0 0 1 2 2.8c0 1.2-.7 2.2-1.8 2.7.5.6.8 1.4.8 2.2a3 3 0 0 1-4 2.8c-.4 1.4-1.7 2.5-3.2 2.5H12V4h3Z" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>',
  book:    '<path d="M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2V5Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="M4 19a2 2 0 0 0 2 2h12" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>',
  barbell: '<path d="M3 9v6M21 9v6M6 7v10M18 7v10M6 12h12" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>',
  droplet: '<path d="M12 3.5s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>',
  leaf:    '<path d="M20 4c-9 0-15 5-15 12a4 4 0 0 0 4 4c7 0 12-6 12-15 0-.4-.5-1-1-1Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="M5 20c5-8 9-11 14-13" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>',
  sun:     '<circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4l1.4-1.4M17 7l1.4-1.4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>',
  moon:    '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>',
  pen:     '<path d="M4 20h4l11-11-4-4L4 16v4Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="M14 6l4 4" stroke="currentColor" stroke-width="1.3"/>',
  run:     '<circle cx="15" cy="4.5" r="1.5" stroke="currentColor" stroke-width="1.3"/><path d="M9 21l2-6-3-3 4-4 3 3 3 1M5 11l3-2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>',
  coffee:  '<path d="M4 9h13v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V9Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="M17 11h2a2 2 0 0 1 0 4h-2M8 3v3M12 3v3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>',
  target:  '<circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.3"/><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.3"/><circle cx="12" cy="12" r="1" fill="currentColor"/>',
  music:   '<path d="M9 18V5l11-2v13" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><circle cx="6" cy="18" r="3" stroke="currentColor" stroke-width="1.3"/><circle cx="17" cy="16" r="3" stroke="currentColor" stroke-width="1.3"/>',
  flame:   '<path d="M12 3s4 4 4 8a4 4 0 0 1-8 0 4 4 0 0 1 2-3.5C10 8 12 6 12 3Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="M9 17a3 3 0 0 0 6 0" stroke="currentColor" stroke-width="1.3"/>',
  heart:   '<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>',
  apple:   '<path d="M12 7c-2-3-7-2-7 3 0 5 4 11 7 11s7-6 7-11c0-5-5-6-7-3Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="M12 7c0-2 1-4 3-4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>',
  bell:    '<path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15L6 16Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="M10 21a2 2 0 0 0 4 0" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>',
  globe:   '<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.3"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" stroke="currentColor" stroke-width="1.3"/>',
};
const ICON_KEYS = Object.keys(ICONS);

const COLORS = [
  { id: "champagne", value: "#c9a66b" },
  { id: "sauge",     value: "#8fa68e" },
  { id: "cuivre",    value: "#b47356" },
  { id: "ardoise",   value: "#7e8694" },
  { id: "vin",       value: "#9a4f5e" },
  { id: "encre",     value: "#5a6a7e" },
  { id: "mousse",    value: "#6e8266" },
  { id: "ocre",      value: "#c08a4a" },
  { id: "rosee",     value: "#c38b8b" },
  { id: "lin",       value: "#a09078" },
  { id: "marine",    value: "#4a5d75" },
  { id: "or",        value: "#d4b97a" },
];

const QUOTES = [
  { t: "Nous sommes ce que nous faisons de manière répétée. L'excellence n'est donc pas un acte, mais une habitude.", a: "Aristote" },
  { t: "La discipline est le pont entre les objectifs et les accomplissements.", a: "Jim Rohn" },
  { t: "On ne change pas un jour, on change chaque jour.", a: "Anonyme" },
  { t: "Le secret de votre avenir est caché dans votre routine quotidienne.", a: "Mike Murdock" },
  { t: "La constance est plus importante que la perfection.", a: "James Clear" },
  { t: "Ce que vous faites tous les jours compte plus que ce que vous faites de temps en temps.", a: "Gretchen Rubin" },
  { t: "Bien commencer la journée, c'est déjà l'avoir gagnée.", a: "Sénèque" },
  { t: "Une habitude, à force d'être répétée, devient une seconde nature.", a: "Cicéron" },
];

/* ── STATE ───────────────────────────────────────────────────── */
let state = loadState();

function defaultState() {
  return {
    habits: [],
    checkins: {}, // { habitId: { 'YYYY-MM-DD': true } }
    notes: [],    // [{ id, text, done, createdAt }]
    createdAt: Date.now(),
  };
}

function loadState() {
  try {
    // Try current version first
    let raw = localStorage.getItem(STORAGE_KEY);
    let parsed = raw ? JSON.parse(raw) : null;

    // Migrate from legacy versions if needed
    if (!parsed) {
      for (const k of LEGACY_KEYS) {
        const old = localStorage.getItem(k);
        if (old) { parsed = JSON.parse(old); break; }
      }
    }
    if (!parsed || !parsed.habits) return seedState();

    // Migration: frequency string → array of day indices
    parsed.habits = parsed.habits.map(h => ({
      ...h,
      frequency: legacyFreqToDays(h.frequency),
    }));
    if (!parsed.notes) parsed.notes = [];
    saveState(parsed);
    return parsed;
  } catch (e) {
    return seedState();
  }
}

function seedState() {
  // First-time seed: 3 example habits + 30 days of realistic data
  const today = new Date();
  const habits = [
    { id: id(), name: "Méditation", description: "10 minutes au calme", icon: "brain", color: "#8fa68e", frequency: DAYS_ALL.slice(), createdAt: Date.now() },
    { id: id(), name: "Lecture",    description: "20 pages avant le coucher", icon: "book", color: "#c9a66b", frequency: DAYS_ALL.slice(), createdAt: Date.now() },
    { id: id(), name: "Mouvement",  description: "30 minutes d'activité", icon: "barbell", color: "#b47356", frequency: DAYS_WEEKDAY.slice(), createdAt: Date.now() },
  ];
  const checkins = {};
  habits.forEach((h, idx) => {
    checkins[h.id] = {};
    const base = [0.78, 0.62, 0.70][idx]; // probability per habit
    for (let d = 0; d < 30; d++) {
      const date = new Date(today);
      date.setDate(today.getDate() - d);
      // a bit more likely on recent days
      const recencyBoost = d < 7 ? 0.12 : 0;
      if (Math.random() < base + recencyBoost) {
        checkins[h.id][fmtDate(date)] = true;
      }
    }
  });
  const seeded = { habits, checkins, notes: [], createdAt: Date.now() };
  saveState(seeded);
  return seeded;
}

function saveState(s = state, opts = {}) {
  s.updatedAt = Date.now();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  if (!opts.skipSync) syncPushDebounced();
}

function id() {
  return "h_" + Math.random().toString(36).slice(2, 9);
}

/* ── DATE HELPERS ────────────────────────────────────────────── */
function fmtDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function todayKey() { return fmtDate(new Date()); }

const MONTHS_FR = ["janv.","févr.","mars","avr.","mai","juin","juil.","août","sept.","oct.","nov.","déc."];
const DAYS_FR_FULL = ["dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"];
const DAYS_FR_SHORT = ["dim.","lun.","mar.","mer.","jeu.","ven.","sam."];

function formatLongDate(d) {
  return `${DAYS_FR_FULL[d.getDay()]} ${d.getDate()} ${MONTHS_FR[d.getMonth()]}`;
}

function isHabitDueOn(habit, date) {
  const dow = date.getDay(); // 0=dim, 1=lun ... 6=sam
  const days = legacyFreqToDays(habit.frequency);
  return days.includes(dow);
}

function describeFrequency(days) {
  if (!days || days.length === 0) return "Aucun jour";
  if (sameDays(days, DAYS_ALL))     return "Tous les jours";
  if (sameDays(days, DAYS_WEEKDAY)) return "Jours ouvrés";
  if (sameDays(days, DAYS_WEEKEND)) return "Week-end";
  const short = ["D","L","M","M","J","V","S"];
  return days.slice().sort().map(d => short[d]).join(" · ");
}

/* ── COMPUTED ────────────────────────────────────────────────── */
function dueHabitsForDate(date) {
  return state.habits.filter(h => isHabitDueOn(h, date));
}

function completionRateForDate(date) {
  const due = dueHabitsForDate(date);
  if (due.length === 0) return 0;
  const key = fmtDate(date);
  const done = due.filter(h => state.checkins[h.id]?.[key]).length;
  return done / due.length;
}

function calcStreakForHabit(habit) {
  let streak = 0;
  const today = new Date();
  for (let d = 0; d < 365; d++) {
    const date = new Date(today);
    date.setDate(today.getDate() - d);
    if (!isHabitDueOn(habit, date)) continue;
    if (state.checkins[habit.id]?.[fmtDate(date)]) {
      streak++;
    } else {
      // Allow today to be incomplete without breaking streak
      if (d === 0) continue;
      break;
    }
  }
  return streak;
}

function calcGlobalStreak() {
  let streak = 0;
  const today = new Date();
  for (let d = 0; d < 365; d++) {
    const date = new Date(today);
    date.setDate(today.getDate() - d);
    const due = dueHabitsForDate(date);
    if (due.length === 0) continue;
    const rate = completionRateForDate(date);
    if (rate >= 0.5) {
      streak++;
    } else {
      if (d === 0) continue;
      break;
    }
  }
  return streak;
}

/* ── RENDER : HERO ───────────────────────────────────────────── */
function renderHero() {
  const today = new Date();
  const hour = today.getHours();
  let greeting = "Bonsoir";
  if (hour < 12) greeting = "Bonjour";
  else if (hour < 18) greeting = "Bel après-midi";

  document.getElementById("greeting").textContent = greeting;
  document.getElementById("todayLong").textContent = formatLongDate(today);
  document.getElementById("currentDate").textContent =
    `${String(today.getDate()).padStart(2, "0")} · ${MONTHS_FR[today.getMonth()]} · ${today.getFullYear()}`;

  const due = dueHabitsForDate(today);
  const key = todayKey();
  const done = due.filter(h => state.checkins[h.id]?.[key]).length;
  const total = due.length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  document.getElementById("doneCount").textContent = done;
  document.getElementById("totalCount").textContent = total;
  document.getElementById("globalStreak").textContent = calcGlobalStreak();

  // 30-day consistency
  let sum = 0, count = 0;
  for (let d = 0; d < 30; d++) {
    const dt = new Date(today);
    dt.setDate(today.getDate() - d);
    if (dueHabitsForDate(dt).length === 0) continue;
    sum += completionRateForDate(dt);
    count++;
  }
  const consistency = count === 0 ? 0 : Math.round((sum / count) * 100);
  document.getElementById("consistency30").textContent = consistency;

  // Ring animation
  const ring = document.getElementById("ringFill");
  const circumference = 2 * Math.PI * 92; // ~578
  const offset = circumference * (1 - pct / 100);
  ring.style.transition = "stroke-dashoffset 1.4s cubic-bezier(.16,1,.3,1)";
  // Force a frame before animating
  requestAnimationFrame(() => {
    ring.setAttribute("stroke-dashoffset", offset);
  });

  // Animated counter
  animateNumber(document.getElementById("ringPct"), pct);

  // Hero sub
  const sub = document.getElementById("heroSub");
  if (total === 0) {
    sub.textContent = "Composez votre premier rituel ci-dessous. Un seul suffit.";
  } else if (done === total) {
    sub.textContent = `Tous vos rituels du jour sont accomplis. Reposez-vous : c'est aussi une discipline.`;
  } else if (done === 0) {
    sub.textContent = `${total} rituels à honorer aujourd'hui. Une chose à la fois.`;
  } else {
    const remaining = total - done;
    sub.textContent = `${done} accompli${done > 1 ? "s" : ""}, ${remaining} restant${remaining > 1 ? "s" : ""}. Continuez votre cadence.`;
  }
}

function animateNumber(el, target, duration = 1100) {
  const start = parseInt(el.textContent) || 0;
  const startTime = performance.now();
  function frame(now) {
    const t = Math.min(1, (now - startTime) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.round(start + (target - start) * eased);
    if (t < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

/* ── RENDER : HABITS LIST ────────────────────────────────────── */
function renderHabits() {
  const list = document.getElementById("habitsList");
  const empty = document.getElementById("emptyState");
  list.innerHTML = "";

  if (state.habits.length === 0) {
    list.hidden = true;
    empty.hidden = false;
    return;
  }
  list.hidden = false;
  empty.hidden = true;

  const today = new Date();
  const todayK = todayKey();

  state.habits.forEach((habit, i) => {
    const due = isHabitDueOn(habit, today);
    const done = !!state.checkins[habit.id]?.[todayK];
    const streak = calcStreakForHabit(habit);

    // Last 7 days
    const week = [];
    for (let d = 6; d >= 0; d--) {
      const dt = new Date(today);
      dt.setDate(today.getDate() - d);
      const k = fmtDate(dt);
      const dueThat = isHabitDueOn(habit, dt);
      week.push({
        label: DAYS_FR_SHORT[dt.getDay()][0].toUpperCase(),
        done: !!state.checkins[habit.id]?.[k],
        due: dueThat,
        today: d === 0,
      });
    }

    const row = document.createElement("div");
    row.className = "habit";
    row.style.setProperty("--i", i);
    row.style.setProperty("--habit-color", habit.color);

    const days = legacyFreqToDays(habit.frequency);
    const isDaily = sameDays(days, DAYS_ALL);
    const freqLabel = isDaily ? "" : describeFrequency(days);
    row.innerHTML = `
      <div class="habit-icon">
        <svg viewBox="0 0 24 24" fill="none">${ICONS[habit.icon] || ICONS.spark}</svg>
      </div>
      <div class="habit-body">
        <div class="habit-name">${escapeHtml(habit.name)}</div>
        <div class="habit-meta">
          ${habit.description ? `<span class="habit-desc">${escapeHtml(habit.description)}</span>` : ""}
          ${habit.description ? `<span class="habit-sep">·</span>` : ""}
          <span class="habit-streak ${streak === 0 ? "cold" : ""}">
            <svg viewBox="0 0 24 24" fill="none"><path d="M12 3s4 4 4 8a4 4 0 0 1-8 0 4 4 0 0 1 2-3.5C10 8 12 6 12 3Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>
            ${streak} jour${streak > 1 ? "s" : ""}
          </span>
          ${freqLabel ? `<span class="habit-sep">·</span><span class="habit-freq">${escapeHtml(freqLabel)}</span>` : ""}
        </div>
      </div>
      <div class="habit-week">
        ${week.map(d => `
          <span class="habit-week-day ${d.done ? "done" : ""} ${d.today ? "today" : ""}" style="${!d.due ? "opacity:0.35" : ""}">${d.label}</span>
        `).join("")}
      </div>
      <div style="display:flex;gap:6px;align-items:center;">
        ${due ? `
          <button class="habit-check ${done ? "done" : ""}" data-action="toggle" data-id="${habit.id}" aria-label="Marquer comme accompli">
            <svg viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4 4 10-10" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        ` : `
          <span class="habit-check" style="cursor:default;opacity:0.4" title="Pas prévu aujourd'hui">
            <svg viewBox="0 0 24 24" fill="none"><path d="M6 12h12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
          </span>
        `}
        <button class="habit-edit" data-action="edit" data-id="${habit.id}" aria-label="Modifier">
          <svg viewBox="0 0 24 24" fill="none"><circle cx="5" cy="12" r="1.3" fill="currentColor"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/><circle cx="19" cy="12" r="1.3" fill="currentColor"/></svg>
        </button>
      </div>
    `;

    list.appendChild(row);
  });
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
}

/* ── RENDER : CHART (SVG, smooth area) ───────────────────────── */
function renderChart() {
  const svg = document.getElementById("chart");
  if (!svg) return;
  svg.innerHTML = "";

  const W = 800, H = 320;
  const padding = { top: 30, right: 30, bottom: 38, left: 38 };
  const innerW = W - padding.left - padding.right;
  const innerH = H - padding.top - padding.bottom;

  // Last 30 days, oldest first
  const today = new Date();
  const days = [];
  for (let d = 29; d >= 0; d--) {
    const dt = new Date(today);
    dt.setDate(today.getDate() - d);
    const rate = completionRateForDate(dt);
    days.push({ date: new Date(dt), rate });
  }

  // Update stats
  const valid = days.filter(d => dueHabitsForDate(d.date).length > 0);
  const avg = valid.length === 0 ? 0 : valid.reduce((a, b) => a + b.rate, 0) / valid.length;
  const best = days.reduce((acc, d) => d.rate > acc.rate ? d : acc, { rate: -1 });
  const firstHalf = valid.slice(0, Math.floor(valid.length / 2));
  const secondHalf = valid.slice(Math.floor(valid.length / 2));
  const avg1 = firstHalf.length === 0 ? 0 : firstHalf.reduce((a, b) => a + b.rate, 0) / firstHalf.length;
  const avg2 = secondHalf.length === 0 ? 0 : secondHalf.reduce((a, b) => a + b.rate, 0) / secondHalf.length;
  const trendDelta = Math.round((avg2 - avg1) * 100);

  const totalCheckins = state.habits.reduce((acc, h) => {
    return acc + Object.keys(state.checkins[h.id] || {}).length;
  }, 0);

  document.getElementById("avg30").innerHTML = `${Math.round(avg * 100)}<span class="unit">%</span>`;
  document.getElementById("bestDay").innerHTML = best.rate > 0
    ? `${Math.round(best.rate * 100)}<span class="unit">%</span>`
    : `—`;
  const trendEl = document.getElementById("trend");
  if (Math.abs(trendDelta) < 1) {
    trendEl.innerHTML = `<span class="arrow">→</span>stable`;
    trendEl.className = "cstat-value";
  } else if (trendDelta > 0) {
    trendEl.innerHTML = `<span class="arrow">↗</span>+${trendDelta}<span class="unit">pts</span>`;
    trendEl.className = "cstat-value up";
  } else {
    trendEl.innerHTML = `<span class="arrow">↘</span>${trendDelta}<span class="unit">pts</span>`;
    trendEl.className = "cstat-value down";
  }
  document.getElementById("totalCheckins").textContent = totalCheckins;

  // Build SVG
  const ns = "http://www.w3.org/2000/svg";
  const accent = getComputedStyle(document.body).getPropertyValue("--accent").trim();
  const textMute = getComputedStyle(document.body).getPropertyValue("--text-mute").trim();
  const border = getComputedStyle(document.body).getPropertyValue("--border").trim();

  // Grid lines (horizontal)
  [0, 0.25, 0.5, 0.75, 1].forEach(v => {
    const y = padding.top + innerH * (1 - v);
    const line = document.createElementNS(ns, "line");
    line.setAttribute("x1", padding.left);
    line.setAttribute("x2", W - padding.right);
    line.setAttribute("y1", y);
    line.setAttribute("y2", y);
    line.setAttribute("stroke", border);
    line.setAttribute("stroke-width", "1");
    line.setAttribute("stroke-dasharray", v === 0 || v === 1 ? "" : "2 4");
    svg.appendChild(line);

    const label = document.createElementNS(ns, "text");
    label.setAttribute("x", padding.left - 10);
    label.setAttribute("y", y + 3);
    label.setAttribute("text-anchor", "end");
    label.setAttribute("font-family", "JetBrains Mono, monospace");
    label.setAttribute("font-size", "10");
    label.setAttribute("fill", textMute);
    label.textContent = Math.round(v * 100);
    svg.appendChild(label);
  });

  // X labels (every 5 days)
  days.forEach((d, i) => {
    if (i % 5 !== 0 && i !== days.length - 1) return;
    const x = padding.left + (innerW * (i / (days.length - 1)));
    const label = document.createElementNS(ns, "text");
    label.setAttribute("x", x);
    label.setAttribute("y", H - padding.bottom + 18);
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("font-family", "JetBrains Mono, monospace");
    label.setAttribute("font-size", "10");
    label.setAttribute("fill", textMute);
    label.textContent = `${d.date.getDate()} ${MONTHS_FR[d.date.getMonth()].replace(".","")}`;
    svg.appendChild(label);
  });

  // Points
  const points = days.map((d, i) => ({
    x: padding.left + innerW * (i / (days.length - 1)),
    y: padding.top + innerH * (1 - d.rate),
    rate: d.rate,
    date: d.date,
  }));

  // Smooth path via cubic bezier with tension
  const linePath = smoothPath(points);
  const areaPath = linePath + ` L${points[points.length - 1].x} ${padding.top + innerH} L${points[0].x} ${padding.top + innerH} Z`;

  // Gradient defs
  const defs = document.createElementNS(ns, "defs");
  const gradId = "chartGrad";
  defs.innerHTML = `
    <linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.28"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
    </linearGradient>
  `;
  svg.appendChild(defs);

  // Area
  const area = document.createElementNS(ns, "path");
  area.setAttribute("d", areaPath);
  area.setAttribute("fill", `url(#${gradId})`);
  area.style.opacity = "0";
  area.style.transition = "opacity 0.8s ease 0.5s";
  svg.appendChild(area);

  // Line
  const line = document.createElementNS(ns, "path");
  line.setAttribute("d", linePath);
  line.setAttribute("stroke", accent);
  line.setAttribute("stroke-width", "1.8");
  line.setAttribute("fill", "none");
  line.setAttribute("stroke-linecap", "round");
  line.setAttribute("stroke-linejoin", "round");
  // Animated draw
  const length = line.getTotalLength?.() || 2000;
  line.style.strokeDasharray = length;
  line.style.strokeDashoffset = length;
  line.style.transition = "stroke-dashoffset 1.4s cubic-bezier(.16,1,.3,1)";
  svg.appendChild(line);

  requestAnimationFrame(() => {
    line.style.strokeDashoffset = "0";
    area.style.opacity = "1";
  });

  // Dots (interactive)
  points.forEach((p, i) => {
    const dot = document.createElementNS(ns, "circle");
    dot.setAttribute("cx", p.x);
    dot.setAttribute("cy", p.y);
    dot.setAttribute("r", "3");
    dot.setAttribute("fill", "var(--bg)");
    dot.setAttribute("stroke", accent);
    dot.setAttribute("stroke-width", "1.4");
    dot.style.opacity = "0";
    dot.style.transition = `opacity 0.4s ease ${0.8 + i * 0.015}s`;
    svg.appendChild(dot);
    requestAnimationFrame(() => { dot.style.opacity = i === points.length - 1 ? "1" : "0"; });

    // Invisible hover area
    const hover = document.createElementNS(ns, "rect");
    const slotW = innerW / (points.length - 1);
    hover.setAttribute("x", p.x - slotW / 2);
    hover.setAttribute("y", padding.top);
    hover.setAttribute("width", slotW);
    hover.setAttribute("height", innerH);
    hover.setAttribute("fill", "transparent");
    hover.style.cursor = "crosshair";
    svg.appendChild(hover);

    hover.addEventListener("mouseenter", () => {
      dot.style.opacity = "1";
      dot.setAttribute("r", "4.5");
      showTooltip(p);
    });
    hover.addEventListener("mouseleave", () => {
      if (i !== points.length - 1) dot.style.opacity = "0";
      dot.setAttribute("r", "3");
      hideTooltip();
    });
  });
}

function smoothPath(pts) {
  if (pts.length < 2) return "";
  const tension = 0.22;
  let d = `M${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1x = p1.x + (p2.x - p0.x) * tension;
    const c1y = p1.y + (p2.y - p0.y) * tension;
    const c2x = p2.x - (p3.x - p1.x) * tension;
    const c2y = p2.y - (p3.y - p1.y) * tension;
    d += ` C${c1x} ${c1y} ${c2x} ${c2y} ${p2.x} ${p2.y}`;
  }
  return d;
}

function showTooltip(p) {
  const tip = document.getElementById("chartTooltip");
  tip.hidden = false;
  const wrap = document.querySelector(".chart-wrap");
  const rect = wrap.getBoundingClientRect();
  const xRel = (p.x / 800) * rect.width;
  const yRel = (p.y / 320) * rect.height;
  tip.innerHTML = `
    <small>${formatLongDate(p.date)}</small>
    <strong>${Math.round(p.rate * 100)}%</strong> accompli
  `;
  tip.style.left = `${xRel}px`;
  tip.style.top = `${yRel}px`;
}
function hideTooltip() {
  document.getElementById("chartTooltip").hidden = true;
}

/* ── RENDER : HEATMAP ────────────────────────────────────────── */
function renderHeatmap() {
  const grid = document.getElementById("heatmap");
  const monthsRow = document.getElementById("heatmapMonths");
  grid.innerHTML = "";
  monthsRow.innerHTML = "";

  // We want 13 weeks. End on today's week (Monday-start convention).
  // For simplicity use Sunday-Sunday weeks but order matters visually.
  // We'll build columns = 13 weeks, each column = 7 days (Mon..Sun)
  const today = new Date();
  // Find start: 13 weeks back, snapped to Monday
  const start = new Date(today);
  // Get Monday of current week
  const dayOfWeek = (today.getDay() + 6) % 7; // 0 = Monday
  start.setDate(today.getDate() - dayOfWeek - 12 * 7);

  const monthSlots = new Array(13).fill(null);
  for (let w = 0; w < 13; w++) {
    const colDate = new Date(start);
    colDate.setDate(start.getDate() + w * 7);
    for (let d = 0; d < 7; d++) {
      const cellDate = new Date(colDate);
      cellDate.setDate(colDate.getDate() + d);
      const cell = document.createElement("div");
      cell.className = "hm-cell";

      const isFuture = cellDate > today;
      if (isFuture) cell.dataset.future = "1";

      const k = fmtDate(cellDate);
      let level = 0;
      let rate = 0;
      if (!isFuture && dueHabitsForDate(cellDate).length > 0) {
        rate = completionRateForDate(cellDate);
        if (rate > 0.0)  level = 1;
        if (rate > 0.4)  level = 2;
        if (rate > 0.7)  level = 3;
        if (rate >= 1.0) level = 4;
      }
      if (level > 0) cell.classList.add("l" + level);

      if (fmtDate(cellDate) === todayKey()) cell.dataset.today = "1";

      cell.title = `${formatLongDate(cellDate)} — ${isFuture ? "à venir" : Math.round(rate * 100) + "% accompli"}`;
      grid.appendChild(cell);
    }
    // Track which months appear in which column
    monthSlots[w] = colDate.getMonth();
  }

  // Render month labels (only show first column of each new month)
  let prev = -1;
  const placeholder = document.createElement("span");
  placeholder.textContent = "";
  monthsRow.appendChild(placeholder);
  monthSlots.forEach((m, i) => {
    const span = document.createElement("span");
    if (m !== prev) {
      span.textContent = MONTHS_FR[m].replace(".", "");
      prev = m;
    }
    monthsRow.appendChild(span);
  });
}

/* ── RENDER : QUOTE ──────────────────────────────────────────── */
function renderQuote() {
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
  const q = QUOTES[dayOfYear % QUOTES.length];
  document.getElementById("dailyQuote").textContent = `« ${q.t} »`;
  document.getElementById("quoteAuthor").textContent = `— ${q.a}`;
}

/* ── MODAL : add / edit habit ────────────────────────────────── */
let editingId = null;
let selectedIcon = "spark";
let selectedColor = COLORS[0].value;
let selectedDays = DAYS_ALL.slice();

function openModal(habit = null) {
  editingId = habit?.id || null;
  const modal = document.getElementById("modal");
  modal.hidden = false;
  document.getElementById("modalTitle").textContent = habit ? "Affiner le rituel" : "Composer un rituel";
  document.getElementById("modalEyebrow").textContent = habit ? "Modifier" : "Nouveau";
  document.getElementById("submitBtn").textContent = habit ? "Enregistrer" : "Créer le rituel";
  document.getElementById("deleteHabitBtn").hidden = !habit;
  document.getElementById("fieldName").value = habit?.name || "";
  document.getElementById("fieldDesc").value = habit?.description || "";
  selectedIcon = habit?.icon || ICON_KEYS[Math.floor(Math.random() * 6)];
  selectedColor = habit?.color || COLORS[Math.floor(Math.random() * COLORS.length)].value;
  selectedDays = habit ? legacyFreqToDays(habit.frequency) : DAYS_ALL.slice();
  renderIconGrid();
  renderColorGrid();
  renderDayChips();
  setTimeout(() => document.getElementById("fieldName").focus(), 100);
}

function renderDayChips() {
  document.querySelectorAll("#dayChips .day-chip").forEach(chip => {
    const d = parseInt(chip.dataset.day, 10);
    chip.classList.toggle("on", selectedDays.includes(d));
  });
  document.getElementById("daySummary").textContent = describeFrequency(selectedDays);
  document.querySelectorAll(".freq-preset").forEach(p => {
    const preset = p.dataset.preset;
    const match = preset === "none"
      ? selectedDays.length === 0
      : sameDays(selectedDays, FREQ_PRESETS[preset]);
    p.style.borderColor = match ? "var(--accent)" : "";
    p.style.color = match ? "var(--accent)" : "";
  });
}

function closeModal() {
  document.getElementById("modal").hidden = true;
  editingId = null;
}

function renderIconGrid() {
  const grid = document.getElementById("iconGrid");
  grid.innerHTML = "";
  ICON_KEYS.forEach(k => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "icon-opt" + (k === selectedIcon ? " active" : "");
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none">${ICONS[k]}</svg>`;
    btn.addEventListener("click", () => {
      selectedIcon = k;
      renderIconGrid();
    });
    grid.appendChild(btn);
  });
}

function renderColorGrid() {
  const grid = document.getElementById("colorGrid");
  grid.innerHTML = "";
  COLORS.forEach(c => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "color-opt" + (c.value === selectedColor ? " active" : "");
    btn.style.setProperty("--c", c.value);
    btn.title = c.id;
    btn.addEventListener("click", () => {
      selectedColor = c.value;
      renderColorGrid();
    });
    grid.appendChild(btn);
  });
}

/* ── ACTIONS ─────────────────────────────────────────────────── */
function toggleHabit(habitId) {
  const k = todayKey();
  state.checkins[habitId] = state.checkins[habitId] || {};
  if (state.checkins[habitId][k]) {
    delete state.checkins[habitId][k];
  } else {
    state.checkins[habitId][k] = true;
    const allDone = state.habits
      .filter(h => isHabitDueOn(h, new Date()))
      .every(h => state.checkins[h.id]?.[k]);
    if (allDone && state.habits.length > 0) {
      toast("Journée accomplie. Reposez-vous.");
    } else {
      toast("Rituel honoré.");
    }
  }
  saveState();
  renderAll();
}

function saveHabit(formData) {
  const data = {
    name: formData.get("name").trim(),
    description: formData.get("description").trim(),
    icon: selectedIcon,
    color: selectedColor,
    frequency: selectedDays.slice().sort(),
  };
  if (!data.name) return;
  if (data.frequency.length === 0) {
    toast("Sélectionnez au moins un jour.");
    return;
  }
  if (editingId) {
    const idx = state.habits.findIndex(h => h.id === editingId);
    if (idx >= 0) state.habits[idx] = { ...state.habits[idx], ...data };
    toast("Rituel modifié.");
  } else {
    state.habits.push({ id: id(), ...data, createdAt: Date.now() });
    toast("Rituel créé.");
  }
  saveState();
  closeModal();
  renderAll();
}

function deleteHabit(habitId) {
  if (!confirm("Supprimer ce rituel et tout son historique ?")) return;
  state.habits = state.habits.filter(h => h.id !== habitId);
  delete state.checkins[habitId];
  saveState();
  closeModal();
  renderAll();
  toast("Rituel supprimé.");
}

/* ── NOTES / CARNET ──────────────────────────────────────────── */
function addNote(text) {
  const t = (text || "").trim();
  if (!t) return;
  state.notes = state.notes || [];
  state.notes.unshift({ id: "n_" + Math.random().toString(36).slice(2, 9), text: t, done: false, createdAt: Date.now() });
  saveState();
  renderNotes();
  toast("Note ajoutée.");
}
function toggleNote(noteId) {
  const n = (state.notes || []).find(x => x.id === noteId);
  if (!n) return;
  n.done = !n.done;
  if (n.done) n.doneAt = Date.now(); else delete n.doneAt;
  saveState();
  renderNotes();
}
function deleteNote(noteId) {
  state.notes = (state.notes || []).filter(x => x.id !== noteId);
  saveState();
  renderNotes();
  toast("Note supprimée.");
}
function editNote(noteId, text) {
  const n = (state.notes || []).find(x => x.id === noteId);
  if (!n) return;
  const t = (text || "").trim();
  if (!t) {
    deleteNote(noteId);
    return;
  }
  n.text = t;
  saveState();
}

function renderNotes() {
  const list = document.getElementById("notesList");
  const empty = document.getElementById("notesEmpty");
  const counter = document.getElementById("noteCount");
  if (!list) return;
  list.innerHTML = "";

  const notes = (state.notes || []).slice();
  // Sort: undone first (oldest first), then done (most recent done first)
  notes.sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    if (a.done) return (b.doneAt || 0) - (a.doneAt || 0);
    return a.createdAt - b.createdAt;
  });

  const remaining = notes.filter(n => !n.done).length;
  counter.textContent = remaining === 0
    ? (notes.length === 0 ? "0" : "✓ tout fait")
    : `${remaining} en cours`;

  if (notes.length === 0) {
    empty.hidden = false;
    return;
  }
  empty.hidden = true;

  notes.forEach((n, i) => {
    const row = document.createElement("div");
    row.className = "note-item" + (n.done ? " done" : "");
    row.style.setProperty("--i", i);
    const meta = n.done && n.doneAt
      ? `<span class="note-meta">Accompli ${relativeTime(n.doneAt)}</span>`
      : `<span class="note-meta">${relativeTime(n.createdAt)}</span>`;
    row.innerHTML = `
      <button class="note-check ${n.done ? "done" : ""}" data-act="toggle" data-id="${n.id}" aria-label="Marquer">
        <svg viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4 4 10-10" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <div>
        <span class="note-text" data-act="edit" data-id="${n.id}" contenteditable="true" spellcheck="false">${escapeHtml(n.text)}</span>
        ${meta}
      </div>
      <button class="note-delete" data-act="delete" data-id="${n.id}" aria-label="Supprimer">
        <svg viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
      </button>
    `;
    list.appendChild(row);
  });
}

function relativeTime(ts) {
  const diff = Date.now() - ts;
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "à l'instant";
  const min = Math.floor(sec / 60);
  if (min < 60) return `il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `il y a ${h} h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `il y a ${d} j`;
  const dt = new Date(ts);
  return `le ${dt.getDate()} ${MONTHS_FR[dt.getMonth()].replace(".","")}`;
}

/* ── TOAST ───────────────────────────────────────────────────── */
let toastTimer;
function toast(msg) {
  const el = document.getElementById("toast");
  el.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4 4 10-10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    ${escapeHtml(msg)}
  `;
  el.hidden = false;
  requestAnimationFrame(() => el.classList.add("show"));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.classList.remove("show");
    setTimeout(() => { el.hidden = true; }, 400);
  }, 2200);
}

/* ── SYNC : GitHub Gist (private) ─────────────────────────────── */
const sync = {
  token: null,
  gistId: null,
  lastPulledAt: null,
  lastPushedAt: null,
  pushTimer: null,
  busy: false,
  error: null,
};

function loadSync() {
  try {
    const raw = localStorage.getItem(SYNC_KEY);
    if (!raw) return;
    const { token, gistId } = JSON.parse(raw);
    sync.token = token || null;
    sync.gistId = gistId || null;
  } catch (e) {}
}

/**
 * Parses #sync=base64(token:gistId) from the URL, configures sync,
 * then performs a smart initial sync (push local if gist is a placeholder,
 * otherwise pull remote into local).
 */
async function checkSyncFromUrl() {
  const hash = location.hash || "";
  const m = hash.match(/[#&]sync=([^&]+)/);
  if (!m) return;
  try {
    const decoded = atob(m[1].replace(/-/g, "+").replace(/_/g, "/"));
    const idx = decoded.indexOf(":");
    if (idx < 0) return;
    const token = decoded.slice(0, idx);
    const gistId = decoded.slice(idx + 1);
    if (!token || !gistId) return;
    sync.token = token;
    sync.gistId = gistId;
    saveSyncConfig();
    // Strip the hash from the URL immediately so it doesn't linger in history
    history.replaceState(null, "", location.pathname + location.search);
    await syncInitial();
  } catch (e) {
    sync.error = "Lien de sync invalide : " + e.message;
    setSyncStatus("error");
  }
}

async function syncInitial() {
  if (!syncEnabled()) return;
  sync.busy = true;
  setSyncStatus("busy");
  try {
    const gist = await ghGist("GET", `/${sync.gistId}`);
    const file = gist.files["rituel-data.json"];
    let remote = null;
    if (file) {
      let content = file.content;
      if (file.truncated && file.raw_url) {
        content = await fetch(file.raw_url).then(r => r.text());
      }
      try { remote = JSON.parse(content); } catch {}
    }
    if (!remote || remote._placeholder || !remote.habits) {
      // Gist is fresh — push local data up
      sync.busy = false;
      await syncPush();
      toast("Synchronisation activée. Vos données sont en ligne.");
    } else {
      // Gist already has data — replace local
      state = remote;
      if (!state.notes) state.notes = [];
      saveState(state, { skipSync: true });
      renderAll();
      sync.lastPulledAt = Date.now();
      toast("Synchronisation activée. Données récupérées.");
    }
    sync.error = null;
    setSyncStatus("on");
  } catch (e) {
    sync.error = e.message;
    setSyncStatus("error");
    toast("Échec de l'activation : " + e.message);
  } finally {
    sync.busy = false;
  }
}
function saveSyncConfig() {
  if (sync.token && sync.gistId) {
    localStorage.setItem(SYNC_KEY, JSON.stringify({ token: sync.token, gistId: sync.gistId }));
  } else {
    localStorage.removeItem(SYNC_KEY);
  }
}
function setSyncStatus(status) {
  const btn = document.getElementById("syncBtn");
  if (!btn) return;
  btn.dataset.status = status || "";
  btn.classList.toggle("syncing", status === "busy");
}
function syncEnabled() { return !!(sync.token && sync.gistId); }

async function ghGist(method, path = "", body = null) {
  const res = await fetch(`https://api.github.com/gists${path}`, {
    method,
    headers: {
      "Authorization": `token ${sync.token}`,
      "Accept": "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const txt = await res.text();
    let msg = `GitHub ${res.status}`;
    try { msg = JSON.parse(txt).message || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

async function syncCreate(token) {
  if (!token || !token.trim()) throw new Error("Token requis.");
  sync.token = token.trim();
  sync.busy = true;
  setSyncStatus("busy");
  try {
    const gist = await ghGist("POST", "", {
      description: "Rituel — données personnelles (chiffré par token GitHub)",
      public: false,
      files: {
        "rituel-data.json": { content: JSON.stringify(state, null, 2) },
      },
    });
    sync.gistId = gist.id;
    sync.lastPushedAt = Date.now();
    saveSyncConfig();
    sync.error = null;
    setSyncStatus("on");
    return gist.id;
  } catch (e) {
    sync.error = e.message;
    sync.token = null;
    setSyncStatus("error");
    throw e;
  } finally {
    sync.busy = false;
  }
}

async function syncPair(token, gistId) {
  if (!token || !token.trim()) throw new Error("Token requis.");
  if (!gistId || !gistId.trim()) throw new Error("Code de partage requis.");
  sync.token = token.trim();
  sync.gistId = gistId.trim();
  sync.busy = true;
  setSyncStatus("busy");
  try {
    const gist = await ghGist("GET", `/${sync.gistId}`);
    const file = gist.files["rituel-data.json"];
    if (!file) throw new Error("Données introuvables dans ce gist.");
    let content = file.content;
    if (file.truncated && file.raw_url) {
      content = await fetch(file.raw_url).then(r => r.text());
    }
    const remote = JSON.parse(content);
    if (!remote.habits) throw new Error("Format de données invalide.");
    state = remote;
    if (!state.notes) state.notes = [];
    saveState(state, { skipSync: true });
    saveSyncConfig();
    sync.lastPulledAt = Date.now();
    sync.error = null;
    setSyncStatus("on");
    renderAll();
    return true;
  } catch (e) {
    sync.error = e.message;
    sync.token = null;
    sync.gistId = null;
    setSyncStatus("error");
    throw e;
  } finally {
    sync.busy = false;
  }
}

async function syncPull(silent = true) {
  if (!syncEnabled() || sync.busy) return;
  sync.busy = true;
  setSyncStatus("busy");
  try {
    const gist = await ghGist("GET", `/${sync.gistId}`);
    const file = gist.files["rituel-data.json"];
    if (!file) return;
    let content = file.content;
    if (file.truncated && file.raw_url) {
      content = await fetch(file.raw_url).then(r => r.text());
    }
    const remote = JSON.parse(content);
    const remoteAt = remote.updatedAt || 0;
    const localAt = state.updatedAt || 0;
    if (remoteAt > localAt) {
      state = remote;
      if (!state.notes) state.notes = [];
      saveState(state, { skipSync: true });
      renderAll();
      if (!silent) toast("Données actualisées.");
    }
    sync.lastPulledAt = Date.now();
    sync.error = null;
    setSyncStatus("on");
  } catch (e) {
    sync.error = e.message;
    setSyncStatus("error");
    if (!silent) toast("Échec de la synchronisation.");
  } finally {
    sync.busy = false;
  }
}

function syncPushDebounced() {
  if (!syncEnabled()) return;
  clearTimeout(sync.pushTimer);
  sync.pushTimer = setTimeout(() => syncPush(), 1500);
}

async function syncPush() {
  if (!syncEnabled() || sync.busy) {
    // Retry shortly if currently busy
    if (sync.busy) {
      clearTimeout(sync.pushTimer);
      sync.pushTimer = setTimeout(() => syncPush(), 2000);
    }
    return;
  }
  sync.busy = true;
  setSyncStatus("busy");
  try {
    await ghGist("PATCH", `/${sync.gistId}`, {
      files: { "rituel-data.json": { content: JSON.stringify(state, null, 2) } },
    });
    sync.lastPushedAt = Date.now();
    sync.error = null;
    setSyncStatus("on");
  } catch (e) {
    sync.error = e.message;
    setSyncStatus("error");
  } finally {
    sync.busy = false;
  }
}

function syncDisable() {
  if (!confirm("Désactiver la synchronisation sur cet appareil ? Les données locales sont conservées et le gist GitHub n'est pas supprimé.")) return;
  sync.token = null;
  sync.gistId = null;
  saveSyncConfig();
  setSyncStatus("");
  renderSyncModal();
  toast("Synchronisation désactivée.");
}

/* ── SYNC MODAL UI ───────────────────────────────────────────── */
function openSyncModal() {
  document.getElementById("syncModal").hidden = false;
  renderSyncModal();
}
function closeSyncModal() {
  document.getElementById("syncModal").hidden = true;
}

let syncTab = "create"; // 'create' | 'join'

function renderSyncModal() {
  const body = document.getElementById("syncBody");
  if (!body) return;

  if (syncEnabled()) {
    body.innerHTML = `
      <div class="sync-section">
        <p class="sync-blurb">
          Vos données sont synchronisées en temps réel via un <strong>gist GitHub privé</strong>.
          Chaque modification est poussée automatiquement, et l'app récupère les changements
          à chaque ouverture.
        </p>
        <div class="sync-status-card">
          <div class="sync-status-line">
            <span class="sync-dot"></span>
            <strong>Synchronisé</strong>
            <span id="syncLastInfo">${syncLastInfoText()}</span>
          </div>
          <span class="field-label" style="display:block;margin-bottom:8px;">Code de partage</span>
          <div class="sync-gist-id">
            <span>${escapeHtml(sync.gistId)}</span>
            <button type="button" id="copyGistBtn">Copier</button>
          </div>
          <p class="sync-help" style="margin-top:10px;">
            Collez ce code (et le même token) dans l'app sur votre autre appareil pour le connecter.
          </p>
        </div>
        ${sync.error ? `<div class="sync-error">Dernière erreur : ${escapeHtml(sync.error)}</div>` : ""}
        <div class="modal-actions" style="border:none;padding-top:0;margin-top:0;">
          <button type="button" class="ghost-btn danger" id="syncDisableBtn">Désactiver sur cet appareil</button>
          <div class="spacer"></div>
          <button type="button" class="ghost-btn" id="syncPullNowBtn">Actualiser</button>
          <button type="button" class="primary-btn" data-close-sync="1">Fermer</button>
        </div>
      </div>
    `;
    document.getElementById("syncDisableBtn").addEventListener("click", syncDisable);
    document.getElementById("syncPullNowBtn").addEventListener("click", () => syncPull(false));
    document.getElementById("copyGistBtn").addEventListener("click", () => {
      navigator.clipboard.writeText(sync.gistId).then(() => toast("Code copié."));
    });
  } else {
    body.innerHTML = `
      <div class="sync-section">
        <p class="sync-blurb">
          Synchronisez vos rituels et notes entre votre Mac et votre iPhone.
          Vos données restent <strong>chez vous</strong>, dans un gist GitHub privé que vous seul pouvez lire.
        </p>
        <div class="sync-tabs">
          <button type="button" class="sync-tab ${syncTab === "create" ? "active" : ""}" data-tab="create">Premier appareil</button>
          <button type="button" class="sync-tab ${syncTab === "join" ? "active" : ""}" data-tab="join">Rejoindre</button>
        </div>
        <div class="field">
          <span class="field-label">Token GitHub <span class="field-opt">(scope <code>gist</code>)</span></span>
          <input type="password" class="sync-input" id="syncTokenInput" placeholder="ghp_…" autocomplete="off" spellcheck="false" />
        </div>
        ${syncTab === "join" ? `
          <div class="field">
            <span class="field-label">Code de partage <span class="field-opt">(depuis le premier appareil)</span></span>
            <input type="text" class="sync-input" id="syncGistInput" placeholder="abc123…" autocomplete="off" spellcheck="false" />
          </div>
          <p class="sync-help">
            <strong style="color:var(--text-soft);">Attention :</strong> rejoindre remplace toutes les données locales par celles du gist.
          </p>
        ` : `
          <p class="sync-help">
            Premier appareil ? Je crée un gist privé avec vos données actuelles et vous obtenez un code à coller sur l'iPhone.
          </p>
        `}
        <p class="sync-help">
          Pas encore de token ? <a href="https://github.com/settings/tokens/new?scopes=gist&description=Rituel%20sync" target="_blank" rel="noopener">Générez-en un</a> (scope <code>gist</code> uniquement).
        </p>
        ${sync.error ? `<div class="sync-error">${escapeHtml(sync.error)}</div>` : ""}
        <div class="modal-actions" style="border:none;padding-top:0;margin-top:4px;">
          <div class="spacer"></div>
          <button type="button" class="ghost-btn" data-close-sync="1">Annuler</button>
          <button type="button" class="primary-btn" id="syncActivateBtn">
            ${syncTab === "create" ? "Créer la synchronisation" : "Rejoindre"}
          </button>
        </div>
      </div>
    `;
    body.querySelectorAll(".sync-tab").forEach(t => {
      t.addEventListener("click", () => { syncTab = t.dataset.tab; renderSyncModal(); });
    });
    document.getElementById("syncActivateBtn").addEventListener("click", async () => {
      const tokenInput = document.getElementById("syncTokenInput");
      const btn = document.getElementById("syncActivateBtn");
      const token = tokenInput.value.trim();
      if (!token) {
        sync.error = "Token requis.";
        renderSyncModal();
        return;
      }
      btn.disabled = true;
      btn.textContent = "…";
      try {
        if (syncTab === "create") {
          await syncCreate(token);
          toast("Synchronisation activée.");
        } else {
          const gistId = document.getElementById("syncGistInput").value.trim();
          await syncPair(token, gistId);
          toast("Appareil connecté.");
        }
        renderSyncModal();
      } catch (e) {
        renderSyncModal();
      }
    });
  }
}

function syncLastInfoText() {
  if (sync.busy) return "· en cours…";
  const last = Math.max(sync.lastPulledAt || 0, sync.lastPushedAt || 0);
  if (!last) return "";
  return `· ${relativeTime(last)}`;
}

/* ── THEME ───────────────────────────────────────────────────── */
function initTheme() {
  const saved = localStorage.getItem(THEME_KEY) || "dark";
  document.documentElement.setAttribute("data-theme", saved);
}
function toggleTheme() {
  const cur = document.documentElement.getAttribute("data-theme") || "dark";
  const next = cur === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem(THEME_KEY, next);
  // Re-render chart to pick up CSS variable color changes
  renderChart();
}

/* ── EVENT WIRING ────────────────────────────────────────────── */
function wire() {
  document.getElementById("openAddHabit").addEventListener("click", () => openModal());
  document.getElementById("openAddHabitEmpty").addEventListener("click", () => openModal());
  document.getElementById("themeToggle").addEventListener("click", toggleTheme);
  document.getElementById("syncBtn").addEventListener("click", openSyncModal);

  // Sync modal close
  document.getElementById("syncModal").addEventListener("click", e => {
    if (e.target.dataset.closeSync === "1" || e.target.closest("[data-close-sync='1']")) closeSyncModal();
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && !document.getElementById("syncModal").hidden) closeSyncModal();
  });

  // Pull from gist when app comes back to foreground / network returns
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && syncEnabled()) syncPull(true);
  });
  window.addEventListener("online", () => { if (syncEnabled()) syncPull(true); });

  // Modal close
  document.getElementById("modal").addEventListener("click", e => {
    if (e.target.dataset.close === "1" || e.target.closest("[data-close='1']")) closeModal();
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && !document.getElementById("modal").hidden) closeModal();
  });

  // Day chips inside modal
  document.getElementById("dayChips").addEventListener("click", e => {
    const chip = e.target.closest(".day-chip");
    if (!chip) return;
    const d = parseInt(chip.dataset.day, 10);
    if (selectedDays.includes(d)) selectedDays = selectedDays.filter(x => x !== d);
    else selectedDays = [...selectedDays, d];
    renderDayChips();
  });
  document.querySelectorAll(".freq-preset").forEach(btn => {
    btn.addEventListener("click", () => {
      selectedDays = FREQ_PRESETS[btn.dataset.preset].slice();
      renderDayChips();
    });
  });

  // Habit list delegation
  document.getElementById("habitsList").addEventListener("click", e => {
    const toggle = e.target.closest('[data-action="toggle"]');
    if (toggle) {
      toggleHabit(toggle.dataset.id);
      return;
    }
    const edit = e.target.closest('[data-action="edit"]');
    if (edit) {
      const habit = state.habits.find(h => h.id === edit.dataset.id);
      if (habit) openModal(habit);
    }
  });

  // Notes
  document.getElementById("noteForm").addEventListener("submit", e => {
    e.preventDefault();
    const field = document.getElementById("noteField");
    addNote(field.value);
    field.value = "";
  });
  document.getElementById("notesList").addEventListener("click", e => {
    const t = e.target.closest("[data-act]");
    if (!t) return;
    const act = t.dataset.act;
    const noteId = t.dataset.id;
    if (act === "toggle") toggleNote(noteId);
    else if (act === "delete") deleteNote(noteId);
  });
  document.getElementById("notesList").addEventListener("blur", e => {
    const t = e.target.closest('[data-act="edit"]');
    if (!t) return;
    editNote(t.dataset.id, t.textContent);
  }, true);
  document.getElementById("notesList").addEventListener("keydown", e => {
    const t = e.target.closest('[data-act="edit"]');
    if (!t) return;
    if (e.key === "Enter") { e.preventDefault(); t.blur(); }
    if (e.key === "Escape") { t.textContent = (state.notes.find(n => n.id === t.dataset.id) || {}).text || ""; t.blur(); }
  });

  // Form submission
  document.getElementById("habitForm").addEventListener("submit", e => {
    e.preventDefault();
    saveHabit(new FormData(e.target));
  });

  // Delete button
  document.getElementById("deleteHabitBtn").addEventListener("click", () => {
    if (editingId) deleteHabit(editingId);
  });

  // Re-render chart on resize (responsive labels)
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => renderChart(), 200);
  });
}

/* ── INIT ────────────────────────────────────────────────────── */
function renderAll() {
  renderHero();
  renderHabits();
  renderNotes();
  renderChart();
  renderHeatmap();
}

initTheme();
loadSync();
renderAll();
renderQuote();
wire();

// Check for magic-link sync activation first, then normal pull
(async () => {
  if (location.hash && location.hash.includes("sync=")) {
    await checkSyncFromUrl();
  } else if (syncEnabled()) {
    setSyncStatus("on");
    syncPull(true);
  } else {
    setSyncStatus("");
  }
})();
