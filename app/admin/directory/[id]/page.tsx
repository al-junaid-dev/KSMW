import { createClient } from '../../../../utils/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

import EmployeeHeaderClient from './EmployeeHeaderClient'
import EmployeeTermsClient from './EmployeeTermsClient'
import EmployeeFinancialsClient from './EmployeeFinancialsClient'
import AttendanceLedgerClient from './AttendanceLedgerClient'

export default async function EmployeeProfilePage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ id: string }>, 
  searchParams: Promise<{ month?: string, year?: string }> 
}) {
  const resolvedParams = await params
  const resolvedSearch = await searchParams
  const employeeId = resolvedParams.id

  const supabase = await createClient()

  // 1. Fetch Employee Profile
  const { data: employee } = await supabase
    .from('profiles')
    .select('*, shops(name)')
    .eq('id', employeeId)
    .single()

  if (!employee) redirect('/admin/directory')

  // 2. IST Formatter for Date Resolution
  const istDateFormatter = new Intl.DateTimeFormat('en-CA', { 
    timeZone: 'Asia/Kolkata', 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit' 
  })
  const todayStr = istDateFormatter.format(new Date())

  const [currentYearStr, currentMonthStr] = todayStr.split('-')
  const month = resolvedSearch?.month ? parseInt(resolvedSearch.month) : parseInt(currentMonthStr)
  const year = resolvedSearch?.year ? parseInt(resolvedSearch.year) : parseInt(currentYearStr)

  // 3. Fetch Time Logs for the month
  const startOfMonth = `${year}-${String(month).padStart(2, '0')}-01T00:00:00+05:30`
  const daysInMonthCount = new Date(year, month, 0).getDate()
  const endOfMonth = `${year}-${String(month).padStart(2, '0')}-${String(daysInMonthCount).padStart(2, '0')}T23:59:59+05:30`

  const { data: monthLogs } = await supabase
    .from('time_logs')
    .select('*')
    .eq('employee_id', employeeId)
    .gte('clock_in_time', startOfMonth)
    .lte('clock_in_time', endOfMonth)

  // 4. Index logs by IST key
  const logMap = new Map<string, any>()
  monthLogs?.forEach((log) => {
    const istKey = istDateFormatter.format(new Date(log.clock_in_time))
    logMap.set(istKey, log)
  })

  // 5. Build Calendar Day Matrix
  const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const joiningDateStr = employee.joining_date || null

  const daysArray = Array.from({ length: daysInMonthCount }, (_, i) => {
    const dayNum = i + 1
    const dateObj = new Date(year, month - 1, dayNum)
    const dayName = weekdayNames[dateObj.getDay()]
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`

    const log = logMap.get(dateStr)
    const isBeforeJoining = Boolean(joiningDateStr && dateStr < joiningDateStr)
    const isFuture = dateStr > todayStr
    const isToday = dateStr === todayStr

    let status = 'Scheduled'
    let badgeColor = 'bg-slate-50 text-slate-700 border border-slate-200'

    if (isBeforeJoining) {
      status = 'Not Joined'
      badgeColor = 'bg-gray-50 text-gray-400 border border-dashed border-gray-200 opacity-60'
    } else if (log) {
      if (log.status === 'Weekoff') {
        // Weekoffs are uniformly colored for past, present, and future
        status = 'Weekoff'
        badgeColor = 'bg-blue-50 text-blue-700 border border-blue-200'
      } else if (log.status === 'Leave') {
        status = 'Leave'
        badgeColor = 'bg-purple-50 text-purple-700 border border-purple-200'
      } else if (log.status === 'Late') {
        status = 'Late'
        badgeColor = 'bg-orange-100 text-orange-700 border border-orange-200'
      } else {
        status = 'Present'
        badgeColor = 'bg-green-100 text-green-700 border border-green-200'
      }
    } else if (isFuture) {
      // Future day without Weekoff or Leave is a Scheduled Day
      status = 'Scheduled'
      badgeColor = 'bg-slate-50 text-slate-700 border border-slate-200'
    } else if (isToday) {
      // Today without a clock-in yet
      status = 'Scheduled'
      badgeColor = 'bg-amber-50 text-amber-800 border border-amber-200'
    } else {
      // Past day without a log or weekoff is Absent (Loss of Pay)
      status = 'Absent'
      badgeColor = 'bg-red-100 text-red-700 border border-red-200'
    }

    return { 
      dayNum, 
      dayName, 
      dateStr, 
      status, 
      badgeColor, 
      log,
      isBeforeJoining,
      isFuture,
      isToday
    }
  })

  const shopName = employee.shops 
    ? (Array.isArray(employee.shops) ? employee.shops[0]?.name : employee.shops?.name) 
    : 'Unassigned'

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 pb-20">
      <div>
        <Link 
          href="/admin/directory" 
          className="inline-flex items-center text-sm text-[#132322] hover:text-[#be9a62] font-medium mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Directory
        </Link>
        <EmployeeHeaderClient employee={employee} shopName={shopName} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <EmployeeTermsClient 
          employeeId={employee.id}
          employeeCode={employee.employee_code}
          department={employee.department}
          hourlyRate={employee.hourly_rate}
        />

        <EmployeeFinancialsClient 
          employeeId={employee.id}
          bankName={employee.bank_name}
          bankAccountNo={employee.bank_account_no}
          uan={employee.uan}
          pan={employee.pan}
        />
      </div>

      <AttendanceLedgerClient 
        employeeId={employee.id}
        employeeName={employee.full_name}
        joiningDate={joiningDateStr}
        todayStr={todayStr}
        daysArray={daysArray}
        currentMonth={month}
        currentYear={year}
      />
    </div>
  )
}