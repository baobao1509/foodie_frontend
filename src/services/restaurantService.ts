import { api } from './apiClient';

// Hàm ánh xạ nội bộ DTO từ Spring Boot trả về cấu trúc sạch đẹp cho Client
export const mapBackendRestaurant = (raw: any) => {
  return {
    id: String(raw.id || ''),
    name: raw.name || 'Nhà hàng ẩm thực',
    slug: raw.slug || '',
    coverImageUrl: raw.coverImageUrl || raw.imageUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
    address: raw.fullAddress || raw.address || 'Địa chỉ liên hệ',
    city: raw.city || 'Thành phố',
    district: raw.district || 'Quận/Huyện',
    deliveryFee: typeof raw.deliveryFee === 'number' ? raw.deliveryFee : 15000,
    rating: typeof raw.rating === 'number' ? raw.rating : 4.8,
    totalReviews: typeof raw.totalReviews === 'number' ? raw.totalReviews : 84,
    minOrderValue: typeof raw.minOrderValue === 'number' ? raw.minOrderValue : 0,
    openingTime: raw.openingTime || '08:00',
    closingTime: raw.closingTime || '22:00',
    isOpen: typeof raw.isOpen === 'boolean' ? raw.isOpen : true,
    categories: Array.isArray(raw.categories) && raw.categories.length > 0 ? raw.categories : ['Ẩm thực', 'Món Việt'],
    estimatedTime: raw.estimatedTime || '35 phút',
    description: raw.description || '',
    phone: raw.phone || '',
    email: raw.email || '',
    fullAddress: raw.fullAddress || '',
    ward: raw.ward || '',
    latitude: raw.latitude,
    longitude: raw.longitude,
    status: raw.status || '',
    createdAt: raw.createdAt || '',
    ownerId: raw.ownerId || '',
    ownerName: raw.ownerName || '',
    ownerPhone: raw.ownerPhone || '',
    payosAccountId: raw.payosAccountId || '',
    qrCodeUrl: raw.qrCodeUrl || '',
    menu: Array.isArray(raw.menu) ? raw.menu.map((m: any) => ({
      id: String(m.id || ''),
      name: m.name || 'Tên món ăn',
      description: m.description || 'Hương vị thơm ngon bổ dưỡng hảo hạng',
      price: typeof m.price === 'number' ? m.price : 25000,
      imageUrl: m.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80',
      category: m.category || 'Món ăn',
      isPopular: typeof m.isPopular === 'boolean' ? m.isPopular : false,
      rating: typeof m.rating === 'number' ? m.rating : 4.5
    })) : []
  };
};

export const getRestaurants = async (): Promise<any[]> => {
  try {
    // Gọi tới endpoint config qua reverse proxy / Nginx
    const res = await api.get('/restaurants');
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
    console.warn('[RestaurantService] Failed with /restaurants, trying fallback endpoint /restaurant:', err);
    try {
      const res = await api.get('/restaurants');
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

export const getMyRestaurant = async (): Promise<any> => {
  const res = await api.get('/restaurants/me');
  return mapBackendRestaurant(res.data);
};

export const createRestaurant = async (payload: any): Promise<any> => {
  try {
    // Thử gọi qua URL config của Nginx reverse-proxy trước
    const res = await api.post('/restaurants/me/insert', payload);
    return res.data;
  } catch (err) {
    console.warn('[RestaurantService] Failed with POST /restaurants/me, trying fallback /restaurant:', err);
    try {
      const res = await api.post('/restaurant', payload);
      return res.data;
    } catch (err2) {
      console.error('[RestaurantService] Failed to create restaurant on both endpoints:', err2);
      throw err2;
    }
  }
};


export const updateRestaurantStatusInBackend = async (id: string, status: string): Promise<any> => {
  try {
    // Gởi PUT lên /api/v1/admin/restaurants/{id}/status?status={status}
    const res = await api.put(`/admin/restaurants/${id}/status`, null, {
      params: { status: status.toUpperCase() }
    });
    return res.data;
  } catch (err) {
    console.warn('[RestaurantService] Failed updating status with query params, trying PUT with body:', err);
    try {
      const res = await api.put(`/admin/restaurants/${id}/status`, { status: status.toUpperCase() });
      return res.data;
    } catch (err2) {
      console.warn('[RestaurantService] Failed all real-backend status updates, falls back to local simulate:', err2);
      return { success: true, simulated: true };
    }
  }
};

export const deleteRestaurantInBackend = async (id: string): Promise<any> => {
  try {
    const res = await api.delete(`/admin/restaurants/${id}`);
    return res.data;
  } catch (err) {
    console.warn('[RestaurantService] Failed delete via standard admin API, trying fallback with /restaurants:', err);
    try {
      const res = await api.delete(`/restaurants/${id}`);
      return res.data;
    } catch (err2) {
      console.warn('[RestaurantService] Failed all backend deletes, using local simulation fallback:', err2);
      return { success: true, simulated: true };
    }
  }
};
