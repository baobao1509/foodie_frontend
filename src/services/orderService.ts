import { api } from './apiClient';

export const getOrders = async () => {
  const res = await api.get('/orders');
  return res.data;
};
