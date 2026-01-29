import { useState, Children, useEffect } from 'react';
import type { ReactNode } from 'react';

interface CarouselProps {
  children: ReactNode;
  interval?: number;
}

export default function Carousel({ children, interval = 5000 }: CarouselProps) {
  const items = Children.toArray(children);
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    if (items.length <= 1) return;

    const timer = setInterval(() => {
      goToNext();
    }, interval);

    return () => clearInterval(timer);
  }, [currentIndex, interval, items.length]);

  return (
    <div className="relative w-full h-full overflow-hidden rounded-xl">
      <div className="relative w-full h-full overflow-hidden">
        <div
          className="flex h-full transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {items.map((item, index) => (
            <div key={index} className="w-full h-full flex-shrink-0 overflow-hidden">
              {item}
            </div>
          ))}
        </div>
      </div>

      {items.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors z-10"
            aria-label="이전"
          >
            ‹
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors z-10"
            aria-label="다음"
          >
            ›
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {items.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/70 w-2'
                }`}
                aria-label={`${index + 1}번`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
