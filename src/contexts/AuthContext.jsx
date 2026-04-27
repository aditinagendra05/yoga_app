import { createContext, useContext, useEffect, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const storageKey = 'yoga-auth';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (!saved) {
      setLoading(false);
      return;
    }

    try {
      const parsed = JSON.parse(saved);
      if (parsed?.token && parsed?.user) {
        setToken(parsed.token);
        setUser(parsed.user);
      }
    } catch (err) {
      localStorage.removeItem(storageKey);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token && user) {
      localStorage.setItem(storageKey, JSON.stringify({ token, user }));
    } else {
      localStorage.removeItem(storageKey);
    }
  }, [token, user]);

  async function authFetch(path, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
      Authorization: `Bearer ${token}`,
    };
    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    if (res.status === 401 || res.status === 403) {
      logout();
      throw new Error('Session expired. Please log in again.');
    }
    return res;
  }

  async function login(email) {
    const authRes = await fetch(`${API_BASE}/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (!authRes.ok) {
      const payload = await authRes.json().catch(() => ({}));
      throw new Error(payload.message || 'Unable to get auth token');
    }

    const { token: authToken } = await authRes.json();

    const userRes = await fetch(`${API_BASE}/users/email/${encodeURIComponent(email)}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!userRes.ok) {
      if (userRes.status === 404) {
        throw new Error('No account found. Please sign up first.');
      }
      const payload = await userRes.json().catch(() => ({}));
      throw new Error(payload.message || 'Unable to read user data');
    }

    const userData = await userRes.json();
    setToken(authToken);
    setUser(userData);
    return userData;
  }

  async function register(email, name) {
    const payload = { email, name: name || email.split('@')[0], role: 'student' };
    const createRes = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!createRes.ok) {
      const body = await createRes.json().catch(() => ({}));
      throw new Error(body.message || 'Unable to create account');
    }

    return login(email);
  }

  function logout() {
    setUser(null);
    setToken(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, authFetch, API_BASE }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
