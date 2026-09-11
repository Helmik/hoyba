export default function EventCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-brand-border bg-brand-surface/80 shadow-md animate-pulse">
      {/* 16:9 Image Placeholder */}
      <div className="relative aspect-[16/9] w-full bg-brand-border/60">
        <div className="absolute left-3 top-3 h-5 w-20 rounded-xl bg-brand-border" />
        <div className="absolute right-3 top-3 h-5 w-14 rounded-xl bg-brand-border" />
      </div>

      {/* Content Skeleton */}
      <div className="flex flex-1 flex-col p-4 sm:p-5 space-y-3">
        <div className="flex justify-between items-center">
          <div className="h-4 w-16 rounded bg-brand-border/60" />
          <div className="h-4 w-28 rounded bg-brand-border/60" />
        </div>

        <div className="space-y-1.5 pt-1">
          <div className="h-4 w-full rounded bg-brand-border/60" />
          <div className="h-4 w-3/4 rounded bg-brand-border/60" />
        </div>

        <div className="pt-3 mt-auto">
          <div className="h-12 w-full rounded-xl bg-brand-border/60" />
        </div>
      </div>
    </div>
  );
}
