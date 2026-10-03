'use server'

import { createClient } from '../../utils/supabase/server'

export async function fetchMoreActivityLogs(offset: number, limit = 20, filterDate?: string) {
  const supabase = await createClient()

  let query = supabase
    .from('time_logs')
    .select(`
      id, clock_in_time, clock_out_time, total_hours, status,
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