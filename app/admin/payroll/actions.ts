'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '../../../utils/supabase/server'

export async function generateDrafts(month: number, year: number) {
  const supabase = await createClient()

  // 1. Fetch all employees
  const { data: employees } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'employee')

  if (!employees) throw new Error('No employees found')

  // 2. Determine dates for the selected month
  const startDate = new Date(year, month - 1, 1).toISOString()
  const endDate = new Date(year, month, 0, 23, 59, 59).toISOString()
  const payableDays = new Date(year, month, 0).getDate() // E.g., 30 for Sept, 31 for Jan

  // 3. Fetch time logs for the month
  const { data: logs } = await supabase
    .from('time_logs')
    .select('employee_id, clock_in_time, total_hours')
    .gte('clock_in_time', startDate)
    .lte('clock_in_time', endDate)

  // 4. Delete existing DRAFTS for this month/year to prevent duplicates
  await supabase
    .from('payslips')
    .delete()
    .match({ month, year, status: 'draft' })

  // 5. Calculate and Prepare Payslips using Monthly Proration Logic
  const payslipsToInsert = employees.map(emp => {
    // Find logs for this employee
    const empLogs = logs?.filter(l => l.employee_id === emp.id) || []
    
    // Calculate Paid Days (Unique days clocked in)
    const uniqueDays = new Set(empLogs.map(l => new Date(l.clock_in_time).getDate()))
    const paidDays = Math.min(payableDays, uniqueDays.size)
    
    // Proration Ratio (Paid Days / Total Days in Month)
    // Absent days reduce paid days, automatically prorating and deducting pay.
    const ratio = payableDays > 0 ? (paidDays / payableDays) : 0

    // Prorate Fixed Monthly Earnings (Basic, HRA, LTA, Special Allowance)
    const basicEarning = (emp.fixed_basic || 0) * ratio
    const hraEarning = (emp.fixed_hra || 0) * ratio
    const ltaEarning = (emp.fixed_lta || 0) * ratio
    const specialEarning = (emp.fixed_special_allowance || 0) * ratio
    
    // Calculate Overtime (Derived hourly rate from monthly basic structure)
    const totalHoursLogged = empLogs.reduce((sum, log) => sum + (Number(log.total_hours) || 0), 0)
    const expectedHours = paidDays * 9 // Assuming 9-hour shifts
    const otHours = Math.max(0, totalHoursLogged - expectedHours)
    const hourlyRateApprox = (emp.fixed_basic || 15000) / (30 * 9)
    const otEarning = otHours * hourlyRateApprox

    const totalEarnings = basicEarning + hraEarning + ltaEarning + specialEarning + otEarning

    // Calculate Standard Statutory Deductions
    const pfDeduction = basicEarning > 0 ? basicEarning * 0.12 : 0 // 12% of Prorated Basic
    const ptDeduction = totalEarnings > 15000 ? 200 : 0           // Profession Tax slab
    const esicDeduction = totalEarnings <= 21000 ? totalEarnings * 0.0075 : 0 // 0.75% ESIC
    
    const totalDeductions = pfDeduction + ptDeduction + esicDeduction

    return {
      employee_id: emp.id,
      month,
      year,
      payable_days: payableDays,
      paid_days: paidDays,
      total_worked_hours: parseFloat(totalHoursLogged.toFixed(2)),
      
      basic_earning: parseFloat(basicEarning.toFixed(2)),
      hra_earning: parseFloat(hraEarning.toFixed(2)),
      lta_earning: parseFloat(ltaEarning.toFixed(2)),
      special_allowance_earning: parseFloat(specialEarning.toFixed(2)),
      overtime_earning: parseFloat(otEarning.toFixed(2)),
      
      pf_deduction: parseFloat(pfDeduction.toFixed(2)),
      pt_deduction: parseFloat(ptDeduction.toFixed(2)),
      esic_deduction: parseFloat(esicDeduction.toFixed(2)),
      
      final_pay_amount: parseFloat(Math.max(0, totalEarnings - totalDeductions).toFixed(2)),
      status: 'draft'
    }
  })

  // 6. Bulk Insert Drafts
  if (payslipsToInsert.length > 0) {
    const { error } = await supabase.from('payslips').insert(payslipsToInsert)
    if (error) throw new Error(error.message)
  }

  revalidatePath('/admin/payroll')
}

export async function updatePayslip(id: string, updates: any) {
  const supabase = await createClient()
  
  // 1. Fetch the existing slip to preserve base earnings during calculation
  const { data: existing } = await supabase.from('payslips').select('*').eq('id', id).single()
  if (!existing) throw new Error('Payslip not found')

  // 2. Merge existing data with the manual modal updates
  const merged = { ...existing, ...updates }

  // 3. Safely recalculate
  const totalEarnings = Number(merged.basic_earning) + Number(merged.hra_earning) + Number(merged.lta_earning) + Number(merged.special_allowance_earning) + Number(merged.overtime_earning)
  const totalDeductions = Number(merged.pf_deduction) + Number(merged.pt_deduction) + Number(merged.esic_deduction) + Number(merged.lwf_deduction)
  
  // Prevent net salary from dropping below zero
  const final_pay_amount = Math.max(0, totalEarnings - totalDeductions)

  const { error } = await supabase
    .from('payslips')
    .update({
      ...updates,
      final_pay_amount,
      is_edited: true
    })
    .eq('id', id)

  if (error) throw new Error(error.message)
  
  revalidatePath('/admin/payroll')
}

export async function finalizePayslips(month: number, year: number) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('payslips')
    .update({ status: 'finalized' })
    .match({ month, year, status: 'draft' })

  if (error) throw new Error(error.message)
  revalidatePath('/admin/payroll')
}


export async function deleteFinalizedPayslip(payslipId: string): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient()

  // 1. Verify that the payslip exists and is finalized
  const { data: slip, error: fetchError } = await supabase
    .from('payslips')
    .select('id, status')
    .eq('id', payslipId)
    .single()

  if (fetchError || !slip) {
    return { error: 'Payslip record not found' }
  }

  if (slip.status !== 'finalized') {
    return { error: 'Only finalized payslips can be deleted with this action.' }
  }

  // 2. Delete the record
  const { error: deleteError } = await supabase
    .from('payslips')
    .delete()
    .eq('id', payslipId)

  if (deleteError) {
    return { error: deleteError.message }
  }

  revalidatePath('/admin/payroll')
  revalidatePath('/dashboard/payslips')
  return { success: true }
}