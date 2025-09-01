// ===== Simple I18N Loader & Applier =====
(() => {
  const STORE_KEY = "sc_lang";
  const RTL_LIST  = ["ar", "fa", "ur", "he"];

  const I18N = {
    packs: {},      // cache
    lang: "en",
    t(key) {
      const p = this.packs[this.lang] || {};
      const v = key.split('.').reduce((o,k)=> (o && o[k]!==undefined) ? o[k] : undefined, p);
      // fallback: جرّب الإنجليزية
      if (v === undefined) {
        const en = this.packs["en"] || {};
        const ve = key.split('.').reduce((o,k)=> (o && o[k]!==undefined) ? o[k] : undefined, en);
        return ve === undefined ? key : ve;
      }
      return v;
    },
    async load(lang) {
      if (!this.packs[lang]) {
        const res = await fetch(`assets/i18n/${lang}.json`, { cache: "no-store" });
        if (!res.ok) throw new Error(`i18n load failed: ${lang}`);
        this.packs[lang] = await res.json();
      }
    },
    apply() {
      // نصوص
      document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.getAttribute("data-i18n");
        let txt = this.t(key);
        // استبدال {year}
        txt = String(txt).replace("{year}", new Date().getFullYear());
        el.textContent = txt;
      });

      // خصائص (placeholder, title,...)
      document.querySelectorAll("[data-i18n-attr]").forEach(el => {
        const map = el.getAttribute("data-i18n-attr");
        // format: "placeholder:key.one, title:key.two"
        map.split(",").forEach(pair => {
          const [attr, k] = pair.split(":").map(s => s.trim());
          if (attr && k) {
            let val = this.t(k).toString().replace("{year}", new Date().getFullYear());
            el.setAttribute(attr, val);
          }
        });
      });

      // اتجاه اللغة
      document.documentElement.lang = this.lang;
      document.documentElement.dir  = RTL_LIST.includes(this.lang) ? "rtl" : "ltr";

      // خيار select (لو موجود)
      const sel = document.getElementById("langSelect");
      if (sel) sel.value = this.lang;

      // حدّث عنوان الصفحة لو عندك مفتاحه
      const titleKey = "app.title";
      const titleVal = this.t(titleKey);
      if (titleVal && document.title !== titleVal) {
        document.title = titleVal;
      }
    }
  };

  async function setLanguage(lang) {
    try {
      I18N.lang = lang || "en";
      await I18N.load("en");       // تأكد من الإنجليزية كـ fallback
      await I18N.load(I18N.lang);  // حمّل اللغة المطلوبة
      localStorage.setItem(STORE_KEY, I18N.lang);
      I18N.apply();
    } catch (e) {
      console.warn("[i18n] setLanguage error:", e);
    }
  }

  async function initI18n() {
    // ترتيب الأفضلية: مخزن > لغة المتصفح > en
    const fromStore   = localStorage.getItem(STORE_KEY);
    const fromBrowser = (navigator.language || "en").slice(0,2);
    const lang = fromStore || (["ar","en"].includes(fromBrowser) ? fromBrowser : "en");
    await setLanguage(lang);

    // ربط تغيير اللغة من الإعدادات
    const sel = document.getElementById("langSelect");
    if (sel) {
      sel.addEventListener("change", async () => {
        await setLanguage(sel.value);
      });
    }
  }

  // كشف دوال للاستعمال من app.js إذا احتجت
  window.I18N = { setLanguage, initI18n };

  // شغّل فورًا بعد تحميل DOM
  document.addEventListener("DOMContentLoaded", initI18n);
})();
