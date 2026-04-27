import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';

function Dashboard() {
  const { user, authFetch } = useAuth();
  const [enrolled, setEnrolled] = useState([]);
  const [payments, setPayments] = useState([]);
  const [instructorClasses, setInstructorClasses] = useState([]);
  const [stats, setStats] = useState(null);
  const [application, setApplication] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user) return;

    const queries = [];
    queries.push(
      authFetch(`/enrolled/${encodeURIComponent(user.email)}`, { method: 'GET' }).then(setEnrolled).catch(() => {})
    );
    queries.push(
      authFetch(`/payments/${encodeURIComponent(user.email)}`, { method: 'GET' }).then(setPayments).catch(() => {})
    );

    if (user.role === 'instructor') {
      queries.push(
        authFetch(`/classes/instructor/${encodeURIComponent(user.email)}`, { method: 'GET' })
          .then(setInstructorClasses)
          .catch(() => {})
      );
      queries.push(
        fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/instructors/apply/${encodeURIComponent(user.email)}`)
          .then((res) => res.json())
          .then(setApplication)
          .catch(() => {})
      );
    }

    if (user.role === 'admin') {
      queries.push(
        authFetch('/instructors/admin-stats', { method: 'GET' }).then(setStats).catch(() => {})
      );
    }

    Promise.all(queries).catch(() => {});
  }, [user]);

  return (
    <section className="page-panel dashboard-panel">
      <div className="page-heading">
        <span className="eyebrow">Dashboard</span>
        <h1>Welcome back, {user.name || user.email}</h1>
        <p>Your workspace for courses, payments, and instructor tools.</p>
      </div>

      {message && <div className="toast-message">{message}</div>}

      <div className="dashboard-grid">
        <article className="dashboard-card">
          <h3>Account</h3>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role || 'student'}</p>
        </article>

        <article className="dashboard-card">
          <h3>Recent activity</h3>
          <p>{payments.length ? `${payments.length} payment records` : 'No completed payments yet.'}</p>
          <p>{enrolled.length ? `${enrolled.length} enrolled classes` : 'No enrollments yet.'}</p>
        </article>

        {user.role === 'instructor' && (
          <article className="dashboard-card wide-card">
            <h3>Your instructor classes</h3>
            {instructorClasses.length ? (
              <ul>
                {instructorClasses.map((cls) => (
                  <li key={cls._id}>{cls.name} — {cls.status}</li>
                ))}
              </ul>
            ) : (
              <p>No classes found. Add a class in the backend or request instructor approval.</p>
            )}
            {application ? <p>Application status: {application.applied ? 'Received' : 'Not applied'}</p> : null}
          </article>
        )}

        {user.role === 'admin' && stats && (
          <article className="dashboard-card wide-card">
            <h3>Admin summary</h3>
            <div className="stat-grid">
              <div><strong>{stats.approvedClasses}</strong><span>Approved classes</span></div>
              <div><strong>{stats.pendingClasses}</strong><span>Pending classes</span></div>
              <div><strong>{stats.totalClasses}</strong><span>Total courses</span></div>
              <div><strong>{stats.instructors}</strong><span>Instructors</span></div>
              <div><strong>{stats.totalEnrolled}</strong><span>Total enrollments</span></div>
            </div>
          </article>
        )}
      </div>

      <div className="dashboard-actions">
        <p>Use the Classes page to choose your next course, and the Cart to move into checkout.</p>
      </div>
    </section>
  );
}

export default Dashboard;
