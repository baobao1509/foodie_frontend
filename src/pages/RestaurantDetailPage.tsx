import React, { useState } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { AppContextType } from '../types';
import { ArrowLeft, Star, MapPin, Clock, Truck, ShoppingBag } from 'lucide-react';
import DishCard from '../components/restaurant/DishCard';

export default function RestaurantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { restaurants, cart, addToCart, updateCartItemQty } = useOutletContext<AppContextType>();

  const [selectedSubCat, setSelectedSubCat] = useState('all');

  const restaurant = restaurants.find((r) => r.id === id);

  const onBack = () => {
    navigate('/');
  };

  const onGoToCart = () => {
    navigate('/cart');
  };

  if (!restaurant) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center">
        <p className="text-gray-500 font-medium">Không tìm thấy dữ liệu nhà hàng.</p>
        <button onClick={onBack} className="mt-4 text-orange-600 font-bold hover:underline">Quay lại Trang Chủ</button>
      </div>
    );
  }

  // Get unique sub-categories from menu items
  const menuCategories = ['all', ...Array.from(new Set(restaurant.menu.map((item) => item.category)))];

  // Filter menu items
  const filteredMenu = selectedSubCat === 'all'
    ? restaurant.menu
    : restaurant.menu.filter((item) => item.category === selectedSubCat);

  // Helper code to check quantity of a menu item inside cart
  const getItemQtyInCart = (itemId: string) => {
    const existing = cart.find(c => c.menuItem.id === itemId);
    return existing ? existing.quantity : 0;
  };

  const totalCartPrice = cart.reduce((acc, c) => acc + (c.menuItem.price * c.quantity), 0);
  const totalCartCount = cart.reduce((acc, c) => acc + c.quantity, 0);

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {/* Back & Breadcrumb Panel */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-orange-600 font-medium text-sm transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại trang chủ</span>
        </button>
      </div>

      {/* Hero Banner Area */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 pb-8">
        <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-xs flex flex-col md:flex-row gap-6 p-6">
          {/* Main Cover Img */}
          <div className="w-full md:w-80 h-52 shrink-0 rounded-2xl overflow-hidden relative">
            <img
              src={restaurant.coverImageUrl}
              alt={restaurant.name}
              className="w-full h-full object-cover"
            />
            {!restaurant.isOpen && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="bg-red-600 text-white text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-sm">Đang đóng cửa</span>
              </div>
            )}
          </div>

          {/* Restaurant meta */}
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {restaurant.categories.map((c) => (
                  <span key={c} className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-sm uppercase tracking-wide">
                    {c}
                  </span>
                ))}
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wide ${
                  restaurant.isOpen ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                }`}>
                  {restaurant.isOpen ? 'Đang hoạt động' : 'Tạm nghỉ'}
                </span>
              </div>

              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-950 font-sans tracking-tight">
                {restaurant.name}
              </h1>

              <p className="flex items-center gap-1 text-sm text-gray-500 mt-2">
                <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                <span>{restaurant.address}</span>
              </p>
            </div>

            {/* Quick specifications */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-orange-50 text-orange-600 shrink-0">
                  <Star className="w-4 h-4 fill-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Đánh giá</p>
                  <p className="text-sm font-bold text-gray-900">{restaurant.rating.toFixed(1)} <span className="text-gray-400 font-normal">({restaurant.totalReviews})</span></p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-orange-50 text-orange-600 shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Thời gian</p>
                  <p className="text-sm font-bold text-gray-900">{restaurant.estimatedTime}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-orange-50 text-orange-600 shrink-0">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Phí giao</p>
                  <p className="text-sm font-bold text-gray-900">{restaurant.deliveryFee === 0 ? "Miễn phí" : `${(restaurant.deliveryFee/1000).toFixed(0)}k đ`}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-orange-50 text-orange-600 shrink-0">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Tối thiểu</p>
                  <p className="text-sm font-bold text-gray-900">{(restaurant.minOrderValue / 1000).toFixed(0)}k đ</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Main Body: Sub-Categories & Dishes List */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Side: Sub-menu filter list */}
        <div className="lg:col-span-1 self-start">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 sticky top-24 shadow-xs">
            <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider pb-3 border-b border-gray-100 mb-3">
              Thực đơn của quán
            </h3>
            <div className="flex lg:flex-col gap-1.5 overflow-x-auto pb-2 lg:pb-0">
              {menuCategories.map((catName) => (
                <button
                  key={catName}
                  onClick={() => setSelectedSubCat(catName)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold text-left transition-colors whitespace-nowrap lg:whitespace-normal cursor-pointer text-ellipsis overflow-hidden ${
                    selectedSubCat === catName
                      ? 'bg-orange-600 text-white shadow-xs'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {catName === 'all' ? '🍽️ Tất cả món ăn' : catName}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Dishes grid */}
        <div className="lg:col-span-3">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>🍛</span>
            <span>{selectedSubCat === 'all' ? 'Tất cả món ngon' : selectedSubCat}</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMenu.map((dish) => {
              const qtyInCart = getItemQtyInCart(dish.id);

              return (
                <DishCard
                  key={dish.id}
                  dish={dish}
                  qtyInCart={qtyInCart}
                  isOpen={restaurant.isOpen}
                  onAddToCart={() => addToCart(dish)}
                  onUpdateCartItemQty={(diff) => updateCartItemQty(dish.id, diff)}
                />
              );
            })}
          </div>
        </div>

      </div>

      {/* Persistent Cart Peek Bottom Bar */}
      {totalCartCount > 0 && (
        <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md shadow-2xl border-t border-gray-150 py-3.5 px-4 md:px-8 z-40 flex items-center justify-between">
          <div className="max-w-6xl mx-auto w-full flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative bg-orange-600 text-white p-3 rounded-full shadow-lg shadow-orange-600/20">
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-amber-500 text-white font-black text-[9px] h-4 w-4 rounded-full flex items-center justify-center border border-white">
                  {totalCartCount}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Đang lựa chọn ({totalCartCount} món)</p>
                <p className="text-base font-black text-gray-950 font-sans">{totalCartPrice.toLocaleString('vi-VN')} đ</p>
              </div>
            </div>

            <button
              onClick={onGoToCart}
              className="bg-orange-600 hover:bg-orange-700 active:bg-orange-850 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-md transition-colors cursor-pointer flex items-center gap-2"
            >
              <span>Xem giỏ hàng & Thanh toán</span>
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
