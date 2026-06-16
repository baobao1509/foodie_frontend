// Re-export core apiClient config
export { api, getBaseUrl, updateApiBaseUrl } from './services/apiClient';

// Re-export background token manager operations
export {
  setOnAuthFailedCallback,
  scheduleRefresh,
  doRefresh,
  cancelRefresh,
  initTokenManager,
} from './services/tokenManager';

// Re-export Auth flow controllers
export { login, register, logout } from './services/authService';

// Re-export Restaurant operations
export {
  getRestaurants,
  createRestaurant,
  updateRestaurantStatusInBackend,
  deleteRestaurantInBackend
} from './services/restaurantService';

export{
  getRestaurantsAdminPaginated
}from'./services/adminService'
// Re-export Order operations
export { getOrders } from './services/orderService';
