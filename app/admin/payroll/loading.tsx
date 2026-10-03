export default function PayrollLoading() {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 pb-20 animate-pulse">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-8 w-56 bg-gray-200 rounded-md"></div>
        <div className="h-4 w-64 bg-gray-100 rounded-md"></div>
      </div>

      {/* Toolbar / Client Component Skeleton */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-6">
        {/* Top filter bar */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div className="flex gap-4">
            <div className="h-10 w-32 bg-gray-200 rounded-lg"></div>
            <div className="h-10 w-24 bg-gray-200 rounded-lg"></div>
          </div>
          <div className="h-10 w-40 bg-[#be9a62]/30 rounded-lg"></div>
        </div>
        
        {/* Table rows */}
        <div className="p-4 space-y-4">
          <div className="h-8 w-full bg-gray-100 rounded mb-4"></div>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex justify-between pb-4 border-b border-gray-50 last:border-0">
              <div className="h-5 w-1/4 bg-gray-200 rounded"></div>
              <div className="h-5 w-1/6 bg-gray-100 rounded"></div>
              <div className="h-5 w-1/6 bg-gray-100 rounded"></div>
              <div className="h-8 w-24 bg-gray-200 rounded-md"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}