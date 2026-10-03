import { redirect } from 'next/navigation'
import { createClient } from '../../../utils/supabase/server'
import { 
  Calendar, 
  MapPin, 
  CheckCircle, 
  Coffee, 
  AlertTriangle, 
  CalendarCheck, 
  XCircle 
} from 'lucide-react'
import EmployeeAttendanceClient from './EmployeeAttendanceClient'

export default async function EmployeeAttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string }>
}) {
  const resolvedSearch = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, shops(name)')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')
  if (profile.role === 'admin') redirect('/admin')

  // 1. Current IST Date Reference
  const istFormatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  const todayStr = istFormatter.format(new Date())
  const [currentYearNum, currentMonthNum] = todayStr.split('-').map(Number)

  // 2. Robust Parsing of Employee Joining Date
  let joiningDateStr: string | null = null
  let joiningYear = currentYearNum
  let joiningMonth = 1
  let joiningDay = 1

  if (profile.joining_date) {
    const parsedJoining = new Date(profile.joining_date)
    if (!isNaN(parsedJoining.getTime())) {
      joiningYear = parsedJoining.getFullYear()
      joiningMonth = parsedJoining.getMonth() + 1
      joiningDay = parsedJoining.getDate()
      joiningDateStr = `${joiningYear}-${String(joiningMonth).padStart(2, '0')}-${String(joiningDay).padStart(2, '0')}`
    }
  }

  // 3. Resolve Target Month & Year
  let month = parseInt(resolvedSearch?.month || '') || currentMonthNum
  let year = parseInt(resolvedSearch?.year || '') || currentYearNum

  if (month < 1 || month > 12) month = currentMonthNum
  if (year < 2020 || year > 2035) year = currentYearNum

  // 4. Server-Side Safety Redirect: Snap to Joining Month if accessing earlier dates
  let redirectedFromPreJoining = false
  if (joiningDateStr) {
    if (year < joiningYear || (year === joiningYear && month < joiningMonth)) {
      redirectedFromPreJoining = true
      year = joiningYear
      month = joiningMonth
    }
  }

  // 5. Fetch Monthly Time Logs strictly for this employee
  const startOfMonth = `${year}-${String(month).padStart(2, '0')}-01T00:00:00+05:30`
  const daysInMonthCount = new Date(year, month, 0).getDate()
  const endOfMonth = `${year}-${String(month).padStart(2, '0')}-${String(daysInMonthCount).padStart(2, '0')}T23:59:59+05:30`

  const { data: monthLogs } = await supabase
    .from('time_logs')
    .select('*')
    .eq('employee_id', user.id)
    .gte('clock_in_time', startOfMonth)
    .lte('clock_in_time', endOfMonth)

  // 6. Map Logs by exact IST Date String
  const logMap = new Map<string, any>()
  monthLogs?.forEach((log) => {
    const istKey = istFormatter.format(new Date(log.clock_in_time))
    logMap.set(istKey, log)
  })

  // 7. Compute Metric Counters & Calendar Matrix
  const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  let presentCount = 0
  let lateCount = 0
  let completedWeekoffs = 0
  let totalWeekoffsInMonth = 0
  let leaveCount = 0
  let absentCount = 0
  let totalScheduledWorkDays = 0

  const daysArray = Array.from({ length: daysInMonthCount }, (_, i) => {
    const dayNum = i + 1
    const dateObj = new Date(year, month - 1, dayNum)
    const dayName = weekdayNames[dateObj.getDay()]
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`

    const log = logMap.get(dateStr)
    const isBeforeJoining = Boolean(joiningDateStr && dateStr < joiningDateStr)
    const isJoiningDate = Boolean(joiningDateStr && dateStr === joiningDateStr)
    const isFuture = dateStr > todayStr
    const isToday = dateStr === todayStr

    let status = 'Scheduled'
    let badgeColor = 'bg-slate-50 text-slate-700 border border-slate-200'

    if (isJoiningDate) {
      // Prominent Gold Highlight for the Employee's Joining Date
      badgeColor = 'bg-amber-50/90 border-2 border-[#be9a62] text-amber-950 shadow-md ring-2 ring-[#be9a62]/30'
      if (log) {
        if (log.status === 'Late') {
          status = 'Late'
          presentCount++
          lateCount++
        } else {
          status = 'Present'
          presentCount++
        }
      } else if (!isFuture) {
        status = 'Present'
        presentCount++
      }
      totalScheduledWorkDays++
    } else if (isBeforeJoining) {
      status = 'Not Joined'
      badgeColor = 'bg-gray-50/80 text-gray-400 border border-dashed border-gray-200 opacity-60 hover:opacity-100 hover:border-gray-400 cursor-pointer'
    } else if (log) {
      if (log.status === 'Weekoff') {
        status = 'Weekoff'
        badgeColor = 'bg-blue-50 text-blue-700 border border-blue-200'
        totalWeekoffsInMonth++
        if (dateStr <= todayStr) {
          completedWeekoffs++
        }
      } else if (log.status === 'Leave') {
        status = 'Leave'
        badgeColor = 'bg-purple-50 text-purple-700 border border-purple-200'
        leaveCount++
      } else if (log.status === 'Late') {
        status = 'Late'
        badgeColor = 'bg-orange-100 text-orange-700 border border-orange-200'
        presentCount++
        lateCount++
        totalScheduledWorkDays++
      } else {
        status = 'Present'
        badgeColor = 'bg-green-100 text-green-700 border border-green-200'
        presentCount++
        totalScheduledWorkDays++
      }
    } else if (isFuture) {
      status = 'Scheduled'
      badgeColor = 'bg-slate-50 text-slate-700 border border-slate-200'
      totalScheduledWorkDays++
    } else if (isToday) {
      status = 'Scheduled'
      badgeColor = 'bg-amber-50 text-amber-800 border border-amber-200'
      totalScheduledWorkDays++
    } else {
      status = 'Absent'
      badgeColor = 'bg-red-100 text-red-700 border border-red-200'
      absentCount++
      totalScheduledWorkDays++
    }

    return {
      dayNum,
      dayName,
      dateStr,
      status,
      badgeColor,
      log,
      isBeforeJoining,
      isJoiningDate,
      isFuture,
      isToday,
    }
  })

  const shopName = profile.shops
    ? Array.isArray(profile.shops)
      ? profile.shops[0]?.name
      : profile.shops?.name
    : 'Unassigned Store'

  const formattedJoiningDate = joiningDateStr
    ? new Date(joiningDateStr).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'Not Specified'

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      
      {/* Page Header with Highlighted Joining Date Capsule */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-xl bg-[#132322] border border-[#be9a62]/30 text-[#be9a62] flex items-center justify-center font-bold text-lg shrink-0">
            {profile.full_name?.charAt(0) || 'E'}
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">{profile.full_name}</h1>
            <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
              <span>{profile.designation || 'Store Staff'}</span>
              <span>&bull;</span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-gray-400" /> {shopName}
              </span>
            </p>
          </div>
        </div>

        <div className="bg-[#be9a62]/10 border border-[#be9a62]/40 px-4 py-2.5 rounded-xl self-start sm:self-auto shadow-2xs">
          <p className="text-[10px] font-bold text-[#be9a62] uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" /> Date of Joining
          </p>
          <p className="text-sm font-black text-gray-900 mt-0.5">
            {formattedJoiningDate}
          </p>
        </div>
      </div>

      {/* Fractional Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-2xs">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
            <CheckCircle className="h-3.5 w-3.5 text-green-600" /> Present Days
          </p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-green-600">{presentCount}</span>
            <span className="text-sm font-bold text-gray-400">/ {totalScheduledWorkDays}</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-0.5">Completed / Total Work Days</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-2xs">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
            <Coffee className="h-3.5 w-3.5 text-blue-600" /> Weekoffs
          </p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-blue-600">{completedWeekoffs}</span>
            <span className="text-sm font-bold text-gray-400">/ {totalWeekoffsInMonth}</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-0.5">Completed / Total Weekoffs</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-2xs">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
            <AlertTriangle className="h-3.5 w-3.5 text-orange-500" /> Late
          </p>
          <p className="text-2xl font-black text-orange-500 mt-1">{lateCount}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Late check-ins</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-2xs">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
            <CalendarCheck className="h-3.5 w-3.5 text-purple-600" /> Leaves
          </p>
          <p className="text-2xl font-black text-purple-600 mt-1">{leaveCount}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Approved leaves</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-2xs col-span-2 sm:col-span-1">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
            <XCircle className="h-3.5 w-3.5 text-red-500" /> Absent (LOP)
          </p>
          <p className="text-2xl font-black text-red-600 mt-1">{absentCount}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Loss of pay</p>
        </div>
      </div>

      {/* Calendar Ledger View */}
      <EmployeeAttendanceClient 
        daysArray={daysArray}
        currentMonth={month}
        currentYear={year}
        joiningYear={joiningYear}
        joiningMonth={joiningMonth}
        formattedJoiningDate={formattedJoiningDate}
        redirectedFromPreJoining={redirectedFromPreJoining}
      />

    </div>
  )
}