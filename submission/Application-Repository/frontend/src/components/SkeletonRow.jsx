export default function SkeletonRow() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-bg-card border-b border-border">
      <div className="flex flex-col gap-3 flex-1 pr-4">
        <div className="flex items-center gap-3">
          <div className="h-5 w-48 rounded skeleton-shimmer" />
          <div className="h-4 w-16 rounded skeleton-shimmer" />
        </div>
        <div className="h-3 w-32 rounded skeleton-shimmer opacity-60" />
      </div>

      <div className="hidden md:flex flex-1 justify-center pr-4">
        <div className="h-3 w-24 rounded skeleton-shimmer opacity-40" />
      </div>

      <div className="mt-4 sm:mt-0 flex-shrink-0">
        <div className="h-6 w-20 rounded-full skeleton-shimmer opacity-80" />
      </div>
    </div>
  );
}
