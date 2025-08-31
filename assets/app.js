/* =============================
   SmartContent - Single App Script
   ============================= */

/* -------- Helpers -------- */
const $  = (q) => document.querySelector(q);
const $$ = (q) => document.querySelectorAll(q);

/* -------- Keys / Storage -------- */
const S = {
  push:     'sc_push',
  autosave: 'sc_autosave',
  dark:     'sc_dark',
  lang:     'sc_lang',
  wallet:   'sc_wallet',
  autoMint: 'sc_automint',
  scNotify: 'sc_scnotify',
  piUser:   'sc_pi_user',
  events:   'sc_events', // analytics
};

const get = (k, fallback=null) => {
  try { const v = localStorage.getItem(k); return v===null ? fallback : JSON.parse(v); }
  catch { return fallback; }
};
const set = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

/* -------- Theme & Lang -------- */
const applyDark = (on) => document.body.classList.toggle('dark', !!on);
const applyLangMeta = (lang) => {
  const rtl = ['ar','fa','ur','he'];
  document.documentElement.lang = lang || 'en';
  document.documentElement.dir  = rtl.includes(lang) ? 'rtl' : 'ltr';
};

/* =================================
   Tabs (works with <a> أو <button>)
   ================================= */
function showTab(id) {
  $$('.tab-pane').forEach(p => p.classList.toggle('active', p.id === id));
  $$('.tabs [data-tab]').forEach(t => t.classList.toggle('active', t.dataset.tab === id));
  logEvent('tab_view', id);
  updateAnalyticsUI();
}
function goToHash() {
  const id = (location.hash || '#home').slice(1);
  showTab(document.getElementById(id) ? id : ($('.tab-pane')?.id || 'home'));
}
function wireNav() {
  $$('.tabs [data-tab]').forEach(t => {
    t.addEventListener('click', (e) => {
      e.preventDefault();
      const id = t.dataset.tab;
      history.replaceState(null, '', '#' + id);
      showTab(id);
    });
  });
  // deep link buttons e.g. data-link="#analytics"
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-link]');
    if (!el) return;
    const id = el.getAttribute('data-link').replace('#','').trim();
    if (id) { history.replaceState(null, '', '#' + id); showTab(id); logEvent('button_click', id); }
  });
  window.addEventListener('hashchange', goToHash);
  goToHash();
}

/* ======================
   Settings (safe wiring)
   ====================== */
function wireSettings() {
  const elPush      = $('#pushToggle');
  const elAutosave  = $('#autosaveToggle');
  const elDark      = $('#darkModeToggle');
  const elLang      = $('#langSelect');
  const elWallet    = $('#walletInput');
  const elCopy      = $('#copyWalletBtn');
  const elAutoMint  = $('#autoMintToggle');
  const elScNotify  = $('#scNotifyToggle');

  // load
  const vPush     = get(S.push,     false);
  const vAutosave = get(S.autosave, false);
  const vDark     = get(S.dark,     true);
  const vLang     = get(S.lang,     'en');
  const vWallet   = get(S.wallet,   '');
  const vAutoMint = get(S.autoMint, false);
  const vScNotify = get(S.scNotify, false);

  // apply meta first
  applyDark(vDark);
  applyLangMeta(vLang);

  // fill UI
  if (elPush)     elPush.checked     = !!vPush;
  if (elAutosave) elAutosave.checked = !!vAutosave;
  if (elDark)     elDark.checked     = !!vDark;
  if (elLang)     elLang.value       = vLang;
  if (elWallet)   elWallet.value     = vWallet || '';
  if (elAutoMint) elAutoMint.checked = !!vAutoMint;
  if (elScNotify) elScNotify.checked = !!vScNotify;

  // save on change
  elPush     && elPush.addEventListener('change', e => set(S.push,     e.target.checked));
  elAutosave && elAutosave.addEventListener('change', e => set(S.autosave, e.target.checked));
  elDark     && elDark.addEventListener('change', e => { set(S.dark, e.target.checked); applyDark(e.target.checked); });
  elLang     && elLang.addEventListener('change', e => { set(S.lang, e.target.value);  applyLangMeta(e.target.value); });
  elWallet   && elWallet.addEventListener('input',  e => set(S.wallet, e.target.value.trim()));
  elAutoMint && elAutoMint.addEventListener('change', e => set(S.autoMint, e.target.checked));
  elScNotify && elScNotify.addEventListener('change', e => set(S.scNotify, e.target.checked));

  // copy wallet
  elCopy && elCopy.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText((elWallet?.value || '').trim()); elCopy.textContent='✅'; setTimeout(()=> elCopy.textContent='📋', 1200); } catch {}
  });
}

/* ======================
   Footer year (optional)
   ====================== */
function updateFooterYear() {
  const el = $('#copyright');
  if (el) el.textContent = `© ${new Date().getFullYear()} SmartContent — Built for Pi Network Creators.`;
}

/* ======================
   Limited banner (mock)
   ====================== */
function limitedModeBanner() {
  const banner = $('#limitedBanner');
  if (!banner) return;
  banner.classList.remove('hidden');
  $('#enableNowBtn')?.addEventListener('click', () => {
    alert('Permission flow would start here in the Pi Browser.');
    banner.classList.add('hidden');
    logEvent('cta_click', 'enable_permissions');
    updateAnalyticsUI();
  });
}

/* ======================
   Analytics (local)
   ====================== */
const getEvents = () => get(S.events, []);
const setEvents = (arr) => set(S.events, arr);

function logEvent(type, detail='') {
  const arr = getEvents();
  arr.push({ ts: Date.now(), type, detail });
  setEvents(arr);
}

function updateAnalyticsUI() {
  const elTotal   = $('#totalEvents');
  const elViews7d = $('#views7d');
  const elMost    = $('#mostViewed');
  const elTable   = $('#eventsTable');
  const elChart   = $('#trafficChart');

  const events = getEvents();
  elTotal   && (elTotal.textContent   = String(events.length));

  const sevenDaysAgo = Date.now() - 7*24*60*60*1000;
  const last7 = events.filter(e => e.ts >= sevenDaysAgo);
  elViews7d && (elViews7d.textContent = String(last7.length));

  if (elMost) {
    const views = events.filter(e => e.type === 'tab_view');
    const counts = views.reduce((m,e)=>((m[e.detail]=(m[e.detail]||0)+1),m),{});
    const most = Object.entries(counts).sort((a,b)=>b[1]-a[1])[0];
    elMost.textContent = most ? most[0] : '–';
  }

  if (elTable) {
    const rows = events.slice(-20).reverse().map(e=>{
      const d = new Date(e.ts).toLocaleString();
      return `<tr><td>${d}</td><td>${e.type}</td><td>${e.detail || '-'}</td></tr>`;
    }).join('');
    elTable.innerHTML = rows || '<tr><td colspan="3">No events yet</td></tr>';
  }

  if (elChart) {
    const buckets = Array(7).fill(0);
    last7.forEach(e => {
      const daysAgo = Math.floor((Date.now() - e.ts) / (24*60*60*1000));
      const idx = 6 - Math.min(Math.max(daysAgo,0),6);
      buckets[idx]++;
    });
    elChart.innerHTML = `
      <div style="display:flex;align-items:flex-end;gap:8px;height:120px;">
        ${buckets.map(v=>`<div title="${v}" style="flex:1;background:linear-gradient(90deg,#7a5cff,#9a5cff);height:${v?10+v*10:6}px;border-radius:6px;"></div>`).join('')}
      </div>
      <div style="display:flex;justify-content:space-between;font-size:12px;opacity:.8;margin-top:6px;">
        <span>Fri</span><span>Sat</span><span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span>
      </div>`;
  }
}

function wireAnalyticsReset() {
  $('#resetAnalyticsBtn')?.addEventListener('click', () => {
    if (confirm('Reset analytics data?')) { set(S.events, []); updateAnalyticsUI(); }
  });
}

/* ======================
   Mock Pi login (optional)
   ====================== */
function mockPiLogin(){ set(S.piUser, { username:'pi_creator', uid:'USR12345' }); renderPiUser(); }
function mockPiLogout(){ localStorage.removeItem(S.piUser); renderPiUser(); }
function renderPiUser(){
  const el  = $('#piUser');
  const btn = $('#piLoginBtn');
  const u = get(S.piUser, null);
  if (!el || !btn) return;
  if (u) { el.textContent = '@'+u.username; btn.textContent='Logout'; btn.onclick = mockPiLogout; }
  else   { el.textContent = '';             btn.textContent='🔐 Login with Pi'; btn.onclick = mockPiLogin; }
}

/* ======================
   CMS (simple local demo)
   ====================== */
const S_CMS = { posts: 'sc_posts' };
const loadPosts = () => get(S_CMS.posts, []);
const savePosts = (a) => set(S_CMS.posts, a);

function renderPosts(){
  const box = $('#postsList');
  if (!box) return;
  const items = loadPosts();
  box.innerHTML = items.length ? items.map((p,i)=>`
    <div class="mini-card" style="display:flex;justify-content:space-between;align-items:center;">
      <div><div class="tag">${p.title}</div><p class="muted" style="margin:6px 0 0;">${p.body.slice(0,120)}${p.body.length>120?'…':''}</p></div>
      <button class="secondary" data-del="${i}">Delete</button>
    </div>
  `).join('') : `<p class="muted">No posts yet.</p>`;
  box.querySelectorAll('button[data-del]').forEach(b=>{
    b.onclick = () => { const arr = loadPosts(); arr.splice(+b.dataset.del,1); savePosts(arr); renderPosts(); logEvent('cms_delete','post'); };
  });
}
function wireCMS(){
  const btn = $('#savePostBtn'), t = $('#postTitle'), b = $('#postBody');
  if (!btn || !t || !b) return;
  btn.onclick = () => {
    const title = t.value.trim(), body = b.value.trim();
    if (!title || !body) { alert('Please write a title and body'); return; }
    const arr = loadPosts(); arr.unshift({ title, body, ts: Date.now() }); savePosts(arr);
    t.value=''; b.value=''; renderPosts(); logEvent('cms_save','post');
  };
  renderPosts();
}

/* ======================
   AI (mock)
   ====================== */
function wireAI(){
  const btn = $('#aiGenBtn'), topic = $('#aiTopic'), out = $('#aiOut');
  if (!btn || !topic || !out) return;
  btn.onclick = () => {
    const t = topic.value.trim() || 'your topic';
    out.value = `Title: ${t}\n\n- Insight 1\n- Insight 2\n- CTA: Share your thoughts.`;
    logEvent('ai_generate', t);
  };
}

/* ======================
   Boot
   ====================== */
document.addEventListener('DOMContentLoaded', () => {
  wireNav();               // التبويبات
  wireSettings();          // الإعدادات (مرن)
  limitedModeBanner();     // بانر اختياري
  updateFooterYear();      // سنة الفوتر
  wireAnalyticsReset();    // زر تصفير
  updateAnalyticsUI();     // رسم الإحصاءات
  renderPiUser();          // زر/اسم مستخدم Pi (mock)
  wireCMS();               // CMS ديمو
  wireAI();                // AI ديمو
});
