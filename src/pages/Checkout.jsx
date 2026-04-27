import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { useAuth } from '../contexts/AuthContext.jsx';

function Checkout() {
  const { user, authFetch } = useAuth();
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [clientSecret, setClientSecret] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    const loadCart = async () => {
      const items = await authFetch(`/cart/${encodeURIComponent(user.email)}`, { method: 'GET' });
      setCartItems(items);
      const total = items.reduce((sum, item) => sum + Number(item.price || 0), 0);
      if (total <= 0) {
        setMessage('Your cart is empty, add a class before paying.');
        return;
      }
      const paymentIntent = await authFetch('/payments/create-intent', {
        method: 'POST',
        body: JSON.stringify({ price: total }),
      });
      setClientSecret(paymentIntent.clientSecret);
    };

    loadCart().catch((err) => setMessage(err.message));
  }, [user]);

  const classesId = useMemo(() => cartItems.map((item) => item._id), [cartItems]);
  const totalPrice = cartItems.reduce((sum, item) => sum + Number(item.price || 0), 0);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');

    if (!stripe || !elements) {
      setMessage('Stripe is not ready yet.');
      return;
    }
    if (!clientSecret) {
      setMessage('Unable to create payment session.');
      return;
    }

    setLoading(true);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setMessage('Please enter card details.');
      setLoading(false);
      return;
    }

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });

    if (error) {
      setMessage(error.message || 'Payment method error');
      setLoading(false);
      return;
    }

    const confirmResult = await stripe.confirmCardPayment(clientSecret, {
      payment_method: paymentMethod.id,
    });

    if (confirmResult.error) {
      setMessage(confirmResult.error.message || 'Payment failed.');
      setLoading(false);
      return;
    }

    if (!confirmResult.paymentIntent || confirmResult.paymentIntent.status !== 'succeeded') {
      setMessage('Payment did not complete.');
      setLoading(false);
      return;
    }

    try {
      await authFetch(`/payments?classId=`, {
        method: 'POST',
        body: JSON.stringify({ classesId, userEmail: user.email, transactionId: confirmResult.paymentIntent.id }),
      });
      navigate('/dashboard');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page-panel form-panel">
      <div className="page-heading">
        <span className="eyebrow">Secure checkout</span>
        <h1>Confirm your enrollment.</h1>
        <p>Stripe secures payment, then we automatically enroll you in your selected classes.</p>
      </div>

      <div className="checkout-summary">
        <div>
          <h2>Order summary</h2>
          <p>{cartItems.length} classes selected</p>
          <p className="summary-price">Total: ${totalPrice.toFixed(2)}</p>
        </div>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          Card details
          <div className="card-element">
            <CardElement options={{ hidePostalCode: true }} />
          </div>
        </label>

        {message && <p className="form-error">{message}</p>}

        <button className="button button-primary button-block" type="submit" disabled={loading || !clientSecret}>
          {loading ? 'Processing payment...' : 'Pay now'}
        </button>
      </form>
    </section>
  );
}

export default Checkout;
