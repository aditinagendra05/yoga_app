import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

function Login() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email.trim());
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
        <span className="eyebrow">Welcome back</span>
        <h1>Login with your existing account</h1>
        <p>Enter your email address to continue. If you are new here, sign up first.</p>
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

        {error && <p className="form-error">{error}</p>}

        <button className="button button-primary button-block" disabled={loading}>
          {loading ? 'Connecting...' : 'Log in'}
        </button>
      </form>

      <div className="form-footnote">
        <p>New here? <Link to="/signup">Create an account</Link>.</p>
      </div>
    </section>
  );
}

export default Login;
