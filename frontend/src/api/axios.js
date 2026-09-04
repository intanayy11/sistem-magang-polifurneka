import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 20000, // 20 detik batas timeout request
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 1. Tangani 401 Unauthorized (Token kadaluarsa / tidak valid)
    if (error.response && error.response.status === 401) {
      if (window.location.pathname !== '/login') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }

    // 2. Tangani Network Error / Timeout (Jaringan lemah atau terputus)
    if (!error.response) {
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        error.userFriendlyMessage = 'Koneksi waktu habis (timeout). Silakan periksa jaringan internet Anda dan coba lagi.';
      } else if (error.message === 'Network Error' || !navigator.onLine) {
        error.userFriendlyMessage = 'Koneksi internet terputus. Pastikan perangkat Anda terhubung ke internet.';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
