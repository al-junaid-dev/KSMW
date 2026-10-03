'use client'

import { useState, useTransition } from 'react'
import { 
  Calendar, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Coffee, 
  Pencil, 
  X, 
  Loader2, 
  Info,
  CalendarCheck,
  CalendarDays,
  Settings2,
  ShieldCheck,
  ArrowRight
} from 'lucide-react'
import { updateAttendanceDayLog, setFutureWeeklyOff } from '../actions'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface CalendarDayItem {
  dayNum: number
  dayName: string
  dateStr: string
  status: string
  badgeColor: string
  log: any
  isBeforeJoining: boolean
  isFuture: boolean
  isToday: boolean
}

interface AttendanceLedgerProps {
  employeeId: string
  employeeName: string
  joiningDate: string | null
  todayStr: string
  daysArray: CalendarDayItem[]
  currentMonth: number
  currentYear: number
}

type AvailableStatus = 'Present' | 'Late' | 'Weekoff' | 'Leave' | 'Absent' | 'Scheduled'

const WEEKDAY_OPTIONS = [
  { label: 'Every Sunday', value: 0 },
  { label: 'Every Monday', value: 1 },
  { label: 'Every Tuesday', value: 2 },
  { label: 'Every Wednesday', value: 3 },
  { label: 'Every Thursday', value: 4 },
  { label: 'Every Friday', value: 5 },
  { label: 'Every Saturday', value: 6 },
]

export default function AttendanceLedgerClient({
  employeeId,
  employeeName,
  joiningDate,
  todayStr,
  daysArray,
  currentMonth,
  currentYear,
}: AttendanceLedgerProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // 1. Month / Year Selectors State (Manual Fetch)
  const [selectedMonth, setSelectedMonth] = useState(currentMonth)
  const [selectedYear, setSelectedYear] = useState(currentYear)

  // 2. Single Day Override Modal State
  const [selectedDay, setSelectedDay] = useState<CalendarDayItem | null>(null)
  const [newStatus, setNewStatus] = useState<AvailableStatus>('Scheduled')
  const [clockIn, setClockIn] = useState('09:30')
  const [clockOut, setClockOut] = useState('18:30')
  const [showConfirm, setShowConfirm] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // 3. Bulk Weekoff Configuration Modal State
  const [isWeekoffModalOpen, setIsWeekoffModalOpen] = useState(false)
  const [selectedWeekday, setSelectedWeekday] = useState<number>(1) // Default to Monday
  const [showWeekoffConfirm, setShowWeekoffConfirm] = useState(false)
  const [isApplyingWeekoff, setIsApplyingWeekoff] = useState(false)

  const isEntireMonthPreJoining = Boolean(
    joiningDate && 
    `${currentYear}-${String(currentMonth).padStart(2, '0')}-31` < joiningDate
  )

  // Triggered ONLY when clicking "Fetch Ledger"
  function handleFetchLedger() {
    startTransition(() => {
      router.push(`/admin/directory/${employeeId}?month=${selectedMonth}&year=${selectedYear}`)
    })
  }

  const openDayModal = (day: CalendarDayItem) => {
    if (day.isBeforeJoining) {
      toast.error(`Cannot edit: ${employeeName} joined on ${joiningDate}.`)
      return
    }

    setSelectedDay(day)

    if (day.isFuture) {
      if (day.status === 'Weekoff') setNewStatus('Weekoff')
      else if (day.status === 'Leave') setNewStatus('Leave')
      else setNewStatus('Scheduled')
    } else {
      if (day.status === 'Late') setNewStatus('Late')
      else if (day.status === 'Weekoff') setNewStatus('Weekoff')
      else if (day.status === 'Leave') setNewStatus('Leave')
      else if (day.status === 'Absent') setNewStatus('Absent')
      else if (day.status === 'Present') setNewStatus('Present')
      else setNewStatus(day.isToday ? 'Present' : 'Absent')
    }

    if (day.log?.clock_in_time) {
      const inD = new Date(day.log.clock_in_time)
      setClockIn(`${String(inD.getHours()).padStart(2, '0')}:${String(inD.getMinutes()).padStart(2, '0')}`)
    } else {
      setClockIn('09:30')
    }

    if (day.log?.clock_out_time) {
      const outD = new Date(day.log.clock_out_time)
      setClockOut(`${String(outD.getHours()).padStart(2, '0')}:${String(outD.getMinutes()).padStart(2, '0')}`)
    } else {
      setClockOut('18:30')
    }

    setShowConfirm(false)
  }

  async function handleSaveDayOverride() {
    if (!selectedDay) return
    setIsSaving(true)

    const clockInISO = `${selectedDay.dateStr}T${clockIn}:00+05:30`
    const clockOutISO = `${selectedDay.dateStr}T${clockOut}:00+05:30`

    const res = await updateAttendanceDayLog(
      employeeId,
      selectedDay.dateStr,
      newStatus,
      newStatus === 'Present' || newStatus === 'Late'
        ? { clock_in: clockInISO, clock_out: clockOutISO }
        : undefined
    )

    if ('error' in res && res.error) {
      toast.error(res.error)
      setIsSaving(false)
      return
    }

    const labelMap: Record<AvailableStatus, string> = {
      Present: 'Present (On Time)',
      Late: 'Late Arrival',
      Weekoff: 'Weekoff',
      Leave: 'Approved Leave',
      Absent: 'Absent (LOP)',
      Scheduled: 'Scheduled Day',
    }

    toast.success(`Day ${selectedDay.dayNum} set to ${labelMap[newStatus]}`)
    setIsSaving(false)
    setShowConfirm(false)
    setSelectedDay(null)
    router.refresh()
  }

  // Handle Future-Only Weekly Off Application
  async function handleApplyFutureWeekoff() {
    setIsApplyingWeekoff(true)

    const res = await setFutureWeeklyOff(
      employeeId,
      selectedWeekday,
      currentMonth,
      currentYear
    )

    if (res.error && (!res.count || res.count === 0)) {
      toast.error(res.error)
      setIsApplyingWeekoff(false)
      return
    }

    const weekdayName = WEEKDAY_OPTIONS.find((w) => w.value === selectedWeekday)?.label || ''
    toast.success(`Applied ${weekdayName} as Weekoff for future dates (${res.count} days updated)!`)
    setIsApplyingWeekoff(false)
    setShowWeekoffConfirm(false)
    setIsWeekoffModalOpen(false)
    router.refresh()
  }

  return (
    <div className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden relative">
      
      {/* Calendar Header with Manual Fetch & Configure Weekoff Buttons */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" /> Monthly Attendance Ledger
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Track shifts, apply weekoffs, and adjust scheduled rosters
          </p>
        </div>

        {/* Action Controls Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Configure Weekoff Action Button */}
          <button
            type="button"
            onClick={() => {
              setShowWeekoffConfirm(false)
              setIsWeekoffModalOpen(true)
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-gray-200 text-gray-700 hover:border-[#be9a62] hover:text-[#be9a62] shadow-2xs transition-colors cursor-pointer"
          >
            <Settings2 className="h-3.5 w-3.5 text-[#be9a62]" />
            <span>Configure Weekoff</span>
          </button>

          {/* Month Dropdown (Updates local state only) */}
          <select 
            value={selectedMonth}
            disabled={isPending}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="rounded-lg border-gray-200 py-1.5 pl-2.5 pr-7 text-xs sm:text-sm font-semibold text-gray-900 bg-white border shadow-2xs focus:outline-none focus:border-[#be9a62] cursor-pointer"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {new Date(0, m - 1).toLocaleString('default', { month: 'short' })}
              </option>
            ))}
          </select>

          {/* Year Dropdown (Updates local state only) */}
          <select 
            value={selectedYear}
            disabled={isPending}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="rounded-lg border-gray-200 py-1.5 pl-2.5 pr-7 text-xs sm:text-sm font-semibold text-gray-900 bg-white border shadow-2xs focus:outline-none focus:border-[#be9a62] cursor-pointer"
          >
            {[2024, 2025, 2026, 2027].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          {/* Dedicated Fetch Button */}
          <button
            type="button"
            onClick={handleFetchLedger}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 bg-[#132322] hover:bg-[#be9a62] hover:text-[#132322] text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin text-[#be9a62]" />
                <span>Loading...</span>
              </>
            ) : (
              <span>Fetch Ledger</span>
            )}
          </button>
        </div>
      </div>

      {/* Pre-Employment Banner */}
      {isEntireMonthPreJoining && (
        <div className="m-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-amber-800 text-xs">
          <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-sm text-amber-900">Pre-Employment Period</p>
            <p>
              {employeeName} officially joined on <strong className="underline">{joiningDate}</strong>. Attendance records do not apply prior to this date.
            </p>
          </div>
        </div>
      )}

      {/* Legend with Edit Option on Weekoff */}
      <div className="px-6 py-3 bg-white border-b border-gray-100 flex flex-wrap items-center gap-4 text-xs font-semibold">
        <span className="flex items-center gap-1.5 text-green-700">
          <CheckCircle className="h-4 w-4 text-green-600"/> Present
        </span>
        <span className="flex items-center gap-1.5 text-orange-700">
          <AlertTriangle className="h-4 w-4 text-orange-500"/> Late Arrival
        </span>
        
        {/* Weekoff with Inline Edit Option */}
        <span className="flex items-center gap-1.5 text-blue-700 bg-blue-50/60 px-2 py-0.5 rounded-md border border-blue-100">
          <Coffee className="h-3.5 w-3.5 text-blue-500"/> 
          <span>Weekoff</span>
          <button 
            type="button"
            onClick={() => {
              setShowWeekoffConfirm(false)
              setIsWeekoffModalOpen(true)
            }}
            className="text-[10px] text-blue-600 hover:text-blue-800 underline font-bold ml-1 cursor-pointer"
          >
            Edit
          </button>
        </span>

        <span className="flex items-center gap-1.5 text-purple-700">
          <CalendarCheck className="h-4 w-4 text-purple-500"/> Approved Leave
        </span>
        <span className="flex items-center gap-1.5 text-red-700">
          <XCircle className="h-4 w-4 text-red-500"/> Absent (LOP)
        </span>
        <span className="flex items-center gap-1.5 text-slate-600">
          <CalendarDays className="h-4 w-4 text-slate-500"/> Scheduled Day
        </span>
        <span className="flex items-center gap-1.5 text-gray-400">
          ◯ Not Joined
        </span>
      </div>

      {/* Days Grid */}
      <div className={`p-6 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 transition-opacity duration-200 ${isPending ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
        {daysArray.map((item) => (
          <button
            key={item.dayNum}
            type="button"
            disabled={item.isBeforeJoining}
            onClick={() => openDayModal(item)}
            className={`p-3 rounded-xl border flex flex-col justify-between gap-2 text-left transition-all ${
              item.isBeforeJoining 
                ? 'cursor-not-allowed opacity-50 bg-gray-50' 
                : 'hover:scale-[1.02] hover:shadow-md cursor-pointer'
            } ${item.badgeColor}`}
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="font-bold text-sm block leading-none">Day {item.dayNum}</span>
                <span className="text-[11px] font-semibold text-gray-500 mt-1 block">
                  {item.dayName}
                </span>
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/80">
                {item.status}
              </span>
            </div>
            
            {item.log ? (
              <div className="text-[10px] space-y-0.5 pt-1.5 border-t border-current/10">
                {item.log.status === 'Weekoff' ? (
                  <p className="font-semibold text-blue-700">Weekoff</p>
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
              <div className="text-[10px] text-gray-500 pt-1.5 border-t border-current/10">
                {item.isBeforeJoining 
                  ? 'Not Employed' 
                  : item.isFuture 
                  ? 'Scheduled Day' 
                  : item.isToday 
                  ? 'Scheduled Today' 
                  : 'Absent (LOP)'}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* ================= 1. CONFIGURE WEEKOFF MODAL (FUTURE-ONLY) ================= */}
      {isWeekoffModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#132322] border border-[#4f4931]/60 rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-white space-y-5">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#4f4931]/40 pb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-[#be9a62]/10 border border-[#be9a62]/30 flex items-center justify-center text-[#be9a62]">
                  <Coffee className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Configure Weekly Off</h3>
                  <p className="text-xs text-[#b09a77]">{employeeName}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsWeekoffModalOpen(false)} 
                className="text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {!showWeekoffConfirm ? (
              <div className="space-y-4 text-xs">
                
                {/* Weekday Selection */}
                <div className="space-y-1.5">
                  <label className="text-[#b09a77] font-semibold uppercase tracking-wider">
                    Select Assigned Weekoff Day
                  </label>
                  <select
                    value={selectedWeekday}
                    onChange={(e) => setSelectedWeekday(Number(e.target.value))}
                    className="w-full bg-[#192115] border border-[#4f4931]/60 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#be9a62] cursor-pointer text-sm"
                  >
                    {WEEKDAY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Future-Only Safety Guarantee Card */}
                <div className="bg-blue-500/10 border border-blue-500/30 p-3.5 rounded-xl space-y-2 text-blue-200">
                  <div className="flex items-center gap-1.5 text-blue-400 font-bold">
                    <ShieldCheck className="h-4 w-4 shrink-0" />
                    <span>Historical Data Guard Enabled</span>
                  </div>
                  <p className="leading-relaxed text-[11px]">
                    This will apply <strong className="text-white">{WEEKDAY_OPTIONS.find(w => w.value === selectedWeekday)?.label}</strong> as a Weekoff <span className="underline font-semibold text-white">strictly from today onwards</span> ({todayStr}).
                  </p>
                  <p className="leading-relaxed text-[11px] text-blue-300/80">
                    Past shift logs, completed clock-ins, and earlier records will <strong>never be altered or deleted</strong>.
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[#4f4931]/40">
                  <button 
                    type="button" 
                    onClick={() => setIsWeekoffModalOpen(false)} 
                    className="px-3.5 py-2 text-gray-300 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button 
                    type="button"
                    onClick={() => setShowWeekoffConfirm(true)}
                    className="bg-[#be9a62] hover:bg-[#b79c68] text-[#132322] font-bold px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1"
                  >
                    <span>Continue</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              /* Confirmation Prompt */
              <div className="space-y-4 text-xs">
                <div className="bg-[#192115] p-4 rounded-xl border border-[#4f4931]/60 space-y-2">
                  <p className="font-semibold text-white">Confirm Weekly Off Application</p>
                  <p className="text-gray-300">
                    Are you sure you want to mark <strong className="text-[#be9a62]">{WEEKDAY_OPTIONS.find(w => w.value === selectedWeekday)?.label}</strong> as Weekoff for all upcoming dates in {new Date(currentYear, currentMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}?
                  </p>
                  <p className="text-[11px] text-green-400 pt-1">
                    &bull; Safe execution: Dates prior to {todayStr} remain completely untouched.
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[#4f4931]/40">
                  <button 
                    type="button"
                    onClick={() => setShowWeekoffConfirm(false)} 
                    disabled={isApplyingWeekoff}
                    className="px-3.5 py-2 text-gray-300 hover:text-white"
                  >
                    Back
                  </button>
                  <button 
                    type="button"
                    onClick={handleApplyFutureWeekoff}
                    disabled={isApplyingWeekoff}
                    className="inline-flex items-center gap-2 bg-[#be9a62] hover:bg-[#b79c68] text-[#132322] font-bold px-4 py-2 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isApplyingWeekoff ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Applying...</span>
                      </>
                    ) : (
                      <span>Confirm & Apply</span>
                    )}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ================= 2. SINGLE DAY OVERRIDE MODAL ================= */}
      {selectedDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#132322] border border-[#4f4931]/60 rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-white space-y-4">
            
            <div className="flex items-center justify-between border-b border-[#4f4931]/40 pb-3">
              <div>
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <Pencil className="h-4 w-4 text-[#be9a62]" /> 
                  Edit Ledger: Day {selectedDay.dayNum} ({selectedDay.dayName})
                </h3>
                <p className="text-xs text-[#b09a77]">
                  {selectedDay.dateStr} &bull; {selectedDay.isFuture ? 'Future Date' : selectedDay.isToday ? 'Today' : 'Past Date'}
                </p>
              </div>
              <button onClick={() => setSelectedDay(null)} className="text-gray-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            {!showConfirm ? (
              <form onSubmit={(e) => { e.preventDefault(); setShowConfirm(true) }} className="space-y-4 text-xs">
                
                <div className="space-y-1.5">
                  <label className="text-[#b09a77] font-semibold uppercase">Classification</label>
                  
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as AvailableStatus)}
                    className="w-full bg-[#192115] border border-[#4f4931]/60 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#be9a62] cursor-pointer"
                  >
                    {selectedDay.isFuture ? (
                      <>
                        <option value="Scheduled">Scheduled Day</option>
                        <option value="Weekoff">Weekoff</option>
                        <option value="Leave">Approved Leave</option>
                      </>
                    ) : (
                      <>
                        <option value="Present">Present (On Time)</option>
                        <option value="Late">Late Arrival</option>
                        <option value="Weekoff">Weekoff</option>
                        <option value="Leave">Approved Leave</option>
                        <option value="Absent">Absent (Loss of Pay)</option>
                      </>
                    )}
                  </select>
                </div>

                {!selectedDay.isFuture && (newStatus === 'Present' || newStatus === 'Late') && (
                  <div className="grid grid-cols-2 gap-2 bg-[#192115] p-3 rounded-xl border border-[#4f4931]/40">
                    <div className="space-y-1">
                      <label className="text-gray-400 text-[11px]">Clock In</label>
                      <input
                        type="time"
                        value={clockIn}
                        onChange={(e) => setClockIn(e.target.value)}
                        className="w-full bg-[#132322] border border-[#4f4931]/60 rounded-lg px-2 py-1.5 text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-gray-400 text-[11px]">Clock Out</label>
                      <input
                        type="time"
                        value={clockOut}
                        onChange={(e) => setClockOut(e.target.value)}
                        className="w-full bg-[#132322] border border-[#4f4931]/60 rounded-lg px-2 py-1.5 text-white"
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2 border-t border-[#4f4931]/40">
                  <button type="button" onClick={() => setSelectedDay(null)} className="px-3 py-1.5 text-gray-300 hover:text-white">
                    Cancel
                  </button>
                  <button type="submit" className="bg-[#be9a62] text-[#132322] font-bold px-4 py-1.5 rounded-xl transition-all cursor-pointer">
                    Review Change
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3 py-2 text-xs">
                <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl text-amber-200 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>Attendance Ledger Caution</span>
                  </div>
                  <p>
                    {selectedDay.isFuture
                      ? `Updating this future date to ${newStatus === 'Scheduled' ? 'a Scheduled Day' : newStatus} adjusts roster planning and scheduled hours.`
                      : `Setting this day to ${newStatus} adjusts the official attendance log and directly influences salary calculation.`}
                  </p>
                </div>

                <div className="bg-[#192115] p-3 rounded-xl border border-[#4f4931]/40 space-y-1 text-[11px]">
                  <p><strong className="text-white">Date:</strong> {selectedDay.dateStr} ({selectedDay.dayName})</p>
                  <p><strong className="text-white">New Status:</strong> {newStatus === 'Scheduled' ? 'Scheduled Day' : newStatus}</p>
                  {!selectedDay.isFuture && (newStatus === 'Present' || newStatus === 'Late') && (
                    <p><strong className="text-white">Shift Hours:</strong> {clockIn} - {clockOut}</p>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button onClick={() => setShowConfirm(false)} className="px-3 py-1.5 text-gray-300">
                    Back
                  </button>
                  <button
                    onClick={handleSaveDayOverride}
                    disabled={isSaving}
                    className="bg-[#be9a62] text-[#132322] font-bold px-4 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    {isSaving && <Loader2 className="h-3 w-3 animate-spin" />}
                    Confirm Override
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  )
}