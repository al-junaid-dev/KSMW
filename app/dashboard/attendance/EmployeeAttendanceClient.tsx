'use client'

import { useState, useTransition } from 'react'
import { 
  Calendar, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Coffee, 
  CalendarCheck, 
  CalendarDays, 
  Loader2,
  Sparkles,
  AlertCircle,
  X,
  ArrowRight
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import toast, { Toaster } from 'react-hot-toast'

interface CalendarDayItem {
  dayNum: number
  dayName: string
  dateStr: string
  status: string
  badgeColor: string
  log: any
  isBeforeJoining: boolean
  isJoiningDate: boolean
  isFuture: boolean
  isToday: boolean
}

interface EmployeeAttendanceClientProps {
  daysArray: CalendarDayItem[]
  currentMonth: number
  currentYear: number
  joiningYear: number
  joiningMonth: number
  formattedJoiningDate: string
  redirectedFromPreJoining?: boolean
}

// Deterministic static month arrays — guarantees 100% hydration match across all locales
const MONTH_NAMES_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
]

const MONTH_NAMES_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export default function EmployeeAttendanceClient({
  daysArray,
  currentMonth,
  currentYear,
  joiningYear,
  joiningMonth,
  formattedJoiningDate,
  redirectedFromPreJoining = false,
}: EmployeeAttendanceClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Selectors State
  const [selectedMonth, setSelectedMonth] = useState(currentMonth)
  const [selectedYear, setSelectedYear] = useState(currentYear)

  // Toggle state to reveal joining date in place in the legend
  const [showLegendJoiningDate, setShowLegendJoiningDate] = useState(false)

  // Prominent On-Screen Alert State
  const [alertBannerText, setAlertBannerText] = useState<string | null>(
    redirectedFromPreJoining
      ? `Notice: You cannot access attendance records prior to your joining date (${formattedJoiningDate}). The calendar has been automatically redirected to your joining month.`
      : null
  )

  // Pre-joining Modal Popup State
  const [modalDetails, setModalDetails] = useState<{ title: string; message: string } | null>(null)

  // Available Years
  const currentSystemYear = new Date().getFullYear()
  const maxYear = Math.max(currentSystemYear + 1, joiningYear + 1)
  const availableYears: number[] = []
  for (let y = Math.min(joiningYear, currentSystemYear - 1); y <= maxYear; y++) {
    availableYears.push(y)
  }

  const allMonths = Array.from({ length: 12 }, (_, i) => i + 1)

  // Manual Fetch with Direct Redirection & Error Interception
  function handleFetch() {
    const isPreJoining = 
      selectedYear < joiningYear || 
      (selectedYear === joiningYear && selectedMonth < joiningMonth)

    if (isPreJoining) {
      const attemptedMonthName = `${MONTH_NAMES_LONG[selectedMonth - 1]} ${selectedYear}`
      const errorMsg = `Access Restricted: You cannot view records for ${attemptedMonthName}. Your official start date is ${formattedJoiningDate}. Redirecting you to your joining date...`

      // 1. Show Error Banner & Toast
      setAlertBannerText(errorMsg)
      toast.error(`Cannot view records before joining date (${formattedJoiningDate}).`, { duration: 5000 })

      // 2. Open Explanation Dialog
      setModalDetails({
        title: 'Pre-Employment Period Restricted',
        message: `You selected ${attemptedMonthName}. Since your employment officially began on ${formattedJoiningDate}, no work logs or shift history exist before this period.\n\nThe system has redirected your calendar to your official joining month.`
      })

      // 3. Automatically snap/redirect dropdowns and router to Joining Date
      setSelectedYear(joiningYear)
      setSelectedMonth(joiningMonth)

      startTransition(() => {
        router.push(`/dashboard/attendance?month=${joiningMonth}&year=${joiningYear}`)
      })
      return
    }

    // Normal valid fetch
    setAlertBannerText(null)
    startTransition(() => {
      router.push(`/dashboard/attendance?month=${selectedMonth}&year=${selectedYear}`)
    })
  }

  // Handle Day Card Click
  function handleDayClick(item: CalendarDayItem) {
    if (item.isBeforeJoining) {
      setModalDetails({
        title: 'Pre-Employment Date',
        message: `Date: ${item.dateStr} (${item.dayName})\n\nThis date is prior to your official joining date (${formattedJoiningDate}). Attendance was not recorded because your employment with the store had not commenced yet.`
      })
      toast.error(`Not employed on this date (Joined on ${formattedJoiningDate}).`)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden relative">
      <Toaster position="top-right" />

      {/* Prominent On-Screen Error / Notice Banner */}
      {alertBannerText && (
        <div className="p-4 bg-amber-50 border-b border-amber-200 flex items-start justify-between gap-3 text-amber-900 text-xs animate-in fade-in slide-in-from-top-2">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-bold text-sm text-amber-950">Access Restriction</p>
              <p className="text-amber-800 leading-relaxed">{alertBannerText}</p>
            </div>
          </div>
          <button 
            onClick={() => setAlertBannerText(null)} 
            className="text-amber-700 hover:text-amber-950 p-1 rounded-md"
            title="Dismiss notice"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header with Selectors & Fetch Button */}
      <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-[#be9a62]" />
          <h2 className="font-bold text-gray-900 text-base">
            {MONTH_NAMES_LONG[currentMonth - 1]} {currentYear}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedMonth}
            disabled={isPending}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="rounded-lg border-gray-200 py-1.5 pl-2.5 pr-7 text-xs sm:text-sm font-semibold text-gray-900 bg-white border shadow-2xs focus:outline-none focus:border-[#be9a62] cursor-pointer"
          >
            {allMonths.map((m) => (
              <option key={m} value={m}>
                {MONTH_NAMES_SHORT[m - 1]}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            disabled={isPending}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="rounded-lg border-gray-200 py-1.5 pl-2.5 pr-7 text-xs sm:text-sm font-semibold text-gray-900 bg-white border shadow-2xs focus:outline-none focus:border-[#be9a62] cursor-pointer"
          >
            {availableYears.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleFetch}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 bg-[#132322] hover:bg-[#be9a62] hover:text-[#132322] text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin text-[#be9a62]" />
                <span>Loading...</span>
              </>
            ) : (
              <span>Fetch</span>
            )}
          </button>
        </div>
      </div>

      {/* Legend with Interactive In-Place Reveal for Joining Date */}
      <div className="px-5 py-3 bg-white border-b border-gray-100 flex flex-wrap items-center gap-4 text-xs font-semibold">
        {/* Clickable in-place reveal button */}
        <button
          type="button"
          onClick={() => setShowLegendJoiningDate((prev) => !prev)}
          title={showLegendJoiningDate ? "Click to collapse" : "Click to reveal joining date"}
          className="flex items-center gap-1.5 text-amber-900 bg-amber-50 hover:bg-amber-100/90 active:scale-95 border border-[#be9a62] px-2.5 py-1 rounded-md shadow-2xs font-bold transition-all cursor-pointer"
        >
          <Sparkles className="h-3.5 w-3.5 text-[#be9a62] shrink-0" />
          <span>{showLegendJoiningDate ? formattedJoiningDate : 'Joining Date'}</span>
        </button>

        <span className="flex items-center gap-1.5 text-green-700">
          <CheckCircle className="h-4 w-4 text-green-600" /> Present
        </span>
        <span className="flex items-center gap-1.5 text-orange-700">
          <AlertTriangle className="h-4 w-4 text-orange-500" /> Late
        </span>
        <span className="flex items-center gap-1.5 text-blue-700">
          <Coffee className="h-4 w-4 text-blue-500" /> Weekoff
        </span>
        <span className="flex items-center gap-1.5 text-purple-700">
          <CalendarCheck className="h-4 w-4 text-purple-500" /> Approved Leave
        </span>
        <span className="flex items-center gap-1.5 text-red-700">
          <XCircle className="h-4 w-4 text-red-500" /> Absent (LOP)
        </span>
        <span className="flex items-center gap-1.5 text-slate-600">
          <CalendarDays className="h-4 w-4 text-slate-500" /> Scheduled
        </span>
        <span className="flex items-center gap-1.5 text-gray-400">
          ◯ Not Joined
        </span>
      </div>

      {/* Calendar Days Grid */}
      <div className={`p-5 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 transition-opacity duration-200 ${isPending ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
        {daysArray.map((item) => (
          <div
            key={item.dayNum}
            onClick={() => handleDayClick(item)}
            className={`p-3 rounded-xl border flex flex-col justify-between gap-2 text-left relative transition-all ${
              item.isJoiningDate 
                ? 'scale-[1.03] shadow-md ring-2 ring-[#be9a62]/40 z-10' 
                : ''
            } ${item.badgeColor}`}
          >
            {/* Header: Day Num & Weekday */}
            <div className="flex justify-between items-start">
              <div>
                <span className="font-bold text-sm block leading-none">Day {item.dayNum}</span>
                <span className="text-[11px] font-semibold text-gray-500 mt-1 block">
                  {item.dayName}
                </span>
              </div>

              {item.isJoiningDate ? (
                <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#be9a62] text-white flex items-center gap-1 shadow-xs">
                  <Sparkles className="h-2.5 w-2.5" /> ★ Joined
                </span>
              ) : (
                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/80">
                  {item.status}
                </span>
              )}
            </div>

            {/* Bottom Content / Timestamps */}
            {item.isJoiningDate ? (
              <div className="text-[10px] space-y-0.5 pt-1.5 border-t border-[#be9a62]/30 font-medium text-amber-950">
                <p className="font-bold text-[#be9a62]">Official Start Date</p>
                {item.log?.clock_in_time && (
                  <p>In: {new Date(item.log.clock_in_time).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })}</p>
                )}
              </div>
            ) : item.log ? (
              <div className="text-[10px] space-y-0.5 pt-1.5 border-t border-current/10">
                {item.log.status === 'Weekoff' ? (
                  <p className="font-semibold text-blue-700">Weekly Off</p>
                ) : item.log.status === 'Leave' ? (
                  <p className="font-semibold text-purple-700">Approved Leave</p>
                ) : (
                  <>
                    <p>In: {new Date(item.log.clock_in_time).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })}</p>
                    {item.log.clock_out_time && (
                      <p>Out: {new Date(item.log.clock_out_time).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })}</p>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div className="text-[10px] text-gray-500 pt-1.5 border-t border-current/10 flex items-center justify-between">
                <span>
                  {item.isBeforeJoining
                    ? 'Pre-joining'
                    : item.isFuture
                    ? 'Scheduled Day'
                    : item.isToday
                    ? 'Scheduled Today'
                    : 'Absent (LOP)'}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Interactive Modal for Pre-Joining Notifications */}
      {modalDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#132322] border border-[#4f4931]/60 rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-white space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#4f4931]/40 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <AlertCircle className="h-4 w-4" />
                </div>
                <h3 className="font-bold text-base text-white">{modalDetails.title}</h3>
              </div>
              <button onClick={() => setModalDetails(null)} className="text-gray-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl space-y-2 text-xs text-amber-200 leading-relaxed">
              <p className="whitespace-pre-line">{modalDetails.message}</p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setModalDetails(null)}
                className="inline-flex items-center gap-1.5 bg-[#be9a62] hover:bg-[#b79c68] text-[#132322] font-bold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm"
              >
                <span>Understood</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}