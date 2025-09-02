// assets/config.js

// إعدادات عامة للتطبيق
window.SC_CONFIG = {
  version: "2.1.0",
  contactEmail: "ahmedheebo@gmail.com",
  privacyUrl: "https://wadkenyer.github.io/smartcontent/privacy.html",
  termsUrl:   "https://wadkenyer.github.io/smartcontent/terms.html",

  // Sandbox للتطوير (بدّلها إلى false عند النشر النهائي)
  sandbox: true,
};

// كائن إضافي مخصص للروابط والدعم (اختياري - متاح للاستخدام في الواجهة)
window.SMARTCONTENT_CONFIG = {
  privacyURL:  window.SC_CONFIG.privacyUrl,
  termsURL:    window.SC_CONFIG.termsUrl,
  supportEmail: window.SC_CONFIG.contactEmail,
};

// تهيئة Pi SDK إذا كان متاح
window.addEventListener("load", () => {
  try {
    if (window.Pi) {
      Pi.init({
        version: "2.0",
        sandbox: !!window.SC_CONFIG.sandbox,
      });
      console.log("[Pi SDK] initialized (sandbox:", !!window.SC_CONFIG.sandbox, ")");
    } else {
      console.log("[Pi SDK] not found (running without SDK).");
    }
  } catch (e) {
    console.warn("[Pi SDK] init error:", e);
  }
});
