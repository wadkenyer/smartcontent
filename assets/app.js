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
}

function wireNav() {
  $$(".tabs button").forEach(b => b.addEventListener("click", () => activate(b.dataset.tab)));
  // in-card CTA buttons
  $$("[data-link]").forEach(btn => {
    btn.addEventListener("click", () => {
      const to = btn.getAttribute("data-link").replace("#","");
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
  THEME: "sc_theme",           // "dark" | "light"
  PUSH: "sc_pref_push",        // "1" | "0"
  AUTOSAVE: "sc_pref_autosave",// "1" | "0"
  LANG: "sc_pref_lang",        // "ar" | "en" | ...
  WALLET: "sc_wallet_address", // "0x..."
};

// --- theme ---
function applyTheme(theme) {
  const root = document.documentElement; // <html>
  if (theme === "light") {
    root.setAttribute("data-theme", "light");
    document.body.setAttribute("data-theme", "light");
  } else {
    root.removeAttribute("data-theme");
    document.body.removeAttribute("data-theme");
  }
}

function initTheme() {
  // default dark
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

  // read saved
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
// لو عندك window.SMARTCONTENT_CONFIG هنوصل الروابط تلقائيًا
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
