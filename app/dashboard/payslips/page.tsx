import { redirect } from 'next/navigation'
import { createClient } from '../../../utils/supabase/server'
import PayslipList from '../PayslipList'

export default async function EmployeePayslipsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, shops(name)')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'admin') redirect('/admin')

  // Fetch finalized payslips
  const { data: payslips } = await supabase
    .from('payslips')
    .select('*')
    .eq('employee_id', user.id)
    .eq('status', 'finalized')
    .order('year', { ascending: false })
    .order('month', { ascending: false })

  const shopName = profile?.shops ? (Array.isArray(profile.shops) ? profile.shops[0]?.name : profile.shops?.name) : 'Unassigned Shop'

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-3xl mx-auto space-y-6 pb-20">
          <div className="bg-[#132322] rounded-xl shadow-lg shadow-[#132322]/50 p-6 border border-[#d1d5db]" >
            <h1 className="text-2xl font-bold text-[wheat] border-b border-[wheat]/30 pb-1 my-4">Payslip Ledger</h1>
            <p className="text-[wheat]/80 text-sm">Download your official monthly salary statements</p>
          </div>

          <PayslipList payslips={payslips || []} profile={profile} />
        </div>
      </main>
    </div>
  )
}