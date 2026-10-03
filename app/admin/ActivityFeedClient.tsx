'use client'

import { useState } from 'react'
import { Activity, Store, Loader2, ChevronDown } from 'lucide-react'
import { fetchMoreActivityLogs } from './actions'
import toast from 'react-hot-toast'

interface ActivityFeedProps {
  initialLogs: any[]
  filterDate?: string
}

export default function ActivityFeedClient({ initialLogs, filterDate }: ActivityFeedProps) {
  const [logs, setLogs] = useState<any[]>(initialLogs)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(initialLogs.length >= 20)

  async function handleLoadMore() {
    setIsLoadingMore(true)
    const nextOffset = logs.length
    const result = await fetchMoreActivityLogs(nextOffset, 20, filterDate)

    if (result.error) {
      toast.error('Failed to load older activity logs')
      setIsLoadingMore(false)
      return
    }

    if (!result.logs || result.logs.length < 20) {
      setHasMore(false)
    }

    setLogs((prev) => [...prev, ...(result.logs || [])])
    setIsLoadingMore(false)
  }

  return (
    <div className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden mt-8">
      {/* Table Header */}
      <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">Organization Activity Feed</h2>
        </div>
        <span className="text-xs font-medium text-gray-500 bg-white border border-gray-200 px-2.5 py-1 rounded-full">
          Showing {logs.length} logs
        </span>
      </div>
      
      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white border-b border-gray-100 text-sm font-medium text-gray-500">
              <th className="p-4 whitespace-nowrap">Employee</th>
              <th className="p-4 whitespace-nowrap">Store</th>
              <th className="p-4 whitespace-nowrap">Date</th>
              <th className="p-4 whitespace-nowrap">Time In</th>
              <th className="p-4 whitespace-nowrap">Time Out</th>
              <th className="p-4 whitespace-nowrap">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {logs && logs.length > 0 ? (
              logs.map((log) => {
                const isActive = !log.clock_out_time
                const profile = Array.isArray(log.profiles) ? log.profiles[0] : log.profiles
                const shop = profile?.shops ? (Array.isArray(profile.shops) ? profile.shops[0] : profile.shops) : null

                return (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium text-gray-900 whitespace-nowrap">
                      {profile?.full_name || 'Unknown User'}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                        <Store className="h-3.5 w-3.5" />
                        {shop?.name || 'Unassigned'}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600 whitespace-nowrap">
                      {new Date(log.clock_in_time).toLocaleDateString('en-IN', { 
                        timeZone: 'Asia/Kolkata', 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="p-4 text-gray-600 whitespace-nowrap">
                      {new Date(log.clock_in_time).toLocaleTimeString('en-IN', { 
                        timeZone: 'Asia/Kolkata', 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </td>
                    <td className="p-4 text-gray-600 whitespace-nowrap">
                      {isActive ? (
                        <span className="text-blue-600 font-medium flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                          Active Now
                        </span>
                      ) : (
                        new Date(log.clock_out_time).toLocaleTimeString('en-IN', { 
                          timeZone: 'Asia/Kolkata', 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })
                      )}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        log.status === 'On Time' ? 'bg-green-100 text-green-700' :
                        log.status === 'Late' ? 'bg-red-100 text-red-700' :
                        log.status === 'Early Leave' ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {log.status || (isActive ? 'Active' : 'Completed')}
                      </span>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">
                  No activity found for this period.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* On-Demand Load More Footer */}
      {hasMore && (
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-center">
          <button
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-white border border-gray-200 text-gray-800 hover:border-[#be9a62] hover:text-[#be9a62] shadow-2xs transition-all disabled:opacity-60 cursor-pointer"
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-[#be9a62]" />
                <span>Fetching previous logs...</span>
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                <span>Load More Logs</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}