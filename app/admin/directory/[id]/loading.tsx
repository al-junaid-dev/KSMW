export default function EmployeeProfileLoading() {
  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 pb-20 animate-pulse">
      
      {/* Back Link */}
      <div className="h-4 w-32 bg-gray-200 rounded mb-4"></div>
      
      {/* Profile Header Banner */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-gray-200"></div>
          <div className="space-y-2">
            <div className="h-7 w-48 bg-gray-200 rounded-md"></div>
            <div className="h-4 w-32 bg-gray-100 rounded-md"></div>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="h-16 w-28 bg-gray-50 rounded-xl border border-gray-100"></div>
          <div className="h-16 w-32 bg-gray-50 rounded-xl border border-gray-100"></div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-48">
          <div className="h-5 w-32 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-4"><div className="h-3 w-full bg-gray-100 rounded"></div><div className="h-3 w-full bg-gray-100 rounded"></div></div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-48 md:col-span-2">
          <div className="h-5 w-48 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-2 gap-4"><div className="h-10 bg-gray-50 rounded"></div><div className="h-10 bg-gray-50 rounded"></div></div>
        </div>
      </div>

      {/* Calendar Matrix Skeleton */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-slate-50 flex justify-between">
          <div className="h-6 w-48 bg-gray-200 rounded"></div>
          <div className="h-8 w-40 bg-gray-200 rounded-lg"></div>
        </div>
        <div className="p-6 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
          {Array.from({ length: 28 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl border border-gray-100 bg-gray-50"></div>
          ))}
        </div>
      </div>

    </div>
  )
}