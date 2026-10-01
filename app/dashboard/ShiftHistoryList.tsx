'use client'

import { useState } from 'react'
import { fetchMoreShifts } from './actions' // or wherever your action is placed
import { History } from 'lucide-react'

export default function ShiftHistoryList({ initialShifts, employeeId }: { initialShifts: any[], employeeId: string }) {
  const [shifts, setShifts] = useState(initialShifts)
  const [offset, setOffset] = useState(7) // start after the initial 7
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(initialShifts.length >= 7)

  const handleLoadMore = async () => {
    try {
      setLoading(true)
      const moreShifts = await fetchMoreShifts(employeeId, offset, 7)
      
      if (moreShifts.length < 7) {
        setHasMore(false)
      }

      setShifts((prev: any) => [...prev, ...moreShifts])
      setOffset((prev) => prev + 7)
    } catch (error) {
      console.error('Failed to load more shifts', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
      <div className="p-6 border-b border-gray-100 flex items-center gap-2 bg-slate-50">
        <History className="h-5 w-5 text-gray-500" />
        <h3 className="text-lg font-semibold text-gray-900">Recent Shifts</h3>
      </div>
      
      <div className="divide-y divide-gray-50">
        {shifts && shifts.length > 0 ? (
          shifts.map((log) => (
            <div key={log.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="font-medium text-gray-900 flex items-center gap-2">
                  {new Date(log.clock_in_time).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium' })}
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    log.status === 'On Time' ? 'bg-green-100 text-green-700' :
                    log.status === 'Late' ? 'bg-red-100 text-red-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    {log.status}
                  </span>
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(log.clock_in_time).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })} 
                  {' '}—{' '} 
                  {new Date(log.clock_out_time).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })}
                </p>
                {log.remarks && <p className="text-xs text-gray-400 mt-1">{log.remarks}</p>}
              </div>
              <div className="text-right">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700">
                  {log.total_hours} hrs
                </span>
              </div>
            </div>
          ))
        ) : (
          <p className="p-6 text-center text-gray-500 text-sm">No recent shifts found.</p>
        )}
      </div>

      {hasMore && (
        <div className="p-4 bg-slate-50 border-t border-gray-100 text-center">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Loading older shifts...' : 'Load More Shifts'}
          </button>
        </div>
      )}
    </div>
  )
}