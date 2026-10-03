import { createClient } from '../../../utils/supabase/server'
import Link from 'next/link'
import { 
  Store, 
  MapPin, 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  AlertTriangle, 
  ArrowRight,
  TrendingUp
} from 'lucide-react'
import AddStoreModal from './AddStoreModal'
import EmployeeAssignmentManager from './EmployeeAssignmentManager'

export default async function AdminStoresPage() {
  const supabase = await createClient()

  // 1. Fetch all shops and active employees with current store joined
  const { data: shops } = await supabase
    .from('shops')
    .select('*')
    .order('name', { ascending: true })

  const { data: employees } = await supabase
    .from('profiles')
    .select('*, shops(name)')
    .eq('role', 'employee')
    .order('full_name', { ascending: true })

  // 2. Calculate Today's date in IST (Asia/Kolkata)
  const formatter = new Intl.DateTimeFormat('en-CA', { 
    timeZone: 'Asia/Kolkata', 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit' 
  })
  const todayStr = formatter.format(new Date())

  // 3. Fetch today's time logs
  const { data: todayLogs } = await supabase
    .from('time_logs')
    .select('*')
    .gte('clock_in_time', `${todayStr}T00:00:00+05:30`)

  // 4. Compute overall operational stats across all stores
  const totalStores = shops?.length || 0
  const totalStaff = employees?.length || 0
  const totalActiveNow = todayLogs?.filter(log => !log.clock_out_time).length || 0
  const totalPresentToday = new Set(todayLogs?.map(log => log.employee_id)).size
  const totalAttendanceRate = totalStaff > 0 ? Math.round((totalPresentToday / totalStaff) * 100) : 0

  // Dynamic color configuration based on attendance rate
const attendanceColorClass = 
  totalStaff === 0 
    ? 'text-gray-500' 
    : totalAttendanceRate >= 80 
    ? 'text-green-600' 
    : totalAttendanceRate >= 50 
    ? 'text-amber-500' 
    : 'text-red-600'

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-20">
      
      {/* Page Header with Add Store Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Store Operations</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Monitor real-time staffing, attendance, and branch assignments
          </p>
        </div>
        <AddStoreModal />
      </div>

      {/* Global Summary KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-1">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            <Store className="h-4 w-4 text-[#be9a62]" /> Total Stores
          </p>
          <p className="text-2xl font-black text-gray-900">{totalStores}</p>
          <p className="text-xs text-gray-400">Registered Outlets</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-1">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            <Users className="h-4 w-4 text-slate-600" /> Total Staff
          </p>
          <p className="text-2xl font-black text-gray-900">{totalStaff}</p>
          <p className="text-xs text-gray-400">Assigned across outlets</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-1">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-blue-600" /> Active Now
          </p>
          <p className="text-2xl font-black text-blue-600 flex items-center gap-2">
            {totalActiveNow}
            {totalActiveNow > 0 && <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />}
          </p>
          <p className="text-xs text-gray-400">Currently clocked in</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-1">
  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
    <TrendingUp className={`h-4 w-4 ${attendanceColorClass}`} /> Attendance Rate
  </p>
  <p className={`text-2xl font-black ${attendanceColorClass}`}>{totalAttendanceRate}%</p>
  <p className="text-xs text-gray-400">{totalPresentToday} of {totalStaff} present today</p>
</div>
      </div>
      
      {/* Staff Store Allocation Manager Section */}
      <EmployeeAssignmentManager 
        employees={employees || []} 
        shops={shops || []} 
      />

      {/* Outlets Directory Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Store className="h-5 w-5 text-[#be9a62]" /> Outlets Directory ({totalStores})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shops && shops.length > 0 ? (
            shops.map((shop) => {
              const shopEmployees = employees?.filter(emp => emp.shop_id === shop.id) || []
              const totalShopStaff = shopEmployees.length

              const presentLogs = todayLogs?.filter(log => 
                shopEmployees.some(emp => emp.id === log.employee_id)
              ) || []

              const presentEmployeeIds = presentLogs.map(log => log.employee_id)
              const absentEmployees = shopEmployees.filter(emp => !presentEmployeeIds.includes(emp.id))
              const lateLogs = presentLogs.filter(log => log.status === 'Late')
              const activeLogs = presentLogs.filter(log => !log.clock_out_time)
              const onTimeCount = presentLogs.length - lateLogs.length

              return (
                <div 
                  key={shop.id}
                  className="bg-white rounded-2xl shadow-sm border border-[#4f4931]/20 hover:border-[#be9a62] overflow-hidden flex flex-col justify-between transition-all duration-200 hover:shadow-md group"
                >
                  {/* Shop Banner */}
                  <div className="bg-[#132322] p-5 text-white flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Store className="h-5 w-5 text-[#be9a62]" />
                        <h3 className="font-bold text-lg text-white group-hover:text-[#be9a62] transition-colors">
                          {shop.name}
                        </h3>
                      </div>
                      <p className="text-xs text-[#b09a77] flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        {shop.location || 'Location not specified'}
                      </p>
                    </div>

                    <span className="text-xs font-semibold bg-[#be9a62]/20 border border-[#be9a62]/30 text-[#be9a62] px-2.5 py-1 rounded-full shrink-0 flex items-center gap-1.5">
                      {activeLogs.length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-[#be9a62] animate-pulse" />}
                      {activeLogs.length} Active
                    </span>
                  </div>

                  {/* Attendance Matrix */}
                  <div className="p-5 space-y-4 flex-1">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <p className="text-xs text-gray-500 font-medium flex items-center gap-1">
                          <UserCheck className="h-3.5 w-3.5 text-green-600" /> Present
                        </p>
                        <p className="text-xl font-bold text-gray-900 mt-1">
                          {presentLogs.length}
                          <span className="text-xs font-normal text-gray-400 ml-1">/ {totalShopStaff}</span>
                        </p>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <p className="text-xs text-gray-500 font-medium flex items-center gap-1">
                          <UserX className="h-3.5 w-3.5 text-red-500" /> Absent
                        </p>
                        <p className="text-xl font-bold text-red-600 mt-1">
                          {absentEmployees.length}
                        </p>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <p className="text-xs text-gray-500 font-medium flex items-center gap-1">
                          <AlertTriangle className="h-3.5 w-3.5 text-orange-500" /> Late
                        </p>
                        <p className="text-lg font-semibold text-orange-600 mt-1">
                          {lateLogs.length}
                        </p>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <p className="text-xs text-gray-500 font-medium flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-blue-600" /> On-Time
                        </p>
                        <p className="text-lg font-semibold text-blue-600 mt-1">
                          {onTimeCount}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                      <span>Roster size:</span>
                      <span className="font-semibold text-gray-800">{totalShopStaff} employee{totalShopStaff === 1 ? '' : 's'}</span>
                    </div>
                  </div>

                  {/* View Details */}
                  <div className="p-4 bg-gray-50 border-t border-gray-100">
                    <Link
                      href={`/admin/stores/${shop.id}`}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold bg-[#132322] text-white hover:bg-[#be9a62] hover:text-[#132322] transition-colors shadow-sm"
                    >
                      <span>View Live Roster</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="col-span-full bg-white rounded-2xl border border-gray-100 p-12 text-center space-y-3">
              <Store className="h-10 w-10 text-gray-300 mx-auto" />
              <p className="text-gray-700 font-medium">No retail stores created yet.</p>
              <p className="text-xs text-gray-400">Stores created in your database will appear here automatically.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}