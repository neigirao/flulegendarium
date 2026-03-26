import { Skeleton } from '@/components/ui/skeleton';

export const GameSkeleton = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header: timer + score */}
      <div className="flex items-center justify-between">
        <Skeleton className="w-[88px] h-[88px] rounded-full" />
        <div className="space-y-2 text-right">
          <Skeleton className="h-5 w-24 ml-auto" />
          <Skeleton className="h-4 w-16 ml-auto" />
        </div>
      </div>

      {/* Player/jersey image */}
      <Skeleton className="w-full h-[350px] md:h-[450px] rounded-lg" />

      {/* Input / options area */}
      <div className="space-y-3">
        <Skeleton className="h-12 w-full rounded-lg" />
        <div className="flex gap-2">
          <Skeleton className="h-10 flex-1 rounded-lg" />
          <Skeleton className="h-10 w-20 rounded-lg" />
        </div>
      </div>

      {/* Hint area */}
      <Skeleton className="h-8 w-3/4 mx-auto rounded" />
    </div>
  );
};
