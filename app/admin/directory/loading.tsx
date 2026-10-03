export default function DirectoryLoading() {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 pb-20 animate-pulse">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-8 w-56 bg-gray-200 rounded-md"></div>
        <div className="h-4 w-80 bg-gray-100 rounded-md"></div>
      </div>

      {/* Directory Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="h-12 w-12 rounded-full bg-gray-200 shrink-0"></div>
              <div className="flex-1 space-y-2 mt-1">
                <div className="h-5 w-3/4 bg-gray-200 rounded"></div>
                <div className="h-3 w-1/2 bg-gray-100 rounded"></div>
              </div>
            </div>
            
            {/* Bottom Info Box */}
            <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
              <div className="space-y-2">
                <div className="h-3 w-16 bg-gray-200 rounded"></div>
                <div className="h-4 w-24 bg-gray-300 rounded"></div>
              </div>
              <div className="space-y-2">
                <div className="h-3 w-16 bg-gray-200 rounded"></div>
                <div className="h-4 w-24 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}