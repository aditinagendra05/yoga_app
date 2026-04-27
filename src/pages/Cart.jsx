import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

function Cart() {
  const { user, authFetch } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadCart = async () => {
    try {
      const items = await authFetch(`/cart/${encodeURIComponent(user.email)}`, {
        method: 'GET',
      });
      setCartItems(items);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    loadCart();
  }, [user]);

  const handleRemove = async (classId) => {
    try {
      await authFetch(`/cart/${classId}?email=${encodeURIComponent(user.email)}`, {
        method: 'DELETE',
      });
      setCartItems((items) => items.filter((item) => item._id !== classId));
      setMessage('Removed from cart.');
    } catch (err) {
      setMessage(err.message);
    }
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + Number(item.price || 0), 0);

  return (
    <section className="page-panel">
      <div className="page-heading">
        <span className="eyebrow">Cart</span>
        <h1>Your selected classes</h1>
        <p>Complete checkout for enrollment, or remove items before you pay.</p>
      </div>

      {message && <div className="toast-message">{message}</div>}

      {loading ? (
        <p>Loading your cart...</p>
      ) : !cartItems.length ? (
        <div className="empty-state">
          <p>Your cart is empty.</p>
          <Link to="/classes" className="button button-primary">Browse classes</Link>
        </div>
      ) : (
        <div className="cart-grid">
          <div className="cart-items">
            {cartItems.map((cls) => (
              <article key={cls._id} className="class-card">
                <div>
                  <h3>{cls.name}</h3>
                  <p>{cls.description}</p>
                </div>
                <div className="card-meta">
                  <span>{cls.instructorName || cls.instructorEmail}</span>
                  <span>${cls.price?.toFixed(2) ?? '0.00'}</span>
                </div>
                <button className="button button-secondary button-block" onClick={() => handleRemove(cls._id)}>
                  Remove
                </button>
              </article>
            ))}
          </div>
          <aside className="checkout-panel">
            <h2>Summary</h2>
            <p>{cartItems.length} classes selected</p>
            <div className="checkout-total">
              <span>Total</span>
              <strong>${totalPrice.toFixed(2)}</strong>
            </div>
            <button className="button button-primary button-block" onClick={() => navigate('/checkout')}>
              Continue to payment
            </button>
          </aside>
        </div>
      )}
    </section>
  );
}

export default Cart;
