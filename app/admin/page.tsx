import { createClient } from '../../utils/supabase/server'
import {
  Store, 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  ArrowUpRight
} from 'lucide-react'
import Link from 'next/link'
import DateFilter from './DateFilter'
import ActivityFeedClient from './ActivityFeedClient'

export default async function AdminDashboardOverview({
  searchParams
}: {
  searchParams: Promise<{ date?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  // 1. Calculate Today's date in IST
  const formatter = new Intl.DateTimeFormat('en-CA', { 
    timeZone: 'Asia/Kolkata', 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit' 
  })
  const todayStr = formatter.format(new Date())

  // Active date selection (defaults to today)
  const selectedDate = params?.date || todayStr
  const isToday = selectedDate === todayStr

  // 2. Fetch all shops
  const { data: shops } = await supabase
    .from('shops')
    .select('*')
    .order('name', { ascending: true })

  // 3. Fetch ONLY employees who joined ON OR BEFORE the selected date
  const { data: employees } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'employee')
    .or(`joining_date.lte.${selectedDate},joining_date.is.null`)

  // 4. Calculate day boundary in IST (+05:30)
  const targetDateObj = new Date(selectedDate)
  targetDateObj.setDate(targetDateObj.getDate() + 1)
  const nextDateStr = targetDateObj.toISOString().split('T')[0]

  // 5. Fetch logs strictly within the selected date
  const { data: logsForDate } = await supabase
    .from('time_logs')
    .select('*')
    .gte('clock_in_time', `${selectedDate}T00:00:00+05:30`)
    .lt('clock_in_time', `${nextDateStr}T00:00:00+05:30`)

  // 6. Compute Point-in-Time Metrics
  const totalStores = shops?.length || 0
  const totalStaff = employees?.length || 0
  const totalActiveNow = isToday ? (logsForDate?.filter(log => !log.clock_out_time).length || 0) : 0
  const totalPresent = new Set(logsForDate?.map(log => log.employee_id)).size
  const totalAttendanceRate = totalStaff > 0 ? Math.round((totalPresent / totalStaff) * 100) : 0

  // 7. Initial 20 logs for the feed for the chosen date
  const { data: recentLogs } = await supabase
    .from('time_logs')
    .select(`
      id, employee_id, clock_in_time, clock_out_time, total_hours, status,
      profiles ( full_name, shops ( name ) )
    `)
    .gte('clock_in_time', `${selectedDate}T00:00:00+05:30`)
    .lt('clock_in_time', `${nextDateStr}T00:00:00+05:30`)
    .order('clock_in_time', { ascending: false })
    .limit(20)

  const attendanceQueryUrl = isToday ? '/admin/attendance' : `/admin/attendance?date=${selectedDate}`

  // Dynamic color configuration based on attendance rate
const attendanceColorClass = 
  totalStaff === 0 
    ? 'text-gray-500' 
    : totalAttendanceRate >= 80 
    ? 'text-green-600' 
    : totalAttendanceRate >= 50 
    ? 'text-amber-500' 
    : 'text-red-600'

const attendanceHoverClass = 
  totalStaff === 0 
    ? 'group-hover:text-gray-600' 
    : totalAttendanceRate >= 80 
    ? 'group-hover:text-green-600' 
    : totalAttendanceRate >= 50 
    ? 'group-hover:text-amber-500' 
    : 'group-hover:text-red-600'

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto pb-20">
      
      {/* Header with Date Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isToday ? "Today's Overview" : `Overview for ${selectedDate}`}
          </h1>
          <p className="text-gray-500 text-sm">
            {isToday 
              ? 'Real-time attendance and shop status' 
              : 'Historical daily attendance records and roster status'}
          </p>
        </div>

        <DateFilter selectedDate={selectedDate} todayStr={todayStr} />
      </div>

      {/* Global Summary KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link 
          href="/admin/stores"
          className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:border-[#be9a62] hover:shadow-md transition-all cursor-pointer group space-y-1 block"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 group-hover:text-[#be9a62] transition-colors">
              <Store className="h-4 w-4 text-[#be9a62]" /> Total Stores
            </p>
            <ArrowUpRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-[#be9a62] transition-colors" />
          </div>
          <p className="text-2xl font-black text-gray-900">{totalStores}</p>
          <p className="text-xs text-gray-400">Registered Outlets &rarr;</p>
        </Link>

        <Link 
          href="/admin/directory"
          className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:border-[#be9a62] hover:shadow-md transition-all cursor-pointer group space-y-1 block"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 group-hover:text-[#be9a62] transition-colors">
              <Users className="h-4 w-4 text-slate-600 group-hover:text-[#be9a62]" /> Total Staff
            </p>
            <ArrowUpRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-[#be9a62] transition-colors" />
          </div>
          <p className="text-2xl font-black text-gray-900">{totalStaff}</p>
          <p className="text-xs text-gray-400">Active as of {selectedDate} &rarr;</p>
        </Link>

        <Link 
          href={attendanceQueryUrl}
          className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:border-[#be9a62] hover:shadow-md transition-all cursor-pointer group space-y-1 block"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 group-hover:text-blue-600 transition-colors">
              <Clock className="h-4 w-4 text-blue-600" /> {isToday ? 'Active Now' : 'Completed Shifts'}
            </p>
            <ArrowUpRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-blue-600 transition-colors" />
          </div>
          <p className="text-2xl font-black text-blue-600 flex items-center gap-2">
            {isToday ? totalActiveNow : (logsForDate?.length || 0)}
            {isToday && totalActiveNow > 0 && <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />}
          </p>
          <p className="text-xs text-gray-400">View real-time roster &rarr;</p>
        </Link>

        <Link 
  href={attendanceQueryUrl}
  className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:border-[#be9a62] hover:shadow-md transition-all cursor-pointer group space-y-1 block"
>
  <div className="flex items-center justify-between">
    <p className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors ${attendanceHoverClass} text-gray-400`}>
      <TrendingUp className={`h-4 w-4 ${attendanceColorClass}`} /> Attendance Rate
    </p>
    <ArrowUpRight className={`h-3.5 w-3.5 text-gray-300 ${attendanceHoverClass} transition-colors`} />
  </div>
  <p className={`text-2xl font-black ${attendanceColorClass}`}>
    {totalAttendanceRate}%
  </p>
  <p className="text-xs text-gray-400">
    {totalPresent} of {totalStaff} present &rarr;
  </p>
</Link>
      </div>

      {/* Shop Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {shops?.map(shop => {
          const shopEmployees = employees?.filter(emp => emp.shop_id === shop.id) || []
          const totalEmp = shopEmployees.length
          
          const presentLogs = logsForDate?.filter(log => shopEmployees.some(emp => emp.id === log.employee_id)) || []
          const presentEmployeeIds = presentLogs.map(log => log.employee_id)
          const absentEmployees = shopEmployees.filter(emp => !presentEmployeeIds.includes(emp.id))
          const lateLogs = presentLogs.filter(log => log.status === 'Late')
          const activeLogs = presentLogs.filter(log => !log.clock_out_time)

          const absentNames = absentEmployees.map(emp => emp.full_name)
          const lateNames = shopEmployees.filter(emp => lateLogs.some(log => log.employee_id === emp.id)).map(emp => emp.full_name)
          const presentNames = shopEmployees.filter(emp => presentEmployeeIds.includes(emp.id)).map(emp => emp.full_name)

          return (
            <Link 
              href={`/admin/stores/${shop.id}`} 
              key={shop.id} 
              className="bg-white rounded-2xl shadow-sm border border-[wheat]/50 overflow-hidden flex flex-col hover:shadow-md hover:border-[wheat] transition-all cursor-pointer group"
            >
              <div className="bg-[#132322]/5 p-4 border-b border-gray-100 flex items-center justify-between group-hover:bg-[#be9a62]/10 transition-colors">
                <div className="flex items-center gap-2">
                  <Store className="h-5 w-5 text-[#be9a62]" />
                  <h2 className="font-bold text-gray-900 group-hover:text-[#be9a62] transition-colors">{shop.name}</h2>
                </div>
                <span className="text-xs font-semibold bg-[#be9a62]/10 text-[#be9a62] px-2.5 py-1 rounded-full flex items-center gap-1">
                  {isToday && activeLogs.length > 0 && <span className="w-1.5 h-1.5 bg-[#be9a62] rounded-full animate-pulse"></span>}
                  {isToday ? `${activeLogs.length} Active Now` : `${presentLogs.length} Logged`}
                </span>
              </div>
              
              <div className="p-4 grid grid-cols-2 gap-4 flex-1">
                <div className="space-y-1">
                   <p className="text-xs text-gray-500 font-medium flex items-center gap-1"><UserCheck className="h-3.5 w-3.5"/> Present</p>
                   <p className="text-xl font-bold text-gray-900">{presentLogs.length} <span className="text-sm font-normal text-gray-400">/ {totalEmp}</span></p>
                   {presentNames.length > 0 && (
                     <p className="text-[11px] text-gray-400 leading-tight mt-1 truncate">{presentNames.join(', ')}</p>
                   )}
                </div>

                <div className="space-y-1">
                   <p className="text-xs text-gray-500 font-medium flex items-center gap-1"><UserX className="h-3.5 w-3.5"/> Absent</p>
                   <p className="text-xl font-bold text-red-600">{absentEmployees.length}</p>
                   {absentNames.length > 0 && (
                     <p className="text-[11px] text-red-400/80 leading-tight mt-1 truncate">{absentNames.join(', ')}</p>
                   )}
                </div>

                <div className="space-y-1 pt-3 border-t border-gray-100">
                   <p className="text-xs text-gray-500 font-medium flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5"/> Late</p>
                   <p className="text-lg font-semibold text-orange-500">{lateLogs.length}</p>
                   {lateNames.length > 0 && (
                     <p className="text-[11px] text-orange-400/80 leading-tight mt-1 truncate">{lateNames.join(', ')}</p>
                   )}
                </div>

                <div className="space-y-1 pt-3 border-t border-gray-100">
                   <p className="text-xs text-gray-500 font-medium flex items-center gap-1"><Clock className="h-3.5 w-3.5"/> On Time</p>
                   <p className="text-lg font-semibold text-green-600">{presentLogs.length - lateLogs.length}</p>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Activity Feed with key={selectedDate} so React re-initializes on date change */}
      <ActivityFeedClient 
        key={selectedDate}
        initialLogs={recentLogs || []} 
        filterDate={selectedDate} 
      />

    </div>
  )
}