export default function AdminDashboardLoading() {
  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto pb-20 animate-pulse">
      
      {/* Header Skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-48 bg-gray-200 rounded-md"></div>
        <div className="h-4 w-64 bg-gray-100 rounded-md"></div>
      </div>

      {/* Shop Cards Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-64">
            <div className="bg-gray-50 p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="h-6 w-32 bg-gray-200 rounded-md"></div>
              <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
            </div>
            <div className="p-4 grid grid-cols-2 gap-4 flex-1">
              <div className="space-y-2"><div className="h-4 w-16 bg-gray-100 rounded"></div><div className="h-8 w-10 bg-gray-200 rounded"></div></div>
              <div className="space-y-2"><div className="h-4 w-16 bg-gray-100 rounded"></div><div className="h-8 w-10 bg-gray-200 rounded"></div></div>
              <div className="space-y-2 pt-3 border-t border-gray-100"><div className="h-4 w-16 bg-gray-100 rounded"></div><div className="h-8 w-10 bg-gray-200 rounded"></div></div>
              <div className="space-y-2 pt-3 border-t border-gray-100"><div className="h-4 w-16 bg-gray-100 rounded"></div><div className="h-8 w-10 bg-gray-200 rounded"></div></div>
            </div>
          </div>
        ))}
      </div>

      {/* Activity Feed Skeleton */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-8">
        <div className="p-6 border-b border-gray-100 bg-slate-50 flex gap-3">
          <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
          <div className="h-6 w-48 bg-gray-200 rounded-md"></div>
        </div>
        <div className="p-4 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex justify-between items-center pb-4 border-b border-gray-50 last:border-0 last:pb-0">
              <div className="h-4 w-32 bg-gray-200 rounded"></div>
              <div className="h-4 w-24 bg-gray-100 rounded"></div>
              <div className="h-4 w-20 bg-gray-100 rounded"></div>
              <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}