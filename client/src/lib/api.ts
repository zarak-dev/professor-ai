import axios from 'axios';

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
export const API_BASE = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`;

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const authToken = localStorage.getItem('token');
      const guestToken = localStorage.getItem('guest_token');

      if (authToken) {
        config.headers.Authorization = `Bearer ${authToken}`;
      } else if (guestToken) {
        config.headers.Authorization = `Bearer ${guestToken}`;
        // Automatically route document calls to guest endpoints when in guest mode
        if (config.url?.startsWith('/documents')) {
          config.url = `/guest${config.url}`;
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== 'undefined') {
      if (error.response?.status === 401) {
        const hasAuthToken = !!localStorage.getItem('token');
        if (hasAuthToken) {
          localStorage.removeItem('token');
          localStorage.removeItem('prof_token');
          localStorage.removeItem('user');
          localStorage.removeItem('prof_user');
          
          if (!window.location.pathname.includes('/sign-in')) {
            window.location.href = '/sign-in';
          }
        } else {
          // Guest session expired
          localStorage.removeItem('guest_token');
          localStorage.removeItem('guest_document_id');
        }
      }
    }
    return Promise.reject(error);
  }
);

export function getErrorMessage(err: unknown, fallback: string = 'An error occurred'): string {
  if (axios.isAxiosError(err)) {
    const errorData = err.response?.data?.error;
    if (typeof errorData === 'string') return errorData;
    if (errorData?.message) return errorData.message;
    if (err.response?.data?.message) return err.response.data.message;
    if (err.message) return err.message;
  } else if (err instanceof Error) {
    return err.message;
  }
  return fallback;
}

export default api;
