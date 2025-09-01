// assets/i18n.js
(() => {
  const LS_KEY = "sc_lang";
  const RTL = ["ar","fa","ur","he"];

  // اقرأ اللغة المختارة أو افتراضي EN
  let lang = localStorage.getItem(LS_KEY) || "en";

  // طبّق لغة + اتجاه الصفحة
  function applyLangMeta(l) {
    document.documentElement.lang = l || "en";
    document.documentElement.dir  = RTL.includes(l) ? "rtl" : "ltr";
  }

  // طبّق الترجمات على عناصر الصفحة
  function applyDict(dict) {
    // 1) عناصر النصوص: data-i18n="key"
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.dataset.i18n;
      const val = dict[key];
      if (val !== undefined && val !== null) {
        el.textContent = val;
      }
      // لو ما في ترجمة: لا نلمس النص الأصلي
    });

    // 2) خصائص/صفات: data-i18n-attr="placeholder:key;title:key2"
    document.querySelectorAll("[data-i18n-attr]").forEach(el => {
      const pairs = el.dataset.i18nAttr.split(";").map(s => s.trim()).filter(Boolean);
      pairs.forEach(p => {
        const [attr, key] = p.split(":").map(s => s.trim());
        if (!attr || !key) return;
        const val = dict[key];
        if (val !== undefined && val !== null) {
          el.setAttribute(attr, val);
        }
      });
    });

    // 3) الفوتر الخاص بسنة الحقوق (اختياري لو تستخدمه)
    const cr = document.getElementById("copyright");
    if (cr) {
      const y = new Date().getFullYear();
      const tpl = dict["footer.copyright"];
      if (tpl) cr.textContent = tpl.replace("{year}", String(y));
    }
  }

  // حمّل ملف اللغة وطبّق
  async function loadAndApply(l) {
    try {
      applyLangMeta(l);
      const res = await fetch(`assets/i18n/${l}.json`, { cache: "no-store" });
      if (!res.ok) throw new Error("i18n fetch failed");
      const dict = await res.json();
      applyDict(dict);
    } catch (e) {
      console.warn("[i18n] failed, fallback to EN", e);
      if (l !== "en") {
        localStorage.setItem(LS_KEY, "en");
        return loadAndApply("en");
      }
    }
  }

  // كشف تغيّر اللغة من القائمة (إن وُجدت)
  document.addEventListener("DOMContentLoaded", () => {
    // طبّق اللغة الحالية
    loadAndApply(lang);

    const sel = document.getElementById("langSelect");
    if (sel) {
      // مزامنة قيمة القائمة مع اللغة الحالية
      sel.value = lang;
      sel.addEventListener("change", () => {
        const v = sel.value || "en";
        localStorage.setItem(LS_KEY, v);
        loadAndApply(v);
      });
    }
  });

  // إتاحة دوال بسيطة للاستخدام من app.js إذا لزم
  window.SC_I18N = {
    setLang: (l) => { localStorage.setItem(LS_KEY, l || "en"); loadAndApply(l || "en"); },
    getLang: () => localStorage.getItem(LS_KEY) || "en"
  };
})();
