// assets/i18n.js — FINAL
(() => {
  const LS_KEY = "sc_lang";
  const RTL    = ["ar","fa","ur","he"];

  function applyLangMeta(lang){
    const l = lang || localStorage.getItem(LS_KEY) || "en";
    document.documentElement.lang = l;
    document.documentElement.dir  = RTL.includes(l) ? "rtl" : "ltr";
  }

  function getPath(obj, path){
    return path.split(".").reduce((o,k)=> (o && k in o ? o[k] : undefined), obj);
  }

  function applyDict(dict){
    if (!dict || typeof dict !== "object") return;

    document.querySelectorAll("[data-i18n]").forEach(el => {
      const v = getPath(dict, el.dataset.i18n);
      if (v != null) el.textContent = v;
    });

    document.querySelectorAll("[data-i18n-attr]").forEach(el => {
      const pairs = el.dataset.i18nAttr
        .split(/[;,]/).map(s=>s.trim()).filter(Boolean); // يقبل ; أو ,
      pairs.forEach(pair => {
        const [attr, key] = pair.split(":").map(s=>s.trim());
        const v = getPath(dict, key);
        if (attr && v != null) el.setAttribute(attr, v);
      });
    });
  }

  async function loadDict(lang){
    const tryLoad = async (l) => {
      const res = await fetch(`assets/i18n/${l}.json`, { cache: "no-store" });
      if (!res.ok) throw new Error(res.status);
      return res.json();
    };
    try { return await tryLoad(lang); }
    catch { try { return await tryLoad("en"); } catch { return null; } }
  }

  async function loadAndApply(lang){
    applyLangMeta(lang);
    const dict = await loadDict(lang);
    if (!dict) return;
    applyDict(dict);

    // استبدال {year} بعد الترجمة
    const y = new Date().getFullYear();
    const cr = document.getElementById("copyright");
    if (cr && cr.textContent.includes("{year}")) {
      cr.textContent = cr.textContent.replace("{year}", y);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    const lang = localStorage.getItem(LS_KEY) || "en";
    loadAndApply(lang);

    const sel = document.getElementById("langSelect");
    if (sel) {
      sel.value = lang;
      sel.addEventListener("change", () => {
        const v = sel.value || "en";
        localStorage.setItem(LS_KEY, v);
        loadAndApply(v);
      });
    }
  });

  window.SC_I18N = {
    setLang: (l) => { const v = l || "en"; localStorage.setItem(LS_KEY, v); loadAndApply(v); },
    getLang: ()  => localStorage.getItem(LS_KEY) || "en",
    loadAndApply
  };
})();
