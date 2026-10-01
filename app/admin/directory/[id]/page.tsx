import { createClient } from '../../../../utils/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft, User, MapPin, Calendar, Building, BadgeIndianRupee, Shield, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

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

  // 1. Fetch Employee Profile with Store Name
  const { data: employee } = await supabase
    .from('profiles')
    .select('*, shops(name)')
    .eq('id', employeeId)
    .single()

  if (!employee) redirect('/admin/directory')

  // 2. Set active month/year filter (defaults to current)
  const currentDate = new Date()
  const month = resolvedSearch?.month ? parseInt(resolvedSearch.month) : currentDate.getMonth() + 1
  const year = resolvedSearch?.year ? parseInt(resolvedSearch.year) : currentDate.getFullYear()

  // 3. Fetch time logs for this specific month
  const startDate = new Date(year, month - 1, 1).toISOString()
  const endDate = new Date(year, month, 0, 23, 59, 59).toISOString()
  
  const { data: monthLogs } = await supabase
    .from('time_logs')
    .select('*')
    .eq('employee_id', employeeId)
    .gte('clock_in_time', startDate)
    .lte('clock_in_time', endDate)

  // 4. Build Calendar Matrix for the Month
  const totalDaysInMonth = new Date(year, month, 0).getDate()
  const daysArray = Array.from({ length: totalDaysInMonth }, (_, i) => {
    const dayNum = i + 1
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
    
    // Find log for this specific day (Fixed typo from l.l to l.clock_in_time)
    const log = monthLogs?.find(l => l.clock_in_time.split('T')[0] === dateStr || new Date(l.clock_in_time).getDate() === dayNum)
    
    let status = 'No Log'
    let badgeColor = 'bg-gray-100 text-gray-400'
    
    // Check if it's a weekend (Sunday = 0)
    const dayOfWeek = new Date(year, month - 1, dayNum).getDay()
    const isSunday = dayOfWeek === 0

    if (log) {
      if (log.status === 'Late') {
        status = 'Late'
        badgeColor = 'bg-orange-100 text-orange-700 border border-orange-200'
      } else {
        status = 'Present'
        badgeColor = 'bg-green-100 text-green-700 border border-green-200'
      }
    } else if (isSunday) {
      status = 'Weekend'
      badgeColor = 'bg-slate-50 text-slate-400'
    } else if (new Date(dateStr) < new Date(currentDate.toDateString())) {
      status = 'Absent'
      badgeColor = 'bg-red-100 text-red-700 border border-red-200'
    }

    return { dayNum, dateStr, status, badgeColor, log }
  })

  const shopName = employee.shops ? (Array.isArray(employee.shops) ? employee.shops[0]?.name : employee.shops?.name) : 'Unassigned'

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 pb-20">
      
      {/* Navigation Header */}
      <div>
        <Link href="/admin/directory" className="inline-flex items-center text-sm text-[#132322] hover:text-[#be9a62] font-medium mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Directory
        </Link>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-[#be9a62] text-white flex items-center justify-center font-bold text-2xl shadow-inner">
              {employee.full_name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{employee.full_name}</h1>
              <p className="text-gray-500 text-sm flex items-center gap-2 mt-1">
                <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium text-xs">{employee.designation || 'Staff'}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5"/> {shopName}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 text-sm border-t md:border-t-0 pt-4 md:pt-0 border-gray-100">
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
              <p className="text-gray-400 text-xs font-medium">Joining Date</p>
              <p className="font-bold text-gray-800 mt-0.5">{employee.joining_date || '29 Jul 2024'}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
              <p className="text-gray-400 text-xs font-medium">Monthly CTC</p>
              <p className="font-bold text-gray-800 mt-0.5">₹{((employee.fixed_basic || 0) + (employee.fixed_hra || 0)).toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Employment Terms */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
          <h2 className="font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
            <Shield className="h-4 w-4 text-blue-600" /> Terms & Schedule
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Employee Code</span>
              <span className="font-semibold text-gray-800">{employee.employee_code || 'EMP-101'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Department</span>
              <span className="font-semibold text-gray-800">{employee.department || 'Retail Sales'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Shift Schedule</span>
              <span className="font-semibold text-gray-800">{employee.shift_start} - {employee.shift_end}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Hourly Rate</span>
              <span className="font-semibold text-gray-800">₹{employee.hourly_rate || 100}/hr</span>
            </div>
          </div>
        </div>

        {/* Bank & Statutory Details */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4 md:col-span-2">
          <h2 className="font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
            <BadgeIndianRupee className="h-4 w-4 text-green-600" /> Financial & Statutory Info
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between bg-gray-50 p-2.5 rounded-lg">
              <span className="text-gray-500">Bank Name</span>
              <span className="font-semibold text-gray-800">{employee.bank_name || 'HDFC Bank'}</span>
            </div>
            <div className="flex justify-between bg-gray-50 p-2.5 rounded-lg">
              <span className="text-gray-500">Account No</span>
              <span className="font-semibold text-gray-800">{employee.bank_account_no || '********6789'}</span>
            </div>
            <div className="flex justify-between bg-gray-50 p-2.5 rounded-lg">
              <span className="text-gray-500">UAN Number</span>
              <span className="font-semibold text-gray-800">{employee.uan || '102116804585'}</span>
            </div>
            <div className="flex justify-between bg-gray-50 p-2.5 rounded-lg">
              <span className="text-gray-500">PAN Card</span>
              <span className="font-semibold text-gray-800">{employee.pan || 'DBFPJ0593E'}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Attendance Calendar Ledger */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Calendar Header & Filters */}
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" /> Monthly Attendance Ledger
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Track daily presence, late arrivals, and absences</p>
          </div>

          {/* Month / Year Switcher for Lazy-Loading History */}
          <form method="GET" className="flex items-center gap-2">
            <select 
              name="month" 
              defaultValue={month}
              className="rounded-lg border-gray-300 py-1.5 pl-3 pr-8 text-sm font-semibold text-gray-900 bg-white border shadow-sm"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <option key={m} value={m}>{new Date(0, m - 1).toLocaleString('default', { month: 'long' })}</option>
              ))}
            </select>
            <select 
              name="year" 
              defaultValue={year}
              className="rounded-lg border-gray-300 py-1.5 pl-3 pr-8 text-sm font-semibold text-gray-900 bg-white border shadow-sm"
            >
              {[2025, 2026, 2027].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <button type="submit" className="bg-[#be9a62] hover:bg-[#132322] text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
              Load
            </button>
          </form>
        </div>

        {/* Legend */}
        <div className="px-6 py-3 bg-white border-b border-gray-100 flex flex-wrap gap-4 text-xs font-semibold">
          <span className="flex items-center gap-1.5 text-green-700"><CheckCircle className="h-4 w-4 text-green-600"/> Present</span>
          <span className="flex items-center gap-1.5 text-orange-700"><AlertTriangle className="h-4 w-4 text-orange-500"/> Late Arrival</span>
          <span className="flex items-center gap-1.5 text-red-700"><XCircle className="h-4 w-4 text-red-500"/> Absent (LOP)</span>
          <span className="flex items-center gap-1.5 text-gray-400">◯ Weekend / Off</span>
        </div>

        {/* Days Grid */}
        <div className="p-6 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
          {daysArray.map((item) => (
            <div key={item.dayNum} className={`p-3 rounded-xl border flex flex-col justify-between gap-2 ${item.badgeColor}`}>
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm">Day {item.dayNum}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider">{item.status}</span>
              </div>
              
              {item.log ? (
                <div className="text-[11px] space-y-0.5 pt-2 border-t border-current/10">
                  <p>In: {new Date(item.log.clock_in_time).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })}</p>
                  {item.log.clock_out_time && (
                    <p>Out: {new Date(item.log.clock_out_time).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })}</p>
                  )}
                </div>
              ) : (
                <div className="text-[11px] text-gray-400 pt-2 border-t border-current/10">
                  {item.status === 'Weekend' ? 'Non-Working' : 'No Log Recorded'}
                </div>
              )}
            </div>
          ))}
        </div>

      </div>

    </div>
  )
}