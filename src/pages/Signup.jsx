import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

function Signup() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await register(email.trim(), name.trim());
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page-panel form-panel">
      <div className="page-heading">
        <span className="eyebrow">New student</span>
        <h1>Create your Yoga Master account</h1>
        <p>Sign up with your email and name to start booking classes, saving favorites, and checking out securely.</p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          Email address
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
          />
        </label>

        <label>
          Full name
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Your full name"
          />
        </label>

        {error && <p className="form-error">{error}</p>}

        <button className="button button-primary button-block" disabled={loading}>
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <div className="form-footnote">
        <p>Already have an account? <Link to="/login">Log in</Link>.</p>
      </div>
    </section>
  );
}

export default Signup;
