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
