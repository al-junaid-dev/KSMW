import { createClient } from './../../../../utils/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft, Store, UserCheck, UserX, AlertTriangle, Clock } from 'lucide-react'
import StoreActions from './StoreActions'

export default async function StoreDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const storeId = resolvedParams.id
  
  const supabase = await createClient()

  // 1. Fetch the specific shop details
  const { data: shop } = await supabase.from('shops').select('*').eq('id', storeId).single()
  if (!shop) redirect('/admin/stores')

  // 2. Fetch employees assigned to this specific shop
  const { data: employees } = await supabase
    .from('profiles')
    .select('*')
    .eq('shop_id', storeId)
    .eq('role', 'employee')

  // 3. Fetch today's logs specifically for these employees
  const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' })
  const todayStr = formatter.format(new Date())
  
  const employeeIds = employees?.map(emp => emp.id) || []
  
  let todayLogs: any[] = []
  if (employeeIds.length > 0) {
    const { data } = await supabase
      .from('time_logs')
      .select('*')
      .in('employee_id', employeeIds)
      .gte('clock_in_time', `${todayStr}T00:00:00+05:30`)
    todayLogs = data || []
  }

  // 4. Categorize staff
  const staffList = employees?.map(emp => {
    const log = todayLogs?.find(l => l.employee_id === emp.id)
    
    let status = 'Absent'
    let statusColor = 'bg-red-100 text-red-700'
    let Icon = UserX

    if (log) {
      if (!log.clock_out_time) {
        status = 'Active Now'
        statusColor = 'bg-blue-100 text-blue-700'
        Icon = Clock
      } else if (log.status === 'Late') {
        status = 'Late (Completed)'
        statusColor = 'bg-orange-100 text-orange-700'
        Icon = AlertTriangle
      } else {
        status = 'On Time (Completed)'
        statusColor = 'bg-green-100 text-green-700'
        Icon = UserCheck
      }
    }

    return { ...emp, log, status, statusColor, Icon }
  })

  // Metrics
  const activeCount = staffList?.filter(s => s.status === 'Active Now').length || 0
  const absentCount = staffList?.filter(s => s.status === 'Absent').length || 0
  const lateCount = staffList?.filter(s => s.status.includes('Late')).length || 0

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 pb-20">
      
      {/* Navigation & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="space-y-1">
          <Link href="/admin/stores" className="inline-flex items-center text-sm text-[#132322] hover:text-[#be9a62] font-medium mb-2">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Stores
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Store className="h-6 w-6 text-[#be9a62]" /> {shop.name}
            </h1>
            {/* Edit & Delete Action Buttons */}
            <StoreActions 
              store={shop} 
              employeeCount={employees?.length || 0} 
            />
          </div>
          <p className="text-gray-500 text-sm">{shop.location || 'No location set'}</p>
        </div>
        
        {/* Quick Shop Stats */}
        <div className="flex gap-3">
          <div className="bg-white px-4 py-2 rounded-lg border border-gray-100 shadow-xs text-center min-w-[80px]">
            <p className="text-xs text-gray-500 font-medium">Active</p>
            <p className="text-lg font-bold text-blue-600">{activeCount}</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg border border-gray-100 shadow-xs text-center min-w-[80px]">
            <p className="text-xs text-gray-500 font-medium">Absent</p>
            <p className="text-lg font-bold text-red-600">{absentCount}</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg border border-gray-100 shadow-xs text-center min-w-[80px]">
            <p className="text-xs text-gray-500 font-medium">Late</p>
            <p className="text-lg font-bold text-orange-500">{lateCount}</p>
          </div>
        </div>
      </div>

      {/* Staff Status List */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-slate-50">
          <h2 className="font-semibold text-gray-900">Today's Roster Status</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {staffList && staffList.length > 0 ? (
            staffList.map((staff) => (
              <div key={staff.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                
                {/* Employee Info */}
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold shrink-0">
                    {staff.full_name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{staff.full_name}</p>
                    <p className="text-xs text-gray-500">Scheduled: {staff.shift_start} - {staff.shift_end}</p>
                  </div>
                </div>

                {/* Status Badge & Timing */}
                <div className="flex flex-col sm:items-end gap-1">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${staff.statusColor}`}>
                    <staff.Icon className="h-3.5 w-3.5" />
                    {staff.status}
                    {staff.status === 'Active Now' && <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse ml-1" />}
                  </span>
                  
                  {staff.log && (
                    <p className="text-xs text-gray-500">
                      In: {new Date(staff.log.clock_in_time).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })}
                      {staff.log.clock_out_time ? ` | Out: ${new Date(staff.log.clock_out_time).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })}` : ''}
                    </p>
                  )}
                </div>

              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              No employees assigned to this store yet.
            </div>
          )}
        </div>
      </div>

    </div>
  )
}