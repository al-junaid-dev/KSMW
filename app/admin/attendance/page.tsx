import { createClient } from '../../../utils/supabase/server'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  UserCheck, 
  UserX, 
  AlertTriangle, 
  Store, 
  TrendingUp 
} from 'lucide-react'
import DateFilter from '../DateFilter'

// Safe helper to resolve store name regardless of Supabase join structure
function getStoreName(shops: any): string {
  if (!shops) return 'Unassigned'
  if (Array.isArray(shops)) {
    return shops[0]?.name || 'Unassigned'
  }
  return shops?.name || 'Unassigned'
}

export default async function AttendanceAnalyticsPage({
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

  const selectedDate = params?.date || todayStr
  const isToday = selectedDate === todayStr

  // Calculate day range
  const targetDateObj = new Date(selectedDate)
  targetDateObj.setDate(targetDateObj.getDate() + 1)
  const nextDateStr = targetDateObj.toISOString().split('T')[0]

  // 2. Fetch all employees with store names
  const { data: employees } = await supabase
    .from('profiles')
    .select('id, full_name, designation, shift_start, shift_end, shop_id, shops(name)')
    .eq('role', 'employee')
    .order('full_name', { ascending: true })

  // 3. Fetch time logs for this date
  const { data: logsForDate } = await supabase
    .from('time_logs')
    .select('*')
    .gte('clock_in_time', `${selectedDate}T00:00:00+05:30`)
    .lt('clock_in_time', `${nextDateStr}T00:00:00+05:30`)

  // 4. Categorize Employees
  const totalEmployees = employees?.length || 0
  const presentLogs = logsForDate || []
  const presentEmpIds = new Set(presentLogs.map(l => l.employee_id))

  const activeStaff = isToday 
    ? presentLogs.filter(l => !l.clock_out_time) 
    : []

  const lateLogs = presentLogs.filter(l => l.status === 'Late')
  const onTimeLogs = presentLogs.filter(l => l.status === 'On Time' || (!l.status && !l.clock_out_time))

  const presentList = employees?.filter(emp => presentEmpIds.has(emp.id)) || []
  const absentList = employees?.filter(emp => !presentEmpIds.has(emp.id)) || []
  const attendanceRate = totalEmployees > 0 ? Math.round((presentList.length / totalEmployees) * 100) : 0

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link href="/admin" className="inline-flex items-center text-xs font-semibold text-gray-500 hover:text-[#be9a62] transition-colors mb-1">
            <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Attendance & Presence Ledger
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            {isToday ? 'Live presence and daily attendance check' : `Historical records for ${selectedDate}`}
          </p>
        </div>

        <DateFilter selectedDate={selectedDate} todayStr={todayStr} />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-1">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-blue-600" /> Active Now
          </p>
          <p className="text-2xl font-black text-blue-600 flex items-center gap-2">
            {isToday ? activeStaff.length : 0}
            {isToday && activeStaff.length > 0 && <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />}
          </p>
          <p className="text-xs text-gray-400">{isToday ? 'Currently on shift' : 'Past date'}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-1">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            <UserCheck className="h-4 w-4 text-green-600" /> Present
          </p>
          <p className="text-2xl font-black text-green-600">{presentList.length}</p>
          <p className="text-xs text-gray-400">Total staff clocked in</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-1">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            <UserX className="h-4 w-4 text-red-500" /> Absent
          </p>
          <p className="text-2xl font-black text-red-600">{absentList.length}</p>
          <p className="text-xs text-gray-400">No shift logged</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-1">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-[#be9a62]" /> Attendance Rate
          </p>
          <p className="text-2xl font-black text-[#be9a62]">{attendanceRate}%</p>
          <p className="text-xs text-gray-400">{presentList.length} of {totalEmployees} employees</p>
        </div>
      </div>

      {/* Two Column Layout: Present vs Absent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Present Staff Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-emerald-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-emerald-600" />
              <h2 className="font-bold text-gray-900">Present Staff ({presentList.length})</h2>
            </div>
            <span className="text-xs font-medium text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
              {onTimeLogs.length} On-Time &bull; {lateLogs.length} Late
            </span>
          </div>

          <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
            {presentList.length > 0 ? (
              presentList.map((emp) => {
                const log = presentLogs.find(l => l.employee_id === emp.id)
                const shopName = getStoreName(emp.shops)
                const isActive = log && !log.clock_out_time

                return (
                  <div key={emp.id} className="p-4 flex items-center justify-between gap-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-[#132322] text-[#be9a62] flex items-center justify-center font-bold text-xs shrink-0">
                        {emp.full_name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-900">{emp.full_name}</p>
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <Store className="h-3 w-3" /> {shopName}
                        </p>
                      </div>
                    </div>

                    <div className="text-right space-y-1">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full inline-block ${
                        isActive
                          ? 'bg-blue-100 text-blue-700'
                          : log?.status === 'Late'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {isActive ? 'Active Now' : log?.status || 'Completed'}
                      </span>
                      {log && (
                        <p className="text-[11px] text-gray-400 font-mono">
                          {new Date(log.clock_in_time).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })}
                          {log.clock_out_time ? ` - ${new Date(log.clock_out_time).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })}` : ''}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="p-8 text-center text-xs text-gray-400">
                No attendance recorded for this date.
              </div>
            )}
          </div>
        </div>

        {/* Absent Staff Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-rose-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserX className="h-5 w-5 text-rose-600" />
              <h2 className="font-bold text-gray-900">Absent Staff ({absentList.length})</h2>
            </div>
            <span className="text-xs font-medium text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-full">
              Loss of Pay (LOP)
            </span>
          </div>

          <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
            {absentList.length > 0 ? (
              absentList.map((emp) => {
                const shopName = getStoreName(emp.shops)

                return (
                  <div key={emp.id} className="p-4 flex items-center justify-between gap-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs shrink-0">
                        {emp.full_name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-900">{emp.full_name}</p>
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <Store className="h-3 w-3" /> {shopName}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-100">
                        Absent
                      </span>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Shift: {emp.shift_start || '09:30'} - {emp.shift_end || '18:30'}
                      </p>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="p-8 text-center text-xs text-gray-400">
                100% staff attendance recorded!
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  )
}