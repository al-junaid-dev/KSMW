'use server'

import { createClient } from '../../utils/supabase/server'
import { revalidatePath } from 'next/cache'

// 1. Fetch paginated activity logs strictly scoped to a selected date
export async function fetchMoreActivityLogs(offset: number, limit = 20, filterDate?: string) {
  const supabase = await createClient()

  let query = supabase
    .from('time_logs')
    .select(`
      id, employee_id, clock_in_time, clock_out_time, total_hours, status,
      profiles ( full_name, shops ( name ) )
    `)
    .order('clock_in_time', { ascending: false })

  if (filterDate) {
    const nextDate = new Date(filterDate)
    nextDate.setDate(nextDate.getDate() + 1)
    const nextDateStr = nextDate.toISOString().split('T')[0]

    query = query
      .gte('clock_in_time', `${filterDate}T00:00:00+05:30`)
      .lt('clock_in_time', `${nextDateStr}T00:00:00+05:30`)
  }

  const { data, error } = await query.range(offset, offset + limit - 1)

  if (error) {
    return { error: error.message, logs: [] }
  }

  return { logs: data || [] }
}

// 2. Edit existing time log
export async function updateTimeLog(logId: string, formData: FormData) {
  const supabase = await createClient()

  const clockInStr = formData.get('clock_in_time') as string
  const clockOutStr = formData.get('clock_out_time') as string
  const status = formData.get('status') as string

  if (!clockInStr) {
    return { error: 'Clock-in time is required' }
  }

  const clockInDate = new Date(clockInStr)
  let clockOutDate: Date | null = null
  let totalHours: number | null = null

  if (clockOutStr && clockOutStr.trim() !== '') {
    clockOutDate = new Date(clockOutStr)
    if (clockOutDate < clockInDate) {
      return { error: 'Clock-out time cannot be earlier than clock-in time' }
    }
    const diffMs = clockOutDate.getTime() - clockInDate.getTime()
    totalHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2))
  }

  const { error } = await supabase
    .from('time_logs')
    .update({
      clock_in_time: clockInDate.toISOString(),
      clock_out_time: clockOutDate ? clockOutDate.toISOString() : null,
      total_hours: totalHours,
      status: status || 'On Time',
    })
    .eq('id', logId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin')
  revalidatePath('/admin/attendance')
  return { success: true }
}

// 3. Delete time log
export async function deleteTimeLog(logId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('time_logs')
    .delete()
    .eq('id', logId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin')
  revalidatePath('/admin/attendance')
  return { success: true }
}