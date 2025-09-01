// assets/i18n.js
(() => {
  const LS_KEY = "sc_lang";
  const RTL = ["ar", "fa", "ur", "he"];

  // اللغة المخزّنة أو EN كافتراضي
  let lang = localStorage.getItem(LS_KEY) || "en";

  /* ===== Helpers ===== */

  // حدّث lang/dir للصفحة
  function applyLangMeta(l) {
    document.documentElement.lang = l || "en";
    document.documentElement.dir = RTL.includes(l) ? "rtl" : "ltr";
  }

  // طبّق القاموس على عناصر الصفحة
  function applyDict(dict) {
    if (!dict || typeof dict !== "object") return;

    // 1) النصوص: data-i18n="key"
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.dataset.i18n;
      const val = getByPath(dict, key);
      if (val != null) el.textContent = val;
    });

    // 2) الخصائص: data-i18n-attr="placeholder:key,title:key2,..."
    document.querySelectorAll("[data-i18n-attr]").forEach((el) => {
      const pairs = el.dataset.i18nAttr
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      pairs.forEach((p) => {
        const [attr, key] = p.split(":").map((s) => s.trim());
        if (!attr || !key) return;
        const val = getByPath(dict, key);
        if (val != null) {
          try {
            el.setAttribute(attr, val);
          } catch (_) {}
        }
      });
    });
  }

  // قراءة قيمة متداخلة من القاموس باستخدام المسار "a.b.c"
  function getByPath(obj, path) {
    return path.split(".").reduce((acc, k) => (acc && acc[k] != null ? acc[k] : undefined), obj);
  }

  // حمّل قاموس لغة
  async function loadDict(l) {
    const url = `assets/i18n/${l}.json`;
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(res.status);
      return await res.json();
    } catch (e) {
      console.warn(`[i18n] failed to load ${url}, fallback to en`, e);
      if (l !== "en") return loadDict("en");
      return {};
    }
  }

  // حمّل وطبّق
  async function loadAndApply(l) {
    const dict = await loadDict(l);
    applyLangMeta(l);
    applyDict(dict);
  }

  /* ===== Bootstrap ===== */

  document.addEventListener("DOMContentLoaded", () => {
    // طبّق اللغة الحالية
    loadAndApply(lang);

    // اربط القائمة المنسدلة إن وُجدت
    const sel = document.getElementById("langSelect");
    if (sel) {
      // عيّن القيمة الحالية
      sel.value = lang;
      sel.addEventListener("change", () => {
        const v = sel.value || "en";
        localStorage.setItem(LS_KEY, v);
        lang = v;
        loadAndApply(v);
      });
    }
  });

  // API صغيرة للاستخدام من app.js عند الحاجة
  window.SC_I18N = {
    setLang(l) {
      const v = l || "en";
      localStorage.setItem(LS_KEY, v);
      lang = v;
      loadAndApply(v);
    },
    getLang() {
      return localStorage.getItem(LS_KEY) || "en";
    },
    // ترجمة مفتاح واحد برمجياً (اختياري)
    async t(key) {
      const dict = await loadDict(lang);
      return getByPath(dict, key) ?? key;
    },
  };
})();
