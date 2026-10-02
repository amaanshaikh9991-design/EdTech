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