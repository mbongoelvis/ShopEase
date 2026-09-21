const BASE_URL = 'http://localhost:5000'; // swap to your real deployed URL later
 
export async function apiRequest(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
 
  if (auth) {
    const token = localStorage.getItem('digisol_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
 
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
 
  const data = await response.json();
 
  if (!response.ok) {
    // Every error response from your backend has an `error` field —
    // throw it so calling code can catch it and show a message.
    throw new Error(data.error || 'Something went wrong');
  }
 
  return data;
}