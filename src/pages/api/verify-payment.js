import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { order_id } = req.query;

  if (!order_id) {
    return res.status(400).json({ success: false, message: 'Order ID is required' });
  }

  try {
    // Verify payment with Cashfree
    const cashfreeResponse = await axios.get(
      `https://api.cashfree.com/pg/orders/${order_id}/payments`,
      {
        headers: {
          'x-client-id': process.env.CASHFREE_CLIENT_ID,
          'x-client-secret': process.env.CASHFREE_SECRET_KEY,
          'x-api-version': '2022-09-01'
        }
      }
    );

    const payments = cashfreeResponse.data;
    
    if (payments.length === 0) {
      return res.status(404).json({ success: false, message: 'No payments found for this order' });
    }

    const latestPayment = payments[0];
    
    if (latestPayment.payment_status === 'SUCCESS') {
      // Here you would typically update your database with the payment success
      // For this mock, we'll return mock order details
      
      return res.status(200).json({
        success: true,
        order: {
          orderId: order_id,
          amount: latestPayment.order_amount,
          date: latestPayment.payment_completion_time || new Date().toISOString(),
          paymentMethod: latestPayment.payment_method,
          referenceId: latestPayment.cf_payment_id
        }
      });
    } else {
      return res.status(400).json({ 
        success: false, 
        message: latestPayment.payment_message || 'Payment not successful'
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    
    // Handle specific Cashfree errors
    if (error.response) {
      if (error.response.status === 401 || error.response.status === 403) {
        return res.status(401).json({ 
          success: false, 
          message: 'authentication Failed'
        });
      }
      
      if (error.response.status === 404) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }
      
      return res.status(400).json({ 
        success: false, 
        message: error.response.data?.message || 'Error verifying payment'
      });
    }
    
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error during payment verification'
    });
  }
}
