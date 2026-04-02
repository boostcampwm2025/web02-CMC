import { useEffect, useState } from 'react';
import Icon from '@/commons/components/Icon';
import type { Toast } from '../../stores/toastStore';

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

export const ToastItem = ({ toast, onRemove }: ToastItemProps) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const duration = toast.duration ?? 3000;
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(() => onRemove(toast.id), 300);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [toast.duration, toast.id, onRemove]);

  return (
    <div
      className={`flex items-start gap-3 px-4 py-4 rounded-lg shadow-2xl bg-[#1a1a1a] border border-red-700 w-[26rem] transition-all duration-300 ${
        isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'
      }`}
    >
      <Icon name="exclamation" className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white break-words">{toast.message}</p>
      </div>
    </div>
  );
};
