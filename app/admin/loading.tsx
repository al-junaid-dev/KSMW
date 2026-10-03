export default function AdminDashboardLoading() {
  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto pb-20 animate-pulse">
      
      {/* Header & Date Filter Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-56 bg-gray-200 rounded-md" />
          <div className="h-4 w-72 bg-gray-100 rounded-md" />
        </div>
        {/* Date Filter Box Skeleton */}
        <div className="h-10 w-64 bg-white border border-gray-200 rounded-xl shadow-xs" />
      </div>

      {/* Global Summary 4-KPI Metrics Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-gray-200 rounded-full" />
              <div className="h-3 w-20 bg-gray-200 rounded" />
            </div>
            <div className="h-8 w-16 bg-gray-300 rounded-md" />
            <div className="h-3 w-28 bg-gray-100 rounded" />
          </div>
        ))}
      </div>

      {/* Store Cards Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div 
            key={i} 
            className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden flex flex-col h-64"
          >
            {/* Store Card Header */}
            <div className="bg-gray-50/80 p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 bg-gray-200 rounded-md" />
                <div className="h-5 w-36 bg-gray-200 rounded" />
              </div>
              <div className="h-5 w-20 bg-gray-200 rounded-full" />
            </div>

            {/* Attendance 2x2 Grid */}
            <div className="p-4 grid grid-cols-2 gap-4 flex-1">
              <div className="space-y-1.5">
                <div className="h-3.5 w-16 bg-gray-100 rounded" />
                <div className="h-6 w-12 bg-gray-200 rounded" />
              </div>
              <div className="space-y-1.5">
                <div className="h-3.5 w-16 bg-gray-100 rounded" />
                <div className="h-6 w-8 bg-gray-200 rounded" />
              </div>
              <div className="space-y-1.5 pt-3 border-t border-gray-100">
                <div className="h-3.5 w-14 bg-gray-100 rounded" />
                <div className="h-5 w-8 bg-gray-200 rounded" />
              </div>
              <div className="space-y-1.5 pt-3 border-t border-gray-100">
                <div className="h-3.5 w-16 bg-gray-100 rounded" />
                <div className="h-5 w-8 bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Master Activity Feed Skeleton */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden mt-8">
        {/* Table Header */}
        <div className="p-6 border-b border-gray-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-5 w-5 bg-gray-200 rounded-full" />
            <div className="h-5 w-52 bg-gray-200 rounded" />
          </div>
          <div className="h-6 w-24 bg-gray-200 rounded-full" />
        </div>

        {/* Table Rows */}
        <div className="p-4 divide-y divide-gray-50">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="py-3.5 flex items-center justify-between gap-4">
              <div className="h-4 w-32 bg-gray-200 rounded" />
              <div className="h-5 w-28 bg-gray-100 rounded-md" />
              <div className="h-4 w-20 bg-gray-100 rounded" />
              <div className="h-4 w-16 bg-gray-100 rounded" />
              <div className="h-4 w-16 bg-gray-100 rounded" />
              <div className="h-5 w-20 bg-gray-200 rounded-full" />
            </div>
          ))}
        </div>

        {/* Load More Button Placeholder */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-center">
          <div className="h-9 w-36 bg-gray-200 rounded-xl" />
        </div>
      </div>

    </div>
  )
}