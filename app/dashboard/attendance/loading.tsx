export default function EmployeeAttendanceLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-56 bg-gray-200 rounded-md" />
        <div className="h-4 w-72 bg-gray-100 rounded-md" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-gray-100 space-y-2">
            <div className="h-3 w-16 bg-gray-100 rounded" />
            <div className="h-6 w-10 bg-gray-200 rounded" />
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-5">
        <div className="flex justify-between items-center pb-4 border-b border-gray-100">
          <div className="h-6 w-40 bg-gray-200 rounded" />
          <div className="h-8 w-44 bg-gray-100 rounded-lg" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
          {Array.from({ length: 28 }).map((_, i) => (
            <div key={i} className="h-20 bg-gray-50 rounded-xl border border-gray-100" />
          ))}
        </div>
      </div>
    </div>
  )
}