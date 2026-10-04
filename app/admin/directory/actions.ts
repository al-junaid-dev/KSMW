'use server'

import { createClient } from '../../../utils/supabase/server'
import { revalidatePath } from 'next/cache'

// 1. Update Employee Basic Details & Shift Schedule
export async function updateEmployeeHeader(
  employeeId: string,
  data: {
    full_name: string
    joining_date: string
    fixed_basic: number
    fixed_hra: number
    shift_start: string
    shift_end: string
  }
) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: data.full_name.trim(),
      joining_date: data.joining_date || null,
      fixed_basic: data.fixed_basic,
      fixed_hra: data.fixed_hra,
      shift_start: data.shift_start,
      shift_end: data.shift_end,
    })
    .eq('id', employeeId)

  if (error) return { error: error.message }

  revalidatePath(`/admin/directory/${employeeId}`)
  revalidatePath('/admin/directory')
  revalidatePath('/admin')
  return { success: true }
}

// 2. Update Employment Terms
export async function updateEmployeeTerms(
  employeeId: string,
  data: {
    employee_code: string
    department: string
    hourly_rate: number
  }
) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('profiles')
    .update({
      employee_code: data.employee_code.trim(),
      department: data.department.trim(),
      hourly_rate: data.hourly_rate,
    })
    .eq('id', employeeId)

  if (error) return { error: error.message }

  revalidatePath(`/admin/directory/${employeeId}`)
  return { success: true }
}

// 3. Update Financial & Statutory Info
export async function updateEmployeeFinancials(
  employeeId: string,
  data: {
    bank_name: string
    bank_account_no: string
    uan: string
    pan: string
  }
) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('profiles')
    .update({
      bank_name: data.bank_name.trim(),
      bank_account_no: data.bank_account_no.trim(),
      uan: data.uan.trim(),
      pan: data.pan.trim().toUpperCase(),
    })
    .eq('id', employeeId)

  if (error) return { error: error.message }

  revalidatePath(`/admin/directory/${employeeId}`)
  return { success: true }
}

// 4. Delete Employee Profile
export async function deleteEmployeeProfile(employeeId: string) {
  const supabase = await createClient()

  // Clean up associated time logs and payslips
  await supabase.from('time_logs').delete().eq('employee_id', employeeId)
  await supabase.from('payslips').delete().eq('employee_id', employeeId)

  const { error } = await supabase.from('profiles').delete().eq('id', employeeId)

  if (error) return { error: error.message }

  revalidatePath('/admin/directory')
  revalidatePath('/admin')
  return { success: true }
}

// 5. Update Daily Attendance Override (Leaves, Weekoffs, Present, Late, Scheduled)
export async function updateAttendanceDayLog(
  employeeId: string,
  dateStr: string,
  status: 'Present' | 'Late' | 'Weekoff' | 'Leave' | 'Absent' | 'Scheduled',
  times?: { clock_in?: string; clock_out?: string }
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  // 1. Verify joining date boundary
  const { data: profile } = await supabase
    .from('profiles')
    .select('shop_id, joining_date')
    .eq('id', employeeId)
    .single()

  if (profile?.joining_date && dateStr < profile.joining_date) {
    return { success: false, error: 'Cannot edit attendance prior to the employee joining date.' }
  }

  const shopId = profile?.shop_id || null
  const startOfDay = `${dateStr}T00:00:00+05:30`
  const endOfDay = `${dateStr}T23:59:59+05:30`

  // 2. Check for an existing log on this IST day
  const { data: existingLog } = await supabase
    .from('time_logs')
    .select('id')
    .eq('employee_id', employeeId)
    .gte('clock_in_time', startOfDay)
    .lte('clock_in_time', endOfDay)
    .maybeSingle()

  // 3. Status Handling
  if (status === 'Absent' || status === 'Scheduled') {
    if (existingLog) {
      const { error } = await supabase.from('time_logs').delete().eq('id', existingLog.id)
      if (error) return { success: false, error: error.message }
    }
  } else if (status === 'Weekoff' || status === 'Leave') {
    const logPayload = {
      employee_id: employeeId,
      shop_id: shopId,
      clock_in_time: `${dateStr}T12:00:00+05:30`,
      clock_out_time: `${dateStr}T12:00:00+05:30`,
      total_hours: 0,
      status: status,
    }

    const { error } = existingLog
      ? await supabase.from('time_logs').update(logPayload).eq('id', existingLog.id)
      : await supabase.from('time_logs').insert(logPayload)

    if (error) return { success: false, error: error.message }
  } else {
    const clockIn = times?.clock_in || `${dateStr}T09:30:00+05:30`
    const clockOut = times?.clock_out || `${dateStr}T18:30:00+05:30`
    const diffHours = parseFloat(
      ((new Date(clockOut).getTime() - new Date(clockIn).getTime()) / (1000 * 60 * 60)).toFixed(2)
    )

    const logPayload = {
      employee_id: employeeId,
      shop_id: shopId,
      clock_in_time: clockIn,
      clock_out_time: clockOut,
      total_hours: diffHours > 0 ? diffHours : 8.0,
      status: status,
    }

    const { error } = existingLog
      ? await supabase.from('time_logs').update(logPayload).eq('id', existingLog.id)
      : await supabase.from('time_logs').insert(logPayload)

    if (error) return { success: false, error: error.message }
  }

  revalidatePath(`/admin/directory/${employeeId}`)
  revalidatePath('/admin')
  revalidatePath('/admin/attendance')
  return { success: true }
}

// 6. Set Future Weekoff strictly from TOMORROW onwards
export async function setFutureWeeklyOff(
  employeeId: string,
  dayOfWeek: number, // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  month: number,
  year: number
): Promise<{ success: boolean; count?: number; removedCount?: number; error?: string }> {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('shop_id, joining_date')
    .eq('id', employeeId)
    .single()

  const shopId = profile?.shop_id || null

  // 1. Calculate Today and Tomorrow in IST
  const istFormatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  
  const now = new Date()
  const todayStr = istFormatter.format(now)

  // Calculate Tomorrow in IST (+1 day)
  const tomorrowObj = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  const tomorrowStr = istFormatter.format(tomorrowObj)

  // 2. Month boundaries
  const totalDays = new Date(year, month, 0).getDate()
  const monthStartStr = `${year}-${String(month).padStart(2, '0')}-01`
  const monthEndStr = `${year}-${String(month).padStart(2, '0')}-${String(totalDays).padStart(2, '0')}`

  // If the entire selected month is before tomorrow, disallow bulk changes
  if (monthEndStr < tomorrowStr) {
    return { 
      success: false, 
      count: 0, 
      error: 'Recurring weekoffs can only be applied to upcoming dates (starting tomorrow).' 
    }
  }

  // The schedule starts either on the 1st of that month or tomorrow (whichever is later)
  const effectiveStartStr = monthStartStr > tomorrowStr ? monthStartStr : tomorrowStr

  // 3. Collect the new matching dates (starting TOMORROW)
  const targetNewDates: string[] = []

  for (let day = 1; day <= totalDays; day++) {
    const d = new Date(year, month - 1, day)
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`

    // STRICT GUARD: Must be on/after tomorrow and on/after joining date
    if (dateStr >= effectiveStartStr) {
      if (!profile?.joining_date || dateStr >= profile.joining_date) {
        if (d.getDay() === dayOfWeek) {
          targetNewDates.push(dateStr)
        }
      }
    }
  }

  // 4. CLEANUP: Delete only upcoming weekoffs that are >= tomorrow and don't match the new weekday
  const { data: existingFutureWeekoffs } = await supabase
    .from('time_logs')
    .select('id, clock_in_time')
    .eq('employee_id', employeeId)
    .eq('status', 'Weekoff')
    .gte('clock_in_time', `${effectiveStartStr}T00:00:00+05:30`)
    .lte('clock_in_time', `${monthEndStr}T23:59:59+05:30`)

  let removedCount = 0
  if (existingFutureWeekoffs && existingFutureWeekoffs.length > 0) {
    const idsToDelete: string[] = []

    for (const log of existingFutureWeekoffs) {
      const logDateStr = istFormatter.format(new Date(log.clock_in_time))
      if (!targetNewDates.includes(logDateStr)) {
        idsToDelete.push(log.id)
      }
    }

    if (idsToDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from('time_logs')
        .delete()
        .in('id', idsToDelete)

      if (deleteError) {
        return { success: false, error: deleteError.message }
      }
      removedCount = idsToDelete.length
    }
  }

  if (targetNewDates.length === 0) {
    revalidatePath(`/admin/directory/${employeeId}`)
    return { 
      success: true, 
      count: 0, 
      removedCount,
      error: 'No upcoming dates from tomorrow onwards match this weekday in the selected month.' 
    }
  }

  // 5. UPSERT the new upcoming weekoff dates
  for (const dateStr of targetNewDates) {
    const startOfDay = `${dateStr}T00:00:00+05:30`
    const endOfDay = `${dateStr}T23:59:59+05:30`

    const { data: existingLog } = await supabase
      .from('time_logs')
      .select('id')
      .eq('employee_id', employeeId)
      .gte('clock_in_time', startOfDay)
      .lte('clock_in_time', endOfDay)
      .maybeSingle()

    const payload = {
      employee_id: employeeId,
      shop_id: shopId,
      clock_in_time: `${dateStr}T12:00:00+05:30`,
      clock_out_time: `${dateStr}T12:00:00+05:30`,
      total_hours: 0,
      status: 'Weekoff',
    }

    if (existingLog) {
      await supabase.from('time_logs').update(payload).eq('id', existingLog.id)
    } else {
      await supabase.from('time_logs').insert(payload)
    }
  }

  revalidatePath(`/admin/directory/${employeeId}`)
  return { success: true, count: targetNewDates.length, removedCount }
}

// 7. Scoped Fetch for Monthly Logs (Only updates the Attendance Ledger without full-page reload)
export async function fetchEmployeeMonthLogs(
  employeeId: string,
  month: number,
  year: number
): Promise<{ logs: any[]; error?: string }> {
  const supabase = await createClient()
  const startOfMonth = `${year}-${String(month).padStart(2, '0')}-01T00:00:00+05:30`
  const daysInMonthCount = new Date(year, month, 0).getDate()
  const endOfMonth = `${year}-${String(month).padStart(2, '0')}-${String(daysInMonthCount).padStart(2, '0')}T23:59:59+05:30`

  const { data: monthLogs, error } = await supabase
    .from('time_logs')
    .select('*')
    .eq('employee_id', employeeId)
    .gte('clock_in_time', startOfMonth)
    .lte('clock_in_time', endOfMonth)

  if (error) return { error: error.message, logs: [] }
  return { logs: monthLogs || [] }
}