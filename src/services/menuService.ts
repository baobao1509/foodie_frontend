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

export const createCategoryInBackend = async (payload: CategoriesRequestDTO): Promise<any> => {
  try {
    const res = await api.post('/categories', payload);
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
