import api from './api';

export const authService = {
  signup: async (data) => {
    const res = await api.post('/auth/signup', data);
    return res.data;
  },

  login: async (data) => {
    const res = await api.post('/auth/login', data);
    return res.data;
  },

  logout: async () => {
    const res = await api.post('/auth/logout');
    return res.data;
  },

  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
};

export const userService = {
  getProfile: async () => {
    const res = await api.get('/users/profile');
    return res.data;
  },

  updateProfile: async (data) => {
    const res = await api.patch('/users/profile', data);
    return res.data;
  },

  changePassword: async (data) => {
    const res = await api.patch('/users/change-password', data);
    return res.data;
  },
};
