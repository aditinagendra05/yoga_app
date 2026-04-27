const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export async function fetchJson(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, options);
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || 'An error occurred while fetching data.');
  }
  return response.json();
}

export async function authFetch(path, token, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    ...(options.headers || {}),
  };
  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || 'Unauthorized or invalid request.');
  }
  return response.json();
}

export default API_BASE;
