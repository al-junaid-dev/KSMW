export default function StoreDetailsLoading() {
  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 pb-20 animate-pulse">
      
      {/* Navigation & Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="space-y-3">
          {/* Back link */}
          <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
          {/* Store Name */}
          <div className="h-8 w-64 bg-gray-200 rounded"></div>
          {/* Location */}
          <div className="h-4 w-48 bg-gray-100 rounded"></div>
        </div>
        
        {/* Quick Shop Stats Skeleton */}
        <div className="flex gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white px-4 py-3 rounded-lg border border-gray-100 shadow-sm flex flex-col items-center justify-center min-w-[80px] space-y-2">
              <div className="h-3 w-12 bg-gray-100 rounded"></div>
              <div className="h-6 w-8 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Staff Status List Skeleton */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Card Header */}
        <div className="p-4 border-b border-gray-100 bg-slate-50">
          <div className="h-5 w-48 bg-gray-200 rounded"></div>
        </div>
        
        {/* Roster Rows */}
        <div className="divide-y divide-gray-50">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              
              {/* Employee Info */}
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-200 shrink-0"></div>
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-gray-200 rounded"></div>
                  <div className="h-3 w-40 bg-gray-100 rounded"></div>
                </div>
              </div>

              {/* Status Badge & Timing */}
              <div className="flex flex-col sm:items-end gap-2">
                <div className="h-6 w-32 bg-gray-200 rounded-full"></div>
                <div className="h-3 w-36 bg-gray-100 rounded"></div>
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  )
}