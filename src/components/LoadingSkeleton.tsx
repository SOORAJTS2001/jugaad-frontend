import { Skeleton } from '@/components/ui/skeleton';

export const MessageSkeleton = () => (
  <div className="flex gap-3">
    <Skeleton className="h-8 w-8 rounded-full" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  </div>
);

export const RecipeSkeleton = () => (
  <div className="space-y-4 p-4 border rounded-lg">
    <div className="flex items-center gap-2">
      <Skeleton className="h-5 w-5 rounded" />
      <Skeleton className="h-6 w-48" />
    </div>
    <Skeleton className="h-4 w-full" />
    <div className="flex gap-4">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-4 w-24" />
    </div>
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-3 p-3 border rounded-lg">
          <Skeleton className="h-12 w-12 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const ProductSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="flex gap-3 p-3 border rounded-lg">
        <Skeleton className="h-16 w-16 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-8 w-full" />
        </div>
      </div>
    ))}
  </div>
);
