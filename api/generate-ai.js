// api/generate-ai.js
export default async function handler(req, res) {
  // 1. السماح فقط بطلبات POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, lang, paymentId } = req.body;
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // ضعه في إعدادات Vercel

  // 2. تأمين بسيط: التأكد من وجود معرف دفع (يمكنك مستقبلاً التحقق منه في قاعدة البيانات)
  if (!paymentId) {
    return res.status(401).json({ error: 'Payment required' });
  }

  try {
    // 3. الاتصال بـ Google Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are an AI assistant for SmartContent app on Pi Network. 
                   Write a professional post about: "${prompt}". 
                   The response must be in ${lang === 'ar' ? 'Arabic' : 'English'}.
                   Keep it engaging and SEO friendly.`
          }]
        }]
      })
    });

    const data = await response.json();
    
    // 4. استخراج النص وإرساله
    if (data.candidates && data.candidates[0].content.parts[0].text) {
      const generatedText = data.candidates[0].content.parts[0].text;
      return res.status(200).json({ text: generatedText });
    } else {
      throw new Error('Gemini API Error');
    }

  } catch (error) {
    console.error("AI Error:", error);
    return res.status(500).json({ error: 'Failed to generate AI content' });
  }
}
