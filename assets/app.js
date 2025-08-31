/* ========= SmartContent App Script ========= */
/* أدوات سريعة لاختيار العناصر */
const $  = (q) => document.querySelector(q);
const $$ = (q) => document.querySelectorAll(q);

/* ========== التنقل بين التبويبات ========== */
function activate(tabId) {
  // أخفِ كل البانلز
  $$('.tab-pane').forEach(el => el.classList.remove('active'));
  // أزل التفعيل من كل أزرار التبويب
  $$('.tabs button').forEach(b => b.classList.remove('active'));

  // فعّل البانل المطلوب
  const pane = document.getElementById(tabId);
  if (pane) pane.classList.add('active');

  // فعّل زر التبويب المطابق
  const btn = Array.from($$('.tabs button')).find(b => b.dataset.tab === tabId);
  if (btn) btn.classList.add('active');

  // سجّل حدث مشاهدة تبويب في الأنلتكس
  logEvent('tab_view', tabId);

  // حدّث الواجهة الخاصة بالأنلتكس (إن وُجدت)
  updateAnalyticsUI();
}

function wireNav() {
  // ربط أزرار التبويب العلوية
  $$('.tabs button[data-tab]').forEach(b => {
    b.addEventListener('click', () => activate(b.dataset.tab));
  });

  // ربط الأزرار داخل الكروت: data-link="#id"
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-link]');
    if (!el) return;
    const id = el.getAttribute('data-link').replace('#', '').trim();
    if (!id) return;
    activate(id);
    logEvent('button_click', id);
  });

  // التنشيط العميق عبر الهاش إن وُجد (أو Home افتراضياً)
  const hash = (location.hash || '#home').replace('#', '');
  activate(hash);
}

/* ========== Limited Mode Banner ========== */
function limitedModeBanner() {
  const banner = $('#limitedBanner');
  if (!banner) return;

  // اظهره افتراضياً إن رغبتَ بمحاكاة “لم يمنح الأذونات”
  banner.classList.remove('hidden');

  const enableBtn = $('#enableNowBtn');
  if (enableBtn) {
    enableBtn.addEventListener('click', () => {
      alert('Permission flow would start here in the Pi Browser.');
      banner.classList.add('hidden');
      logEvent('cta_click', 'enable_permissions');
      updateAnalyticsUI();
    });
  }
}

/* ========== الفوتر: سنة تلقائية ========== */
function updateFooterYear() {
  const y  = new Date().getFullYear();
  const cr = document.getElementById('copyright');
  if (cr) cr.textContent = `© ${y} SmartContent – Built for Pi Network Creators`;
}

/* ========== تفضيلات بسيطة (اختياري) ========== */
/* تحفظ حالة Dark Mode واللغة إن كانت موجودة في الصفحة */
function wirePrefs() {
  const darkChk = document.getElementById('darkModeToggle');
  if (darkChk) {
    // حمّل الحالة المحفوظة
    const saved = localStorage.getItem('pref_dark') === '1';
    darkChk.checked = saved;
    document.documentElement.dataset.theme = saved ? 'dark' : 'default';

    darkChk.addEventListener('change', () => {
      const on = darkChk.checked;
      localStorage.setItem('pref_dark', on ? '1' : '0');
      document.documentElement.dataset.theme = on ? 'dark' : 'default';
      logEvent('pref_change', on ? 'dark_on' : 'dark_off');
      updateAnalyticsUI();
    });
  }

  const langSel = document.getElementById('langSelect');
  if (langSel) {
    const savedLang = localStorage.getItem('pref_lang');
    if (savedLang) langSel.value = savedLang;

    langSel.addEventListener('change', () => {
      localStorage.setItem('pref_lang', langSel.value);
      logEvent('pref_change', `lang_${langSel.value}`);
      updateAnalyticsUI();
      // هنا لاحقاً يمكنك استدعاء مُحمّل i18n لتطبيق اللغة
    });
  }
}

/* ========== Analytics محلي (LocalStorage) ========== */
const LS_EVENTS_KEY = 'sc_events';

function getEvents() {
  try {
    const raw = localStorage.getItem(LS_EVENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setEvents(arr) {
  try {
    localStorage.setItem(LS_EVENTS_KEY, JSON.stringify(arr));
  } catch {}
}

function logEvent(type, detail = '') {
  const events = getEvents();
  events.push({
    ts: Date.now(),
    type,
    detail
  });
  setEvents(events);
}

function resetAnalytics() {
  setEvents([]);
  updateAnalyticsUI();
}

function updateAnalyticsUI() {
  // عناصر الإحصائيات إن وُجدت
  const elTotal   = document.getElementById('totalEvents');
  const elViews7d = document.getElementById('views7d');
  const elMost    = document.getElementById('mostViewed');
  const elTable   = document.getElementById('eventsTable');
  const elChart   = document.getElementById('trafficChart'); // اختياري للرسم البسيط

  const events = getEvents();

  // إجمالي
  if (elTotal) elTotal.textContent = String(events.length);

  // 7 أيام
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const last7 = events.filter(e => e.ts >= sevenDaysAgo);
  if (elViews7d) elViews7d.textContent = String(last7.length);

  // أكثر تبويب مشاهدة
  if (elMost) {
    const views = events.filter(e => e.type === 'tab_view');
    const counts = views.reduce((acc, e) => {
      acc[e.detail] = (acc[e.detail] || 0) + 1;
      return acc;
    }, {});
    const most = Object.entries(counts).sort((a,b) => b[1]-a[1])[0];
    elMost.textContent = most ? most[0] : '–';
  }

  // جدول آخر 20 حدث
  if (elTable) {
    const rows = events.slice(-20).reverse().map(e => {
      const d = new Date(e.ts);
      const time = d.toLocaleString();
      return `<tr><td>${time}</td><td>${e.type}</td><td>${e.detail || '-'}</td></tr>`;
    }).join('');
    elTable.innerHTML = rows || '<tr><td colspan="3">No events yet</td></tr>';
  }

  // رسم بسيط (اختياري جداً) لعدد أحداث كل يوم خلال 7 أيام
  if (elChart) {
    const buckets = Array(7).fill(0);
    last7.forEach(e => {
      const daysAgo = Math.floor((Date.now() - e.ts) / (24*60*60*1000));
      const idx = 6 - Math.min(Math.max(daysAgo,0),6); // 0..6، اليوم في اليمين
      buckets[idx]++;
    });
    // ارسم أعمدة بسيطة داخل العنصر
    elChart.innerHTML = `
      <div style="display:flex; align-items:flex-end; gap:8px; height:120px;">
        ${buckets.map(v => `
          <div title="${v}" style="flex:1; background:linear-gradient(90deg,#7a5cff,#9a5cff); height:${v ? (10+v*10) : 6}px; border-radius:6px;"></div>
        `).join('')}
      </div>
      <div style="display:flex; justify-content:space-between; font-size:12px; opacity:.8; margin-top:6px;">
        <span>Fri</span><span>Sat</span><span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span>
      </div>
    `;
  }
}

/* ========== ربط زر تصفير الأنلتكس إن وُجد ========== */
function wireAnalyticsReset() {
  const resetBtn = document.getElementById('resetAnalyticsBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('Reset analytics data?')) resetAnalytics();
    });
  }
}

/* ========== تشغيل كل شيء بعد تحميل DOM ========== */
document.addEventListener('DOMContentLoaded', () => {
  wireNav();
  wireSettings();
  renderPiUser();
  limitedModeBanner();
  updateFooterYear();
  wirePrefs();
  wireAnalyticsReset();
  updateAnalyticsUI();
});// مفاتيح التخزين في localStorage
const S = {
  push:     "sc_push",
  autosave: "sc_autosave",
  dark:     "sc_dark",
  lang:     "sc_lang",
  wallet:   "sc_wallet",
  autoMint: "sc_automint",
  scNotify: "sc_scnotify",
};
// مفاتيح تخزين
const S = Object.assign({}, S, { piUser: "sc_pi_user" }); // لو S معرف سابقًا

function mockPiLogin(){
  // استبدل لاحقًا بـ window.Pi.authenticate(...)
  const u = { username: "pi_creator", uid: "USR12345" };
  localStorage.setItem(S.piUser, JSON.stringify(u));
  renderPiUser();
}

function mockPiLogout(){
  localStorage.removeItem(S.piUser);
  renderPiUser();
}

function renderPiUser(){
  const el = document.getElementById("piUser");
  const btn = document.getElementById("piLoginBtn");
  const u = JSON.parse(localStorage.getItem(S.piUser) || "null");
  if(!el || !btn) return;
  if(u){
    el.textContent = `@${u.username}`;
    btn.textContent = "Logout";
    btn.onclick = mockPiLogout;
  }else{
    el.textContent = "";
    btn.textContent = "🔐 Login with Pi";
    btn.onclick = mockPiLogin;
  }
}

// داخل DOMContentLoaded بعد wireSettings()
renderPiUser();

const get = (k, f=null)=>{ try{ const v=localStorage.getItem(k); return v===null?f:JSON.parse(v);}catch{ return f;} };
const set = (k, v)=>{ try{ localStorage.setItem(k, JSON.stringify(v)); }catch{} };

// طبّق الثيم
const applyDark = (on)=> {
  // لو عندك CSS يعتمد على body.dark حافظ عليه
  document.body.classList.toggle("dark", !!on);
};

// لغة + اتجاه
const applyLangMeta = (lang)=>{
  const rtl = ["ar","fa","ur","he"];
  document.documentElement.lang = lang || "en";
  document.documentElement.dir  = rtl.includes(lang) ? "rtl" : "ltr";
};

// وحدة إعدادات موحّدة
function wireSettings() {
  const elPush      = document.getElementById("pushToggle");
  const elAutosave  = document.getElementById("autosaveToggle");
  const elDark      = document.getElementById("darkModeToggle");
  const elLang      = document.getElementById("langSelect");
  const elWallet    = document.getElementById("walletInput");
  const elCopy      = document.getElementById("copyWalletBtn");
  const elAutoMint  = document.getElementById("autoMintToggle");
  const elScNotify  = document.getElementById("scNotifyToggle");

  // قراءة محفوظات
  const vPush      = get(S.push,     false);
  const vAutosave  = get(S.autosave, false);
  const vDark      = get(S.dark,     true);
  const vLang      = get(S.lang,     "en");
  const vWallet    = get(S.wallet,   "");
  const vAutoMint  = get(S.autoMint, false);
  const vScNotify  = get(S.scNotify, false);

  // تطبيق قبل عرض
  applyDark(vDark);
  applyLangMeta(vLang);

  // تعبئة UI
  if (elPush)     elPush.checked     = !!vPush;
  if (elAutosave) elAutosave.checked = !!vAutosave;
  if (elDark)     elDark.checked     = !!vDark;
  if (elLang)     elLang.value       = vLang;
  if (elWallet)   elWallet.value     = vWallet || "";
  if (elAutoMint) elAutoMint.checked = !!vAutoMint;
  if (elScNotify) elScNotify.checked = !!vScNotify;

  // حفظ عند التغيير
  elPush?.addEventListener("change",     e=> set(S.push,     e.target.checked));
  elAutosave?.addEventListener("change", e=> set(S.autosave, e.target.checked));
  elDark?.addEventListener("change",     e=> { set(S.dark, e.target.checked); applyDark(e.target.checked); });
  elLang?.addEventListener("change",     e=> { set(S.lang, e.target.value);  applyLangMeta(e.target.value); });
  elWallet?.addEventListener("input",    e=> set(S.wallet,   e.target.value.trim()));
  elAutoMint?.addEventListener("change", e=> set(S.autoMint, e.target.checked));
  elScNotify?.addEventListener("change", e=> set(S.scNotify, e.target.checked));

  // نسخ العنوان
  elCopy?.addEventListener("click", async ()=>{
    try {
      await navigator.clipboard.writeText((elWallet?.value || "").trim());
      elCopy.textContent = "✅";
      setTimeout(()=> elCopy.textContent = "📋", 1200);
    } catch {}
  });
}
