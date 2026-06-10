import React from 'react';
import { Restaurant } from '../../types';
import { Star, MapPin, Clock, Truck, ShieldAlert } from 'lucide-react';

interface RestaurantCardProps {
  key?: React.Key;
  restaurant: Restaurant;
  onClick: () => void;
}

export default function RestaurantCard({ restaurant, onClick }: RestaurantCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-xs hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group"
    >
      {/* Visual Cover */}
      <div className="h-44 relative bg-gray-100 overflow-hidden">
        <img
          src={restaurant.coverImageUrl}
          alt={restaurant.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Rating pill overlay */}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-full text-xs font-bold text-gray-900 flex items-center gap-1 shadow-xs ring-1 ring-black/5">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{restaurant.rating.toFixed(1)}</span>
          <span className="text-gray-400 font-normal">({restaurant.totalReviews})</span>
        </div>

        {/* Shipping badge overlay */}
        <div className="absolute bottom-3 left-3 bg-gray-900/80 backdrop-blur-xs text-white text-[11px] font-semibold tracking-wide px-2.5 py-1 rounded-lg flex items-center gap-1">
          <Truck className="w-3 h-3 text-orange-400" />
          <span>{restaurant.deliveryFee === 0 ? "Freeship" : `${(restaurant.deliveryFee/1000).toFixed(0)}k ship`}</span>
        </div>

        {/* Opening status overlay */}
        {!restaurant.isOpen && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center">
            <div className="bg-red-600 text-white text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-lg shadow-xs flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 animate-pulse" />
              <span>Đang đóng cửa</span>
            </div>
          </div>
        )}
      </div>

      {/* Info Area */}
      <div className="p-5">
        <div className="flex flex-wrap gap-1 mb-2">
          {restaurant.categories.map((cat) => (
            <span key={cat} className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
              {cat}
            </span>
          ))}
        </div>

        <h3 className="font-sans font-bold text-base text-gray-950 line-clamp-1 group-hover:text-orange-600 transition-colors">
          {restaurant.name}
        </h3>

        <p className="flex items-center gap-1 text-xs text-gray-400 mt-1.5 mb-4 font-normal">
          <MapPin className="w-3.5 h-3.5 text-gray-300 shrink-0" />
          <span className="truncate">{restaurant.address}, {restaurant.district}</span>
        </p>

        <div className="flex justify-between items-center text-xs font-semibold py-3 border-t border-gray-100 text-gray-500">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-orange-500" />
            {restaurant.estimatedTime}
          </span>
          <span className="text-gray-400">
            Đơn tối thiểu: <b className="text-gray-700 font-bold">{(restaurant.minOrderValue / 1000).toFixed(0)}k</b>
          </span>
        </div>
      </div>
    </div>
  );
}
