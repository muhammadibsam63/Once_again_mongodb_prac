import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // send httpOnly cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for consistent error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Network error
    if (!error.response) {
      return Promise.reject({
        message: 'Unable to reach the server. Please check your connection.',
      });
    }

    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      'Something went wrong. Please try again.';

    return Promise.reject({
      message,
      status: error.response.status,
      data: error.response.data,
    });
  }
);

export default api;
