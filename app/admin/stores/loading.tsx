export default function AdminStoresLoading() {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-20 animate-pulse">
      
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-56 bg-gray-200 rounded-md" />
          <div className="h-4 w-80 bg-gray-100 rounded-md" />
        </div>
        <div className="h-10 w-32 bg-gray-200 rounded-xl" />
      </div>

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-2">
            <div className="h-3 w-20 bg-gray-200 rounded" />
            <div className="h-7 w-14 bg-gray-300 rounded" />
            <div className="h-3 w-28 bg-gray-100 rounded" />
          </div>
        ))}
      </div>

      {/* Staff Store Allocation Manager Skeleton */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden space-y-4">
        <div className="p-6 border-b border-gray-100 bg-slate-50 flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-5 w-48 bg-gray-200 rounded" />
            <div className="h-3 w-64 bg-gray-100 rounded" />
          </div>
          <div className="flex gap-2">
            <div className="h-8 w-40 bg-gray-200 rounded-xl" />
            <div className="h-8 w-32 bg-gray-200 rounded-xl" />
          </div>
        </div>

        <div className="p-4 divide-y divide-gray-50">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-gray-200 shrink-0" />
                <div className="space-y-1.5">
                  <div className="h-4 w-32 bg-gray-200 rounded" />
                  <div className="h-3 w-16 bg-gray-100 rounded" />
                </div>
              </div>
              <div className="h-4 w-24 bg-gray-100 rounded" />
              <div className="h-6 w-28 bg-gray-100 rounded-full" />
              <div className="h-8 w-32 bg-gray-200 rounded-lg" />
            </div>
          ))}
        </div>
      </div>

      {/* Stores Section Header */}
      <div className="h-6 w-48 bg-gray-200 rounded" />

      {/* Stores Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col justify-between h-96">
            <div className="bg-[#132322] p-5 flex justify-between items-center">
              <div className="space-y-2">
                <div className="h-5 w-32 bg-white/20 rounded" />
                <div className="h-3 w-24 bg-white/10 rounded" />
              </div>
              <div className="h-6 w-20 bg-white/10 rounded-full" />
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="h-16 bg-gray-50 rounded-xl" />
                <div className="h-16 bg-gray-50 rounded-xl" />
                <div className="h-16 bg-gray-50 rounded-xl" />
                <div className="h-16 bg-gray-50 rounded-xl" />
              </div>
              <div className="h-4 w-full bg-gray-100 rounded" />
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100">
              <div className="h-10 w-full bg-gray-200 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}