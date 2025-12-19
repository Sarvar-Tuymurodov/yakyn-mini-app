interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-[#404040] rounded ${className}`}
    />
  );
}

export function ContactCardSkeleton() {
  return (
    <div className="bg-white dark:bg-[#2d2d2d] rounded-xl p-4 border border-gray-100 dark:border-[#404040]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          {/* Status indicator */}
          <Skeleton className="w-2.5 h-2.5 rounded-full flex-shrink-0" />
          {/* Name */}
          <Skeleton className="h-5 w-32" />
        </div>
        {/* Action button */}
        <Skeleton className="w-9 h-9 rounded-full" />
      </div>
    </div>
  );
}

export function ContactListSkeleton() {
  return (
    <div className="space-y-5">
      {/* Section header skeleton */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-5 w-6 rounded-full" />
        </div>
        <div className="space-y-2">
          <ContactCardSkeleton />
          <ContactCardSkeleton />
        </div>
      </div>

      {/* Second section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-5 w-6 rounded-full" />
        </div>
        <div className="space-y-2">
          <ContactCardSkeleton />
        </div>
      </div>

      {/* Third section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-6 rounded-full" />
        </div>
        <div className="space-y-2">
          <ContactCardSkeleton />
          <ContactCardSkeleton />
          <ContactCardSkeleton />
        </div>
      </div>
    </div>
  );
}

export function ContactDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Info card skeleton */}
      <div className="bg-white dark:bg-[#2d2d2d] rounded-xl p-4 border border-gray-100 dark:border-[#404040] space-y-3">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>

      {/* Notes skeleton */}
      <div className="bg-white dark:bg-[#2d2d2d] rounded-xl p-4 border border-gray-100 dark:border-[#404040]">
        <Skeleton className="h-4 w-20 mb-3" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4" />
      </div>

      {/* AI button skeleton */}
      <Skeleton className="h-12 w-full rounded-xl" />

      {/* Frequency selection skeleton */}
      <div>
        <Skeleton className="h-4 w-24 mb-2" />
        <div className="grid grid-cols-2 gap-2">
          <Skeleton className="h-12 rounded-xl" />
          <Skeleton className="h-12 rounded-xl" />
          <Skeleton className="h-12 rounded-xl" />
          <Skeleton className="h-12 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
