import React from 'react';
import { Store } from 'lucide-react';

interface StoreStatusToggleProps {
  isOpen: boolean;
  onToggleStoreState: () => void;
}

export default function StoreStatusToggle({ isOpen, onToggleStoreState }: StoreStatusToggleProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs">
      <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wider mb-4">
        Cài đặt hoạt động nhà hàng
      </h3>

      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-150">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-full ${isOpen ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
            <Store className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-sm text-gray-800">Trạng thái mở cửa</p>
            <p className="text-xs text-gray-400">Quan định xem khách hàng có thể đặt đơn hàng hay không</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-md uppercase ${
            isOpen ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
          }`}>
            {isOpen ? 'Mở cửa' : 'Đóng cửa'}
          </span>
          <button
            onClick={onToggleStoreState}
            className={`font-bold text-xs px-4 py-2 rounded-xl border transition-all cursor-pointer ${
              isOpen
                ? 'border-red-200 text-red-600 hover:bg-red-50'
                : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
            }`}
          >
            {isOpen ? 'Tắt mở (Đóng cửa)' : 'Bật mở (Mở cửa)'}
          </button>
        </div>
      </div>
    </div>
  );
}
