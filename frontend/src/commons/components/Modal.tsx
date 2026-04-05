import { useEffect, useState } from 'react';

const SHOW_DELAY = 50;
const HIDE_DURATION = 300;

interface ModalProps {
  isOpen: boolean;
  onClose?: () => void;
  children: React.ReactNode | ((isAnimating: boolean) => React.ReactNode);
  zIndex?: string;
  bg?: string;
  blur?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function Modal({
  isOpen,
  onClose,
  children,
  zIndex = 'z-50',
  bg = 'bg-black/70',
  blur = 'backdrop-blur-sm',
  className = '',
  style
}: ModalProps) {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      const timer = setTimeout(() => setIsAnimating(true), SHOW_DELAY);
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setShouldRender(false), HIDE_DURATION);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!shouldRender || !onClose) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shouldRender, onClose]);

  useEffect(() => {
    if (!shouldRender) return;
    const count = Number(document.body.dataset.modalCount ?? 0) + 1;
    document.body.dataset.modalCount = String(count);
    document.body.style.overflow = 'hidden';
    return () => {
      const next = Number(document.body.dataset.modalCount ?? 1) - 1;
      document.body.dataset.modalCount = String(next);
      if (next === 0) {
        document.body.style.overflow = '';
        delete document.body.dataset.modalCount;
      }
    };
  }, [shouldRender]);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 ${zIndex} ${bg} ${blur} flex items-center justify-center transition-opacity duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0'} ${className}`}
      style={style}
      onClick={onClose}
      role={isOpen ? 'dialog' : undefined}
      aria-modal={isOpen ? 'true' : undefined}
    >
      {typeof children === 'function' ? children(isAnimating) : children}
    </div>
  );
}
