import api from './axiosInstance';

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

export const tasksAPI = {
  create: (data) => api.post('/tasks', data),
  list: (page = 1, limit = 10) => api.get(`/tasks?page=${page}&limit=${limit}`),
  getById: (id) => api.get(`/tasks/${id}`),
  delete: (id) => api.delete(`/tasks/${id}`),
};
