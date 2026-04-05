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
    if (!shouldRender) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [shouldRender]);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 ${zIndex} ${bg} ${blur} flex items-center justify-center transition-opacity duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0'} ${className}`}
      style={style}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      {typeof children === 'function' ? children(isAnimating) : children}
    </div>
  );
}
