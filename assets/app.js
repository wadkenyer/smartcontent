// =============================================
// SmartContent - assets/app.js (نسخة محسنة 2026)
// =============================================

let currentUser = null;

// تهيئة Pi SDK (يُستدعى من ai.html)
async function initPiSDK() {
  try {
    await Pi.init({ 
      version: "2.0", 
      sandbox: true   // غيّر إلى false عند الإنتاج النهائي
    });
    console.log("✅ Pi SDK تم تهيئته بنجاح");
  } catch (err) {
    console.error("❌ فشل تهيئة Pi SDK:", err);
  }
}

// دالة الدفع المحسنة (هذه هي النسخة الصحيحة)
async function makePiPayment(amount, memo) {
  if (!currentUser) {
    return alert("يرجى تسجيل الدخول بـ Pi أولاً");
  }

  try {
    const payment = await window.Pi.createPayment({
      amount: amount,
      memo: memo,
      metadata: { 
        app: "SmartContent",
        service: "AI_Generation",
        version: "1.0"
      }
    }, {
      onReadyForServerApproval: async (paymentId) => {
        console.log("🔄 جاري الموافقة على الدفع - Payment ID:", paymentId);
        
        try {
          const res = await fetch('/api/pi-backend', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'approve', paymentId: paymentId })
          });

          if (res.ok) {
            console.log("✅ تمت الموافقة من السيرفر");
          } else {
            console.error("❌ فشل الموافقة من السيرفر");
          }
        } catch (err) {
          console.error("خطأ في الاتصال أثناء الموافقة:", err);
        }
      },

      onReadyForServerCompletion: async (paymentId, txid) => {
        console.log("🔄 جاري إتمام الدفع - TXID:", txid);
        
        try {
          const res = await fetch('/api/pi-backend', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              action: 'complete', 
              paymentId: paymentId, 
              txid: txid 
            })
          });

          if (res.ok) {
            console.log("✅ تم إتمام الدفع بنجاح على السيرفر");
          }
        } catch (err) {
          console.error("خطأ في الاتصال أثناء الإتمام:", err);
        }
      },

      onCancel: (paymentId) => {
        console.log("❌ تم إلغاء الدفع:", paymentId);
        alert("تم إلغاء عملية الدفع");
      },

      onError: (error) => {
        console.error("❌ Payment Error:", error);
        alert("حدث خطأ أثناء الدفع: " + (error.message || "غير معروف"));
      }
    });

    console.log("✅ تم إنشاء طلب الدفع بنجاح:", payment);
    return payment;

  } catch (e) {
    console.error("فشل بدء الدفع:", e);
    alert("فشل بدء عملية الدفع. تأكد من فتح التطبيق داخل Pi Browser.");
    return null;
  }
}

// دالة توليد المحتوى بعد الدفع (مؤقتاً بسيطة)
async function handleAiGeneration() {
  const topicInput = document.getElementById("ai-topic");
  const resultArea = document.getElementById("ai-result");

  if (!topicInput || !topicInput.value.trim()) {
    alert("يرجى كتابة الموضوع أولاً!");
    return;
  }

  resultArea.style.display = "block";
  resultArea.innerHTML = "⏳ جاري بدء عملية الدفع...";

  // بدء الدفع (مثال: 1 Pi)
  const payment = await makePiPayment(1, "توليد محتوى بالذكاء الاصطناعي - SmartContent");

  if (payment) {
    resultArea.innerHTML = `
      ✅ تم بدء الدفع بنجاح!<br><br>
      الموضوع: ${topicInput.value}<br><br>
      <small>سيتم إضافة Gemini API قريباً بعد نجاح الدفع...</small>
    `;
  } else {
    resultArea.innerHTML = "❌ فشل الدفع أو تم إلغاؤه";
  }
}

// جعل الدوال متاحة عالمياً
window.initPiSDK = initPiSDK;
window.makePiPayment = makePiPayment;
window.handleAiGeneration = handleAiGeneration;

console.log("✅ app.js تم تحميله بنجاح - الدوال جاهزة");