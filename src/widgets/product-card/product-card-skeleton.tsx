export function ProductCardSkeleton() {
  return (
    <div className="flex h-full flex-col rounded-xl bg-surface overflow-hidden shadow-sm">
      <div className="aspect-[4/3] animate-pulse bg-surface/60" />
      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="h-2 w-14 animate-pulse rounded bg-surface/60" />
        <div className="space-y-1.5">
          <div className="h-3 w-full animate-pulse rounded bg-surface/60" />
          <div className="h-3 w-3/4 animate-pulse rounded bg-surface/60" />
        </div>
        <div className="mt-auto space-y-2">
          <div className="h-5 w-20 animate-pulse rounded bg-surface/60" />
          <div className="space-y-1">
            <div className="h-2.5 w-full animate-pulse rounded bg-surface/60" />
            <div className="h-2.5 w-4/5 animate-pulse rounded bg-surface/60" />
            <div className="h-2.5 w-3/5 animate-pulse rounded bg-surface/60" />
          </div>
        </div>
      </div>
    </div>
  )
}
