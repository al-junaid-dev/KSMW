import { createClient } from '../../utils/supabase/server'
import { Store, UserCheck, UserX, Clock, AlertTriangle, Activity } from 'lucide-react'
import Link from 'next/link'

export default async function AdminDashboardOverview() {
  const supabase = await createClient()

  // 1. Fetch all shops & employees
  const { data: shops } = await supabase.from('shops').select('*')
  const { data: employees } = await supabase.from('profiles').select('*').eq('role', 'employee')

  // 2. Safely calculate "Today" in IST (Asia/Kolkata)
  const formatter = new Intl.DateTimeFormat('en-CA', { 
    timeZone: 'Asia/Kolkata', 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit' 
  })
  const todayStr = formatter.format(new Date()) // Returns YYYY-MM-DD in IST

  // 3. Fetch TODAY'S time logs (adjusted for IST offset +05:30)
  const { data: todayLogs } = await supabase
    .from('time_logs')
    .select('*')
    .gte('clock_in_time', `${todayStr}T00:00:00+05:30`)

  // 4. Fetch the chronological feed of the 20 most recent logs across all shops
  const { data: recentLogs } = await supabase
    .from('time_logs')
    .select(`
      id, clock_in_time, clock_out_time, total_hours, status,
      profiles ( full_name, shops ( name ) )
    `)
    .order('clock_in_time', { ascending: false })
    .limit(20)

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto pb-20">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Today's Overview</h1>
        <p className="text-gray-500 text-sm">Real-time attendance and shop status</p>
      </div>

      {/* Shop Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {shops?.map(shop => {
          // --- THESE ARE THE MISSING VARIABLES ---
          const shopEmployees = employees?.filter(emp => emp.shop_id === shop.id) || []
          const totalEmp = shopEmployees.length
          
          const presentLogs = todayLogs?.filter(log => shopEmployees.some(emp => emp.id === log.employee_id)) || []
          
          const presentEmployeeIds = presentLogs.map(log => log.employee_id)
          const absentEmployees = shopEmployees.filter(emp => !presentEmployeeIds.includes(emp.id))
          const lateLogs = presentLogs.filter(log => log.status === 'Late')
          const activeLogs = presentLogs.filter(log => !log.clock_out_time)

          const absentNames = absentEmployees.map(emp => emp.full_name)
          const lateNames = shopEmployees.filter(emp => lateLogs.some(log => log.employee_id === emp.id)).map(emp => emp.full_name)
          const presentNames = shopEmployees.filter(emp => presentEmployeeIds.includes(emp.id)).map(emp => emp.full_name)
          // ---------------------------------------

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
                  {activeLogs.length > 0 && <span className="w-1.5 h-1.5 bg-[#be9a62] rounded-full animate-pulse"></span>}
                  {activeLogs.length} Active Now
                </span>
              </div>
              
              <div className="p-4 grid grid-cols-2 gap-4 flex-1">
                <div className="space-y-1">
                   <p className="text-xs text-gray-500 font-medium flex items-center gap-1"><UserCheck className="h-3.5 w-3.5"/> Present</p>
                   <p className="text-xl font-bold text-gray-900">{presentLogs.length} <span className="text-sm font-normal text-gray-400">/ {totalEmp}</span></p>
                   {presentNames.length > 0 && (
                     <p className="text-[11px] text-gray-400 leading-tight mt-1">{presentNames.join(', ')}</p>
                   )}
                </div>

                <div className="space-y-1">
                   <p className="text-xs text-gray-500 font-medium flex items-center gap-1"><UserX className="h-3.5 w-3.5"/> Absent</p>
                   <p className="text-xl font-bold text-red-600">{absentEmployees.length}</p>
                   {absentNames.length > 0 && (
                     <p className="text-[11px] text-red-400/80 leading-tight mt-1">{absentNames.join(', ')}</p>
                   )}
                </div>

                <div className="space-y-1 pt-3 border-t border-gray-100">
                   <p className="text-xs text-gray-500 font-medium flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5"/> Late</p>
                   <p className="text-lg font-semibold text-orange-500">{lateLogs.length}</p>
                   {lateNames.length > 0 && (
                     <p className="text-[11px] text-orange-400/80 leading-tight mt-1">{lateNames.join(', ')}</p>
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

      {/* Master Activity Feed */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-8">
        <div className="p-6 border-b border-gray-100 flex items-center gap-2 bg-slate-50">
          <Activity className="h-5 w-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">Organization Activity Feed</h2>
        </div>
        
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
              {recentLogs && recentLogs.length > 0 ? (
                recentLogs.map((log) => {
                  const isActive = !log.clock_out_time
                  const profile = Array.isArray(log.profiles) ? log.profiles[0] : log.profiles
                  const shop = profile?.shops ? (Array.isArray(profile.shops) ? profile.shops[0] : profile.shops) : null

                  return (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-medium text-gray-900 whitespace-nowrap">{profile?.full_name || 'Unknown User'}</td>
                      <td className="p-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                          <Store className="h-3.5 w-3.5" />
                          {shop?.name || 'Unassigned'}
                        </span>
                      </td>
                      <td className="p-4 text-gray-600 whitespace-nowrap">
                        {new Date(log.clock_in_time).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="p-4 text-gray-600 whitespace-nowrap">
                        {new Date(log.clock_in_time).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="p-4 text-gray-600 whitespace-nowrap">
                        {isActive ? (
                          <span className="text-blue-600 font-medium flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                            Active Now
                          </span>
                        ) : (
                          new Date(log.clock_out_time).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })
                        )}
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          log.status === 'On Time' ? 'bg-green-100 text-green-700' :
                          log.status === 'Late' ? 'bg-red-100 text-red-700' :
                          log.status === 'Early Leave' ? 'bg-orange-100 text-orange-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {log.status || 'Active'}
                        </span>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    No recent activity found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}