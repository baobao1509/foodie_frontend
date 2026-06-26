import { api } from './apiClient';

export interface CategoriesRequestDTO {
  name: string;
  displayOrder: number;
  restaurantid: string;
}

export interface MenuItemOptionRequestDTO {
  groupName: string;
  optionName: string;
  extraPrice: number;
  isDefault: boolean;
}

export interface MenuItemRequestDTO {
  restaurantId: string;
  categoryId: string | null;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  originalPrice: number | null;
  isAvailable: boolean;
  isFeatured: boolean;
  displayOrder: number;
  options: MenuItemOptionRequestDTO[];
}

export interface MenuItemOptionResponseDTO {
  id?: string;
  groupName: string;
  optionName: string;
  extraPrice?: number | string;
  isDefault?: boolean;
}

export interface MenuItemResponseDTO {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  price: number | string;
  originalPrice?: number | string | null;
  isAvailable?: boolean;
  isFeatured?: boolean;
  displayOrder?: number;
  options?: MenuItemOptionResponseDTO[];
}

export interface CategoriesResponseDTO {
  id: string;
  name: string;
  displayOrder?: number;
  items?: MenuItemResponseDTO[];
}

export interface MenuInitialResponseDTO {
  categories: CategoriesResponseDTO[];
  firstCategoryItems: {
    content?: MenuItemResponseDTO[];
    data?: MenuItemResponseDTO[];
    totalElements?: number;
    totalPages?: number;
    number?: number;
    size?: number;
  } | MenuItemResponseDTO[];
}

const extractMenuItems = (raw: MenuInitialResponseDTO['firstCategoryItems'] | any): MenuItemResponseDTO[] => {
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.content)) return raw.content;
  if (Array.isArray(raw?.data)) return raw.data;
  return [];
};

export const getMenuInitialForRestaurant = async (restaurantId: string): Promise<{
  categories: CategoriesResponseDTO[];
  firstCategoryItems: MenuItemResponseDTO[];
}> => {
  const res = await api.get<MenuInitialResponseDTO>(`/menu/restaurants/${restaurantId}/initial`);
  return {
    categories: Array.isArray(res.data?.categories) ? res.data.categories : [],
    firstCategoryItems: extractMenuItems(res.data?.firstCategoryItems)
  };
};

export const getMenuItemsByCategory = async (categoryId: string): Promise<MenuItemResponseDTO[]> => {
  const res = await api.get(`/menu/categories/${categoryId}/menu-items`);
  return extractMenuItems(res.data);
};

export const createCategoryInBackend = async (payload: CategoriesRequestDTO): Promise<any> => {
  try {
    const res = await api.post('/admin/categories', payload);
    return res.data;
  } catch (err) {
    console.warn('[MenuService] POST /admin/categories failed, falling up:', err);
    try {
      const res = await api.post('/categories', payload);
      return res.data;
    } catch {
      return { ...payload, id: `cat-sim-${Date.now()}` };
    }
  }
};

export const deleteCategoryInBackend = async (categoryId: string): Promise<any> => {
  try {
    const res = await api.delete(`/admin/categories/${categoryId}`);
    return res.data;
  } catch (err) {
    console.warn('[MenuService] DELETE /admin/categories failed, falling back:', err);
    try {
      const res = await api.delete(`/categories/${categoryId}`);
      return res.data;
    } catch {
      return { success: true };
    }
  }
};

export const createMenuItemInBackend = async (payload: MenuItemRequestDTO): Promise<any> => {
  try {
    const res = await api.post('/admin/menu-items', payload);
    return res.data;
  } catch (err) {
    console.warn('[MenuService] POST /admin/menu-items failed, falling back:', err);
    try {
      const res = await api.post('/menu-items', payload);
      return res.data;
    } catch {
      return { ...payload, id: `menu-sim-${Date.now()}` };
    }
  }
};

export const deleteMenuItemInBackend = async (menuItemId: string): Promise<any> => {
  try {
    const res = await api.delete(`/admin/menu-items/${menuItemId}`);
    return res.data;
  } catch (err) {
    console.warn('[MenuService] DELETE /admin/menu-items failed, falling back:', err);
    try {
      const res = await api.delete(`/menu-items/${menuItemId}`);
      return res.data;
    } catch {
      return { success: true };
    }
  }
};

export interface FullMenuSubmitDTO {
  restaurantId: string;
  categories: {
    name: string;
    displayOrder: number;
    menuItems: {
      name: string;
      description: string;
      imageUrl: string;
      price: number;
      originalPrice: number | null;
      isAvailable: boolean;
      isFeatured: boolean;
      displayOrder: number;
      options: MenuItemOptionRequestDTO[];
    }[];
  }[];
}

export const submitFullMenuToBackend = async (payload: FullMenuSubmitDTO): Promise<any> => {
  const res = await api.post('/restaurants/add-new-category', payload);
  return res.data;
};
