import React from 'react';
import { OrderStatus } from '../../types';

interface OrderTimelineProps {
  status: OrderStatus;
}

export default function OrderTimeline({ status }: OrderTimelineProps) {
  const getTimelineProgressPercentage = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING': return 15;
      case 'PREPARING': return 45;
      case 'SHIPPING': return 75;
      case 'COMPLETED': return 100;
      case 'CANCELLED': return 0;
      default: return 0;
    }
  };

  return (
    <div className="mb-8">
      <h3 className="font-bold text-sm text-gray-950 uppercase tracking-wider mb-5">
        Hành trình vận đơn giao hàng
      </h3>

      {/* Horizontal slider status bar */}
      <div className="relative mb-8 mt-4">
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-100 -translate-y-1/2 z-0" />
        <div 
          className="absolute top-1/2 left-0 h-1 bg-orange-600 -translate-y-1/2 z-0 transition-all duration-500 ease-out" 
          style={{ width: `${getTimelineProgressPercentage(status)}%` }}
        />

        {/* Four bullet stops */}
        <div className="relative z-10 flex justify-between">
          {[
            { key: 'PENDING', label: 'Đặt hàng thành công', emoji: '✓' },
            { key: 'PREPARING', label: 'Cửa hàng làm món', emoji: '🍳' },
            { key: 'SHIPPING', label: 'Tài xế đi giao', emoji: '🛵' },
            { key: 'COMPLETED', label: 'Giao thành công', emoji: '🏠' }
          ].map((step, index) => {
            const statusesOrdered: OrderStatus[] = ['PENDING', 'PREPARING', 'SHIPPING', 'COMPLETED'];
            const stepIndex = statusesOrdered.indexOf(step.key as any);
            const activeIndex = statusesOrdered.indexOf(status);
            const isCheckpassed = stepIndex <= activeIndex;
            const isCurrent = step.key === status;

            return (
              <div key={step.key} className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full border-3 flex items-center justify-center transition-all ${
                  isCheckpassed
                    ? 'bg-orange-600 border-white text-white shadow-md shadow-orange-600/10'
                    : 'bg-white border-gray-100 text-gray-300'
                } ${isCurrent ? 'ring-4 ring-orange-500/20 scale-110' : ''}`}>
                  <span className="text-xs font-bold leading-none">{step.emoji}</span>
                </div>
                <span className={`text-[10px] sm:text-[11px] font-bold mt-2 text-center max-w-[80px] sm:max-w-none transition-colors ${
                  isCurrent ? 'text-orange-600' : isCheckpassed ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
