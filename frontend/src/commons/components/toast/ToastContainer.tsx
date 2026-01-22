import { useEffect } from 'react';
import { useToastStore } from '../../stores/toastStore';
import { ToastItem } from './ToastItem';

export const ToastContainer = () => {
  const { toasts, removeToast } = useToastStore();

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && toasts.length > 0) {
        removeToast(toasts[toasts.length - 1].id);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [toasts, removeToast]);

  return (
    <div className="fixed top-4 right-4 z-50">
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          className="absolute top-0 right-0 transition-all duration-300 ease-out"
          style={{
            transform: `translateY(${index * 12}px) scale(${1 - index * 0.05})`,
            zIndex: 50 - index,
            opacity: 1 - index * 0.15
          }}
        >
          <ToastItem toast={toast} onRemove={removeToast} />
        </div>
      ))}
    </div>
  );
};
