import { api } from './apiClient';
import { scheduleRefresh, cancelRefresh } from './tokenManager';

export const login = async (email: string, password: string) => {
  const res = await api.post('/auth/login', { email, password });
  
  if (res.data && res.data.expiresIn) {
    scheduleRefresh(res.data.expiresIn);
  }

  return res.data.user;
};

export const register = async (payload: {
  email: string;
  fullName: string;
  password: string;
  phone?: string;
  role: string;
}) => {
  const res = await api.post('/auth/register', payload);
  return res.data;
};

export const logout = async () => {
  cancelRefresh(); // Hủy toàn bộ timer
  await api.post('/auth/logout');
};
