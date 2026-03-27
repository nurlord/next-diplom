import ky from 'ky';

export const apiClient = ky.create({
  prefixUrl: process.env.NEXT_PUBLIC_API_URL || '', // Base path for the API
  hooks: {
    beforeRequest: [
      (request) => {
        // Example: Add authorization header if token exists
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
        if (response.status === 401) {
          // Handle unauthorized, e.g., redirect to login or refresh token
        }
      }
    ]
  }
});
