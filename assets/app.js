/* ===== SmartContent App - Core Logic ===== */

// المساعدات (Helpers)
const $ = (q) => document.querySelector(q);
const $$ = (q) => document.querySelectorAll(q);

// مفاتيح التخزين (Storage Keys)
const S = {
  piUser: "sc_pi_user",
  dark: "sc_dark",
  lang: "sc_lang",
  autosave: "sc_autosave"
};

// وظائف التخزين
const get = (k, f = null) => { try { const v = localStorage.getItem(k); return v === null ? f : JSON.parse(v); } catch { return f; } };
const set = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

/* ===== 1. تهيئة نظام Pi Network ===== */

async function initPi() {
  if (typeof Pi === "undefined") {
    console.warn("Pi SDK not found. Use Pi Browser.");
    return;
  }

  try {
    // جلب الإعدادات من config.js
    const config = window.SC_CONFIG || { version: "2.0", sandbox: true };
    await Pi.init({ version: "2.0", sandbox: config.sandbox });
    
    console.log("Pi SDK Initialized");
    renderPiUser(); // تحديث الواجهة عند التحميل
  } catch (e) {
    console.error("Pi Init Error:", e);
  }
}

/* ===== 2. نظام تسجيل الدخول (Authentication) ===== */

async function piLogin() {
  if (typeof Pi === "undefined") {
    alert(window.SC_I18N.getLang() === "ar" ? "افتح التطبيق من متصفح Pi!" : "Open in Pi Browser!");
    return;
  }

  try {
    const scopes = ["username", "payments"];
    const auth = await Pi.authenticate(scopes, onIncompletePaymentFound);
    
    set(S.piUser, auth.user);
    renderPiUser();
    
    const msg = window.SC_I18N.getLang() === "ar" ? `أهلاً @${auth.user.username}` : `Welcome @${auth.user.username}`;
    console.log(msg);
  } catch (e) {
    console.error("Login failed", e);
  }
}

function renderPiUser() {
  const userEl = $("#piUser");
  const btn = $("#piLoginBtn");
  const u = get(S.piUser, null);

  if (!userEl || !btn) return;

  if (u) {
    userEl.innerHTML = `<span class="user-badge">🟣 @${u.username}</span>`;
    btn.textContent = window.SC_I18N.getLang() === "ar" ? "خروج" : "Logout";
    btn.onclick = () => { localStorage.removeItem(S.piUser); renderPiUser(); };
  } else {
    userEl.textContent = "";
    btn.textContent = window.SC_I18N.getLang() === "ar" ? "🔐 دخول Pi" : "🔐 Pi Login";
    btn.onclick = piLogin;
  }
}

/* ===== 3. نظام المدفوعات (Payments) ===== */

async function createPiPayment(amount, memo) {
  try {
    const payment = await Pi.createPayment({
      amount: amount,
      memo: memo,
      metadata: { service: "AI_Generation" },
    }, {
      onReadyForServerApproval: (id) => console.log("Payment Pending Approval:", id),
      onReadyForServerCompletion: (id, txid) => console.log("Payment Confirmed:", txid),
      onCancel: (id) => console.log("Payment Cancelled"),
      onError: (err) => console.error("Payment Error", err),
    });
    return payment;
  } catch (e) {
    return null;
  }
}

function onIncompletePaymentFound(payment) {
  console.log("Found incomplete payment:", payment);
}

/* ===== 4. محرك الذكاء الاصطناعي (AI Engine) ===== */

async function handleAiGeneration() {
  const user = get(S.piUser, null);
  const lang = window.SC_I18N.getLang();
  const topicInput = $("#ai-topic"); // تأكد أن id المدخل هو ai-topic
  const resultArea = $("#ai-result");

  if (!user) {
    alert(lang === "ar" ? "سجل دخولك أولاً!" : "Login first!");
    return;
  }

  if (!topicInput || !topicInput.value) {
    alert(lang === "ar" ? "أدخل موضوعاً!" : "Enter a topic!");
    return;
  }

  // طلب الدفع (0.001 Pi)
  const payment = await createPiPayment(0.001, "AI Content Generation");
  
  if (payment) {
    resultArea.innerHTML = lang === "ar" ? "⏳ جاري التوليد..." : "⏳ Generating...";
    
    try {
      // استدعاء Hugging Face (استبدل TOKEN بـ مفتاحك الحقيقي)
      const response = await fetch("https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2", {
        method: "POST",
        headers: { "Authorization": "Bearer YOUR_TOKEN_HERE" },
        body: JSON.stringify({ inputs: `Write a post about: ${topicInput.value}. Language: ${lang}` })
      });
      
      const data = await response.json();
      resultArea.innerHTML = `<div class="ai-output">${data[0].generated_text}</div>`;
    } catch (err) {
      resultArea.innerHTML = "Error / خطأ";
    }
  }
}

/* ===== 5. تشغيل التطبيق عند التحميل ===== */

document.addEventListener("DOMContentLoaded", () => {
  initPi();

  const genBtn = $("#generateBtn");
  if (genBtn) genBtn.addEventListener("click", handleAiGeneration);

  // تحديث السنة في الفوتر تلقائياً
  const yearEl = $("#copyright-year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});
