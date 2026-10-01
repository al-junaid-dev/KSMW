import { createClient } from '../../../utils/supabase/server'
import PayrollClient from './PayrollClient'

export default async function PayrollDashboardPage({ searchParams }: { searchParams: Promise<{ month?: string, year?: string }> }) {
  const supabase = await createClient()
  const params = await searchParams

  const currentDate = new Date()
  const month = params?.month ? parseInt(params.month) : currentDate.getMonth() + 1
  const year = params?.year ? parseInt(params.year) : currentDate.getFullYear()

  // Fetch generated payslips for the selected month/year
  const { data: payslips } = await supabase
    .from('payslips')
    .select(`
      *,
      profiles ( full_name )
    `)
    .eq('month', month)
    .eq('year', year)
    .order('created_at', { ascending: false })

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payroll Management</h1>
        <p className="text-gray-500 text-sm">Review, edit, and finalize monthly payslips</p>
      </div>

      <PayrollClient 
        payslips={payslips || []} 
        currentMonth={month} 
        currentYear={year} 
      />
    </div>
  )
}