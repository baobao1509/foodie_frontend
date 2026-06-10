import React from 'react';
import { MenuItem } from '../../types';
import { Plus, Minus } from 'lucide-react';

interface DishCardProps {
  key?: React.Key;
  dish: MenuItem;
  qtyInCart: number;
  isOpen: boolean;
  onAddToCart: () => void;
  onUpdateCartItemQty: (diff: number) => void;
}

export default function DishCard({ dish, qtyInCart, isOpen, onAddToCart, onUpdateCartItemQty }: DishCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4 hover:shadow-md transition-shadow relative overflow-hidden">
      {/* Dish Img */}
      <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-gray-50">
        <img
          src={dish.imageUrl}
          alt={dish.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Main specification */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{dish.category}</span>
            {dish.isPopular && (
              <span className="bg-amber-50 text-amber-700 text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wide">⭐ Best Seller</span>
            )}
          </div>
          <h4 className="font-sans font-bold text-sm text-gray-950 mb-1 leading-snug line-clamp-1">{dish.name}</h4>
          <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed mb-2 font-normal">{dish.description}</p>
        </div>

        <div className="flex items-center justify-between mt-1">
          <span className="text-sm font-black text-gray-950 font-sans">
            {dish.price.toLocaleString('vi-VN')} đ
          </span>

          {/* Interactive Button */}
          {qtyInCart > 0 ? (
            <div className="flex items-center gap-2.5 bg-gray-100 rounded-full px-2.5 py-1 text-sm font-bold text-gray-900">
              <button
                onClick={() => onUpdateCartItemQty(-1)}
                className="w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-xs cursor-pointer text-gray-600 hover:bg-orange-50 hover:text-orange-600"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="text-xs select-none w-4 text-center">{qtyInCart}</span>
              <button
                onClick={() => onUpdateCartItemQty(1)}
                className="w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-xs cursor-pointer text-gray-600 hover:bg-orange-50 hover:text-orange-600"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              disabled={!isOpen}
              onClick={onAddToCart}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                isOpen
                  ? 'bg-orange-600 hover:bg-orange-700 text-white'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
