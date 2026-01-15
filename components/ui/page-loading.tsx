import { Skeleton } from './skeleton'

interface PageLoadingProps {
  title?: boolean
  filters?: boolean
  cards?: number
  table?: number
}

export function PageLoading({
  title = true,
  filters = false,
  cards = 0,
  table = 0,
}: PageLoadingProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {title && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
          <Skeleton className="h-10 w-28" />
        </div>
      )}

      {filters && (
        <div className="flex flex-col sm:flex-row gap-3">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-[140px]" />
          <Skeleton className="h-10 w-[130px]" />
        </div>
      )}

      {cards > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: cards }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      )}

      {table > 0 && (
        <div className="rounded-xl border overflow-hidden">
          <div className="bg-muted/50 px-4 py-3">
            <div className="flex gap-8">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
          <div className="divide-y">
            {Array.from({ length: table }).map((_, i) => (
              <div key={i} className="px-4 py-4 flex items-center gap-4">
                <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
