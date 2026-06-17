import { api } from './apiClient';
import { mapBackendRestaurant } from './restaurantService';
import { UserSummaryDTO } from '../types';

export { mapBackendRestaurant };

export const getRestaurantsAdminPaginated = async (
  status: string = 'ALL',
  page: number = 0,
  size: number = 10
): Promise<{
  content: any[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}> => {
  try {
    const params: any = {
      page,
      size
    };
    if (status && status !== 'ALL') {
      params.status = status.toUpperCase();
    }

    const res = await api.get('/admin/restaurants', { params });
    const responseData = res.data;

    let content: any[] = [];
    let totalPages = 1;
    let totalElements = 0;

    if (responseData && typeof responseData === 'object') {
      if (Array.isArray(responseData.content)) {
        content = responseData.content.map(mapBackendRestaurant);
        totalPages = typeof responseData.totalPages === 'number' ? responseData.totalPages : 1;
        totalElements = typeof responseData.totalElements === 'number' ? responseData.totalElements : responseData.content.length;
      } else if (Array.isArray(responseData)) {
        content = responseData.map(mapBackendRestaurant);
        totalElements = responseData.length;
        totalPages = Math.ceil(totalElements / size) || 1;
      } else if (Array.isArray(responseData.data)) {
        content = responseData.data.map(mapBackendRestaurant);
        totalElements = responseData.data.length;
        totalPages = Math.ceil(totalElements / size) || 1;
      }
    }

    return {
      content,
      totalPages,
      totalElements,
      number: page,
      size,
    };
  } catch (err) {
    console.error('[RestaurantService] Failed paginated fetch from Admin controller:', err);
    return {
      content: [],
      totalPages: 1,
      totalElements: 0,
      number: page,
      size
    };
  }
};

export const approveRestaurantInBackend = async (
  restaurantId: string,
  currentUser: UserSummaryDTO
): Promise<any> => {
  // Gửi đúng 1 phát duy nhất tới endpoint chính xác qua POST
  const params = { restaurantId };
  const body = {
    id: currentUser.id,
    fullName: currentUser.fullName,
    avatarUrl: currentUser.avatarUrl,
    role: currentUser.role
  };

  const res = await api.post('/admin/restaurants/approve', body, { params });
  return res.data;
};

export const suspendRestaurantInBackend = async (
  restaurantId: string,
  currentUser: UserSummaryDTO
): Promise<any> => {
  // Gửi đúng 1 phát duy nhất tới /admin/restaurants/suspended qua POST
  const params = { restaurantId };
  const body = {
    id: currentUser.id,
    fullName: currentUser.fullName,
    avatarUrl: currentUser.avatarUrl,
    role: currentUser.role
  };

  const res = await api.post('/admin/restaurants/suspended', body, { params });
  return res.data;
};


export const unblockRestaurantInBackend = async (
  restaurantId: string,
  currentUser: UserSummaryDTO
): Promise<any> => {
  const params = { restaurantId };
  const body = {
    id: currentUser.id,
    fullName: currentUser.fullName,
    avatarUrl: currentUser.avatarUrl,
    role: currentUser.role
  };

  const res = await api.post('/admin/restaurants/unblock', body, { params });
  return res.data;
};

export const createRestaurant = async (payload: any): Promise<any> => {
  try {
    // Thử gọi qua URL config của Nginx reverse-proxy trước
    const res = await api.post('/restaurants', payload);
    return res.data;
  } catch (err) {
    console.warn('[RestaurantService] Failed with POST /restaurants, trying fallback /restaurant:', err);
    try {
      const res = await api.post('/restaurant', payload);
      return res.data;
    } catch (err2) {
      console.error('[RestaurantService] Failed to create restaurant on both endpoints:', err2);
      throw err2;
    }
  }
};
