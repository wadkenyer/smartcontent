/* ========== SmartContent app.js ========== */
const $  = q => document.querySelector(q);
const $$ = q => document.querySelectorAll(q);

const S = {
  push:"sc_push", autosave:"sc_autosave", dark:"sc_dark",
  lang:"sc_lang", wallet:"sc_wallet", autoMint:"sc_automint",
  scNotify:"sc_scnotify", piUser:"sc_pi_user"
};

const get = (k, f=null)=>{ try{ const v=localStorage.getItem(k); return v===null?f:JSON.parse(v);}catch{ return f;} };
const set = (k, v)=>{ try{ localStorage.setItem(k, JSON.stringify(v)); }catch{} };

function applyDark(on){ document.documentElement.dataset.theme = on ? "dark" : "light"; }

/* تبويب */
function showTab(id){
  $$(".tab-pane").forEach(p => p.classList.toggle("active", p.id === id));
  $$(".tabs [data-tab]").forEach(a => a.classList.toggle("active", a.dataset.tab === id));
}
function goToHash(){ const id = (location.hash || "#home").slice(1); showTab($("#"+id)?id:"home"); }
function wireNav(){
  $$(".tabs [data-tab]").forEach(a=>{
    a.addEventListener("click",(e)=>{
      e.preventDefault();
      const id = a.dataset.tab;
      history.replaceState(null,"","#"+id);
      showTab(id);
    });
  });
  document.body.addEventListener("click",(e)=>{
    const b = e.target.closest("[data-link]");
    if (b){ e.preventDefault(); const id=b.dataset.link; history.replaceState(null,"",id); goToHash(); }
  });
  window.addEventListener("hashchange", goToHash);
  goToHash();
}

/* إعدادات */
function wireSettings(){
  const elPush = $("#pushToggle");
  const elAutosave = $("#autosaveToggle");
  const elDark = $("#darkModeToggle");
  const elLang = $("#langSelect");
  const elWallet = $("#walletInput");
  const elCopy = $("#copyWalletBtn");
  const elAutoMint = $("#autoMintToggle");
  const elScNotify = $("#scNotifyToggle");

  // load
  const vPush = get(S.push,false);
  const vAutosave = get(S.autosave,false);
  const vDark = get(S.dark,true);
  const vLang = SC_I18N.getLang();
  const vWallet = get(S.wallet,"");
  const vAutoMint = get(S.autoMint,false);
  const vScNotify = get(S.scNotify,false);

  // apply
  applyDark(vDark);
  SC_I18N.setLang(vLang); // أول تطبيق للترجمة

  // UI
  if (elPush) elPush.checked = !!vPush;
  if (elAutosave) elAutosave.checked = !!vAutosave;
  if (elDark) elDark.checked = !!vDark;
  if (elLang) elLang.value = vLang;
  if (elWallet) elWallet.value = vWallet || "";
  if (elAutoMint) elAutoMint.checked = !!vAutoMint;
  if (elScNotify) elScNotify.checked = !!vScNotify;

  // persist
  elPush?.addEventListener("change", e=> set(S.push, e.target.checked));
  elAutosave?.addEventListener("change", e=> set(S.autosave, e.target.checked));
  elDark?.addEventListener("change", e=> { const on=e.target.checked; set(S.dark,on); applyDark(on); });
  elLang?.addEventListener("change", e=> { const lang=e.target.value; set(S.lang,lang); SC_I18N.setLang(lang); });
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

/* Login (Mock مؤقت) */
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

/* Footer year fallback لو ملف الترجمة ما حطّ السنة */
function updateFooterYear(){
  const el = $("#copyright");
  if (el && el.textContent.includes("{year}") === false) return; // already filled by i18n
  if (el) el.textContent = `© ${new Date().getFullYear()} SmartContent — Built for Pi Network Creators.`;
}

/* Ready */
document.addEventListener("DOMContentLoaded", () => {
  wireNav();
  wireSettings();
  renderPiUser();
  updateFooterYear();
});
