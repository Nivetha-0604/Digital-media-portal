export const getUser = () => JSON.parse(localStorage.getItem('user') || 'null');

export async function api(url, { method = 'GET', body, form } = {}) {
  const headers = {};
  const token = localStorage.getItem('token');
  if (token) headers.Authorization = 'Bearer ' + token;
  if (body) headers['Content-Type'] = 'application/json';
  let res;
  try { res = await fetch('/api' + url, { method, headers, body: form || (body && JSON.stringify(body)) }); }
  catch { throw new Error('Cannot reach the server. Is the backend running?'); }
  const text = await res.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch { /* ignore */ }
  if (!res.ok) throw new Error(data.msg ||
    (res.status >= 500 ? 'Backend is not responding. Start it with "npm run dev" inside the server folder.' : 'Request failed'));
  return data;
}
