import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { fetchJson } from '../api/client.js';

function Classes() {
  const { user, token, authFetch } = useAuth();
  const [classes, setClasses] = useState([]);
  const [cartChecks, setCartChecks] = useState({});
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchJson('/classes').then(setClasses).catch(console.error);
  }, []);

  useEffect(() => {
    if (!user || !classes.length) return;

    classes.forEach((cls) => {
      authFetch(`/cart/check/${cls._id}?email=${encodeURIComponent(user.email)}`, {
        method: 'GET',
      })
        .then((payload) => {
          setCartChecks((prev) => ({ ...prev, [cls._id]: payload.inCart }));
        })
        .catch(() => {});
    });
  }, [user, token, classes]);

  const handleAddToCart = async (cls) => {
    try {
      await authFetch('/cart', {
        method: 'POST',
        body: JSON.stringify({ classId: cls._id, userMail: user.email }),
      });
      setCartChecks((prev) => ({ ...prev, [cls._id]: true }));
      setMessage(`"${cls.name}" added to your cart.`);
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <section className="page-panel">
      <div className="page-heading">
        <span className="eyebrow">Classes</span>
        <h1>Find your next yoga flow.</h1>
        <p>Choose from guided courses crafted for every level.</p>
      </div>

      {message ? <div className="toast-message">{message}</div> : null}

      <div className="card-grid">
        {classes.map((cls) => (
          <article key={cls._id} className="class-card">
            <div>
              <h3>{cls.name}</h3>
              <p>{cls.description}</p>
            </div>
            <div className="card-meta">
              <span>{cls.instructorName || cls.instructorEmail}</span>
              <span>{cls.availableSeats} seats</span>
            </div>
            <div className="card-tertiary">
              <strong>${cls.price?.toFixed(2) ?? '0.00'}</strong>
            </div>
            <button
              className="button button-primary button-block"
              disabled={!user || cartChecks[cls._id] || cls.availableSeats < 1}
              onClick={() => handleAddToCart(cls)}
            >
              {user ? cartChecks[cls._id] ? 'In Cart' : 'Add to Cart' : 'Login to Add'}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Classes;
