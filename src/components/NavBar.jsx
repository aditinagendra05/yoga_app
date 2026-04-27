import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="site-header">
      <div className="site-brand">
        <Link to="/" className="brand-link">
          Yoga Master
        </Link>
        <span className="brand-subtitle">Earth, breath, balance</span>
      </div>
      <nav className="site-nav">
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/classes">Classes</NavLink>
        <NavLink to="/instructors">Instructors</NavLink>
        <NavLink to="/dashboard">Dashboard</NavLink>
        {user ? <NavLink to="/cart">Cart</NavLink> : null}
      </nav>
      <div className="site-actions">
        {user ? (
          <>
            <span className="user-pill">{user.name || user.email}</span>
            <button className="button button-secondary" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="button button-secondary">Login</Link>
            <Link to="/signup" className="button button-primary">Sign Up</Link>
          </>
        )}
      </div>
    </header>
  );
}

export default NavBar;
