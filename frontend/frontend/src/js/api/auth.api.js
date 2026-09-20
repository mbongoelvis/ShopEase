
// Mirrors backend/src/routes/auth.routes.js — keep resource names identical.
import { apiRequest } from './client.js';

export async function login(email, password) {
  const data = await apiRequest('/auth/login', {
    method: 'POST',
    body: { email, password },
    auth: false, // no token exists yet before login succeeds
  });

  // Store what the rest of the app needs to read the current user's role.
  localStorage.setItem('digisol_token', data.token);
  localStorage.setItem('digisol_user', JSON.stringify(data.user));

  return data;
}

export function logout() {
  localStorage.removeItem('digisol_token');
  localStorage.removeItem('digisol_user');
}

export function getCurrentUser() {
  const raw = localStorage.getItem('digisol_user');
  return raw ? JSON.parse(raw) : null;
}