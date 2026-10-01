'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '../../utils/supabase/server'

export async function clockIn(status: string, remarks: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase.from('time_logs').insert({
    employee_id: user.id,
    status,
    remarks
  })

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard')
}

export async function clockOut(logId: string, clockInTime: string, outStatus: string, outRemarks: string) {
  const supabase = await createClient()
  
  const clockOutTime = new Date()
  const clockIn = new Date(clockInTime)
  const hours = (clockOutTime.getTime() - clockIn.getTime()) / (1000 * 60 * 60)

  // Fetch current log to append remarks if needed
  const { data: currentLog } = await supabase.from('time_logs').select('remarks').eq('id', logId).single()
  const finalRemarks = currentLog?.remarks ? `${currentLog.remarks} | ${outRemarks}` : outRemarks;

  const { error } = await supabase.from('time_logs').update({
    clock_out_time: clockOutTime.toISOString(),
    total_hours: parseFloat(hours.toFixed(2)),
    status: outStatus,
    remarks: finalRemarks
  }).eq('id', logId)

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard')
}

export async function fetchMoreShifts(employeeId: string, offset: number = 0, limit: number = 7) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('time_logs')
    .select('*')
    .eq('employee_id', employeeId)
    .not('clock_out_time', 'is', null)
    .order('clock_in_time', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw new Error(error.message)
  return data || []
}