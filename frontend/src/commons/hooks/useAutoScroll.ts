import { useRef, useEffect } from 'react';

export function useAutoScrollDown<T>(deps: T[]) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, deps);

  return scrollRef;
}
