// ========= helpers =========
const $  = (q) => document.querySelector(q);
const $$ = (q) => document.querySelectorAll(q);

// ========= tabs routing =========
function activate(tabId) {
  $$(".tab-pane").forEach(el => el.classList.remove("active"));
  $$(".tabs button").forEach(b => b.classList.remove("active"));

  const pane = document.getElementById(tabId);
  const btn  = Array.from($$(".tabs button")).find(b => b.dataset.tab === tabId);

  if (pane) pane.classList.add("active");
  if (btn)  btn.classList.add("active");

  // update URL (direct links)
  if (tabId === "home") {
    history.replaceState(null, "", "./index.html");
  } else {
    history.replaceState(null, "", `#${tabId}`);
  }

  // track + render analytics on demand
  trackTabView(tabId);
  if (tabId === "analytics") renderAnalytics();
}

function wireNav() {
  $$(".tabs button").forEach(b => b.addEventListener("click", () => activate(b.dataset.tab)));

  // in-card CTA buttons
  $$("[data-link]").forEach(btn => {
    btn.addEventListener("click", () => {
      const to = btn.getAttribute("data-link").replace("#","");
      trackCtaClick(to);
      activate(to);
    });
  });
}

function openFromHash() {
  const tabFromHash = (location.hash || "#home").replace("#","");
  activate(tabFromHash);
}

// ========= limited mode banner (demo) =========
function limitedModeBanner() {
  const banner = $("#limitedBanner");
  if (!banner) return;
  banner.classList.remove("hidden");
  $("#enableNowBtn")?.addEventListener("click", () => {
    alert("Permission flow would start here in the Pi Browser.");
    banner.classList.add("hidden");
  });
}

// ========= settings persistence (localStorage) =========
const LS_KEYS = {
  THEME: "sc_theme",            // "dark" | "light"
  PUSH: "sc_pref_push",         // "1" | "0"
  AUTOSAVE: "sc_pref_autosave", // "1" | "0"
  LANG: "sc_pref_lang",         // "ar" | "en" | ...
  WALLET: "sc_wallet_address",  // "0x..."
};

// --- theme ---
function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === "light") {
    root.setAttribute("data-theme", "light");
    document.body.setAttribute("data-theme", "light");
  } else {
    root.removeAttribute("data-theme");
    document.body.removeAttribute("data-theme");
  }
}

function initTheme() {
  const saved = localStorage.getItem(LS_KEYS.THEME) || "dark";
  applyTheme(saved);

  const darkToggle = $("#prefDark");
  if (darkToggle) {
    darkToggle.checked = (saved === "dark");
    darkToggle.addEventListener("change", () => {
      const next = darkToggle.checked ? "dark" : "light";
      localStorage.setItem(LS_KEYS.THEME, next);
      applyTheme(next);
    });
  }
}

// --- other preferences ---
function initPreferences() {
  const push = $("#prefPush");
  const autosave = $("#prefAutosave");
  const lang = $("#prefLang");
  const wallet = $("#walletAddress");

  const savedPush = localStorage.getItem(LS_KEYS.PUSH);
  const savedAutosave = localStorage.getItem(LS_KEYS.AUTOSAVE);
  const savedLang = localStorage.getItem(LS_KEYS.LANG);
  const savedWallet = localStorage.getItem(LS_KEYS.WALLET);

  if (push) {
    push.checked = savedPush === "1";
    push.addEventListener("change", () =>
      localStorage.setItem(LS_KEYS.PUSH, push.checked ? "1" : "0")
    );
  }
  if (autosave) {
    autosave.checked = savedAutosave === "1";
    autosave.addEventListener("change", () =>
      localStorage.setItem(LS_KEYS.AUTOSAVE, autosave.checked ? "1" : "0")
    );
  }
  if (lang) {
    if (savedLang) lang.value = savedLang;
    lang.addEventListener("change", () =>
      localStorage.setItem(LS_KEYS.LANG, lang.value)
    );
  }
  if (wallet) {
    if (savedWallet) wallet.value = savedWallet;
    wallet.addEventListener("input", () =>
      localStorage.setItem(LS_KEYS.WALLET, wallet.value.trim())
    );
  }
}

// ========= optional dynamic links from config =========
function wireLinksFromConfig(cfg) {
  if (!cfg) return;
  const map = [
    ["#privacyLink", "privacyURL"],
    ["#termsLink", "termsURL"],
    ["#footerEmail", "supportEmail"] // mailto
  ];
  map.forEach(([sel, key]) => {
    const el = $(sel);
    if (!el || !cfg[key]) return;
    if (key === "supportEmail") {
      el.href = `mailto:${cfg[key]}`;
      el.textContent = cfg[key];
    } else {
      el.href = cfg[key];
    }
  });
}

// ========= Analytics =========
const ANALYTICS_KEY = "sc_analytics_events";
const MAX_EVENTS = 1000;

function getEvents() {
  try {
    return JSON.parse(localStorage.getItem(ANALYTICS_KEY) || "[]");
  } catch {
    return [];
  }
}
function saveEvents(arr) {
  localStorage.setItem(ANALYTICS_KEY, JSON.stringify(arr.slice(-MAX_EVENTS)));
}
function trackEvent(type, data = {}) {
  const ev = { ts: Date.now(), type, ...data };
  const arr = getEvents();
  arr.push(ev);
  saveEvents(arr);
}
function trackTabView(tabId)   { trackEvent("tab_view",  { tabId }); }
function trackCtaClick(target) { trackEvent("cta_click", { target }); }

function fmtTime(t) {
  const d = new Date(t);
  return d.toLocaleString();
}

function statsFromEvents(events) {
  // last 7 days tab_view counts per day
  const DAY = 24*60*60*1000;
  const today = new Date();
  const zeroUTC = (d) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const start = zeroUTC(new Date(Date.now() - 6*DAY)); // 7 columns (0..6)
  const buckets = Array.from({length:7}, (_,i)=>{
    const day = new Date(start.getTime() + i*DAY);
    const key = day.toISOString().slice(0,10);
    return { key, label: day.toLocaleDateString(undefined,{weekday:"short"}), count:0 };
  });

  const tabCounts = {};
  let total = events.length;

  events.forEach(e => {
    if (e.type === "tab_view") {
      const dayKey = new Date(e.ts).toISOString().slice(0,10);
      const b = buckets.find(b => b.key === dayKey);
      if (b) b.count++;
      tabCounts[e.tabId] = (tabCounts[e.tabId]||0)+1;
    }
  });

  const last7Views = buckets.reduce((s,b)=>s+b.count,0);
  const topTab = Object.entries(tabCounts).sort((a,b)=>b[1]-a[1])[0]?.[0] || "—";

  return { buckets, total, last7Views, topTab };
}

function drawBarChart(canvas, buckets) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height;

  // clear
  ctx.clearRect(0,0,W,H);

  const max = Math.max(1, ...buckets.map(b=>b.count));
  const pad = 32;
  const barW = (W - pad*2) / buckets.length * 0.6;
  const stepX = (W - pad*2) / buckets.length;

  // axes (simple)
  ctx.strokeStyle = "#8892a6";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad, H - pad);
  ctx.lineTo(W - pad, H - pad);
  ctx.moveTo(pad, pad);
  ctx.lineTo(pad, H - pad);
  ctx.stroke();

  // bars
  buckets.forEach((b, i) => {
    const x = pad + i*stepX + (stepX - barW)/2;
    const h = Math.round((H - pad*2) * (b.count / max));
    const y = H - pad - h;

    // bar (uses current theme fill via computed style)
    ctx.fillStyle = getComputedStyle(document.body).getPropertyValue("--brand2") || "#8a5cff";
    ctx.fillRect(x, y, barW, h);

    // label
    ctx.fillStyle = getComputedStyle(document.body).getPropertyValue("--text") || "#e5e7eb";
    ctx.font = "12px system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(b.label, x + barW/2, H - pad + 16);
  });
}

function renderAnalytics() {
  const events = getEvents();
  const { buckets, total, last7Views, topTab } = statsFromEvents(events);

  // stats cards
  $("#statTotal").textContent = String(total);
  $("#stat7d").textContent = String(last7Views);
  $("#statTopTab").textContent = topTab;

  // table (latest 50)
  const tbody = $("#eventsTableBody");
  if (tbody) {
    tbody.innerHTML = "";
    events.slice(-50).reverse().forEach(e => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${fmtTime(e.ts)}</td>
        <td>${e.type}</td>
        <td>${e.tabId ? e.tabId : (e.target || "")}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  // chart
  drawBarChart($("#analyticsChart"), buckets);

  // reset btn
  $("#resetAnalyticsBtn")?.addEventListener("click", () => {
    if (confirm("Reset local analytics data?")) {
      saveEvents([]);
      renderAnalytics();
    }
  });
}

// ========= boot =========
document.addEventListener("DOMContentLoaded", () => {
  wireNav();
  openFromHash();
  limitedModeBanner();

  // prefs
  initTheme();
  initPreferences();

  // config links (اختياري)
  wireLinksFromConfig(window.SMARTCONTENT_CONFIG);
});
