import { publicEnv } from './env';

export type ApiOptions = RequestInit & {
  token?: string | null;
  sessionId?: string | null;
};

export async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const url = `${publicEnv.NEXT_PUBLIC_API_URL.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
  const { token, sessionId, ...init } = options;
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  if (init.body && !headers.has('Content-Type') && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (sessionId) headers.set('X-Session-Id', sessionId);

  const res = await fetch(url, {
    ...init,
    headers,
    cache: init.cache ?? 'no-store',
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = json?.error?.message || res.statusText;
    
    // Auto-redirect on 401 (Unauthorized)
    if (res.status === 401 && typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
      localStorage.removeItem('retailos_staff_token');
      localStorage.removeItem('retailos_staff_user');
      window.location.href = '/admin/login';
      return null as any;
    }

    const error = new Error(message) as any;
    error.status = res.status;
    throw error;
  }
  return json.data as T;
}
export function getMediaUrl(path: string | null | undefined) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  
  const baseUrl = 'http://localhost:5000';
  const finalPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${baseUrl}${finalPath}`;
}
