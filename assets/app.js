// أدوات مساعدة سريعة
const $  = (q) => document.querySelector(q);
const $$ = (q) => document.querySelectorAll(q);

// تفعيل تبويب حسب الـ id
function activate(tabId) {
  $$(".tab-pane").forEach(el => el.classList.remove("active"));
  $$(".tabs button").forEach(b => b.classList.remove("active"));

  const pane = document.getElementById(tabId);
  const btn  = Array.from($$(".tabs button")).find(b => b.dataset.tab === tabId);

  if (pane) pane.classList.add("active");
  if (btn)  btn.classList.add("active");

  // تحديث الرابط (للدخول المباشر)
  if (tabId === "home") {
    history.replaceState(null, "", "./index.html");
  } else {
    history.replaceState(null, "", `#${tabId}`);
  }
}

// ربط أزرار التبويب
function wireNav() {
  $$(".tabs button").forEach(b => {
    b.addEventListener("click", () => activate(b.dataset.tab));
  });

  // أزرار داخل الكروت/الأقسام تقفز للتاب المقابل
  $$("[data-link]").forEach(btn => {
    btn.addEventListener("click", () => {
      const to = btn.getAttribute("data-link").replace("#","");
      activate(to);
    });
  });
}

// عند التحميل افتح التبويب من الهاش إن وجد
function openFromHash() {
  const tabFromHash = (location.hash || "#home").replace("#","");
  activate(tabFromHash);
}

// بانر "Limited Mode" (تجريبي)
function limitedModeBanner() {
  const banner = $("#limitedBanner");
  if (!banner) return;

  // أظهره بشكل افتراضي (يمكنك تغيير المنطق لاحقًا)
  banner.classList.remove("hidden");
  $("#enableNowBtn")?.addEventListener("click", () => {
    alert("Permission flow would start here in the Pi Browser.");
    banner.classList.add("hidden");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  wireNav();
  openFromHash();
  limitedModeBanner();
});
