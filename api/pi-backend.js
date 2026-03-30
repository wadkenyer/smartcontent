export default async function handler(req, res) {
  const { action, paymentId, txid } = req.body;
  const PI_API_KEY = process.env.PI_API_KEY; // ضعه في إعدادات Vercel

  const baseUrl = `https://api.minepi.com/v2/payments/${paymentId}`;

  if (action === 'approve') {
    await fetch(`${baseUrl}/approve`, {
      method: 'POST',
      headers: { 'Authorization': `Key ${PI_API_KEY}` }
    });
    return res.status(200).json({ status: 'approved' });
  }

  if (action === 'complete') {
    await fetch(`${baseUrl}/complete`, {
      method: 'POST',
      headers: { 'Authorization': `Key ${PI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ txid })
    });
    return res.status(200).json({ status: 'completed' });
  }
}
