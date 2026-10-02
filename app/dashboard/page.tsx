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

  // 1. Fetch active log
  const { data: activeLog } = await supabase
    .from('time_logs')
    .select('*')
    .eq('employee_id', user.id)
    .is('clock_out_time', null)
    .order('clock_in_time', { ascending: false })
    .limit(1)
    .single()

  // 2. Calculate "Today" in IST
  const formatter = new Intl.DateTimeFormat('en-CA', { 
    timeZone: 'Asia/Kolkata', 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit' 
  })
  const todayStr = formatter.format(new Date())

  // 3. Check if a completed shift exists for today
  const { data: completedTodayLog } = await supabase
    .from('time_logs')
    .select('id')
    .eq('employee_id', user.id)
    .not('clock_out_time', 'is', null)
    .gte('clock_in_time', `${todayStr}T00:00:00+05:30`)
    .limit(1)
    .maybeSingle()

  const hasCompletedToday = Boolean(completedTodayLog)

  // 4. Fetch initial 7 recent shifts for the pagination component
  const { data: initialShifts } = await supabase
    .from('time_logs')
    .select('*')
    .eq('employee_id', user.id)
    .not('clock_out_time', 'is', null)
    .order('clock_in_time', { ascending: false })
    .range(0, 6)

  const shopName = profile?.shops ? (Array.isArray(profile.shops) ? profile.shops[0]?.name : profile.shops?.name) : 'Unassigned Shop'

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-3xl mx-auto space-y-6 pb-20">
          
          <header className="bg-white rounded-xl shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#be9a62] flex items-center gap-2">
                <User className="h-6 w-6 text-blue-[#be9a62]" />
                Welcome, {profile?.full_name}
              </h1>
              <p className="text-gray-500 flex items-center gap-1 mt-1">
                <MapPin className="h-4 w-4" />
                {shopName}
              </p>
            </div>
          </header>

          {/* Time Clock Manager with Single-Shift Lockout */}
          <TimeClockManager 
            activeLog={activeLog} 
            profile={profile} 
            hasCompletedToday={hasCompletedToday} 
          />

          {/* Paginated Shift History List */}
          <ShiftHistoryList 
            initialShifts={initialShifts || []} 
            employeeId={user.id} 
          />

        </div>
      </main>
    </div>
  )
}