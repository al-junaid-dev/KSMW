import { redirect } from 'next/navigation'
import { createClient } from '../../utils/supabase/server'
import AdminSidebar from './AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  // Ensure only admins can access these routes
  if (profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      {/* The Sidebar is rendered here across all Admin pages */}
      <AdminSidebar adminName={profile.full_name || 'Admin'} />
      
      {/* The specific page content (page.tsx, directory/page.tsx) renders inside here */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}