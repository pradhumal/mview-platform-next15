import { Skeleton } from "@/components/ui/skeleton";

export function CardSkeleton() {
  return (
    <div className="calm-card">
      <div className="flex items-start gap-4">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    </div>
  );
}

export function MineralCardSkeleton() {
  return (
    <div className="calm-card">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <div className="flex items-center gap-1.5">
            <Skeleton className="w-3.5 h-3.5 rounded" />
            <Skeleton className="h-4 w-28" />
          </div>
          <Skeleton className="h-4 w-36" />
        </div>
        <Skeleton className="w-5 h-5" />
      </div>
    </div>
  );
}

export function ActivityCardSkeleton() {
  return (
    <div className="timeline-item">
      <div className="timeline-dot">
        <Skeleton className="w-4 h-4 rounded-full" />
      </div>
      <div className="calm-card">
        <div className="flex items-start justify-between gap-3 mb-3">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4 mb-3" />
        <div className="flex items-center gap-1.5 mb-4">
          <Skeleton className="w-3 h-3" />
          <Skeleton className="h-3 w-32" />
        </div>
        <div className="flex items-center gap-4 pt-3 border-t border-border/50">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </div>
  );
}

export function HomeSkeleton() {
  return (
    <div className="px-5 py-8 md:px-8 md:py-12 space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-64" />
      </div>
      <CardSkeleton />
      <CardSkeleton />
      <div className="space-y-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    </div>
  );
}
