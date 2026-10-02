const apiOrigin = import.meta.env.VITE_API_URL
  || (import.meta.env.DEV ? 'http://localhost:4000' : '');

export function apiUrl(path) {
  if (!apiOrigin) {
    throw new Error('VITE_API_URL is not configured for this deployment.');
  }

  return `${apiOrigin.replace(/\/+$/, '')}/api/${path.replace(/^\/+/, '')}`;
}