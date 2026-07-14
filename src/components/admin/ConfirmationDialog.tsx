import React from 'react';
import { AlertTriangle, Info, X } from 'lucide-react';

export type ConfirmationStyle = 'default' | 'warning' | 'danger';

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  style?: ConfirmationStyle;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel,
  cancelLabel,
  style = 'default',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const styleConfig = {
    default: {
      bg: 'bg-white',
      border: 'border-[#C9A56A]/30',
      icon: Info,
      iconColor: 'text-[#0B3027]',
      iconBg: 'bg-[#C9A56A]/20',
      confirmBtn: 'bg-[#0B3027] hover:bg-[#0E3A2F] text-white shadow-md',
    },
    warning: {
      bg: 'bg-white',
      border: 'border-amber-500/30',
      icon: AlertTriangle,
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-100',
      confirmBtn: 'bg-amber-600 hover:bg-amber-700 text-white shadow-md',
    },
    danger: {
      bg: 'bg-white',
      border: 'border-red-500/30',
      icon: AlertTriangle,
      iconColor: 'text-red-600',
      iconBg: 'bg-red-100',
      confirmBtn: 'bg-red-600 hover:bg-red-700 text-white shadow-md',
    },
  };

  const currentStyle = styleConfig[style];
  const Icon = currentStyle.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B3027]/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className={`relative w-full max-w-md p-6 rounded-3xl ${currentStyle.bg} border ${currentStyle.border} shadow-2xl animate-in zoom-in-95 duration-200`}
        role="dialog"
        aria-modal="true"
      >
        <button 
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-4 mb-6">
          <div className={`p-3 rounded-2xl ${currentStyle.iconBg} shrink-0`}>
            <Icon className={`w-6 h-6 ${currentStyle.iconColor}`} />
          </div>
          <div className="pt-1">
            <h3 className="font-['Cormorant_Garamond'] text-2xl font-bold text-gray-900 leading-none mb-2">
              {title}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-full font-semibold text-xs text-gray-700 hover:bg-gray-100 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onCancel();
            }}
            className={`px-5 py-2.5 rounded-full font-semibold text-xs transition-colors ${currentStyle.confirmBtn}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
