import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Head from 'next/head';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { FbPixelEvents, initFacebookPixel } from '@/lib/facebookPixel';

const PaymentSuccess = () => {
  const router = useRouter();
  const { order_id } = router.query;

  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'failed'
  const [order, setOrder] = useState(null);
  const [data123, setData] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    initFacebookPixel();
  }, []);

  useEffect(() => {
    if (!order_id) return;
    const verified_data = JSON.parse(localStorage.getItem(`data123`));

    const verified = localStorage.getItem(`verified_${order_id}`);
    if (verified === 'true') {
      setStatus('success')
      setData(verified_data);
      verifyPayment(); // get full details
      return;
    }

    let interval;
    let timeout;

    const checkPayment = async () => {
      try {
        const res = await axios.post('/api/verifyPayment', {
          amount: Number(order_id),
        });

        if (res.data.success) {
          localStorage.setItem(`verified_${order_id}`, 'true');
          clearInterval(interval);
          clearTimeout(timeout);
          setStatus('success');
          verifyPayment();
        } else {
          console.log('Still waiting...');
        }
      } catch (err) {
        console.error('Error while checking payment:', err);
      }
    };

    interval = setInterval(checkPayment, 2000);

    timeout = setTimeout(() => {
      clearInterval(interval);
      setStatus('failed');
      setError('Payment not found or timed out. Please try again.');
    }, 30000); // stop checking after 1 minute

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [order_id]);

  const verifyPayment = async () => {
    try {
      const res = await axios.post('/api/verifyPayment', {
        amount: Number(order_id),
      });

      if (res.data.success) {
        setData(res.data.data);
        localStorage.setItem("data123", JSON.stringify(res.data.data))
        setOrder(res.data.order || {});
      }
    } catch (err) {
      console.error('Error during verifyPayment:', err);
    }
  };

  return (
    <>
      <Head>
        <title>Payment Status</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="page-wrapper">
        <div className={`card fade-in`}>
          <div className="logo-wrapper">
            {status === 'verifying' && <Loader2 className="icon blue spin" size={72} />}
            {status === 'success' && <CheckCircle2 className="icon green bounce" size={72} />}
            {status === 'failed' && <XCircle className="icon red shake" size={72} />}
          </div>

          {status === 'verifying' && (
            <>
              <h2>Verifying Payment...</h2>
              <p className="text">Please wait while we confirm your transaction.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <h2 className="mb-3 text-success text-center">Payment Successful</h2>
              <p className="text-muted text-center mb-4">Thank you for your payment!</p>

              <div className="card bg-light mb-4 mx-auto" style={{ maxWidth: '400px' }}>
                <div className="card-body">
                  <p className="mb-2 justify-content-between d-flex"><strong>Order ID:</strong> {data123 && data123.id}</p>
                  <p className="mb-2  justify-content-between d-flex"><strong>Amount Paid:</strong> ₹ {order_id}</p>
                  <p className="mb-0  justify-content-between d-flex"><strong>Date:</strong> {new Date().toLocaleString()}</p>
                </div>
              </div>

              <div className="d-flex justify-content-center gap-3 flex-wrap">
                <button
                  className="btn btn-primary px-4"
                  onClick={() => router.push('/')}
                >
                  View Orders
                </button>
                <button
                  className="btn btn-outline-primary px-4"
                  onClick={() => router.push('/')}
                >
                  Back to Home
                </button>
              </div>
            </>
          )}

          {status === 'failed' && (
            <>
              <h2>Payment Failed</h2>
              <p className="text">{error}</p>
              <div className="btn-group">
                <button onClick={() => router.push('/')}>Try Again</button>
                <button onClick={() => router.push('/')}>Back to Home</button>
              </div>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        .page-wrapper {
          min-height: 100vh;
          background-color: #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
        }

        .card {
          background: #fff;
          padding: 2.5rem;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
          max-width: 500px;
          width: 100%;
          text-align: center;
          font-family: 'Segoe UI', sans-serif;
          animation: fadeIn 0.8s ease-in-out;
        }

        .logo-wrapper {
          margin-bottom: 1rem;
        }

        .icon {
          display: block;
          margin: 0 auto;
        }

        .blue {
          color: #3b82f6;
        }

        .green {
          color: #22c55e;
        }

        .red {
          color: #ef4444;
        }

        h2 {
          margin-top: 0.5rem;
          font-size: 1.75rem;
          color: #111827;
        }

        .text {
          color: #6b7280;
          margin-bottom: 1.5rem;
        }

        .details {
          text-align: left;
          background: #f9fafb;
          padding: 1rem;
          border-radius: 10px;
          margin-bottom: 1.5rem;
          font-size: 0.95rem;
          color: #374151;
        }

        .details p {
          margin: 0.3rem 0;
        }

        .btn-group {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        button {
          background: #3b82f6;
          color: #fff;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-size: 1rem;
          cursor: pointer;
          transition: background 0.3s ease;
        }

        button:hover {
          background: #2563eb;
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        .bounce {
          animation: bounce 1s ease-out;
        }

        .shake {
          animation: shake 0.5s ease-in-out;
        }

        .fade-in {
          animation: fadeIn 0.8s ease-in;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes bounce {
          0%   { transform: scale(0.8); opacity: 0; }
          50%  { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); }
        }

        @keyframes shake {
          0% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          50% { transform: translateX(5px); }
          75% { transform: translateX(-5px); }
          100% { transform: translateX(0); }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 480px) {
          .card {
            padding: 1.5rem;
          }

          button {
            width: 100%;
            padding: 0.75rem;
          }
        }
      `}</style>
    </>
  );
};

export default PaymentSuccess;
