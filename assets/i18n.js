// i18n loader (final)
(() => {
  const LS_KEY = "sc_lang";
  const RTL    = ["ar","fa","ur","he"];

  function applyLangMeta(lang){
    document.documentElement.lang = lang || "en";
    document.documentElement.dir  = RTL.includes(lang) ? "rtl" : "ltr";
  }

  function get(obj, path){
    return path.split(".").reduce((o,k)=> (o && k in o ? o[k] : undefined), obj);
  }

  function applyDict(dict){
    if (!dict) return;

    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.dataset.i18n;
      const val = get(dict, key);
      if (val != null) el.textContent = val;
    });

    document.querySelectorAll("[data-i18n-attr]").forEach(el => {
      const pairs = el.dataset.i18nAttr.split(";").map(s => s.trim()).filter(Boolean);
      pairs.forEach(pair => {
        const [attr, key] = pair.split(":").map(s => s.trim());
        const val = get(dict, key);
        if (attr && val != null) el.setAttribute(attr, val);
      });
    });

    // سنة الفوتر
    const y = new Date().getFullYear();
    const cr = document.getElementById("copyright");
    if (cr && cr.textContent.includes("{year}")) {
      cr.textContent = cr.textContent.replace("{year}", y);
    }
  }

  async function loadDict(lang){
    const url = `assets/i18n/${lang}.json`;
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(res.status + " " + res.statusText);
      return await res.json();
    } catch (e) {
      console.warn("[i18n] failed to load", url, e);
      return null;
    }
  }

  async function loadAndApply(lang){
    applyLangMeta(lang);
    const d = await loadDict(lang);
    if (!d) return;
    applyDict(d);
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
    setLang: (l) => { const v=l||"en"; localStorage.setItem(LS_KEY, v); loadAndApply(v); },
    getLang: () => localStorage.getItem(LS_KEY) || "en",
  };
})();
