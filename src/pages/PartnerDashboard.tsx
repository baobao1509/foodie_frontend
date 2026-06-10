import React, { useState } from 'react';
import { Restaurant, MenuItem, Order, OrderStatus } from '../types';
import { ToggleLeft, ToggleRight, Trash2, Edit2, Plus, Percent, Store, CreditCard, ChevronRight, CheckCircle2 } from 'lucide-react';
import AddDishForm from '../components/partner/AddDishForm';
import StoreStatusToggle from '../components/partner/StoreStatusToggle';

interface PartnerDashboardProps {
  restaurants: Restaurant[];
  orders: Order[];
  onToggleStoreState: (restaurantId: string) => void;
  onAddMenuItem: (restaurantId: string, item: MenuItem) => void;
  onRemoveMenuItem: (restaurantId: string, itemId: string) => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
}

export default function PartnerDashboard({
  restaurants,
  orders,
  onToggleStoreState,
  onAddMenuItem,
  onRemoveMenuItem,
  onUpdateOrderStatus
}: PartnerDashboardProps) {
  // Choose which restaurant inside partner credentials dashboard
  const [selectedResId, setSelectedResId] = useState(restaurants[0]?.id || '');

  const activeRes = restaurants.find(r => r.id === selectedResId);
  const activeResOrders = orders.filter(o => o.restaurantId === selectedResId);

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <main className="max-w-6xl mx-auto px-4 md:px-8">
        
        {/* Upper Dashboard header banner */}
        <div className="mb-8">
          <h1 className="text-2xl font-black text-gray-950 font-sans tracking-tight">Cổng quản lý nhà hàng Đối tác</h1>
          <p className="text-xs text-gray-400 font-semibold mt-1 uppercase tracking-wide">
            Kiểm soát menu món ăn ẩm thực, quản lý đơn hàng & cấu hình hoạt động nhà hàng trực tiếp
          </p>
        </div>

        {/* Quick selector of store list */}
        <div className="bg-white rounded-2xl border border-gray-150 p-4 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-400 uppercase">Đối tác quản trị:</span>
            <select
              value={selectedResId}
              onChange={(e) => setSelectedResId(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-sm font-bold text-gray-800 rounded-xl px-4 py-2 outline-hidden cursor-pointer"
            >
              {restaurants.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          <div className="text-xs text-gray-400 font-semibold">
            Đang hiển thị điều khiển: <b className="text-gray-900 font-bold">{activeRes?.name}</b>
          </div>
        </div>

        {activeRes ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left columns: Store Settings status & Live Orders lists (8 cols) */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              
              {/* Cài đặt mở cửa đóng cửa */}
              <StoreStatusToggle
                isOpen={activeRes.isOpen}
                onToggleStoreState={() => onToggleStoreState(activeRes.id)}
              />

              {/* Real-time Order Control lists from this restaurant */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs">
                <h3 className="font-bold text-sm text-gray-950 uppercase tracking-wider pb-4 border-b border-gray-100 mb-4 flex items-center gap-2">
                  <span>🛎️</span>
                  <span>Đơn hàng đang chờ xử lý ({activeResOrders.filter(o => o.status !== 'COMPLETED').length} đơn)</span>
                </h3>

                {activeResOrders.length > 0 ? (
                  <div className="flex flex-col gap-4">
                    {activeResOrders.map((ord) => (
                      <div key={ord.id} className="border border-gray-150 rounded-2xl p-4 bg-gray-50/50">
                        <div className="flex justify-between items-start pb-2.5 border-b border-gray-200/50">
                          <div>
                            <span className="font-mono text-xs font-black text-gray-950">ĐƠN #{ord.id}</span>
                            <span className="text-[10px] text-gray-400 font-bold ml-2">({ord.createdAt})</span>
                          </div>
                          <div>
                            <span className="text-sm font-black text-orange-600 font-sans">
                              {ord.total.toLocaleString('vi-VN')} đ
                            </span>
                          </div>
                        </div>

                        {/* List items cooked inside this order */}
                        <div className="py-3 text-xs text-gray-700 font-medium">
                          {ord.items.map((it) => (
                            <div key={it.menuItem.id} className="flex justify-between py-0.5">
                              <span>• {it.menuItem.name} <b className="text-gray-900">x{it.quantity}</b></span>
                              <span>{(it.menuItem.price * it.quantity).toLocaleString('vi-VN')} đ</span>
                            </div>
                          ))}
                        </div>

                        {/* Delivery address details */}
                        <div className="p-3 bg-white border border-gray-100 rounded-xl text-xs text-gray-500 mb-4 font-normal">
                          <p className="font-semibold text-gray-800">Người nhận: {ord.recipientName} ({ord.recipientPhone})</p>
                          <p className="mt-0.5">Địa chỉ: {ord.shippingAddress}</p>
                        </div>

                        {/* Action controllers buttons inside restaurant partner dashboard */}
                        <div className="flex flex-wrap items-center justify-between gap-2.5">
                          <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase mr-1.5">Trạng thái hiện tại:</span>
                            <span className="bg-orange-100 text-orange-850 font-bold text-[10px] px-2 py-1 rounded-sm uppercase tracking-wide">
                              {ord.status}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {ord.status === 'PENDING' && (
                              <button
                                onClick={() => onUpdateOrderStatus(ord.id, 'PREPARING')}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl cursor-pointer"
                              >
                                Chấp nhận nấu món 🍳
                              </button>
                            )}
                            {ord.status === 'PREPARING' && (
                              <button
                                onClick={() => onUpdateOrderStatus(ord.id, 'SHIPPING')}
                                className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs px-4 py-2 rounded-xl cursor-pointer"
                              >
                                Giao tài xế mang đi 🛵
                              </button>
                            )}
                            {ord.status === 'SHIPPING' && (
                              <button
                                onClick={() => onUpdateOrderStatus(ord.id, 'COMPLETED')}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl cursor-pointer"
                              >
                                Hoàn tất giao hàng ✓
                              </button>
                            )}
                            {ord.status === 'COMPLETED' && (
                              <span className="text-emerald-600 font-bold text-xs flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4" /> Đã hoàn tất thành công
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <span className="text-4xl select-none">📭</span>
                    <p className="text-gray-400 font-semibold text-xs mt-2.5">Nhà hàng chưa ghi nhận đơn hàng nào hôm nay</p>
                  </div>
                )}
              </div>

              {/* List menu culinary layout items editing table */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs">
                <h3 className="font-bold text-sm text-gray-920 uppercase tracking-widest pb-4 border-b border-gray-100 mb-4">
                  Quản lý danh sách thực đơn ({activeRes.menu.length} món)
                </h3>

                <div className="flex flex-col gap-3">
                  {activeRes.menu.map((food) => (
                    <div key={food.id} className="flex justify-between items-center p-3.5 bg-gray-50 border border-gray-100 rounded-2xl hover:border-gray-200 transition-all">
                      <div className="flex items-center gap-3">
                        <img
                          src={food.imageUrl}
                          alt={food.name}
                          className="w-12 h-12 rounded-xl object-cover"
                        />
                        <div>
                          <p className="font-bold text-sm text-gray-900">{food.name}</p>
                          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">{food.category}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="font-mono font-bold text-sm text-gray-900">
                          {food.price.toLocaleString('vi-VN')} đ
                        </span>

                        <button
                          onClick={() => {
                            if (confirm(`Bạn chắc chắn muốn xoá món ${food.name} khỏi thực đơn?`)) {
                              onRemoveMenuItem(activeRes.id, food.id);
                            }
                          }}
                          className="text-gray-400 hover:text-red-650 transition-colors cursor-pointer"
                          title="Xoá món ăn"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right column: Add dish form sidebar (4 cols) */}
            <div className="lg:col-span-4 self-start flex flex-col gap-6 lg:sticky lg:top-24">
              <AddDishForm
                selectedResId={activeRes.id}
                onAddMenuItem={onAddMenuItem}
              />
            </div>

          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 font-medium">Bạn chưa đăng ký bất kỳ cửa hàng đối tác nào.</p>
          </div>
        )}

      </main>
    </div>
  );
}
