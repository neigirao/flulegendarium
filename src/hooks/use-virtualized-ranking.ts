
import { useState, useEffect } from 'react';

interface RankingItem {
  id: string;
  player_name: string;
  score: number;
  games_played: number;
  user_id: string | null;
  created_at: string;
}

interface VirtualizedRankingItem extends RankingItem {
  index: number;
}

export function useVirtualizedRanking(items: VirtualizedRankingItem[], itemHeight: number = 60) {
  const [visibleItems, setVisibleItems] = useState<VirtualizedRankingItem[]>([]);
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
