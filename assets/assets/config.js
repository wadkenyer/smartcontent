// assets/config.js
window.SC_CONFIG = {
  version: "2.1.0",
  contactEmail: "ahmedheebo@gmail.com",
  privacyUrl: "https://wadkenyer.github.io/smartcontent/privacy.html",
  termsUrl: "https://wadkenyer.github.io/smartcontent/terms.html",

  // فعّل/عطّل الساندبوكس أثناء التطوير
  sandbox: true, // غيّرها إلى false عند الإنتاج
};

// تهيئة Pi SDK إن كان متاحًا
window.addEventListener("load", () => {
  try {
    if (window.Pi) {
      // ملاحظة: استدعاءات init قد تختلف حسب إصدار SDK لديك
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
window.SMARTCONTENT_CONFIG = {
  privacyURL: "https://wadkenyer.github.io/smartcontent/privacy.html",
  termsURL:   "https://wadkenyer.github.io/smartcontent/terms.html",
  supportEmail: "ahmedheebo@gmail.com"
};
