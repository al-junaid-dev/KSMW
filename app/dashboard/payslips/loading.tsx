export default function PayslipsLoading() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 animate-pulse">
      
      {/* Header Skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-48 bg-gray-200 rounded-md" />
        <div className="h-4 w-72 bg-gray-100 rounded-md" />
      </div>

      {/* Payslip List Skeleton */}
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div 
            key={i} 
            className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            {/* Left Details */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-5 w-32 bg-gray-200 rounded" />
                <div className="h-5 w-16 bg-green-100 rounded-full" />
              </div>
              <div className="h-3.5 w-48 bg-gray-100 rounded" />
              <div className="h-3.5 w-36 bg-gray-100 rounded" />
            </div>

            {/* Right Financial & Download Action */}
            <div className="flex items-center justify-between sm:justify-end gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100">
              <div className="sm:text-right space-y-1">
                <div className="h-3 w-16 bg-gray-100 rounded sm:ml-auto" />
                <div className="h-6 w-24 bg-gray-200 rounded" />
              </div>
              <div className="h-10 w-28 bg-[#be9a62]/20 rounded-xl shrink-0" />
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}