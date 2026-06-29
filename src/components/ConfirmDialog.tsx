import React from 'react';
import { AlertTriangle, HelpCircle, Info, Loader2, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  type = 'warning',
  isLoading = false,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const IconMap = {
    danger: <AlertTriangle className="w-6 h-6 text-red-600" />,
    warning: <AlertTriangle className="w-6 h-6 text-amber-600" />,
    info: <Info className="w-6 h-6 text-blue-600" />,
  };

  const ColorMap = {
    danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500 shadow-red-900/10 text-white',
    warning: 'bg-amber-500 hover:bg-amber-600 focus:ring-amber-500 shadow-amber-900/10 text-white',
    info: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 shadow-blue-900/10 text-white',
  };

  const bgIconMap = {
    danger: 'bg-red-100',
    warning: 'bg-amber-100',
    info: 'bg-blue-100',
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-4 z-[9999] animate-fade-in backdrop-blur-xs font-sans text-gray-800">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-150 overflow-hidden transform transition-all animate-scale-in">
        {/* Header decoration */}
        <div className="relative p-6 pb-4 flex items-start gap-4 text-left">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${bgIconMap[type]}`}>
            {IconMap[type] || <HelpCircle className="w-6 h-6 text-gray-600" />}
          </div>

          <div className="flex-1 pr-4">
            <h3 className="text-sm font-black text-gray-950 uppercase tracking-wider mb-1.5">
              {title}
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed font-medium">
              {message}
            </p>
          </div>
        </div>

        {/* Action Panel */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-2 border-t border-gray-150">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
          >
            {cancelText}
          </button>
          
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-all cursor-pointer disabled:opacity-60 active:scale-95 ${ColorMap[type]}`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Đang xử lý...</span>
              </>
            ) : (
              <span>{confirmText}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
