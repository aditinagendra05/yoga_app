// Yoga Master Frontend — Indian Aesthetic Edition
// Connect to your backend at http://localhost:5000
// Uses React + hooks + Stripe

import { useState, useEffect, useCallback, useRef } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe("pk_test_51TQqYJHUvciEaQvETL1b4d9vg4G1TG6tlWY5jgN4HPL0BsH0s5AnpA7556Rk0dG3c6uFgHVIQV8I1ohwp4YjK4Ej00hGhumjvY");

const API = "http://localhost:5000";

// ─── Helpers ──────────────────────────────────────────────────────────────────
async function apiFetch(path, options = {}, token = null) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Yatra+One&family=Tiro+Devanagari+Sanskrit:ital@0;1&family=Nunito:wght@300;400;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --saffron: #FF6B00;
    --turmeric: #E8A020;
    --kumkum: #C0392B;
    --lotus: #E8748A;
    --peacock: #1A6B72;
    --indigo: #2C3E7A;
    --cream: #FFF8EE;
    --parchment: #F5E6C8;
    --dark: #1C1209;
    --mid: #5C3D1A;
    --light-text: #8B6542;
  }

  html { scroll-behavior: smooth; }

  body {
    font-family: 'Nunito', sans-serif;
    background: var(--cream);
    color: var(--dark);
    min-height: 100vh;
  }

  /* ── Mandala Background ── */
  .mandala-bg {
    position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden;
  }
  .mandala-bg::before {
    content: '';
    position: absolute; top: -20%; right: -15%;
    width: 700px; height: 700px;
    background: radial-gradient(circle, rgba(232,160,32,0.12) 0%, transparent 70%);
    border-radius: 50%;
  }
  .mandala-bg::after {
    content: '';
    position: absolute; bottom: -20%; left: -15%;
    width: 600px; height: 600px;
    background: radial-gradient(circle, rgba(255,107,0,0.10) 0%, transparent 70%);
    border-radius: 50%;
  }

  /* ── Nav ── */
  .nav {
    position: sticky; top: 0; z-index: 100;
    background: rgba(255,248,238,0.92);
    backdrop-filter: blur(12px);
    border-bottom: 2px solid var(--parchment);
    padding: 0 2rem;
    display: flex; align-items: center; justify-content: space-between;
    height: 68px;
  }
  .nav-logo {
    font-family: 'Yatra One', cursive;
    font-size: 1.6rem;
    color: var(--saffron);
    letter-spacing: 1px;
    display: flex; align-items: center; gap: 10px;
    cursor: pointer;
  }
  .nav-logo span { color: var(--peacock); }
  .nav-links { display: flex; align-items: center; gap: 0.4rem; }
  .nav-btn {
    background: none; border: none; cursor: pointer;
    font-family: 'Nunito', sans-serif; font-size: 0.9rem; font-weight: 600;
    color: var(--mid); padding: 8px 16px; border-radius: 8px;
    transition: all 0.2s;
  }
  .nav-btn:hover { background: var(--parchment); color: var(--saffron); }
  .nav-btn.active { color: var(--saffron); }
  .btn-primary {
    background: linear-gradient(135deg, var(--saffron), var(--turmeric));
    color: white; border: none; cursor: pointer;
    font-family: 'Nunito', sans-serif; font-size: 0.9rem; font-weight: 700;
    padding: 10px 22px; border-radius: 25px;
    transition: all 0.25s; box-shadow: 0 4px 15px rgba(255,107,0,0.3);
    letter-spacing: 0.3px;
  }
  .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(255,107,0,0.4); }
  .btn-primary:active { transform: translateY(0); }
  .btn-secondary {
    background: white; border: 2px solid var(--saffron); cursor: pointer;
    font-family: 'Nunito', sans-serif; font-size: 0.9rem; font-weight: 700;
    padding: 8px 20px; border-radius: 25px; color: var(--saffron);
    transition: all 0.25s;
  }
  .btn-secondary:hover { background: var(--saffron); color: white; }

  /* ── Hero ── */
  .hero {
    position: relative; z-index: 1;
    padding: 80px 2rem 60px;
    text-align: center; max-width: 900px; margin: 0 auto;
  }
  .hero-ornament {
    font-size: 2.5rem; margin-bottom: 1rem; display: block;
    animation: float 4s ease-in-out infinite;
  }
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
  .hero h1 {
    font-family: 'Yatra One', cursive;
    font-size: clamp(2.4rem, 5vw, 4rem);
    color: var(--dark);
    line-height: 1.15;
    margin-bottom: 1rem;
  }
  .hero h1 em {
    font-style: normal;
    background: linear-gradient(135deg, var(--saffron), var(--kumkum));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .hero p {
    font-size: 1.1rem; color: var(--light-text); max-width: 560px;
    margin: 0 auto 2rem; line-height: 1.7;
  }
  .hero-cta { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
  .hero-divider {
    text-align: center; font-size: 1.8rem; color: var(--turmeric);
    margin: 10px 0 40px; letter-spacing: 8px; opacity: 0.7;
  }

  /* ── Section ── */
  .section { position: relative; z-index: 1; padding: 3rem 2rem; max-width: 1200px; margin: 0 auto; }
  .section-title {
    font-family: 'Yatra One', cursive;
    font-size: 1.9rem; color: var(--dark); margin-bottom: 0.4rem;
    display: flex; align-items: center; gap: 12px;
  }
  .section-title::after {
    content: ''; flex: 1; height: 2px;
    background: linear-gradient(90deg, var(--turmeric), transparent);
  }
  .section-sub { color: var(--light-text); font-size: 0.95rem; margin-bottom: 2rem; }

  /* ── Cards Grid ── */
  .cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
  }

  /* ── Class Card ── */
  .class-card {
    background: white;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 2px 12px rgba(92,61,26,0.08);
    border: 1px solid rgba(232,160,32,0.15);
    transition: all 0.3s;
    cursor: pointer;
  }
  .class-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 32px rgba(255,107,0,0.15);
    border-color: rgba(255,107,0,0.3);
  }
  .class-img {
    width: 100%; height: 180px; object-fit: cover;
    background: var(--parchment);
  }
  .class-img-placeholder {
    width: 100%; height: 180px;
    background: linear-gradient(135deg, var(--parchment), rgba(255,107,0,0.1));
    display: flex; align-items: center; justify-content: center;
    font-size: 3rem;
  }
  .class-body { padding: 1.2rem; }
  .class-name {
    font-family: 'Yatra One', cursive;
    font-size: 1.05rem; color: var(--dark); margin-bottom: 0.4rem;
  }
  .class-instructor { font-size: 0.82rem; color: var(--light-text); margin-bottom: 0.8rem; }
  .class-footer {
    display: flex; justify-content: space-between; align-items: center;
    border-top: 1px solid var(--parchment); padding-top: 0.8rem; margin-top: 0.8rem;
  }
  .class-price {
    font-weight: 700; font-size: 1.1rem;
    color: var(--saffron);
  }
  .class-seats { font-size: 0.78rem; color: var(--light-text); }
  .badge {
    display: inline-block; padding: 2px 10px; border-radius: 20px;
    font-size: 0.72rem; font-weight: 700; letter-spacing: 0.4px;
  }
  .badge-approved { background: rgba(26,107,114,0.1); color: var(--peacock); }
  .badge-pending { background: rgba(232,160,32,0.15); color: var(--turmeric); }
  .badge-enrolled { background: rgba(255,107,0,0.1); color: var(--saffron); }

  /* ── Instructor Card ── */
  .instructor-card {
    background: white; border-radius: 16px;
    padding: 1.5rem; text-align: center;
    box-shadow: 0 2px 12px rgba(92,61,26,0.08);
    border: 1px solid rgba(232,160,32,0.15);
    transition: all 0.3s;
  }
  .instructor-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 28px rgba(255,107,0,0.12);
  }
  .instructor-avatar {
    width: 80px; height: 80px; border-radius: 50%;
    object-fit: cover; margin: 0 auto 1rem;
    border: 3px solid var(--turmeric);
    background: var(--parchment); display: flex; align-items: center; justify-content: center;
    font-size: 2rem; font-weight: 700; color: var(--saffron);
    overflow: hidden;
  }
  .instructor-name {
    font-family: 'Yatra One', cursive;
    font-size: 1.05rem; color: var(--dark); margin-bottom: 0.3rem;
  }
  .instructor-email { font-size: 0.78rem; color: var(--light-text); margin-bottom: 0.8rem; }
  .instructor-stats { font-size: 0.82rem; color: var(--peacock); font-weight: 600; }

  /* ── Auth Modal ── */
  .modal-overlay {
    position: fixed; inset: 0; z-index: 200;
    background: rgba(28,18,9,0.6);
    backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center;
    padding: 1rem;
    animation: fadeIn 0.2s ease;
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  .modal {
    background: white; border-radius: 24px;
    width: 100%; max-width: 420px;
    box-shadow: 0 24px 60px rgba(28,18,9,0.25);
    overflow: hidden;
    animation: slideUp 0.3s ease;
  }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .modal-header {
    background: linear-gradient(135deg, var(--saffron), var(--turmeric));
    padding: 2rem;
    text-align: center;
    color: white;
  }
  .modal-header .om { font-size: 2.5rem; display: block; margin-bottom: 0.5rem; }
  .modal-header h2 {
    font-family: 'Yatra One', cursive;
    font-size: 1.6rem;
  }
  .modal-header p { font-size: 0.85rem; opacity: 0.9; margin-top: 0.3rem; }
  .modal-body { padding: 2rem; }
  .modal-tabs {
    display: flex; border-radius: 10px; overflow: hidden;
    border: 2px solid var(--parchment); margin-bottom: 1.5rem;
  }
  .modal-tab {
    flex: 1; padding: 10px; text-align: center;
    background: none; border: none; cursor: pointer;
    font-family: 'Nunito', sans-serif; font-size: 0.9rem; font-weight: 700;
    color: var(--light-text); transition: all 0.2s;
  }
  .modal-tab.active {
    background: linear-gradient(135deg, var(--saffron), var(--turmeric));
    color: white;
  }

  /* ── Form ── */
  .form-group { margin-bottom: 1.1rem; }
  .form-label {
    display: block; font-size: 0.82rem; font-weight: 600;
    color: var(--mid); margin-bottom: 6px;
  }
  .form-input {
    width: 100%; padding: 11px 14px;
    border: 2px solid var(--parchment); border-radius: 10px;
    font-family: 'Nunito', sans-serif; font-size: 0.95rem;
    color: var(--dark); background: var(--cream);
    transition: border-color 0.2s; outline: none;
  }
  .form-input:focus { border-color: var(--turmeric); background: white; }
  .form-select {
    width: 100%; padding: 11px 14px;
    border: 2px solid var(--parchment); border-radius: 10px;
    font-family: 'Nunito', sans-serif; font-size: 0.95rem;
    color: var(--dark); background: var(--cream);
    transition: border-color 0.2s; outline: none; cursor: pointer;
  }
  .form-select:focus { border-color: var(--turmeric); }
  .form-error { color: var(--kumkum); font-size: 0.8rem; margin-top: 0.5rem; }
  .form-success { color: var(--peacock); font-size: 0.82rem; margin-top: 0.5rem; font-weight: 600; }
  .form-btn {
    width: 100%; padding: 13px;
    background: linear-gradient(135deg, var(--saffron), var(--turmeric));
    color: white; border: none; border-radius: 12px;
    font-family: 'Nunito', sans-serif; font-size: 1rem; font-weight: 700;
    cursor: pointer; transition: all 0.25s;
    box-shadow: 0 4px 15px rgba(255,107,0,0.3);
    margin-top: 0.5rem;
  }
  .form-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(255,107,0,0.4); }
  .form-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

  /* ── User Menu ── */
  .user-menu { position: relative; }
  .user-avatar-btn {
    width: 40px; height: 40px; border-radius: 50%;
    border: 2px solid var(--turmeric); cursor: pointer;
    background: linear-gradient(135deg, var(--saffron), var(--turmeric));
    color: white; font-weight: 700; font-size: 0.95rem;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Nunito', sans-serif;
    overflow: hidden;
  }
  .dropdown {
    position: absolute; top: calc(100% + 10px); right: 0;
    background: white; border-radius: 14px; min-width: 200px;
    box-shadow: 0 8px 30px rgba(28,18,9,0.12);
    border: 1px solid var(--parchment);
    overflow: hidden; z-index: 300;
    animation: slideUp 0.2s ease;
  }
  .dropdown-item {
    display: block; width: 100%; padding: 12px 16px;
    background: none; border: none; cursor: pointer;
    font-family: 'Nunito', sans-serif; font-size: 0.9rem;
    color: var(--mid); text-align: left; transition: background 0.15s;
  }
  .dropdown-item:hover { background: var(--cream); color: var(--saffron); }
  .dropdown-divider { height: 1px; background: var(--parchment); margin: 4px 0; }
  .dropdown-user { padding: 12px 16px; }
  .dropdown-user-name { font-weight: 700; font-size: 0.9rem; color: var(--dark); }
  .dropdown-user-email { font-size: 0.78rem; color: var(--light-text); }
  .dropdown-user-role {
    display: inline-block; margin-top: 4px;
    font-size: 0.7rem; font-weight: 700; padding: 2px 8px;
    border-radius: 10px; background: rgba(255,107,0,0.1); color: var(--saffron);
    text-transform: uppercase; letter-spacing: 0.5px;
  }

  /* ── Page Tabs ── */
  .page-tabs {
    display: flex; gap: 0.5rem; flex-wrap: wrap;
    margin-bottom: 2rem; z-index: 1; position: relative;
  }
  .page-tab {
    padding: 8px 20px; border-radius: 25px;
    background: none; border: 2px solid var(--parchment);
    font-family: 'Nunito', sans-serif; font-size: 0.88rem; font-weight: 700;
    color: var(--light-text); cursor: pointer; transition: all 0.2s;
  }
  .page-tab:hover { border-color: var(--turmeric); color: var(--mid); }
  .page-tab.active {
    background: linear-gradient(135deg, var(--saffron), var(--turmeric));
    border-color: transparent; color: white;
    box-shadow: 0 4px 12px rgba(255,107,0,0.25);
  }

  /* ── Toast ── */
  .toast-container {
    position: fixed; bottom: 2rem; right: 2rem; z-index: 500;
    display: flex; flex-direction: column; gap: 0.5rem;
  }
  .toast {
    padding: 12px 20px; border-radius: 12px;
    font-size: 0.88rem; font-weight: 600; color: white;
    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
    animation: slideUp 0.3s ease;
    max-width: 300px;
  }
  .toast-success { background: var(--peacock); }
  .toast-error { background: var(--kumkum); }
  .toast-info { background: var(--indigo); }

  /* ── Empty / Loading ── */
  .empty { text-align: center; padding: 4rem 1rem; color: var(--light-text); }
  .empty-icon { font-size: 3rem; margin-bottom: 1rem; display: block; }
  .loading { text-align: center; padding: 3rem; }
  .spinner {
    width: 42px; height: 42px;
    border: 3px solid var(--parchment);
    border-top-color: var(--saffron);
    border-radius: 50%; margin: 0 auto 1rem;
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── Stat Cards ── */
  .stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
  .stat-card {
    background: white; border-radius: 14px; padding: 1.2rem;
    text-align: center; border: 1px solid rgba(232,160,32,0.2);
    box-shadow: 0 2px 8px rgba(92,61,26,0.06);
  }
  .stat-icon { font-size: 1.8rem; margin-bottom: 0.4rem; display: block; }
  .stat-num { font-family: 'Yatra One', cursive; font-size: 1.8rem; color: var(--saffron); }
  .stat-label { font-size: 0.75rem; color: var(--light-text); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }

  /* ── Patterns ── */
  .rangoli-divider {
    text-align: center; padding: 1.5rem 0;
    color: var(--turmeric); font-size: 1.4rem; letter-spacing: 12px; opacity: 0.5;
  }

  /* ── Cart Page ── */
  .cart-item {
    background: white; border-radius: 14px; padding: 1rem 1.2rem;
    display: flex; align-items: center; gap: 1rem;
    border: 1px solid var(--parchment); margin-bottom: 0.8rem;
    transition: box-shadow 0.2s;
  }
  .cart-item:hover { box-shadow: 0 4px 14px rgba(255,107,0,0.1); }
  .cart-item-img {
    width: 60px; height: 60px; border-radius: 10px; object-fit: cover;
    background: var(--parchment); flex-shrink: 0;
  }
  .cart-item-info { flex: 1; }
  .cart-item-name { font-weight: 700; font-size: 0.95rem; color: var(--dark); }
  .cart-item-instructor { font-size: 0.78rem; color: var(--light-text); }
  .cart-item-price { font-weight: 700; color: var(--saffron); font-size: 1rem; }
  .cart-remove {
    background: none; border: none; cursor: pointer;
    color: var(--light-text); font-size: 1.1rem; padding: 4px;
    border-radius: 6px; transition: color 0.2s;
  }
  .cart-remove:hover { color: var(--kumkum); }
  .cart-total-box {
    background: linear-gradient(135deg, rgba(255,107,0,0.06), rgba(232,160,32,0.06));
    border: 2px solid rgba(255,107,0,0.15); border-radius: 14px;
    padding: 1.2rem 1.5rem; margin-top: 1.2rem;
    display: flex; justify-content: space-between; align-items: center;
  }
  .cart-total-label { font-weight: 700; color: var(--mid); }
  .cart-total-amount { font-family: 'Yatra One', cursive; font-size: 1.6rem; color: var(--saffron); }

  /* ── Responsive ── */
  @media (max-width: 600px) {
    .nav { padding: 0 1rem; }
    .hero { padding: 50px 1rem 40px; }
    .section { padding: 2rem 1rem; }
    .nav-links .nav-btn { display: none; }
  }
`;

// ─── Toast System ─────────────────────────────────────────────────────────────
let toastId = 0;
function useToast() {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((msg, type = "success") => {
    const id = ++toastId;
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  }, []);
  return { toasts, toast: add };
}

// ─── Auth Modal ───────────────────────────────────────────────────────────────
function AuthModal({ onClose, onSuccess, toast }) {
  const [tab, setTab] = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", photoUrl: "", role: "student" });

  const update = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleLogin = async () => {
    if (!form.email) return setError("Email is required");
    setLoading(true); setError("");
    try {
      // Get token
      const { token } = await apiFetch("/auth/token", {
        method: "POST", body: JSON.stringify({ email: form.email })
      });
      // Get user
      const user = await apiFetch(`/users/email/${encodeURIComponent(form.email)}`, {}, token);
      localStorage.setItem("ym_token", token);
      localStorage.setItem("ym_user", JSON.stringify(user));
      toast("Welcome back, " + (user.name || user.email) + "! 🙏", "success");
      onSuccess({ user, token });
    } catch (err) {
      setError(err.message.includes("not found") ? "No account found. Please sign up." : err.message);
    } finally { setLoading(false); }
  };

  const handleSignup = async () => {
    if (!form.name || !form.email) return setError("Name and email are required");
    setLoading(true); setError("");
    try {
      await apiFetch("/users", {
        method: "POST",
        body: JSON.stringify({ name: form.name, email: form.email, photoUrl: form.photoUrl || null, role: form.role })
      });
      // Auto-login
      const { token } = await apiFetch("/auth/token", {
        method: "POST", body: JSON.stringify({ email: form.email })
      });
      const user = await apiFetch(`/users/email/${encodeURIComponent(form.email)}`, {}, token);
      localStorage.setItem("ym_token", token);
      localStorage.setItem("ym_user", JSON.stringify(user));
      toast("Account created! Namaste 🙏", "success");
      onSuccess({ user, token });
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="om">🕉️</span>
          <h2>Yoga Master</h2>
          <p>Begin your journey within</p>
        </div>
        <div className="modal-body">
          <div className="modal-tabs">
            <button className={`modal-tab ${tab === "login" ? "active" : ""}`} onClick={() => { setTab("login"); setError(""); }}>Sign In</button>
            <button className={`modal-tab ${tab === "signup" ? "active" : ""}`} onClick={() => { setTab("signup"); setError(""); }}>Join Us</button>
          </div>

          {tab === "login" ? (
            <>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input className="form-input" type="email" placeholder="your@email.com" value={form.email} onChange={update("email")}
                  onKeyDown={e => e.key === "Enter" && handleLogin()} />
              </div>
              {error && <p className="form-error">⚠️ {error}</p>}
              <button className="form-btn" onClick={handleLogin} disabled={loading}>
                {loading ? "Signing in..." : "🙏 Sign In"}
              </button>
            </>
          ) : (
            <>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" placeholder="Priya Sharma" value={form.name} onChange={update("name")} />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input className="form-input" type="email" placeholder="priya@example.com" value={form.email} onChange={update("email")} />
              </div>
              <div className="form-group">
                <label className="form-label">Photo URL (optional)</label>
                <input className="form-input" placeholder="https://..." value={form.photoUrl} onChange={update("photoUrl")} />
              </div>
              <div className="form-group">
                <label className="form-label">Join As</label>
                <select className="form-select" value={form.role} onChange={update("role")}>
                  <option value="student">Student</option>
                  <option value="instructor">Instructor</option>
                </select>
              </div>
              {error && <p className="form-error">⚠️ {error}</p>}
              <button className="form-btn" onClick={handleSignup} disabled={loading}>
                {loading ? "Creating account..." : "✨ Create Account"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Classes Page ─────────────────────────────────────────────────────────────
function ClassesPage({ auth, toast, onCartUpdate }) {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/classes").then(setClasses).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const addToCart = async (cls) => {
    if (!auth) return toast("Please sign in to enroll", "error");
    try {
      await apiFetch("/cart", {
        method: "POST",
        body: JSON.stringify({ classId: cls._id, userMail: auth.user.email })
      }, auth.token);
      toast("Added to cart! 🛒", "success");
      onCartUpdate();
    } catch (err) {
      toast(err.message === "Already in cart" ? "Already in your cart!" : err.message, "error");
    }
  };

  if (loading) return <div className="loading"><div className="spinner"/><p>Loading classes...</p></div>;
  if (!classes.length) return <div className="empty"><span className="empty-icon">🧘</span><p>No classes available yet.</p></div>;

  return (
    <div>
      <div className="cards-grid">
        {classes.map(cls => (
          <div key={cls._id} className="class-card">
            {cls.image
              ? <img src={cls.image} alt={cls.name} className="class-img" onError={e => { e.target.style.display='none'; }}/>
              : <div className="class-img-placeholder">🧘</div>
            }
            <div className="class-body">
              <p className="class-name">{cls.name}</p>
              <p className="class-instructor">👤 {cls.instructorName}</p>
              {cls.description && <p style={{fontSize:'0.8rem',color:'var(--light-text)',marginBottom:'0.5rem',lineHeight:1.5}}>{cls.description.slice(0,80)}{cls.description.length>80?'...':''}</p>}
              <div className="class-footer">
                <span className="class-price">₹{cls.price}</span>
                <span className="class-seats">🪑 {cls.availableSeats} seats</span>
              </div>
              <button className="btn-primary" style={{width:'100%',marginTop:'0.8rem',padding:'9px',borderRadius:'10px'}} onClick={() => addToCart(cls)}>
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Instructors Page ─────────────────────────────────────────────────────────
function InstructorsPage() {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/instructors").then(setInstructors).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><div className="spinner"/><p>Loading instructors...</p></div>;
  if (!instructors.length) return <div className="empty"><span className="empty-icon">🙏</span><p>No instructors yet.</p></div>;

  return (
    <div className="cards-grid" style={{gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))'}}>
      {instructors.map(inst => (
        <div key={inst._id} className="instructor-card">
          <div className="instructor-avatar">
            {inst.photoUrl
              ? <img src={inst.photoUrl} alt={inst.name} style={{width:'100%',height:'100%',objectFit:'cover'}} onError={e=>{e.target.style.display='none'}}/>
              : (inst.name?.[0] || '🧘')
            }
          </div>
          <p className="instructor-name">{inst.name || "Yogi"}</p>
          <p className="instructor-email">{inst.email}</p>
          {inst.about && <p style={{fontSize:'0.78rem',color:'var(--light-text)',margin:'0.4rem 0',lineHeight:1.5}}>{inst.about.slice(0,100)}...</p>}
          <p className="instructor-stats">🕉️ Certified Instructor</p>
          {inst.skills && <p style={{fontSize:'0.75rem',color:'var(--light-text)',marginTop:'0.4rem'}}>{inst.skills}</p>}
        </div>
      ))}
    </div>
  );
}

// ─── Stripe Checkout Form ─────────────────────────────────────────────────────
function CheckoutForm({ auth, items, total, toast, onSuccess, onCancel }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [cardError, setCardError] = useState("");

  const handlePay = async () => {
    if (!stripe || !elements) return;
    setProcessing(true);
    setCardError("");
    try {
      // 1. Create payment intent on backend
      const { clientSecret } = await apiFetch("/payments/create-intent", {
        method: "POST",
        body: JSON.stringify({ price: total })
      }, auth.token);

      // 2. Confirm card payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: elements.getElement(CardElement) }
      });

      if (error) {
        setCardError(error.message);
        setProcessing(false);
        return;
      }

      // 3. Record payment + enroll + clear cart
      await apiFetch("/payments", {
        method: "POST",
        body: JSON.stringify({
          classesId: items.map(c => c._id),
          userEmail: auth.user.email,
          transactionId: paymentIntent.id,
          amount: total,
          date: new Date(),
        })
      }, auth.token);

      toast("Payment successful! You're enrolled 🎉", "success");
      onSuccess();
    } catch (err) {
      setCardError(err.message);
      toast(err.message, "error");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div style={{marginTop:'1.5rem',background:'white',borderRadius:'16px',padding:'1.5rem',
      border:'2px solid rgba(255,107,0,0.2)',boxShadow:'0 4px 20px rgba(255,107,0,0.08)'}}>
      <h3 style={{fontFamily:'Yatra One, cursive',fontSize:'1.1rem',marginBottom:'1.2rem',color:'var(--dark)'}}>
        💳 Payment Details
      </h3>

      {/* Order summary */}
      <div style={{background:'var(--cream)',borderRadius:'10px',padding:'1rem',marginBottom:'1.2rem'}}>
        {items.map(cls => (
          <div key={cls._id} style={{display:'flex',justifyContent:'space-between',fontSize:'0.85rem',
            padding:'4px 0',borderBottom:'1px solid var(--parchment)'}}>
            <span style={{color:'var(--mid)'}}>{cls.name}</span>
            <span style={{fontWeight:700,color:'var(--saffron)'}}>₹{cls.price}</span>
          </div>
        ))}
        <div style={{display:'flex',justifyContent:'space-between',marginTop:'0.6rem',
          fontWeight:700,fontSize:'0.95rem'}}>
          <span>Total</span>
          <span style={{color:'var(--saffron)',fontFamily:'Yatra One, cursive',fontSize:'1.1rem'}}>₹{total.toFixed(2)}</span>
        </div>
      </div>

      {/* Stripe Card Element */}
      <div style={{border:'2px solid var(--parchment)',borderRadius:'10px',padding:'12px 14px',
        background:'var(--cream)',marginBottom:'1rem',transition:'border-color 0.2s'}}
        onFocus={e => e.currentTarget.style.borderColor='var(--turmeric)'}
        onBlur={e => e.currentTarget.style.borderColor='var(--parchment)'}>
        <CardElement options={{
          style: {
            base: {
              fontSize: '15px',
              color: '#1C1209',
              fontFamily: 'Nunito, sans-serif',
              '::placeholder': { color: '#8B6542' },
            },
            invalid: { color: '#C0392B' },
          },
          hidePostalCode: true,
        }} />
      </div>

      <p style={{fontSize:'0.75rem',color:'var(--light-text)',marginBottom:'1rem'}}>
        🔒 Test card: <strong>4242 4242 4242 4242</strong> · Any future date · Any CVC
      </p>

      {cardError && <p className="form-error" style={{marginBottom:'0.8rem'}}>⚠️ {cardError}</p>}

      <div style={{display:'flex',gap:'0.8rem'}}>
        <button className="form-btn" onClick={handlePay} disabled={processing || !stripe}
          style={{flex:2}}>
          {processing ? "Processing..." : `🙏 Pay ₹${total.toFixed(2)}`}
        </button>
        <button onClick={onCancel} disabled={processing}
          style={{flex:1,background:'none',border:'2px solid var(--parchment)',borderRadius:'12px',
            cursor:'pointer',fontFamily:'Nunito, sans-serif',fontSize:'0.9rem',color:'var(--light-text)',
            transition:'all 0.2s'}}
          onMouseOver={e => e.currentTarget.style.borderColor='var(--turmeric)'}
          onMouseOut={e => e.currentTarget.style.borderColor='var(--parchment)'}>
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── Cart Page ────────────────────────────────────────────────────────────────
function CartPage({ auth, toast, cartCount, onCartUpdate, onEnrolled }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCheckout, setShowCheckout] = useState(false);

  const loadCart = useCallback(async () => {
    if (!auth) return setLoading(false);
    try {
      const data = await apiFetch(`/cart/${encodeURIComponent(auth.user.email)}`, {}, auth.token);
      setItems(data);
    } catch {} finally { setLoading(false); }
  }, [auth]);

  useEffect(() => { loadCart(); }, [loadCart, cartCount]);

  const remove = async (classId) => {
    try {
      await apiFetch(`/cart/${classId}?email=${encodeURIComponent(auth.user.email)}`, { method: "DELETE" }, auth.token);
      toast("Removed from cart", "info");
      onCartUpdate();
      loadCart();
    } catch (err) { toast(err.message, "error"); }
  };

  const total = items.reduce((s, c) => s + parseFloat(c.price || 0), 0);

  const handlePaymentSuccess = () => {
    setShowCheckout(false);
    setItems([]);
    onCartUpdate();
    if (onEnrolled) onEnrolled();
  };

  if (!auth) return <div className="empty"><span className="empty-icon">🔐</span><p>Sign in to view your cart.</p></div>;
  if (loading) return <div className="loading"><div className="spinner"/></div>;
  if (!items.length) return (
    <div className="empty">
      <span className="empty-icon">🛒</span>
      <p>Your cart is empty.</p>
      <p style={{fontSize:'0.85rem',marginTop:'0.5rem',color:'var(--light-text)'}}>Add some classes to get started!</p>
    </div>
  );

  return (
    <div style={{maxWidth:600}}>
      {items.map(cls => (
        <div key={cls._id} className="cart-item">
          {cls.image
            ? <img src={cls.image} alt={cls.name} className="cart-item-img" onError={e=>{e.target.style.display='none'}}/>
            : <div className="cart-item-img" style={{display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.5rem'}}>🧘</div>
          }
          <div className="cart-item-info">
            <p className="cart-item-name">{cls.name}</p>
            <p className="cart-item-instructor">{cls.instructorName}</p>
          </div>
          <span className="cart-item-price">₹{cls.price}</span>
          <button className="cart-remove" onClick={() => remove(cls._id)} disabled={showCheckout}>✕</button>
        </div>
      ))}

      <div className="cart-total-box">
        <span className="cart-total-label">Total Amount</span>
        <span className="cart-total-amount">₹{total.toFixed(2)}</span>
      </div>

      {!showCheckout && (
        <>
          <button className="btn-primary"
            style={{marginTop:'1rem',padding:'13px 32px',width:'100%',borderRadius:'12px',fontSize:'1rem'}}
            onClick={() => setShowCheckout(true)}>
            🙏 Proceed to Checkout
          </button>
          <p style={{textAlign:'center',fontSize:'0.78rem',color:'var(--light-text)',marginTop:'0.8rem'}}>
            🔒 Powered by Stripe — Secure payments
          </p>
        </>
      )}

      {showCheckout && (
        <Elements stripe={stripePromise}>
          <CheckoutForm
            auth={auth}
            items={items}
            total={total}
            toast={toast}
            onSuccess={handlePaymentSuccess}
            onCancel={() => setShowCheckout(false)}
          />
        </Elements>
      )}
    </div>
  );
}

// ─── My Enrolled Page ─────────────────────────────────────────────────────────
function EnrolledPage({ auth }) {
  const [enrolled, setEnrolled] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) return setLoading(false);
    apiFetch(`/enrolled/${encodeURIComponent(auth.user.email)}`, {}, auth.token)
      .then(setEnrolled).catch(() => {}).finally(() => setLoading(false));
  }, [auth]);

  if (!auth) return <div className="empty"><span className="empty-icon">🔐</span><p>Sign in to view enrolled classes.</p></div>;
  if (loading) return <div className="loading"><div className="spinner"/></div>;
  if (!enrolled.length) return <div className="empty"><span className="empty-icon">📚</span><p>No enrolled classes yet.</p></div>;

  return (
    <div className="cards-grid">
      {enrolled.map((e, i) => (
        <div key={i} className="class-card">
          {e.classes?.image
            ? <img src={e.classes.image} alt={e.classes.name} className="class-img"/>
            : <div className="class-img-placeholder">🧘</div>
          }
          <div className="class-body">
            <p className="class-name">{e.classes?.name}</p>
            <p className="class-instructor">👤 {e.classes?.instructorName}</p>
            {e.instructor && <p style={{fontSize:'0.78rem',color:'var(--peacock)',marginTop:'0.3rem'}}>📧 {e.instructor.email}</p>}
            <div style={{marginTop:'0.8rem'}}>
              <span className="badge badge-enrolled">✓ Enrolled</span>
            </div>
            {e.classes?.videoLink && (
              <a href={e.classes.videoLink} target="_blank" rel="noreferrer"
                style={{display:'block',marginTop:'0.8rem',padding:'8px',background:'rgba(26,107,114,0.1)',
                  borderRadius:'8px',textAlign:'center',fontSize:'0.82rem',color:'var(--peacock)',
                  textDecoration:'none',fontWeight:700}}>
                ▶ Watch Class
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Admin Dashboard ──────────────────────────────────────────────────────────
function AdminDashboard({ auth, toast }) {
  const [stats, setStats] = useState(null);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth || auth.user.role !== "admin") return;
    Promise.all([
      apiFetch("/instructors/admin-stats", {}, auth.token),
      apiFetch("/classes/manage", {}, auth.token)
    ]).then(([s, c]) => { setStats(s); setClasses(c); }).catch(() => {}).finally(() => setLoading(false));
  }, [auth]);

  const updateStatus = async (id, status) => {
    try {
      await apiFetch(`/classes/${id}/status`, {
        method: "PATCH", body: JSON.stringify({ status })
      }, auth.token);
      setClasses(c => c.map(cls => cls._id === id ? { ...cls, status } : cls));
      toast(`Class ${status}! ✓`, "success");
    } catch (err) { toast(err.message, "error"); }
  };

  if (!auth || auth.user.role !== "admin") return <div className="empty"><span className="empty-icon">🔒</span><p>Admin access required.</p></div>;
  if (loading) return <div className="loading"><div className="spinner"/></div>;

  return (
    <div>
      {stats && (
        <div className="stats-row">
          <div className="stat-card"><span className="stat-icon">📚</span><div className="stat-num">{stats.totalClasses}</div><div className="stat-label">Total Classes</div></div>
          <div className="stat-card"><span className="stat-icon">✅</span><div className="stat-num">{stats.approvedClasses}</div><div className="stat-label">Approved</div></div>
          <div className="stat-card"><span className="stat-icon">⏳</span><div className="stat-num">{stats.pendingClasses}</div><div className="stat-label">Pending</div></div>
          <div className="stat-card"><span className="stat-icon">🧘</span><div className="stat-num">{stats.instructors}</div><div className="stat-label">Instructors</div></div>
          <div className="stat-card"><span className="stat-icon">👥</span><div className="stat-num">{stats.totalEnrolled}</div><div className="stat-label">Enrollments</div></div>
        </div>
      )}
      <h3 style={{fontFamily:'Yatra One, cursive',fontSize:'1.2rem',marginBottom:'1rem',color:'var(--dark)'}}>Manage Classes</h3>
      <div style={{display:'flex',flexDirection:'column',gap:'0.7rem'}}>
        {classes.map(cls => (
          <div key={cls._id} style={{background:'white',borderRadius:'12px',padding:'1rem 1.2rem',
            display:'flex',alignItems:'center',gap:'1rem',border:'1px solid var(--parchment)',flexWrap:'wrap'}}>
            <div style={{flex:1,minWidth:200}}>
              <p style={{fontWeight:700,fontSize:'0.95rem',color:'var(--dark)'}}>{cls.name}</p>
              <p style={{fontSize:'0.78rem',color:'var(--light-text)'}}>{cls.instructorName} · ₹{cls.price}</p>
            </div>
            <span className={`badge badge-${cls.status || 'pending'}`}>{cls.status || 'pending'}</span>
            <div style={{display:'flex',gap:'0.5rem'}}>
              {cls.status !== 'approved' && (
                <button className="btn-primary" style={{padding:'6px 14px',fontSize:'0.8rem'}} onClick={() => updateStatus(cls._id, 'approved')}>Approve</button>
              )}
              {cls.status !== 'denied' && (
                <button className="btn-secondary" style={{padding:'6px 14px',fontSize:'0.8rem',borderColor:'var(--kumkum)',color:'var(--kumkum)'}}
                  onClick={() => updateStatus(cls._id, 'denied')}>Deny</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Instructor Panel ─────────────────────────────────────────────────────────
function InstructorPanel({ auth, toast }) {
  const [myClasses, setMyClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', price: '', availableSeats: '', videoLink: '', image: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    if (!auth || auth.user.role !== 'instructor') return;
    try {
      const data = await apiFetch(`/classes/instructor/${encodeURIComponent(auth.user.email)}`, {}, auth.token);
      setMyClasses(data);
    } catch {} finally { setLoading(false); }
  }, [auth]);

  useEffect(() => { load(); }, [load]);

  const submit = async () => {
    if (!form.name || !form.price) return toast("Name and price required", "error");
    setSubmitting(true);
    try {
      await apiFetch("/classes", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          instructorName: auth.user.name,
          instructorEmail: auth.user.email,
        })
      }, auth.token);
      toast("Class submitted for review! 🙏", "success");
      setShowForm(false);
      setForm({ name: '', description: '', price: '', availableSeats: '', videoLink: '', image: '' });
      load();
    } catch (err) { toast(err.message, "error"); }
    finally { setSubmitting(false); }
  };

  if (!auth || auth.user.role !== 'instructor') return <div className="empty"><span className="empty-icon">🔒</span><p>Instructor access required.</p></div>;
  if (loading) return <div className="loading"><div className="spinner"/></div>;

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5rem',flexWrap:'wrap',gap:'1rem'}}>
        <h3 style={{fontFamily:'Yatra One, cursive',fontSize:'1.2rem',color:'var(--dark)'}}>My Classes ({myClasses.length})</h3>
        <button className="btn-primary" onClick={() => setShowForm(s => !s)}>
          {showForm ? "✕ Cancel" : "+ Add New Class"}
        </button>
      </div>

      {showForm && (
        <div style={{background:'white',borderRadius:'16px',padding:'1.5rem',marginBottom:'1.5rem',
          border:'2px solid rgba(255,107,0,0.2)',boxShadow:'0 4px 20px rgba(255,107,0,0.08)'}}>
          <h4 style={{fontFamily:'Yatra One, cursive',marginBottom:'1.2rem',color:'var(--dark)'}}>New Class</h4>
          {[['name','Class Name','Surya Namaskar Basics'],['price','Price (₹)','50'],['availableSeats','Available Seats','30'],
            ['videoLink','Video Link','https://youtu.be/...'],['image','Image URL','https://...']].map(([key, label, ph]) => (
            <div className="form-group" key={key}>
              <label className="form-label">{label}</label>
              <input className="form-input" placeholder={ph} value={form[key]} onChange={e => setForm(f => ({...f, [key]: e.target.value}))}/>
            </div>
          ))}
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-input" rows={3} placeholder="Describe your class..." value={form.description}
              onChange={e => setForm(f => ({...f, description: e.target.value}))} style={{resize:'vertical'}}/>
          </div>
          <button className="form-btn" onClick={submit} disabled={submitting}>{submitting ? "Submitting..." : "🕉️ Submit for Review"}</button>
        </div>
      )}

      {!myClasses.length ? (
        <div className="empty"><span className="empty-icon">📝</span><p>No classes yet. Add your first class!</p></div>
      ) : (
        <div className="cards-grid">
          {myClasses.map(cls => (
            <div key={cls._id} className="class-card">
              {cls.image ? <img src={cls.image} alt={cls.name} className="class-img"/> : <div className="class-img-placeholder">🧘</div>}
              <div className="class-body">
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'start',marginBottom:'0.5rem'}}>
                  <p className="class-name" style={{flex:1}}>{cls.name}</p>
                  <span className={`badge badge-${cls.status || 'pending'}`}>{cls.status || 'pending'}</span>
                </div>
                <div className="class-footer">
                  <span className="class-price">₹{cls.price}</span>
                  <span className="class-seats">👥 {cls.totalEnrolled || 0} enrolled</span>
                </div>
                {cls.reason && <p style={{fontSize:'0.75rem',color:'var(--kumkum)',marginTop:'0.5rem'}}>Note: {cls.reason}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const [auth, setAuth] = useState(() => {
    try {
      const token = localStorage.getItem("ym_token");
      const user = JSON.parse(localStorage.getItem("ym_user") || "null");
      return token && user ? { token, user } : null;
    } catch { return null; }
  });
  const [showAuth, setShowAuth] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const { toasts, toast } = useToast();

  // Load cart count
  useEffect(() => {
    if (!auth) return setCartCount(0);
    apiFetch(`/cart/${encodeURIComponent(auth.user.email)}`, {}, auth.token)
      .then(data => setCartCount(data.length)).catch(() => {});
  }, [auth]);

  const logout = () => {
    localStorage.removeItem("ym_token");
    localStorage.removeItem("ym_user");
    setAuth(null); setShowDropdown(false); setPage("home");
    toast("Namaste! See you soon 🙏", "info");
  };

  const initials = auth?.user?.name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "?";

  const navPages = [
    { id: "home", label: "🏠 Home" },
    { id: "classes", label: "📚 Classes" },
    { id: "instructors", label: "🧘 Instructors" },
  ];
  const authPages = auth ? [
    { id: "cart", label: `🛒 Cart${cartCount > 0 ? ` (${cartCount})` : ''}` },
    { id: "enrolled", label: "✅ My Learning" },
    ...(auth.user.role === "admin" ? [{ id: "admin", label: "⚙️ Admin" }] : []),
    ...(auth.user.role === "instructor" ? [{ id: "instructor", label: "📝 My Classes" }] : []),
  ] : [];

  return (
    <>
      <style>{styles}</style>
      <div className="mandala-bg" />

      {/* Nav */}
      <nav className="nav">
        <div className="nav-logo" onClick={() => setPage("home")}>
          🕉️ <span>Yoga</span>Master
        </div>
        <div className="nav-links">
          {[...navPages, ...authPages].map(p => (
            <button key={p.id} className={`nav-btn ${page === p.id ? "active" : ""}`} onClick={() => setPage(p.id)}>
              {p.label}
            </button>
          ))}
          {!auth ? (
            <button className="btn-primary" onClick={() => setShowAuth(true)}>Sign In</button>
          ) : (
            <div className="user-menu">
              <button className="user-avatar-btn" onClick={() => setShowDropdown(s => !s)}>
                {auth.user.photoUrl
                  ? <img src={auth.user.photoUrl} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} onError={e=>{e.target.style.display='none'}}/>
                  : initials
                }
              </button>
              {showDropdown && (
                <div className="dropdown">
                  <div className="dropdown-user">
                    <div className="dropdown-user-name">{auth.user.name || "Yogi"}</div>
                    <div className="dropdown-user-email">{auth.user.email}</div>
                    <span className="dropdown-user-role">{auth.user.role || "student"}</span>
                  </div>
                  <div className="dropdown-divider"/>
                  <button className="dropdown-item" onClick={() => { setPage("enrolled"); setShowDropdown(false); }}>📚 My Learning</button>
                  <button className="dropdown-item" onClick={() => { setPage("cart"); setShowDropdown(false); }}>🛒 Cart</button>
                  <div className="dropdown-divider"/>
                  <button className="dropdown-item" style={{color:'var(--kumkum)'}} onClick={logout}>🚪 Sign Out</button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Page Content */}
      {page === "home" && (
        <>
          <div className="hero">
            <span className="hero-ornament">🕉️</span>
            <h1>Find Your <em>Inner Peace</em><br/>Through Yoga</h1>
            <p>Discover ancient wisdom, expert instructors, and transformative classes rooted in the heart of India's yogic tradition.</p>
            <div className="hero-cta">
              <button className="btn-primary" style={{padding:'14px 32px',fontSize:'1rem'}} onClick={() => setPage("classes")}>
                Explore Classes
              </button>
              <button className="btn-secondary" style={{padding:'12px 28px',fontSize:'1rem'}} onClick={() => setPage("instructors")}>
                Meet Instructors
              </button>
            </div>
          </div>

          <div className="hero-divider">✦ ॐ ✦ ॐ ✦ ॐ ✦</div>

          <div className="section">
            <h2 className="section-title">🔥 Popular Classes</h2>
            <p className="section-sub">Most loved by our students</p>
            <PopularClasses auth={auth} toast={toast} onCartUpdate={() => {
              if (auth) apiFetch(`/cart/${encodeURIComponent(auth.user.email)}`, {}, auth.token)
                .then(d => setCartCount(d.length)).catch(() => {});
            }} />
          </div>

          <div className="rangoli-divider">❁ ❁ ❁ ❁ ❁</div>

          <div className="section">
            <h2 className="section-title">⭐ Top Instructors</h2>
            <p className="section-sub">Learn from the best</p>
            <PopularInstructors />
          </div>

          {!auth && (
            <div style={{position:'relative',zIndex:1,padding:'3rem 2rem',textAlign:'center'}}>
              <div style={{background:'linear-gradient(135deg, var(--saffron), var(--turmeric))',
                borderRadius:'24px',padding:'3rem 2rem',maxWidth:600,margin:'0 auto',color:'white'}}>
                <div style={{fontSize:'3rem',marginBottom:'1rem'}}>🙏</div>
                <h2 style={{fontFamily:'Yatra One, cursive',fontSize:'1.8rem',marginBottom:'0.8rem'}}>Begin Your Journey</h2>
                <p style={{opacity:0.9,marginBottom:'1.5rem',lineHeight:1.6}}>
                  Join thousands of students discovering the transformative power of yoga. Sign up today and find your flow.
                </p>
                <button onClick={() => setShowAuth(true)}
                  style={{background:'white',color:'var(--saffron)',border:'none',cursor:'pointer',
                    padding:'13px 32px',borderRadius:'25px',fontFamily:'Nunito, sans-serif',
                    fontSize:'1rem',fontWeight:700,boxShadow:'0 4px 15px rgba(0,0,0,0.15)'}}>
                  Get Started Free
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {page === "classes" && (
        <div className="section">
          <h2 className="section-title">📚 All Classes</h2>
          <p className="section-sub">Explore our full collection of yoga classes</p>
          <ClassesPage auth={auth} toast={toast} onCartUpdate={() => {
            if (auth) apiFetch(`/cart/${encodeURIComponent(auth.user.email)}`, {}, auth.token)
              .then(d => setCartCount(d.length)).catch(() => {});
          }} />
        </div>
      )}

      {page === "instructors" && (
        <div className="section">
          <h2 className="section-title">🧘 Our Instructors</h2>
          <p className="section-sub">Expert guides on your yogic journey</p>
          <InstructorsPage />
        </div>
      )}

      {page === "cart" && (
        <div className="section">
          <h2 className="section-title">🛒 Your Cart</h2>
          <p className="section-sub">Review your selected classes</p>
          <CartPage auth={auth} toast={toast} cartCount={cartCount}
            onCartUpdate={() => {
              if (auth) apiFetch(`/cart/${encodeURIComponent(auth.user.email)}`, {}, auth.token)
                .then(d => setCartCount(d.length)).catch(() => {});
            }}
            onEnrolled={() => setPage("enrolled")}
          />
        </div>
      )}

      {page === "enrolled" && (
        <div className="section">
          <h2 className="section-title">✅ My Learning</h2>
          <p className="section-sub">Classes you've enrolled in</p>
          <EnrolledPage auth={auth} />
        </div>
      )}

      {page === "admin" && (
        <div className="section">
          <h2 className="section-title">⚙️ Admin Dashboard</h2>
          <p className="section-sub">Manage your platform</p>
          <AdminDashboard auth={auth} toast={toast} />
        </div>
      )}

      {page === "instructor" && (
        <div className="section">
          <h2 className="section-title">📝 Instructor Panel</h2>
          <p className="section-sub">Manage your classes</p>
          <InstructorPanel auth={auth} toast={toast} />
        </div>
      )}

      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onSuccess={(a) => { setAuth(a); setShowAuth(false); }}
          toast={toast}
        />
      )}

      {/* Toasts */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>{t.msg}</div>
        ))}
      </div>
    </>
  );
}

// ─── Home page sub-components ─────────────────────────────────────────────────
function PopularClasses({ auth, toast, onCartUpdate }) {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/classes/popular").then(setClasses).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const addToCart = async (cls) => {
    if (!auth) return toast("Please sign in first", "error");
    try {
      await apiFetch("/cart", {
        method: "POST",
        body: JSON.stringify({ classId: cls._id, userMail: auth.user.email })
      }, auth.token);
      toast("Added to cart! 🛒", "success");
      onCartUpdate();
    } catch (err) {
      toast(err.message === "Already in cart" ? "Already in your cart!" : err.message, "error");
    }
  };

  if (loading) return <div className="loading"><div className="spinner"/></div>;
  if (!classes.length) return <div className="empty"><span className="empty-icon">🧘</span><p>No classes yet.</p></div>;

  return (
    <div className="cards-grid">
      {classes.map(cls => (
        <div key={cls._id} className="class-card">
          {cls.image ? <img src={cls.image} alt={cls.name} className="class-img"/> : <div className="class-img-placeholder">🧘</div>}
          <div className="class-body">
            <p className="class-name">{cls.name}</p>
            <p className="class-instructor">👤 {cls.instructorName}</p>
            <div className="class-footer">
              <span className="class-price">₹{cls.price}</span>
              <span className="class-seats">👥 {cls.totalEnrolled || 0} enrolled</span>
            </div>
            <button className="btn-primary" style={{width:'100%',marginTop:'0.8rem',padding:'9px',borderRadius:'10px'}} onClick={() => addToCart(cls)}>
              Add to Cart
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function PopularInstructors() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/instructors/popular").then(setData).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><div className="spinner"/></div>;
  if (!data.length) return <div className="empty"><span className="empty-icon">🙏</span><p>No instructors yet.</p></div>;

  return (
    <div className="cards-grid" style={{gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))'}}>
      {data.map((item, i) => (
        <div key={i} className="instructor-card">
          <div className="instructor-avatar">
            {item.instructor?.photoUrl
              ? <img src={item.instructor.photoUrl} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} onError={e=>{e.target.style.display='none'}}/>
              : (item.instructor?.name?.[0] || '🧘')
            }
          </div>
          <p className="instructor-name">{item.instructor?.name || "Yogi"}</p>
          <p className="instructor-email">{item.instructor?.email}</p>
          <p className="instructor-stats">🌟 {item.totalEnrolled} students</p>
        </div>
      ))}
    </div>
  );
}