
import { useState, useEffect } from 'react';

interface VirtualizedItem {
  id: string;
  index: number;
  player_name: string;
  score: number;
}

export function useVirtualizedRanking(items: VirtualizedItem[], itemHeight: number = 60) {
  const [visibleItems, setVisibleItems] = useState<VirtualizedItem[]>([]);
  const [scrollTop, setScrollTop] = useState(0);

  useEffect(() => {
    const handleScroll = (event: Event) => {
      const target = event.target as HTMLElement;
      if (!target) return;
      
      setScrollTop(target.scrollTop);
    };

    const container = document.querySelector('.ranking-container');
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  useEffect(() => {
    const visibleCount = Math.ceil(window.innerHeight / itemHeight) + 2;
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(startIndex + visibleCount, items.length);

    setVisibleItems(
      items.slice(startIndex, endIndex).map((item, idx) => ({
        ...item,
        index: startIndex + idx
      }))
    );
  }, [items, scrollTop, itemHeight]);

  return {
    visibleItems,
    totalHeight: items.length * itemHeight,
    offset: Math.floor(scrollTop / itemHeight) * itemHeight
  };
}
