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

// 5. Update Daily Attendance Override (Leaves, Weekoffs, Present, Late)
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
    // If setting to Absent or resetting to Scheduled Day, clear any existing log
    if (existingLog) {
      const { error } = await supabase.from('time_logs').delete().eq('id', existingLog.id)
      if (error) return { success: false, error: error.message }
    }
  } else if (status === 'Weekoff' || status === 'Leave') {
    // Stored with 12:00 PM IST anchor so UTC conversions never spill into adjacent dates
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
    // Present or Late (only available for past/today)
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

// 6. Set Future Weekoff for a Specific Day of the Week in a Month
export async function setFutureWeeklyOff(
  employeeId: string,
  dayOfWeek: number, // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  month: number,
  year: number
): Promise<{ success: boolean; count?: number; error?: string }> {
  const supabase = await createClient()

  // 1. Get Employee Profile & Shop ID
  const { data: profile } = await supabase
    .from('profiles')
    .select('shop_id, joining_date')
    .eq('id', employeeId)
    .single()

  const shopId = profile?.shop_id || null

  // 2. IST Formatter for Today's Date Cutoff
  const istFormatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  const todayStr = istFormatter.format(new Date())

  // 3. Find all matching future days in the target month
  const totalDays = new Date(year, month, 0).getDate()
  const targetDates: string[] = []

  for (let day = 1; day <= totalDays; day++) {
    const d = new Date(year, month - 1, day)
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`

    // STRICT SAFETY GUARD: ONLY future dates (today onwards) and on/after joining date
    if (d.getDay() === dayOfWeek && dateStr >= todayStr) {
      if (!profile?.joining_date || dateStr >= profile.joining_date) {
        targetDates.push(dateStr)
      }
    }
  }

  if (targetDates.length === 0) {
    return { 
      success: true, 
      count: 0, 
      error: 'No future dates match this weekday in the selected month.' 
    }
  }

  // 4. Upsert Weekoff records for eligible future dates only
  for (const dateStr of targetDates) {
    const startOfDay = `${dateStr}T00:00:00+05:30`
    const endOfDay = `${dateStr}T23:59:59+05:30`

    const { data: existingLog } = await supabase
      .from('time_logs')
      .select('id, clock_out_time')
      .eq('employee_id', employeeId)
      .gte('clock_in_time', startOfDay)
      .lte('clock_in_time', endOfDay)
      .maybeSingle()

    // Safety: If an employee already clocked out on today, do NOT overwrite it
    if (existingLog && existingLog.clock_out_time && dateStr === todayStr) {
      continue
    }

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
  revalidatePath('/admin')
  return { success: true, count: targetDates.length }
}