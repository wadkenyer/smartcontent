/* ===== تحديث نظام المدفوعات مع Pi SDK ===== */
async function createPiPayment(amount, memo) {
  try {
    return new Promise((resolve, reject) => {
      Pi.createPayment({
        amount: amount,
        memo: memo,
        metadata: { service: "AI_Generation", version: "1.0" }
      }, {
        onReadyForServerApproval: async (paymentId) => {
          console.log("✅ Ready for Server Approval:", paymentId);
          try {
            await fetch('/api/pi-backend', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'approve', paymentId })
            });
          } catch (e) {
            console.error("Approval fetch failed", e);
          }
        },

        onReadyForServerCompletion: async (paymentId, txid) => {
          console.log("✅ Ready for Server Completion:", txid);
          try {
            await fetch('/api/pi-backend', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'complete', paymentId, txid })
            });
          } catch (e) {
            console.error("Completion fetch failed", e);
          }
        },

        onCancel: (paymentId) => {
          console.log("❌ Payment Cancelled:", paymentId);
          resolve(null);
        },

        onError: (err) => {
          console.error("❌ Payment Error:", err);
          reject(err);
        }
      });
    });
  } catch (e) {
    console.error("Payment Flow Failed", e);
    return null;
  }
}

/* ===== محرك الذكاء الاصطناعي المحسن ===== */
async function handleAiGeneration() {
  const user = get(S.piUser, null);   // تأكد أن get و S.piUser موجودين
  const lang = window.SC_I18N ? window.SC_I18N.getLang() : "ar";
  const topicInput = document.getElementById("ai-topic");   // استخدم getElementById بدل jQuery إذا أمكن
  const resultArea = document.getElementById("ai-result");

  if (!user) {
    alert(lang === "ar" ? "سجل دخولك أولاً عبر Pi!" : "Login via Pi first!");
    return;
  }

  if (!topicInput || !topicInput.value.trim()) {
    alert(lang === "ar" ? "أدخل موضوعاً!" : "Enter a topic!");
    return;
  }

  resultArea.innerHTML = lang === "ar" ? "⏳ جاري بدء عملية الدفع..." : "⏳ Starting secure payment...";

  try {
    const payment = await createPiPayment(0.01, "AI Content Creation - SmartContent");

    if (!payment) {
      resultArea.innerHTML = lang === "ar" ? "❌ تم إلغاء الدفع" : "❌ Payment cancelled";
      return;
    }

    resultArea.innerHTML = lang === "ar" ? "⏳ جاري التوليد بأمان عبر Gemini..." : "⏳ Securely generating with Gemini...";

    const response = await fetch("/api/generate-ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        prompt: topicInput.value.trim(),
        lang: lang,
        paymentId: payment.identifier || payment.id || payment.paymentId   // حسب ما يرجعه Pi
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data.text) {
      resultArea.innerHTML = `<div class="ai-output card p-4 bg-white dark:bg-gray-800 rounded-lg">${data.text.replace(/\n/g, '<br>')}</div>`;
    } else if (data.error) {
      throw new Error(data.error);
    } else {
      throw new Error("Empty response from AI");
    }

  } catch (err) {
    console.error("AI Generation Error:", err);
    resultArea.innerHTML = lang === "ar" 
      ? `❌ خطأ: ${err.message || "فشل في التوليد"}` 
      : `❌ Error: ${err.message || "Generation failed"}`;
  }
}