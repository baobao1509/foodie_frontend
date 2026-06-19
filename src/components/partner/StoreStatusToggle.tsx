import React from 'react';

interface StoreStatusToggleProps {
  isOpen: boolean;
  onToggleStoreState: () => void;
}

export default function StoreStatusToggle({ isOpen, onToggleStoreState }: StoreStatusToggleProps) {
  return (
    <div className="flex gap-2 w-full">
      <button
        type="button"
        onClick={() => { if (!isOpen) onToggleStoreState(); }}
        className={`flex-1 py-2.5 px-4 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 border-2 ${
          isOpen
            ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/10'
            : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'
        }`}
      >
        <span>🟢</span>
        <span>Mở Cửa</span>
      </button>

      <button
        type="button"
        onClick={() => { if (isOpen) onToggleStoreState(); }}
        className={`flex-1 py-2.5 px-4 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 border-2 ${
          !isOpen
            ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/10'
            : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'
        }`}
      >
        <span>🔴</span>
        <span>Đóng Cửa</span>
      </button>
    </div>
  );
}
