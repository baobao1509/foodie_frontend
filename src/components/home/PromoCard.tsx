import React from 'react';

interface PromoCardProps {
  key?: React.Key;
  code: string;
  description: string;
  minOrder: number;
  emoji: string;
  bgColorClass: string;
}

export default function PromoCard({ code, description, minOrder, emoji, bgColorClass }: PromoCardProps) {
  return (
    <div
      className={`p-5 rounded-2xl border transition-all duration-300 hover:shadow-md cursor-pointer flex justify-between items-center relative overflow-hidden ${bgColorClass}`}
    >
      <div>
        <p className="font-mono text-xs font-bold uppercase tracking-wider text-orange-600 mb-1">{code}</p>
        <h3 className="font-sans font-bold text-base text-gray-900">{description}</h3>
        <p className="text-xs text-gray-500 mt-1">Đơn tối thiểu {(minOrder / 1000).toFixed(0)}k</p>
      </div>
      <div className="text-3xl pr-2 select-none">
        {emoji}
      </div>
    </div>
  );
}
