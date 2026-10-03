'use client'

import { useState } from 'react'
import { 
  Activity, 
  Store, 
  Loader2, 
  ChevronDown, 
  Pencil, 
  Trash2, 
  X, 
  AlertTriangle, 
  Clock 
} from 'lucide-react'
import { fetchMoreActivityLogs, updateTimeLog, deleteTimeLog } from './actions'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface ActivityFeedProps {
  initialLogs: any[]
  filterDate?: string
}

export default function ActivityFeedClient({ initialLogs, filterDate }: ActivityFeedProps) {
  const router = useRouter()
  const [logs, setLogs] = useState<any[]>(initialLogs)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(initialLogs.length >= 20)

  // Edit State
  const [editingLog, setEditingLog] = useState<any | null>(null)
  const [editClockIn, setEditClockIn] = useState('')
  const [editClockOut, setEditClockOut] = useState('')
  const [editStatus, setEditStatus] = useState('On Time')
  const [showEditConfirm, setShowEditConfirm] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Delete State
  const [deletingLog, setDeletingLog] = useState<any | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Format UTC string into local `YYYY-MM-DDTHH:mm` format for input
  const formatForInput = (isoStr: string | null) => {
    if (!isoStr) return ''
    const d = new Date(isoStr)
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
  }

  const openEditModal = (log: any) => {
    setEditingLog(log)
    setEditClockIn(formatForInput(log.clock_in_time))
    setEditClockOut(formatForInput(log.clock_out_time))
    setEditStatus(log.status || 'On Time')
    setShowEditConfirm(false)
  }

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

  async function handleConfirmEdit() {
    if (!editingLog) return
    setIsSaving(true)

    const formData = new FormData()
    formData.append('clock_in_time', editClockIn)
    formData.append('clock_out_time', editClockOut)
    formData.append('status', editStatus)

    const res = await updateTimeLog(editingLog.id, formData)

    if (res?.error) {
      toast.error(res.error)
      setIsSaving(false)
      return
    }

    toast.success('Attendance log updated successfully!')
    setLogs((prev) =>
      prev.map((item) =>
        item.id === editingLog.id
          ? {
              ...item,
              clock_in_time: new Date(editClockIn).toISOString(),
              clock_out_time: editClockOut ? new Date(editClockOut).toISOString() : null,
              status: editStatus,
            }
          : item
      )
    )
    setIsSaving(false)
    setEditingLog(null)
    router.refresh()
  }

  async function handleConfirmDelete() {
    if (!deletingLog) return
    setIsDeleting(true)

    const res = await deleteTimeLog(deletingLog.id)

    if (res?.error) {
      toast.error(res.error)
      setIsDeleting(false)
      return
    }

    toast.success('Attendance record deleted.')
    setLogs((prev) => prev.filter((item) => item.id !== deletingLog.id))
    setIsDeleting(false)
    setDeletingLog(null)
    router.refresh()
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
          Showing {logs.length} logs {filterDate ? `for ${filterDate}` : 'for today'}
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
              <th className="p-4 whitespace-nowrap text-right">Actions</th>
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
                    <td className="p-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(log)}
                          className="p-1.5 text-gray-500 hover:text-[#be9a62] hover:bg-[#be9a62]/10 rounded-lg transition-colors cursor-pointer"
                          title="Edit Log"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeletingLog(log)}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Log"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-500">
                  No activity found for this date.
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
                <span>Fetching older logs...</span>
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

      {/* ================= EDIT MODAL ================= */}
      {editingLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#132322] border border-[#4f4931]/60 rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-white space-y-5">
            <div className="flex items-center justify-between border-b border-[#4f4931]/40 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-lg bg-[#be9a62]/10 border border-[#be9a62]/30 flex items-center justify-center text-[#be9a62]">
                  <Pencil className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Edit Shift Record</h3>
                  <p className="text-xs text-[#b09a77]">
                    {Array.isArray(editingLog.profiles) ? editingLog.profiles[0]?.full_name : editingLog.profiles?.full_name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingLog(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {!showEditConfirm ? (
              <form onSubmit={(e) => { e.preventDefault(); setShowEditConfirm(true) }} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#b09a77]">
                    Clock In Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={editClockIn}
                    onChange={(e) => setEditClockIn(e.target.value)}
                    className="w-full bg-[#192115] border border-[#4f4931]/60 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#be9a62]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#b09a77]">
                    Clock Out Time (Leave blank if currently Active)
                  </label>
                  <input
                    type="datetime-local"
                    value={editClockOut}
                    onChange={(e) => setEditClockOut(e.target.value)}
                    className="w-full bg-[#192115] border border-[#4f4931]/60 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#be9a62]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#b09a77]">
                    Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full bg-[#192115] border border-[#4f4931]/60 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#be9a62] cursor-pointer"
                  >
                    <option value="On Time">On Time</option>
                    <option value="Late">Late</option>
                    <option value="Early Leave">Early Leave</option>
                    <option value="Half Day">Half Day</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#4f4931]/40">
                  <button
                    type="button"
                    onClick={() => setEditingLog(null)}
                    className="px-4 py-2 text-xs font-medium text-gray-300 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-[#be9a62] hover:bg-[#b79c68] text-[#132322] font-semibold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer"
                  >
                    Review Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 py-2">
                <div className="bg-[#192115] p-4 rounded-xl border border-[#4f4931]/60 space-y-2 text-xs">
                  <p className="text-gray-300 font-medium">Please confirm these adjustments:</p>
                  <div className="text-[#b09a77] space-y-1">
                    <p><strong className="text-white">Clock In:</strong> {new Date(editClockIn).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
                    <p><strong className="text-white">Clock Out:</strong> {editClockOut ? new Date(editClockOut).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : 'None (Active)'}</p>
                    <p><strong className="text-white">Status:</strong> {editStatus}</p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowEditConfirm(false)}
                    disabled={isSaving}
                    className="px-4 py-2 text-xs font-medium text-gray-300 hover:text-white transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmEdit}
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 bg-[#be9a62] hover:bg-[#b79c68] text-[#132322] font-semibold text-xs px-4 py-2 rounded-xl transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Confirm & Save</span>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= DELETE CONFIRMATION MODAL ================= */}
      {deletingLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#132322] border border-red-500/40 rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-white space-y-5">
            <div className="flex items-center justify-between border-b border-[#4f4931]/40 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                  <Trash2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Delete Attendance Record</h3>
                  <p className="text-xs text-red-300 font-medium">Permanent action warning</p>
                </div>
              </div>
              <button
                onClick={() => setDeletingLog(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl space-y-2 text-xs">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>Caution: Irreversible Ledger Adjustment</span>
              </div>
              <p className="text-amber-200/90 leading-relaxed">
                You are about to permanently delete this shift log for{' '}
                <strong className="text-white">
                  {Array.isArray(deletingLog.profiles) ? deletingLog.profiles[0]?.full_name : deletingLog.profiles?.full_name}
                </strong>. This will recalculate the day's attendance metrics and could impact monthly payroll calculations.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#4f4931]/40">
              <button
                type="button"
                onClick={() => setDeletingLog(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-medium text-gray-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all disabled:opacity-50 cursor-pointer shadow-md"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Yes, Delete Log</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}