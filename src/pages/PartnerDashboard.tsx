import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { AppContextType, Restaurant, MenuItem, Order, OrderStatus } from '../types';
import { Trash2, Edit2, Plus, Percent, Store, CreditCard, ChevronRight, CheckCircle2, ListOrdered, Loader2, Tags } from 'lucide-react';
import StoreStatusToggle from '../components/partner/StoreStatusToggle';
import MenuManagementModal from '../components/partner/MenuManagementModal';
import {
  getMenuInitialForRestaurant,
  getMenuItemsByCategory,
  CategoriesResponseDTO,
  MenuItemResponseDTO
} from '../api';

export default function PartnerDashboard() {
  const {
    restaurants,
    setRestaurants,
    orders,
    onToggleStoreState,
    onAddMenuItem,
    onRemoveMenuItem,
    onUpdateOrderStatus,
    currentUser,
  } = useOutletContext<AppContextType>();

  // Choose which restaurant inside partner credentials dashboard
  const [selectedResId, setSelectedResId] = useState('');

  // Tự động đồng bộ và lựa chọn nhà hàng thuộc sở hữu của đối tác hoặc nhà hàng hợp lệ từ DB
  useEffect(() => {
    if (restaurants.length > 0) {
      if (currentUser && currentUser.role === 'PARTNER') {
        const myStore = restaurants.find(r => String(r.ownerId) === String(currentUser.id));
        if (myStore) {
          setSelectedResId(myStore.id);
          return;
        }
      }
      
      // Kiểm tra xem ID đã chọn hiện tại có hợp lệ trong danh sách mới không
      const isValid = restaurants.some(r => r.id === selectedResId);
      if (!isValid) {
        setSelectedResId(restaurants[0].id);
      }
    }
  }, [restaurants, currentUser, selectedResId]);

  // Modal open status for detailed master detail menu
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [menuCategories, setMenuCategories] = useState<CategoriesResponseDTO[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [categoryMenuItems, setCategoryMenuItems] = useState<MenuItemResponseDTO[]>([]);
  const [isMenuLoading, setIsMenuLoading] = useState(false);
  const [menuError, setMenuError] = useState('');

  const activeRes = restaurants.find(r => r.id === selectedResId);
  const activeResOrders = orders.filter(o => o.restaurantId === selectedResId);

  const formatMoney = (value: number | string | null | undefined) => {
    const numericValue = Number(value || 0);
    return numericValue.toLocaleString('vi-VN');
  };

  const getOptionGroups = (item: MenuItemResponseDTO) => {
    return (item.options || []).reduce<Record<string, string[]>>((groups, option) => {
      const groupName = option.groupName || 'Tuy chon';
      groups[groupName] = [...(groups[groupName] || []), option.optionName];
      return groups;
    }, {});
  };

  useEffect(() => {
    if (!selectedResId) {
      setMenuCategories([]);
      setSelectedCategoryId('');
      setCategoryMenuItems([]);
      return;
    }

    let isCancelled = false;
    const loadInitialMenu = async () => {
      setIsMenuLoading(true);
      setMenuError('');
      try {
        const result = await getMenuInitialForRestaurant(selectedResId);
        if (isCancelled) return;

        const sortedCategories = [...result.categories].sort(
          (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)
        );
        const firstCategory = sortedCategories[0];
        setMenuCategories(sortedCategories);
        setSelectedCategoryId(firstCategory?.id || '');
        setCategoryMenuItems(result.firstCategoryItems);
      } catch (err) {
        console.error('Failed to load partner menu initial data:', err);
        if (!isCancelled) {
          setMenuCategories([]);
          setSelectedCategoryId('');
          setCategoryMenuItems([]);
          setMenuError('Khong tai duoc thuc don tu may chu.');
        }
      } finally {
        if (!isCancelled) setIsMenuLoading(false);
      }
    };

    loadInitialMenu();
    return () => {
      isCancelled = true;
    };
  }, [selectedResId]);

  const handleSelectCategory = async (categoryId: string) => {
    if (categoryId === selectedCategoryId) return;

    setSelectedCategoryId(categoryId);
    setIsMenuLoading(true);
    setMenuError('');
    try {
      const items = await getMenuItemsByCategory(categoryId);
      setCategoryMenuItems(items);
    } catch (err) {
      console.error('Failed to load menu items by category:', err);
      setCategoryMenuItems([]);
      setMenuError('Khong tai duoc danh sach mon cua danh muc nay.');
    } finally {
      setIsMenuLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8 font-sans">
      <main className="max-w-6xl mx-auto px-4 md:px-8">
        
        {/* Upper Dashboard header banner */}
        <div className="mb-8 p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 rounded-2xl text-white shadow-lg relative overflow-hidden">
          <div className="absolute right-[-20px] top-[-20px] w-40 h-40 rounded-full bg-white/5 pointer-events-none" />
          <h1 className="text-xl md:text-2xl font-black tracking-tight flex items-center gap-2">
            <span>🛡️</span>
            <span>Trang quản trị của riêng nhà hàng {activeRes?.name || ''}</span>
          </h1>
          <p className="text-[11px] text-indigo-200/80 font-bold mt-1 uppercase tracking-wider">
            Cấu hình danh mục, thực phẩm & cấu trúc Topping đi kèm đồng bộ Spring DTO theo mô hình Master-Detail
          </p>
        </div>

        {activeRes ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column: Management Tools & Controls (4 cols) */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                
                {/* Cài đặt mở cửa đóng cửa */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs">
                  <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-wider mb-2">Trạng thái nhà hàng</h3>
                  <StoreStatusToggle
                    isOpen={activeRes.isOpen}
                    onToggleStoreState={() => onToggleStoreState(activeRes.id)}
                  />
                </div>

                {/* Highly-styled Master Detail Menu Manager Invitation card */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs flex flex-col text-left select-none relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-bl-full -z-0 transition-all group-hover:scale-110" />
                  
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 mb-4 z-10 relative">
                    <Store className="w-6 h-6" />
                  </div>
                  
                  <h3 className="font-sans font-black text-gray-950 text-sm uppercase tracking-wide z-10 relative">Quản lý Thực đơn chi tiết</h3>
                  <p className="text-xs text-gray-500 mt-2.5 leading-relaxed font-medium z-10 relative">
                    Khởi tạo & hiệu đính liên hợp các thực thể <b>Category (Danh mục)</b>, <b>MenuItem (Món ăn)</b> & <b>MenuItemOption (Toppings)</b> đồng bộ.
                  </p>
                  
                  <button
                    onClick={() => setIsMenuModalOpen(true)}
                    className="mt-6 w-full bg-orange-600 text-white hover:bg-orange-700 font-black text-xs py-3 px-4 rounded-xl shadow-md shadow-orange-900/10 transition-all uppercase cursor-pointer flex items-center justify-center gap-1.5 z-10 relative"
                  >
                    <span>🍔 Quản lý Thực đơn (Master-Detail)</span>
                  </button>
                </div>

                {/* Quick stats summarizing core records */}
                <div className="bg-slate-900 text-slate-100 rounded-2xl p-5 text-left shadow-xs">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1">
                    <span>📊</span>
                    <span>Tóm tắt thông số bếp</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-white/5 rounded-xl">
                      <p className="text-[10px] text-slate-450 uppercase font-black">Trong Thực Đơn</p>
                      <p className="text-lg font-black font-mono text-white mt-1">{activeRes.menu.length} món</p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl">
                      <p className="text-[10px] text-slate-450 uppercase font-black">Đơn hành ngày</p>
                      <p className="text-lg font-black font-mono text-orange-400 mt-1">{orders.filter(o => o.restaurantId === activeRes.id).length} đơn</p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column: Live Orders management dashboard (8 cols) */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                
                {/* Real-time Order Control lists from this restaurant */}
                <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-xs">
                  <h3 className="font-bold text-sm text-gray-950 uppercase tracking-wider pb-4 border-b border-gray-100 mb-4 flex items-center gap-2 text-left">
                    <span>🛎️</span>
                    <span>Đơn hàng đang chờ xử lý ({activeResOrders.filter(o => o.status !== 'COMPLETED').length} đơn)</span>
                  </h3>

                  {activeResOrders.length > 0 ? (
                    <div className="flex flex-col gap-4">
                      {activeResOrders.map((ord) => (
                        <div key={ord.id} className="border border-gray-150 rounded-2xl p-4 bg-gray-50/50 text-left">
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
                          <div className="py-3 text-xs text-gray-700 font-medium space-y-1">
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
                              <span className="text-[10px] font-bold text-gray-400 uppercase mr-1.5">Trạng thái:</span>
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

                {/* API driven category and menu item preview */}
                <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 pb-4 border-b border-gray-100 mb-4 bg-white shrink-0">
                    <div className="text-left">
                      <h3 className="font-bold text-sm text-gray-920 uppercase tracking-widest flex items-center gap-2">
                        <Tags className="w-4 h-4 text-orange-600" />
                        <span>Thuc don theo danh muc ({categoryMenuItems.length} mon)</span>
                      </h3>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">
                        Tai tu /menu/restaurants/{activeRes.id}/initial va /menu/categories/{selectedCategoryId || 'categoryId'}/menu-items
                      </p>
                    </div>
                    <button
                      onClick={() => setIsMenuModalOpen(true)}
                      className="px-3.5 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer"
                    >
                      Bam de tinh chinh chi tiet
                    </button>
                  </div>

                  {menuError && (
                    <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-left">
                      <p className="text-xs font-bold text-red-700">{menuError}</p>
                    </div>
                  )}

                  <div className="flex gap-2 overflow-x-auto pb-3 mb-4">
                    {menuCategories.length === 0 && !isMenuLoading ? (
                      <div className="w-full rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-5 text-center">
                        <p className="text-xs font-bold text-gray-400">Chua co danh muc nao duoc tra ve tu backend.</p>
                      </div>
                    ) : (
                      menuCategories.map((category) => {
                        const isSelected = category.id === selectedCategoryId;
                        return (
                          <button
                            key={category.id}
                            onClick={() => handleSelectCategory(category.id)}
                            className={`shrink-0 rounded-xl border px-4 py-2 text-left transition-all cursor-pointer ${
                              isSelected
                                ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-xs'
                                : 'border-gray-150 bg-white text-gray-600 hover:border-orange-200 hover:bg-orange-50/40'
                            }`}
                          >
                            <span className="block text-xs font-black uppercase tracking-wide">{category.name}</span>
                            <span className="block text-[10px] font-bold text-gray-400 mt-0.5">
                              Order #{category.displayOrder ?? 0}
                            </span>
                          </button>
                        );
                      })
                    )}
                  </div>

                  {isMenuLoading ? (
                    <div className="flex items-center justify-center py-12 text-orange-600">
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      <span className="text-xs font-black uppercase tracking-wider">Dang tai thuc don...</span>
                    </div>
                  ) : categoryMenuItems.length === 0 ? (
                    <div className="text-center py-10 rounded-2xl bg-gray-50 border border-gray-100">
                      <p className="text-gray-400 font-semibold text-xs">Danh muc nay chua co mon an nao.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {categoryMenuItems
                        .slice()
                        .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
                        .map((food) => {
                          const optionGroups = getOptionGroups(food);
                          return (
                            <div key={food.id} className="p-3.5 bg-gray-50/50 border border-gray-100 rounded-2xl hover:border-gray-150 transition-all text-left">
                              <div className="flex justify-between items-start gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                  <img
                                    src={food.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80'}
                                    alt={food.name}
                                    className="w-12 h-12 rounded-xl object-cover shrink-0 bg-gray-100"
                                  />
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <p className="font-bold text-xs text-gray-900 truncate">{food.name}</p>
                                      {food.isFeatured && (
                                        <span className="shrink-0 rounded bg-orange-100 px-1.5 py-0.5 text-[9px] font-black text-orange-700">HOT</span>
                                      )}
                                    </div>
                                    <p className="text-[10px] text-gray-400 font-medium line-clamp-2 mt-0.5">{food.description || 'Chua co mo ta'}</p>
                                  </div>
                                </div>

                                <div className="text-right shrink-0">
                                  <span className="font-mono font-bold text-xs text-gray-900 block">
                                    {formatMoney(food.price)} d
                                  </span>
                                  {food.originalPrice && (
                                    <span className="font-mono text-[10px] text-gray-400 line-through">
                                      {formatMoney(food.originalPrice)} d
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="mt-3 flex items-center justify-between gap-2">
                                <span className={`rounded-lg px-2 py-1 text-[10px] font-black uppercase ${
                                  food.isAvailable === false
                                    ? 'bg-red-50 text-red-600'
                                    : 'bg-emerald-50 text-emerald-700'
                                }`}>
                                  {food.isAvailable === false ? 'Tam het mon' : 'Dang ban'}
                                </span>
                                <span className="text-[10px] font-bold text-gray-400">Order #{food.displayOrder ?? 0}</span>
                              </div>

                              {Object.keys(optionGroups).length > 0 && (
                                <div className="mt-3 border-t border-gray-100 pt-2 space-y-1">
                                  {Object.entries(optionGroups).map(([groupName, optionNames]) => (
                                    <p key={groupName} className="text-[10px] text-gray-500">
                                      <b className="text-gray-700">{groupName}:</b> {optionNames.join(', ')}
                                    </p>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  )}

                  {menuCategories.length > 0 && (
                    <p className="text-center text-[10px] text-gray-400 font-bold mt-4">
                      Bam vao tung danh muc de tai danh sach mon cua category do tu backend.
                    </p>
                  )}
                </div>
              </div>

            </div>

            {/* Render the core Master Detail Menu Editor Modal */}
            <MenuManagementModal
              isOpen={isMenuModalOpen}
              onClose={() => setIsMenuModalOpen(false)}
              restaurant={activeRes}
              setRestaurants={setRestaurants}
              allRestaurants={restaurants}
            />
          </>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 p-8 shadow-xs">
            <p className="text-gray-500 font-semibold text-sm">Bạn chưa kích hoạt hoặc đăng ký bất kỳ cửa hàng đối tác nào trong hệ thống.</p>
          </div>
        )}

      </main>
    </div>
  );
}
