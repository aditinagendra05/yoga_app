import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { fetchJson } from '../api/client.js';

function Instructors() {
  const { user, token, authFetch } = useAuth();
  const [instructors, setInstructors] = useState([]);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchJson('/instructors').then(setInstructors).catch(console.error);
  }, []);

  const handleApply = async () => {
    if (!user) {
      setMessage('Please log in before applying.');
      return;
    }

    try {
      await authFetch('/instructors/apply', {
        method: 'POST',
        body: JSON.stringify({ email: user.email, name: user.name }),
      });
      setMessage('Application received. Our team will review your instructor request.');
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <section className="page-panel">
      <div className="page-heading">
        <span className="eyebrow">Instructors</span>
        <h1>Meet our guiding teachers.</h1>
        <p>Learn from certified instructors who blend tradition with modern breathwork.</p>
      </div>

      {message ? <div className="toast-message">{message}</div> : null}

      <div className="card-grid">
        {instructors.map((inst) => (
          <article key={inst._id || inst.email} className="instructor-card">
            <h3>{inst.name || inst.email}</h3>
            <p>{inst.about || 'A teacher dedicated to mindful practice.'}</p>
            <div className="card-meta">
              <span>{inst.skills?.join(', ') || 'Yoga, meditation, wellness'}</span>
              <span>{inst.email}</span>
            </div>
          </article>
        ))}
      </div>

      <div className="cta-block">
        <div>
          <h2>Become an instructor</h2>
          <p>Share your knowledge and guide new students through soulful yoga experiences.</p>
        </div>
        <button className="button button-primary" onClick={handleApply}>Apply to Teach</button>
      </div>
    </section>
  );
}

export default Instructors;
