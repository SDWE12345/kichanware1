import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const CASHFREE_CONFIG = {
    CLIENT_ID: process.env.CASHFREE_CLIENT_ID || "959196d551aea7bea9a477b402691959",
    SECRET_KEY: process.env.CASHFREE_SECRET_KEY || "cfsk_ma_prod_d0a3be9cfc075074f78dd2f0df87b5d7_20f13ce7",
    BASE_URL: "https://api.cashfree.com/pg",
    API_VERSION: "2022-09-01"
  };

  try {
    const { amount, customer_name, customer_email, customer_phone } = req.body;
    const link_id = `link_${Date.now()}`;

    const headers = {
      "x-client-id": CASHFREE_CONFIG.CLIENT_ID,
      "x-client-secret": CASHFREE_CONFIG.SECRET_KEY,
      "x-api-version": CASHFREE_CONFIG.API_VERSION,
      "Content-Type": "application/json"
    };

    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers.host;

    const data = {
      link_id,
      link_amount: amount,
      link_currency: "INR",
      link_purpose: "Test Payment",
      customer_details: {
        customer_name,
        customer_email,
        customer_phone
      },
      link_notify: {
        send_sms: true,
        send_email: true
      },
      link_meta: {
        return_url: `${protocol}://${host}/payment-success?link_id=${link_id}`,
        notify_url: `${protocol}://${host}/api/webhook`
      }
    };

    const response = await axios.post(`${CASHFREE_CONFIG.BASE_URL}/links`, data, { headers });

    return res.status(200).json({
      success: true,
      link_url: response.data.link_url
    });
  } catch (error) {
    console.error("Error creating payment link:", error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      error: "Failed to create payment link",
      details: error.response?.data || error.message
    });
  }
}