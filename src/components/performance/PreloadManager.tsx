
import { useEffect } from 'react';

interface PreloadManagerProps {
  resources: Array<{
    href: string;
    as: 'image' | 'font' | 'script' | 'style';
    type?: string;
    crossOrigin?: 'anonymous' | 'use-credentials';
    priority?: 'high' | 'low';
  }>;
}

export const PreloadManager = ({ resources }: PreloadManagerProps) => {
  useEffect(() => {
    const links: HTMLLinkElement[] = [];

    resources.forEach(({ href, as, type, crossOrigin, priority }) => {
      // Avoid duplicate preloads
      const existing = document.querySelector(`link[href="${href}"]`);
      if (existing) return;

      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = href;
      link.as = as;
      
      if (type) link.type = type;
      if (crossOrigin) link.crossOrigin = crossOrigin;
      if (priority && 'fetchPriority' in link) {
        (link as any).fetchPriority = priority;
      }

      document.head.appendChild(link);
      links.push(link);
    });

    return () => {
      links.forEach(link => {
        if (document.head.contains(link)) {
          document.head.removeChild(link);
        }
      });
    };
  }, [resources]);

  return null;
};
