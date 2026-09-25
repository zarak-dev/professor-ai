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
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
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
        localStorage.removeItem('token');
        localStorage.removeItem('prof_token');
        localStorage.removeItem('user');
        localStorage.removeItem('prof_user');
        
        // Only redirect if not already on the sign-in page
        if (!window.location.pathname.includes('/sign-in')) {
          window.location.href = '/sign-in';
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
