import { useState, useEffect } from 'react';
import { Restaurant, Order, OrderStatus, OrderTimelineStep, MenuItem } from '../types';
import { MOCK_RESTAURANTS } from '../data';
import { getOrders as apiGetOrders, getRestaurants as apiGetRestaurants } from '../api';

export function useAppData(currentUser: any, triggerPath?: string) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>(MOCK_RESTAURANTS);
  const [orders, setOrders] = useState<Order[]>([]);

  // Callback khi KHÁCH đặt đơn hàng mới thành công
  const onPlaceOrder = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);
  };

  // Cập nhật trạng thái đơn và bổ sung timeline history khi đối tác/admin thao tác
  const onUpdateOrderStatus = (orderId: string, nextStatus: OrderStatus) => {
    setOrders((prevOrders) =>
      prevOrders.map((o) => {
        if (o.id !== orderId) return o;

        let stepTitle = '';
        let stepDesc = '';
        switch (nextStatus) {
          case 'PREPARING':
            stepTitle = 'Đang chuẩn bị thức ăn';
            stepDesc = 'Cửa hàng đang tích cực sửa soạn & gói ghém món ăn thơm ngon cho bạn.';
            break;
          case 'SHIPPING':
            stepTitle = 'Đang trên đường giao';
            stepDesc = 'Tài xế công nghệ đang bốc xe nhận đơn và hỏa tốc phi tới chỗ bạn.';
            break;
          case 'COMPLETED':
            stepTitle = 'Giao vận thành công';
            stepDesc = 'Bữa ăn thịnh soạn đã được trao tận tay quý hàng. Chúc bạn ngon miệng!';
            break;
          case 'CANCELLED':
            stepTitle = 'Đơn hàng bị từ chối';
            stepDesc = 'Hệ thống buộc phải huỷ hoặc từ chối xử lý vận đơn này.';
            break;
          default:
            return o;
        }

        const newStep: OrderTimelineStep = {
          status: nextStatus,
          title: stepTitle,
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          description: stepDesc,
        };

        return {
          ...o,
          status: nextStatus,
          timeline: [...o.timeline.filter((t) => t.status !== nextStatus), newStep],
        };
      })
    );
  };

  // Thêm món và cài đặt lại danh sách món ăn trong Partner Dashboard
  const onAddMenuItem = (restaurantId: string, item: MenuItem) => {
    setRestaurants((prevRes) =>
      prevRes.map((r) => {
        if (r.id !== restaurantId) return r;
        return {
          ...r,
          menu: [item, ...r.menu],
        };
      })
    );
  };

  // Switch đóng/mở cửa của nhà hàng đối tác
  const onToggleStoreState = (restaurantId: string) => {
    setRestaurants((prevRes) =>
      prevRes.map((r) => {
        if (r.id !== restaurantId) return r;
        return {
          ...r,
          isOpen: !r.isOpen,
        };
      })
    );
  };

  // Xóa món ăn khỏi thực đơn của quán tương ứng
  const onRemoveMenuItem = (restaurantId: string, itemId: string) => {
    setRestaurants((prevRes) =>
      prevRes.map((r) => {
        if (r.id !== restaurantId) return r;
        return {
          ...r,
          menu: r.menu.filter((m) => m.id !== itemId),
        };
      })
    );
  };

  return {
    restaurants,
    setRestaurants,
    orders,
    setOrders,
    onPlaceOrder,
    onUpdateOrderStatus,
    onAddMenuItem,
    onToggleStoreState,
    onRemoveMenuItem,
  };
}
