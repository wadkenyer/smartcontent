// api/generate-ai.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, lang, paymentId } = req.body;
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'Server configuration error: Missing GEMINI_API_KEY' });
  }

  if (!prompt || !paymentId) {
    return res.status(400).json({ error: 'Missing prompt or paymentId' });
  }

  try {
    // استخدم نموذج أحدث وأكثر استقراراً (غير 1.5-flash إذا كان يعطي 404)
    const model = "gemini-1.5-flash-latest";   // أو جرب "gemini-2.0-flash" أو "gemini-1.5-pro" حسب ما يدعمه حسابك

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `أنت مساعد ذكي في تطبيق SmartContent على شبكة Pi Network.
اكتب محتوى احترافي وجذاب باللغة ${lang === 'ar' ? 'العربية' : 'الإنجليزية'} عن الموضوع التالي: "${prompt}".
اجعله مناسب لمنصات التواصل الاجتماعي، SEO-friendly، ويحتوي على عناوين فرعية إذا لزم الأمر.
لا تضف أي تعليقات إضافية خارج المحتوى.`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 800,
          }
        })
      }
    );

    const data = await geminiResponse.json();

    if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
      const generatedText = data.candidates[0].content.parts[0].text;
      return res.status(200).json({ text: generatedText });
    } else {
      console.error("Gemini raw response:", data);
      throw new Error(data.error?.message || 'Unknown Gemini error');
    }

  } catch (error) {
    console.error("AI Generation Error:", error);
    return res.status(500).json({ 
      error: 'Failed to generate AI content',
      details: error.message 
    });
  }
}