import { redirect } from 'next/navigation'
import { createClient } from '../../utils/supabase/server'
import { MapPin, User } from 'lucide-react'
import TimeClockManager from './TimeClockManager'
import ShiftHistoryList from './ShiftHistoryList'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, shops(name)')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'admin') redirect('/admin')

  // 1. Calculate Today's date in IST
  const formatter = new Intl.DateTimeFormat('en-CA', { 
    timeZone: 'Asia/Kolkata', 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit' 
  })
  const todayStr = formatter.format(new Date())

  // 2. Fetch today's log to determine daily status
  const { data: todayLog } = await supabase
    .from('time_logs')
    .select('*')
    .eq('employee_id', user.id)
    .gte('clock_in_time', `${todayStr}T00:00:00+05:30`)
    .order('clock_in_time', { ascending: false })
    .limit(1)
    .maybeSingle()

  // 3. Determine today's classification
  let todayStatus: 'Scheduled' | 'Weekoff' | 'Leave' | 'Completed' | 'Active' = 'Scheduled'

  if (todayLog) {
    if (todayLog.status === 'Weekoff') {
      todayStatus = 'Weekoff'
    } else if (todayLog.status === 'Leave') {
      todayStatus = 'Leave'
    } else if (todayLog.clock_out_time) {
      todayStatus = 'Completed'
    } else {
      todayStatus = 'Active'
    }
  }

  // 4. Fetch initial 7 completed shifts for history
  const { data: initialShifts } = await supabase
    .from('time_logs')
    .select('*')
    .eq('employee_id', user.id)
    .not('clock_out_time', 'is', null)
    .neq('status', 'Weekoff')
    .neq('status', 'Leave')
    .order('clock_in_time', { ascending: false })
    .range(0, 6)

  const shopName = profile?.shops 
    ? (Array.isArray(profile.shops) ? profile.shops[0]?.name : profile.shops?.name) 
    : 'Unassigned Shop'

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      
      {/* Header */}
      <header className="bg-white rounded-xl shadow-xs p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-[#be9a62] flex items-center gap-2">
            <User className="h-6 w-6 text-[#be9a62]" />
            Welcome, {profile?.full_name}
          </h1>
          <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
            <MapPin className="h-4 w-4" />
            {shopName}
          </p>
        </div>
      </header>

      {/* Time Clock Manager with Daily Schedule Recognition */}
      <TimeClockManager 
        activeLog={todayStatus === 'Active' ? todayLog : null} 
        profile={profile} 
        todayStatus={todayStatus}
        hasCompletedToday={todayStatus === 'Completed'} 
      />

      {/* Paginated Shift History List */}
      <ShiftHistoryList 
        initialShifts={initialShifts || []} 
        employeeId={user.id} 
      />

    </div>
  )
}