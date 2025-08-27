// Simple tab router + links + limited mode banner

const $ = (q) => document.querySelector(q);
const $$ = (q) => document.querySelectorAll(q);

function activate(tabId) {
  $$(".tab-pane").forEach(el => el.classList.remove("active"));
  $$(".tabs button").forEach(b => b.classList.remove("active"));
  const pane = document.getElementById(tabId);
  const btn = Array.from($$(".tabs button")).find(b => b.dataset.tab === tabId);
  if (pane) pane.classList.add("active");
  if (btn) btn.classList.add("active");
  window.location.hash = tabId === "home" ? "" : `#${tabId}`;
}

function wireNav() {
  $$(".tabs button").forEach(b => b.addEventListener("click", () => activate(b.dataset.tab)));
  // card buttons
  $$(".primary[data-link]").forEach(btn => {
    btn.addEventListener("click", () => {
      const to = btn.getAttribute("data-link").replace("#","");
      activate(to);
    });
  });
  // deep link on load
  const hash = (location.hash || "#home").replace("#","");
  activate(hash);
}

function wireLinksFromConfig(cfg) {
  if (!cfg) return;
  const privacyEls = ["#privacyLink","#footerPrivacy"];
  const termsEls = ["#termsLink","#footerTerms"];
  privacyEls.forEach(s => { const a=$(s); if (a) a.href = cfg.privacyURL; });
  termsEls.forEach(s => { const a=$(s); if (a) a.href = cfg.termsURL; });
  const emailEls = ["#contactLink","#footerEmail"];
  emailEls.forEach(s => { const a=$(s); if (!a) return;
    a.href = `mailto:${cfg.supportEmail}`; a.textContent = cfg.supportEmail;
  });
}

function limitedModeBanner() {
  const banner = $("#limitedBanner");
  if (!banner) return;
  // Simulate: show banner by default (user skipped permissions)
  banner.classList.remove("hidden");
  $("#enableNowBtn").addEventListener("click", () => {
    // Here you would trigger permission flow in the Pi Browser.
    alert("Permission flow would start here in the Pi Browser.");
    banner.classList.add("hidden");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  wireNav();
  wireLinksFromConfig(window.SMARTCONTENT_CONFIG);
  limitedModeBanner();
});
