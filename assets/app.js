/* ===== تحديث نظام المدفوعات (Payments) للربط مع Vercel ===== */

async function createPiPayment(amount, memo) {
  try {
    const payment = await Pi.createPayment({
      amount: amount,
      memo: memo,
      metadata: { service: "AI_Generation" },
    }, {
      // 1. عند موافقة المستخدم، نرسل المعرف لخادم Vercel للموافقة عليه برمجياً
      onReadyForServerApproval: async (paymentId) => {
        console.log("Server Approval Step:", paymentId);
        await fetch('/api/pi-backend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'approve', paymentId: paymentId })
        });
      },
      // 2. عند اكتمال العملية، نبلغ الخادم لإتمامها نهائياً
      onReadyForServerCompletion: async (paymentId, txid) => {
        console.log("Server Completion Step:", txid);
        await fetch('/api/pi-backend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'complete', paymentId: paymentId, txid: txid })
        });
      },
      onCancel: (id) => console.log("Payment Cancelled"),
      onError: (err) => console.error("Payment Error", err),
    });
    return payment;
  } catch (e) {
    console.error("Payment Flow Failed", e);
    return null;
  }
}

/* ===== محرك الذكاء الاصطناعي (AI Engine) عبر Vercel API ===== */

async function handleAiGeneration() {
  const user = get(S.piUser, null);
  const lang = window.SC_I18N.getLang();
  const topicInput = $("#ai-topic");
  const resultArea = $("#ai-result");

  if (!user) {
    alert(lang === "ar" ? "سجل دخولك أولاً عبر Pi!" : "Login via Pi first!");
    return;
  }

  if (!topicInput || !topicInput.value) {
    alert(lang === "ar" ? "أدخل موضوعاً!" : "Enter a topic!");
    return;
  }

  // تنفيذ عملية الدفع أولاً
  const payment = await createPiPayment(0.01, "AI Content Creation Fee");
  
  if (payment) {
    resultArea.innerHTML = lang === "ar" ? "⏳ جاري التوليد بأمان..." : "⏳ Securely Generating...";
    
    try {
      // نرسل الطلب لـ Vercel ليقوم هو بالاتصال بالذكاء الاصطناعي
      const response = await fetch("/api/generate-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: topicInput.value,
          lang: lang,
          paymentId: payment.identifier // نرسل معرف الدفع للتأكد
        })
      });
      
      const data = await response.json();
      
      if (data.text) {
        resultArea.innerHTML = `<div class="ai-output card">${data.text}</div>`;
      } else {
        throw new Error("Empty response");
      }
    } catch (err) {
      resultArea.innerHTML = lang === "ar" ? "❌ حدث خطأ في الاتصال" : "❌ Connection Error";
    }
  }
}
