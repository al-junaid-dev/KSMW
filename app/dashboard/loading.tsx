export default function DashboardLoading() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 animate-pulse">
      
      {/* Header Skeleton */}
      <header className="bg-white rounded-xl shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-gray-100">
        <div className="space-y-2">
          {/* Welcome Title */}
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-[#be9a62]/30 shrink-0" />
            <div className="h-7 w-56 bg-gray-200 rounded-md" />
          </div>
          {/* Shop Location */}
          <div className="flex items-center gap-1.5 pt-1">
            <div className="h-4 w-4 rounded-full bg-gray-200 shrink-0" />
            <div className="h-4 w-36 bg-gray-100 rounded" />
          </div>
        </div>
      </header>

      {/* TimeClockManager Card Skeleton */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="space-y-1">
            <div className="h-4 w-28 bg-gray-200 rounded" />
            <div className="h-3 w-40 bg-gray-100 rounded" />
          </div>
          <div className="h-6 w-24 bg-gray-100 rounded-full" />
        </div>

        {/* Live Timer Display Skeleton */}
        <div className="py-6 flex flex-col items-center justify-center space-y-2 bg-gray-50/80 rounded-xl border border-gray-100">
          <div className="h-3 w-20 bg-gray-200 rounded" />
          <div className="h-10 w-44 bg-gray-300 rounded-lg" />
        </div>

        {/* Action Button Skeleton */}
        <div className="h-13 w-full bg-[#be9a62]/30 rounded-xl" />
      </div>

      {/* ShiftHistoryList Skeleton */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-slate-50 flex items-center justify-between">
          <div className="h-5 w-36 bg-gray-200 rounded" />
          <div className="h-4 w-20 bg-gray-100 rounded" />
        </div>

        <div className="divide-y divide-gray-100">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-4 flex items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="h-4 w-28 bg-gray-200 rounded" />
                <div className="h-3 w-40 bg-gray-100 rounded" />
              </div>
              <div className="flex items-center gap-3">
                <div className="h-4 w-16 bg-gray-100 rounded" />
                <div className="h-6 w-20 bg-gray-200 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}