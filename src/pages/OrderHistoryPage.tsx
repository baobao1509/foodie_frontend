import React from 'react';
import { Order, OrderStatus } from '../types';
import { ChevronRight, CreditCard, Landmark, Wallet, Truck, ShoppingBag, Clock, HeartHandshake } from 'lucide-react';
import OrderTimeline from '../components/orders/OrderTimeline';

interface OrderHistoryPageProps {
  orders: Order[];
  onSimulateStatus: (orderId: string, nextStatus: OrderStatus) => void;
  setActivePage: (page: 'home' | 'restaurant' | 'cart' | 'orders' | 'partner') => void;
}

export default function OrderHistoryPage({ orders, onSimulateStatus, setActivePage }: OrderHistoryPageProps) {
  
  // Format payment method text description
  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'CASH': return 'Tiền mặt khi nhận hàng (COD)';
      case 'MOMO': return 'Ví điện tử MoMo';
      case 'VNPAY': return 'Cổng thanh toán điện tử VNPAY';
      case 'CREDIT_CARD': return 'Thẻ tín dụng Quốc tế';
      default: return method;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'CASH': return <Truck className="w-4 h-4 text-gray-500" />;
      case 'MOMO': return <Wallet className="w-4 h-4 text-fuchsia-600" />;
      case 'VNPAY': return <Landmark className="w-4 h-4 text-blue-600" />;
      case 'CREDIT_CARD': return <CreditCard className="w-4 h-4 text-emerald-600" />;
      default: return <CreditCard className="w-4 h-4 text-gray-500" />;
    }
  };

  // Helper trigger next step status simulation
  const getNextStatusTrigger = (currentStatus: OrderStatus): { label: string; status: OrderStatus } | null => {
    switch (currentStatus) {
      case 'PENDING':
        return { label: 'Chấp nhận & chuẩn bị món ngon 🍳', status: 'PREPARING' };
      case 'PREPARING':
        return { label: 'Bàn giao Shipper đi giao hàng 🛵', status: 'SHIPPING' };
      case 'SHIPPING':
        return { label: 'Đánh dấu Giao hàng thành công 🏠', status: 'COMPLETED' };
      case 'COMPLETED':
      case 'CANCELLED':
      default:
        return null;
    }
  };

  if (orders.length === 0) {
    return (
      <div className="bg-gray-50 min-h-screen py-16 px-4 text-center">
        <div className="max-w-md mx-auto bg-white rounded-3xl p-8 border border-gray-150 shadow-xs">
          <span className="text-5xl select-none">📦</span>
          <h2 className="text-xl font-extrabold text-gray-900 mt-4 mb-2">Chưa có thông tin đơn hàng</h2>
          <p className="text-sm text-gray-500 mb-6">Bạn chưa đặt đơn hàng nào trên hệ thống cả. Hãy thưởng thức các vị ngon nóng sốt chỉ sau vài click chuột tại trang chủ!</p>
          <button
            onClick={() => setActivePage('home')}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl transition-all cursor-pointer shadow-xs"
          >
            Tìm vị ngon nóng sốt ngay
          </button>
        </div>
      </div>
    );
  }

  // Show order active listings
  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <main className="max-w-4xl mx-auto px-4">
        
        {/* Page Heading */}
        <div className="mb-6">
          <h1 className="text-2xl font-black text-gray-950 font-sans tracking-tight">Hành trình đơn hàng của bạn</h1>
          <p className="text-xs text-gray-400 font-semibold mt-1 uppercase tracking-wide">
            Kiểm tra và giả lập hành trình nấu nướng & vận đơn thời gian thực
          </p>
        </div>

        {/* Orders Listing Wrapper */}
        <div className="flex flex-col gap-6">
          {orders.map((order) => {
            const nextStep = getNextStatusTrigger(order.status);

            return (
              <div key={order.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-6 relative">
                
                {/* Highlight active or completed status */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-orange-600" />

                {/* Upper banner section: Order meta details */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-gray-100 gap-4">
                  <div>
                    <span className="bg-gray-100 text-gray-800 text-[10px] font-bold px-2 py-0.5 rounded-sm mr-2 font-mono uppercase">
                      HÓA ĐƠN #{order.id}
                    </span>
                    <span className="text-xs font-mono text-gray-400 font-semibold">Tạo lúc: {order.createdAt}</span>
                    <h2 className="font-sans font-extrabold text-base text-gray-900 mt-1.5 flex items-center gap-1.5">
                      <span>🍲</span>
                      <span>{order.restaurantName}</span>
                    </h2>
                  </div>

                  <div className="flex flex-col items-start sm:items-end gap-1 shrink-0">
                    <span className="text-xs font-semibold text-gray-400">Thành tiền cần trả</span>
                    <span className="text-lg font-black font-sans text-orange-600">
                      {order.total.toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                </div>

                {/* Middle Section: Deliver Items Grid & Client Delivery Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6 border-b border-gray-50 text-xs">
                  {/* Items purchased */}
                  <div>
                    <h3 className="font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1">
                      <ShoppingBag className="w-3.5 h-3.5 text-gray-400" />
                      <span>Món đã chọn ({order.items.reduce((acc, c) => acc + c.quantity, 0)} món)</span>
                    </h3>
                    <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                      {order.items.map((it) => (
                        <div key={it.menuItem.id} className="flex justify-between items-center text-gray-700 bg-gray-50 border border-gray-100 p-2.5 rounded-xl font-medium">
                          <span className="line-clamp-1 flex-1">
                            {it.menuItem.name} <b className="text-orange-600 font-bold ml-1">x{it.quantity}</b>
                          </span>
                          <span className="text-gray-900 font-bold shrink-0">
                            {(it.menuItem.price * it.quantity).toLocaleString('vi-VN')} đ
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Info and Address */}
                  <div>
                    <h3 className="font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1">
                      <HeartHandshake className="w-3.5 h-3.5 text-gray-400" />
                      <span>Chi tiết nhận hàng & Vận chuyển</span>
                    </h3>
                    <div className="bg-gray-50 border border-gray-150 p-4 rounded-2xl flex flex-col gap-2.5 font-medium text-gray-700 leading-relaxed">
                      <p>🗣️ <b className="text-gray-900 font-bold">Người nhận:</b> {order.recipientName} ({order.recipientPhone})</p>
                      <p>📍 <b className="text-gray-900 font-bold">Địa chỉ:</b> {order.shippingAddress}</p>
                      <p className="flex items-center gap-1.5 mt-1 border-t border-gray-200/60 pt-2 text-[11px] font-bold text-gray-500 uppercase">
                        {getPaymentMethodIcon(order.paymentMethod)}
                        <span>Hình thức: {getPaymentMethodLabel(order.paymentMethod)}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Timeline Progress */}
                <div className="pt-6">
                  <OrderTimeline status={order.status} />
                </div>

                {/* SIMULATOR TOOLBAR: Simulation status trigger controls */}
                {nextStep && (
                  <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex gap-2 items-start">
                      <Clock className="w-5 h-5 text-orange-600 shrink-0 mt-0.5 animate-pulse" />
                      <div>
                        <h4 className="font-bold text-xs text-orange-950">Hệ thống Giả lập Đơn hàng bếp nấu</h4>
                        <p className="text-[11px] text-orange-850 mt-0.5">
                          Bạn có thể trực tiếp giả lập cập nhật tiếp theo của tài xế hoặc nhà bếp nấu nướng:
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => onSimulateStatus(order.id, nextStep.status)}
                      className="bg-orange-600 hover:bg-orange-700 active:bg-orange-850 text-white font-bold text-xs px-5 py-2.5 rounded-xl md:py-2 transition-all cursor-pointer shadow-xs flex items-center gap-1 shrink-0 self-start sm:self-auto"
                    >
                      <span>{nextStep.label}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {order.status === 'COMPLETED' && (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 mt-4 text-emerald-950 text-xs font-medium flex items-center gap-2">
                    <span>🎉</span>
                    <span>
                      Đơn hàng đã được giao thành công viên mãn! Cảm ơn bạn đã tin dùng dịch vụ của chúng tôi!
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </main>
    </div>
  );
}
