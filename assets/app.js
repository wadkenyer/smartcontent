/* ========== SmartContent · one-file script ========== */
/* Helpers */
const $  = (q) => document.querySelector(q);
const $$ = (q) => document.querySelectorAll(q);

/* Storage keys */
const S = {
  push: "sc_push",
  autosave: "sc_autosave",
  dark: "sc_dark",
  lang: "sc_lang",
  wallet: "sc_wallet",
  autoMint: "sc_automint",
  scNotify: "sc_scnotify",
  piUser: "sc_pi_user",
};

/* Utils */
const get = (k, f=null)=>{ try{ const v=localStorage.getItem(k); return v===null?f:JSON.parse(v);}catch{ return f;} };
const set = (k, v)=>{ try{ localStorage.setItem(k, JSON.stringify(v)); }catch{} };

/* Theme + dir */
function applyDark(on){ document.documentElement.dataset.theme = on ? "dark" : "light"; }
function applyLangMeta(lang){
  const rtl = ["ar","fa","ur","he"];
  document.documentElement.lang = lang || "en";
  document.documentElement.dir  = rtl.includes(lang||"en") ? "rtl" : "ltr";
}

/* -------- i18n loader -------- */
async function loadLang(lang){
  try{
    const res  = await fetch(`assets/i18n/${lang}.json`, {cache:"no-store"});
    const dict = await res.json();

    // نصوص العناصر
    document.querySelectorAll("[data-i18n]").forEach(el=>{
      const key = el.getAttribute("data-i18n");
      const val = key.split(".").reduce((o,i)=>o?.[i], dict);
      if (val != null) el.textContent = val;
    });

    // Placeholders إن وُجدت
    document.querySelectorAll("[data-i18n-ph]").forEach(el=>{
      const key = el.getAttribute("data-i18n-ph");
      const val = key.split(".").reduce((o,i)=>o?.[i], dict);
      if (val != null) el.setAttribute("placeholder", val);
    });

    // سطر حقوق بسنة تلقائية (لو موجود قالب في ملف اللغة)
    const cr = $("#copyright");
    if (cr) {
      const y = new Date().getFullYear();
      const tpl = dict?.footer?.copyright;
      cr.textContent = tpl ? tpl.replace("{year}", y) : `© ${y} SmartContent`;
    }

    console.log(`[i18n] loaded ${lang}`);
  }catch(e){
    console.warn("[i18n] load error:", e);
  }
}

/* -------- Tabs (hash-based) -------- */
function showTab(id){
  $$(".tab-pane").forEach(p => p.classList.toggle("active", p.id === id));
  $$(".tabs [data-tab]").forEach(a => a.classList.toggle("active", a.dataset.tab === id));
}
function goToHash(){
  const id = (location.hash || "#home").slice(1);
  showTab($("#"+id) ? id : "home");
}
function wireNav(){
  $$(".tabs [data-tab]").forEach(a=>{
    a.addEventListener("click",(e)=>{
      e.preventDefault();
      const id = a.dataset.tab;
      history.replaceState(null, "", "#"+id);
      showTab(id);
    });
  });
  window.addEventListener("hashchange", goToHash);
  goToHash();
}

/* -------- Settings -------- */
function wireSettings(){
  const elPush = $("#pushToggle");
  const elAutosave = $("#autosaveToggle");
  const elDark = $("#darkModeToggle");
  const elLang = $("#langSelect");
  const elWallet = $("#walletInput");
  const elCopy = $("#copyWalletBtn");
  const elAutoMint = $("#autoMintToggle");
  const elScNotify = $("#scNotifyToggle");

  // load saved
  const vPush = get(S.push,false);
  const vAutosave = get(S.autosave,false);
  const vDark = get(S.dark,true);
  const vLang = get(S.lang,"en");
  const vWallet = get(S.wallet,"");
  const vAutoMint = get(S.autoMint,false);
  const vScNotify = get(S.scNotify,false);

  // apply before render
  applyDark(vDark);
  applyLangMeta(vLang);

  // fill UI
  if (elPush) elPush.checked = !!vPush;
  if (elAutosave) elAutosave.checked = !!vAutosave;
  if (elDark) elDark.checked = !!vDark;
  if (elLang) elLang.value = vLang;
  if (elWallet) elWallet.value = vWallet || "";
  if (elAutoMint) elAutoMint.checked = !!vAutoMint;
  if (elScNotify) elScNotify.checked = !!vScNotify;

  // i18n first render
  loadLang(vLang);

  // persist on change
  elPush?.addEventListener("change", e=> set(S.push, e.target.checked));
  elAutosave?.addEventListener("change", e=> set(S.autosave, e.target.checked));
  elDark?.addEventListener("change", e=> { const on=e.target.checked; set(S.dark,on); applyDark(on); });
  elLang?.addEventListener("change", e=> { const lang=e.target.value; set(S.lang,lang); applyLangMeta(lang); loadLang(lang); });
  elWallet?.addEventListener("input", e=> set(S.wallet, e.target.value.trim()));
  elAutoMint?.addEventListener("change", e=> set(S.autoMint, e.target.checked));
  elScNotify?.addEventListener("change", e=> set(S.scNotify, e.target.checked));

  // copy
  elCopy?.addEventListener("click", async ()=>{
    try{
      await navigator.clipboard.writeText((elWallet?.value||"").trim());
      elCopy.textContent = "✅";
      setTimeout(()=> elCopy.textContent="📋", 1200);
    }catch{}
  });
}

/* -------- Footer year (fallback) -------- */
function updateFooterYear(){
  const el = $("#copyright");
  if (el && !el.textContent?.trim()) {
    el.textContent = `© ${new Date().getFullYear()} SmartContent — Built for Pi Network Creators.`;
  }
}

/* -------- Simple mock Pi login (اختياري الآن) -------- */
function mockPiLogin(){
  const u = { username: "pi_creator" };
  set(S.piUser, u);
  renderPiUser();
}
function mockPiLogout(){
  localStorage.removeItem(S.piUser);
  renderPiUser();
}
function renderPiUser(){
  const el = $("#piUser");
  const btn = $("#piLoginBtn");
  const u = get(S.piUser, null);
  if (!el || !btn) return;
  if (u){
    el.textContent = "@"+u.username;
    btn.textContent = "Logout";
    btn.onclick = mockPiLogout;
  }else{
    el.textContent = "";
    btn.textContent = "🔐 Login with Pi";
    btn.onclick = mockPiLogin;
  }
}

/* -------- DOM ready -------- */
document.addEventListener("DOMContentLoaded", () => {
  wireNav();
  wireSettings();
  renderPiUser();
  updateFooterYear();
});
