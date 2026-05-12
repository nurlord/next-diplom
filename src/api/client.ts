import ky from 'ky';

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

async function tryRefreshToken(): Promise<string | null> {
  const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;
  if (!refreshToken) return null;

  try {
    const res = await ky.post(`${BASE_URL}/auth/refresh`, {
      json: { refresh_token: refreshToken },
    }).json<{ data: { access_token?: string; refresh_token?: string } }>();

    if (res.data.access_token) {
      localStorage.setItem('access_token', res.data.access_token);
    }
    if (res.data.refresh_token) {
      localStorage.setItem('refresh_token', res.data.refresh_token);
    }
    return res.data.access_token ?? null;
  } catch {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    return null;
  }
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://jazylym-production.up.railway.app';

export const apiClient = ky.create({
  prefixUrl: BASE_URL,
  timeout: false,
  hooks: {
    beforeRequest: [
      (request) => {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('access_token');
          if (token) {
            request.headers.set('Authorization', `Bearer ${token}`);
          }
        }
      }
    ],
    afterResponse: [
      async (request, options, response) => {
        if (response.status === 401 && typeof window !== 'undefined') {
          // Deduplicate concurrent refresh calls
          if (!isRefreshing) {
            isRefreshing = true;
            refreshPromise = tryRefreshToken().finally(() => {
              isRefreshing = false;
              refreshPromise = null;
            });
          }

          const newToken = await refreshPromise;
          if (newToken) {
            request.headers.set('Authorization', `Bearer ${newToken}`);
            return ky(request);
          }
        }
      }
    ]
  }
});
