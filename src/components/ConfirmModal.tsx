import React from 'react';
import { AlertTriangle, Trash2, X, Check } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Xác nhận xóa',
  cancelText = 'Hủy bỏ',
  variant = 'danger',
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  const isDanger = variant === 'danger';
  const isWarning = variant === 'warning';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200"
        role="dialog"
        aria-modal="true"
      >
        <div className={`px-4 py-3 flex items-center justify-between text-white ${
          isDanger 
            ? 'bg-red-700' 
            : isWarning 
            ? 'bg-amber-600' 
            : 'bg-blue-700'
        }`}>
          <div className="flex items-center space-x-2">
            {isDanger ? (
              <Trash2 className="w-4 h-4 text-white" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-200" />
            )}
            <h3 className="font-bold text-sm leading-tight">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-full text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-3">
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
            {message}
          </p>
        </div>

        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs text-slate-700 hover:bg-slate-200 bg-slate-100 rounded-lg font-semibold transition cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-1.5 text-xs font-bold text-white rounded-lg shadow-xs transition active:scale-95 cursor-pointer flex items-center space-x-1.5 ${
              isDanger
                ? 'bg-red-700 hover:bg-red-800'
                : isWarning
                ? 'bg-amber-600 hover:bg-amber-700'
                : 'bg-blue-700 hover:bg-blue-800'
            }`}
          >
            {isDanger && <Trash2 className="w-3.5 h-3.5" />}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
