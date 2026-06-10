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
  USER = 'USER',
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
