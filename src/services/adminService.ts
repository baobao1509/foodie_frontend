import { api } from './apiClient';
import { mapBackendRestaurant } from './restaurantService';

export { mapBackendRestaurant };

export const getAdminRestaurants = async (): Promise<any[]> => {
  try {
    // Gọi tới endpoint config qua reverse proxy / Nginx
    const res = await api.get('admin/restaurant');
    const responseData = res.data;

    let rawList: any[] = [];
    // Hỗ trợ cả Page JPA và Array thuần
    if (responseData && Array.isArray(responseData.content)) {
      rawList = responseData.content;
    } else if (Array.isArray(responseData)) {
      rawList = responseData;
    } else if (responseData && typeof responseData === 'object') {
      rawList = responseData.data || [];
    }

    return rawList.map(mapBackendRestaurant);
  } catch (err) {
    console.warn('[RestaurantService] Failed with /api/ve/restaurant, trying fallback endpoint /restaurant:', err);
    try {
      const res = await api.get('/restaurant');
      const responseData = res.data;
      
      let rawList: any[] = [];
      if (responseData && Array.isArray(responseData.content)) {
        rawList = responseData.content;
      } else if (Array.isArray(responseData)) {
        rawList = responseData;
      } else if (responseData && typeof responseData === 'object') {
        rawList = responseData.data || [];
      }
      
      return rawList.map(mapBackendRestaurant);
    } catch (err2) {
      console.error('[RestaurantService] Failed to load restaurants from backend API entirely:', err2);
      throw err2;
    }
  }
};
export const getRestaurantsAdminPaginated = async (
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
    const res = await api.get('/admin/restaurants', {
      params: {
        page,
        size
      }
    });
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
    console.warn('[RestaurantService] Failed paginated fetch from Admin controller, trying client fallback:', err);
    // Fallback: Lấy toàn bộ danh sách ở client và tự phân trang cục bộ
    try {
      const all = await getAdminRestaurants();
      const totalElements = all.length;
      const totalPages = Math.ceil(totalElements / size) || 1;
      const startIdx = page * size;
      const content = all.slice(startIdx, startIdx + size);
      
      return {
        content,
        totalPages,
        totalElements,
        number: page,
        size,
      };
    } catch (fallbackErr) {
      console.error('[RestaurantService] All fetching systems failed:', fallbackErr);
      return {
        content: [],
        totalPages: 1,
        totalElements: 0,
        number: page,
        size
      };
    }
  }
};


export const createRestaurant = async (payload: any): Promise<any> => {
  try {
    // Thử gọi qua URL config của Nginx reverse-proxy trước
    const res = await api.post('/restaurants', payload);
    return res.data;
  } catch (err) {
    console.warn('[RestaurantService] Failed with POST /api/ve/restaurant, trying fallback /restaurant:', err);
    try {
      const res = await api.post('/restaurant', payload);
      return res.data;
    } catch (err2) {
      console.error('[RestaurantService] Failed to create restaurant on both endpoints:', err2);
      throw err2;
    }
  }
};
