import React, { useState } from 'react';
import { Restaurant } from '../types';
import { CATEGORIES_LIST, PROMO_CODES } from '../data';
import { Search } from 'lucide-react';
import PromoCard from '../components/home/PromoCard';
import RestaurantCard from '../components/home/RestaurantCard';

interface HomePageProps {
  restaurants: Restaurant[];
  setSelectedRestaurantId: (id: string | null) => void;
  setActivePage: (page: 'home' | 'restaurant' | 'cart' | 'orders' | 'partner') => void;
}

export default function HomePage({ restaurants, setSelectedRestaurantId, setActivePage }: HomePageProps) {
  const [searchInput, setSearchInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('rating');

  // Filter restaurants by search query & category
  const filteredRestaurants = restaurants.filter((restaurant) => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchInput.toLowerCase()) ||
                          restaurant.categories.some(cat => cat.toLowerCase().includes(searchInput.toLowerCase())) ||
                          restaurant.menu.some(dish => dish.name.toLowerCase().includes(searchInput.toLowerCase()));
    
    // Check if category matches
    let matchesCategory = true;
    if (selectedCategory !== 'all') {
      matchesCategory = restaurant.categories.some(
        (cat) => cat.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    return matchesSearch && matchesCategory;
  });

  // Sort filtered restaurants
  const sortedRestaurants = [...filteredRestaurants].sort((a, b) => {
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'delivery') return a.deliveryFee - b.deliveryFee;
    if (sortBy === 'reviews') return b.totalReviews - a.totalReviews;
    return 0;
  });

  const selectRestaurant = (id: string) => {
    setSelectedRestaurantId(id);
    setActivePage('restaurant');
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* ── Hero & Search Banner ── */}
      <div className="relative bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white py-12 md:py-16 px-4 text-center overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-x-12 -translate-y-12" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl translate-x-24 translate-y-24" />

        <div className="max-w-3xl mx-auto relative z-10">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 drop-shadow-xs font-sans">
            Món ngon đến xông nhà trong 30 phút ⚡
          </h1>
          <p className="text-orange-50 text-base md:text-lg mb-8 max-w-xl mx-auto">
            Hàng trăm thương hiệu ẩm thực tinh tế, ưu đãi độc quyền hàng ngày, giao hàng thân thiện siêu tốc.
          </p>

          {/* Elegant Search Container */}
          <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-xl p-1.5 flex flex-col md:flex-row gap-2 border border-orange-400/20">
            <div className="flex-1 flex items-center px-3 gap-2">
              <Search className="w-5 h-5 text-gray-400 shrink-0" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Tìm món phở, cơm tấm, pizza hay tên quán..."
                className="w-full py-2.5 text-sm md:text-base text-gray-800 outline-hidden bg-transparent placeholder-gray-400"
              />
            </div>
            <button className="bg-orange-600 hover:bg-orange-700 active:bg-orange-850 text-white font-bold text-sm md:text-base px-6 py-2.5 md:py-2 rounded-xl transition-colors shrink-0">
              Tìm kiếm
            </button>
          </div>
        </div>
      </div>

      {/* ── Promo Banners ── */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 pt-8">
        <h2 className="text-xs font-mono uppercase tracking-widest text-gray-400 mb-3 block">Ưu đãi cực HOT hôm nay</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PROMO_CODES.map((promo, idx) => (
            <PromoCard
              key={promo.code}
              code={promo.code}
              description={promo.description}
              minOrder={promo.minOrder}
              emoji={idx === 0 ? '🎁' : idx === 1 ? '🚚' : '🥞'}
              bgColorClass={
                idx === 0 
                  ? 'bg-orange-50/50 border-orange-100 text-orange-950'
                  : idx === 1
                  ? 'bg-amber-50/50 border-amber-100 text-amber-950'
                  : 'bg-emerald-50/50 border-emerald-100 text-emerald-900'
              }
            />
          ))}
        </div>
      </div>

      {/* ── Categories Navigation ── */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 pt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Danh mục ẩm thực</h2>
        </div>
        <div className="flex gap-2.5 overflow-x-auto pb-3 scrollbar-none">
          {CATEGORIES_LIST.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold transition-all shrink-0 cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-orange-600 text-white shadow-md shadow-orange-600/10'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <span className="text-base">{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Main Restaurants Section ── */}
      <main className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        {/* Section Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Đối tác nhà hàng nổi bật</h2>
            <p className="text-sm text-gray-500 mt-1">
              Phát hiện {sortedRestaurants.length} địa điểm ẩm thực chất lượng hàng đầu
            </p>
          </div>

          {/* Filtering/Sorting Selector */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-semibold text-gray-400">Sắp xếp:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-gray-200 text-sm font-medium text-gray-700 rounded-xl px-3 py-1.5 outline-hidden focus:ring-2 focus:ring-orange-500/20"
            >
              <option value="rating">Được đánh giá cao</option>
              <option value="delivery">Phí giao hàng thấp nhất</option>
              <option value="reviews">Khách sạn & Độc giả nhiều nhất</option>
            </select>
          </div>
        </div>

        {/* Restaurants Grid */}
        {sortedRestaurants.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedRestaurants.map((r) => (
              <RestaurantCard
                key={r.id}
                restaurant={r}
                onClick={() => selectRestaurant(r.id)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center max-w-md mx-auto shadow-xs">
            <span className="text-5xl select-none">🍲</span>
            <h3 className="text-lg font-bold text-gray-800 mt-4 mb-2">Không tìm thấy kết quả</h3>
            <p className="text-sm text-gray-500 mb-6 px-4">
              Chúng tôi không tìm thấy nhà hàng nào tương quan với từ khoá "{searchInput}". Vui lòng thử tìm từ khoá khác!
            </p>
            <button
              onClick={() => { setSearchInput(''); setSelectedCategory('all'); }}
              className="bg-orange-600 hover:bg-orange-700 active:bg-orange-850 text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-colors cursor-pointer"
            >
              Reset bộ lọc
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
