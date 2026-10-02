import { redirect } from 'next/navigation'
import { createClient } from '../../utils/supabase/server'
import EmployeeSidebar from './EmployeeSidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name, shops(name)')
    .eq('id', user.id)
    .single()

  // Ensure admins are redirected to the admin portal
  if (profile?.role === 'admin') {
    redirect('/admin')
  }

  // Bypass TypeScript strict inference for the Supabase join
  const shopData = profile?.shops as any
  const shopName = shopData ? (Array.isArray(shopData) ? shopData[0]?.name : shopData.name) : 'Unassigned Shop'

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      {/* The Sidebar is rendered here across all Employee pages */}
      <EmployeeSidebar 
        employeeName={profile?.full_name || 'Staff'} 
        shopName={shopName} 
      />
      
      {/* The specific page content renders inside here */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        {children}
      </main>
    </div>
  )
}