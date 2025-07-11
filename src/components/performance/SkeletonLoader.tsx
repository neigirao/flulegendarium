import { memo } from 'react';

interface SkeletonLoaderProps {
  className?: string;
  rows?: number;
  type?: 'card' | 'list' | 'ranking';
}

export const SkeletonLoader = memo(({ 
  className = "", 
  rows = 5, 
  type = 'list' 
}: SkeletonLoaderProps) => {
  if (type === 'ranking') {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-6 shadow-lg animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div>
                  <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
              <div className="text-right">
                <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-8"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'card') {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg p-6 shadow animate-pulse">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow animate-pulse">
          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="h-4 bg-gray-200 rounded w-20"></div>
        </div>
      ))}
    </div>
  );
});

SkeletonLoader.displayName = 'SkeletonLoader';