/* ===== Pi Network Integration (النسخة المطورة) ===== */

async function piLogin() {
  const btn = $("#piLoginBtn");
  const userEl = $("#piUser");

  // التأكد من أننا داخل Pi Browser
  if (typeof Pi === "undefined") {
    console.warn("Pi SDK not found. Are you in Pi Browser?");
    alert("يرجى فتح التطبيق من داخل Pi Browser لتتمكن من تسجيل الدخول.");
    return;
  }

  try {
    // طلب الصلاحيات: الاسم والمدفوعات
    const scopes = ["username", "payments"]; 
    
    // بدء عملية المصادقة الحقيقية
    const auth = await Pi.authenticate(scopes, onIncompletePaymentFound);
    
    // حفظ بيانات المستخدم الحقيقية
    set(S.piUser, auth.user);
    
    // تحديث الواجهة
    renderPiUser();
    console.log("Welcome, " + auth.user.username);

  } catch (e) {
    console.error("Pi login failed", e);
    alert("فشل تسجيل الدخول، تأكد من منح الصلاحيات المطلوبة.");
  }
}

// دالة لمعالجة المدفوعات غير المكتملة (إلزامية من Pi Network)
function onIncompletePaymentFound(payment) {
  console.log("Incomplete payment found:", payment);
  // هنا يمكنك إرسال الـ paymentId لخادمك للتأكد من الحالة
}

function renderPiUser() {
  const userEl = $("#piUser");
  const btn = $("#piLoginBtn");
  const u = get(S.piUser, null);

  if (!userEl || !btn) return;

  if (u) {
    // عرض اسم المستخدم مع أيقونة جذابة
    userEl.innerHTML = `<span class="user-badge">🟣 @${u.username}</span>`;
    btn.textContent = "Logout";
    btn.onclick = () => {
      localStorage.removeItem(S.piUser);
      renderPiUser();
    };
  } else {
    userEl.textContent = "";
    btn.innerHTML = "🔐 Login with Pi";
    btn.onclick = piLogin; // ربط الزر بالدالة الحقيقية
  }
}
/* ===== دالة دفع Pi مقابل خدمة AI ===== */

async function payForAiService(amount, metadata) {
  try {
    const payment = await Pi.createPayment({
      amount: amount, // مثال: 0.001
      memo: "Generating AI Content: " + metadata, // يظهر للمستخدم في محفظته
      metadata: { serviceType: "AI_Generation" }, 
    }, {
      // هذه الدوال الأربع إلزامية لإتمام العملية بنجاح:
      onReadyForServerApproval: (paymentId) => {
        console.log("Payment ID created:", paymentId);
        // هنا يجب إبلاغ خادمك (Backend) بالـ paymentId ليعتمده
        // إذا لم يكن لديك backend حالياً، يمكنك محاكاة ذلك في مرحلة الـ Sandbox
      },
      onReadyForServerCompletion: (paymentId, txid) => {
        console.log("Transaction ID on Chain:", txid);
        // تم الدفع بنجاح على البلوكشين!
      },
      onCancel: (paymentId) => { console.log("User cancelled payment"); },
      onError: (error, payment) => { console.error("Payment error", error); },
    });
    
    return payment; // إذا نجحت العملية
  } catch (err) {
    console.error("Payment failed", err);
    return null;
  }
}

/* ===== مثال لاستخدامها عند الضغط على زر "توليد محتوى" ===== */
async function handleGenerateClick() {
  const user = get(S.piUser, null);
  
  if (!user) {
    alert("يرجى تسجيل الدخول باستخدام Pi أولاً!");
    return;
  }

  // طلب دفع مبلغ بسيط قبل بدء المعالجة
  const success = await payForAiService(0.001, "Article Generator");
  
  if (success) {
    // هنا تضع كود الذكاء الاصطناعي الخاص بك (OpenAI API أو غيرها)
    alert("تم الدفع بنجاح! جاري توليد المحتوى...");
    // generateContent(); 
  }
}
