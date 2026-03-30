export default async function handler(req, res) {
  // 1. التأكد من نوع الطلب
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { action, paymentId, txid } = req.body;
  const PI_API_KEY = process.env.PI_API_KEY;

  if (!PI_API_KEY) {
    return res.status(500).json({ error: 'Server configuration error: Missing API Key' });
  }

  const baseUrl = `https://api.minepi.com/v2/payments/${paymentId}`;

  try {
    if (action === 'approve') {
      const response = await fetch(`${baseUrl}/approve`, {
        method: 'POST',
        headers: { 'Authorization': `Key ${PI_API_KEY}` }
      });
      
      if (!response.ok) throw new Error('Pi API Approval Failed');
      
      return res.status(200).json({ status: 'approved' });
    }

    if (action === 'complete') {
      const response = await fetch(`${baseUrl}/complete`, {
        method: 'POST',
        headers: { 
          'Authorization': `Key ${PI_API_KEY}`, 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ txid })
      });

      if (!response.ok) throw new Error('Pi API Completion Failed');

      return res.status(200).json({ status: 'completed' });
    }
  } catch (error) {
    console.error("Pi Payment Error:", error.message);
    return res.status(500).json({ error: error.message });
  }
}
