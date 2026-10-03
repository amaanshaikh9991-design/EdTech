const apiOrigin =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:4000' : '');

export function apiUrl(path) {
  const cleanPath = path.replace(/^\/+/, '');

  if (!apiOrigin) {
    return `/api/${cleanPath}`;
  }

  return `${apiOrigin.replace(/\/+$/, '')}/api/${cleanPath}`;
}

export async function readApiJson(response, fallbackMessage = 'The server could not complete this request.') {
  if (response.status === 204) return null;

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error(response.status === 404
      ? 'This API route is not available. Restart or redeploy the updated backend.'
      : `The server returned an unexpected response (${response.status}).`);
  }

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || fallbackMessage);
  return data;
}

export function apiFetch(path, options = {}) {
  const headers = new Headers(options.headers || {});
  const token = sessionStorage.getItem('currentStudentToken');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return fetch(apiUrl(path), { ...options, headers });
}