export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  isPopular: boolean;
  rating?: number;
}

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  coverImageUrl: string;
  address: string;
  city: string;
  district: string;
  deliveryFee: number;
  rating: number;
  totalReviews: number;
  minOrderValue: number;
  openingTime: string;
  closingTime: string;
  isOpen: boolean;
  categories: string[];
  estimatedTime: string;
  menu: MenuItem[];
  description?: string;
  phone?: string;
  email?: string;
  fullAddress?: string;
  ward?: string;
  latitude?: number;
  longitude?: number;
  status?: string;
  createdAt?: string;
  ownerId?: string;
  ownerName?: string;
  ownerPhone?: string;
  payosAccountId?: string;
  qrCodeUrl?: string;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
}

export type OrderStatus = 'PENDING' | 'PREPARING' | 'SHIPPING' | 'COMPLETED' | 'CANCELLED';

export interface OrderTimelineStep {
  status: OrderStatus;
  title: string;
  time: string;
  description: string;
}

export interface Order {
  id: string;
  restaurantId: string;
  restaurantName: string;
  restaurantAddress: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  status: OrderStatus;
  shippingAddress: string;
  recipientName: string;
  recipientPhone: string;
  paymentMethod: 'CASH' | 'MOMO' | 'VNPAY' | 'CREDIT_CARD';
  createdAt: string;
  timeline: OrderTimelineStep[];
}

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  PARTNER = 'PARTNER',
  ADMIN = 'ADMIN'
}

export interface UserSummaryDTO {
  id: string;
  fullName: string;
  avatarUrl: string;
  role: UserRole;
}

export type ActivePage = 'home' | 'restaurant' | 'cart' | 'orders' | 'partner' | 'login' | 'register';

export interface AppContextType {
  restaurants: Restaurant[];
  setRestaurants: (restaurants: Restaurant[]) => void;
  orders: Order[];
  setOrders: (orders: Order[]) => void;
  currentUser: UserSummaryDTO | null;
  handleLoginSuccess: (user: UserSummaryDTO) => void;
  handleLogout: () => Promise<void>;
  cart: CartItem[];
  addToCart: (item: MenuItem, notes?: string) => void;
  updateCartItemQty: (itemId: string, diff: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  cartMeta: {
    name: string;
    deliveryFee: number;
    minOrderValue: number;
    address: string;
  };
  onPlaceOrder: (newOrder: Order) => void;
  onUpdateOrderStatus: (orderId: string, nextStatus: OrderStatus) => void;
  onAddMenuItem: (restaurantId: string, item: MenuItem) => void;
  onToggleStoreState: (restaurantId: string) => void;
  onRemoveMenuItem: (restaurantId: string, itemId: string) => void;
}
