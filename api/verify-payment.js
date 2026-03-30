// api/verify-payment.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { paymentId } = req.body;
  const PI_API_KEY = process.env.PI_API_KEY; // المفتاح السري من Vercel

  try {
    // الاتصال بخوادم Pi للتأكد من صحة العملية
    const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}`, {
      method: 'GET',
      headers: { 'Authorization': `Key ${PI_API_KEY}` }
    });

    const paymentData = await response.json();

    if (paymentData && paymentData.status.completed) {
       // إذا كان الدفع مكتملاً، نرسل رد بالنجاح
       res.status(200).json({ success: true, data: paymentData });
    } else {
       res.status(400).json({ success: false, message: 'Payment not completed' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
