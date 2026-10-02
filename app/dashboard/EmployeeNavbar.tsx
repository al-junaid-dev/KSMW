'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, LogOut, FileText, Clock, Settings } from 'lucide-react'
import { logout } from '../auth/actions'
import toast from 'react-hot-toast'
import Image from 'next/image'

export default function EmployeeNavbar({ employeeName, shopName }: { employeeName: string, shopName: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const navLinks = [
    { name: 'Time & Shifts', href: '/dashboard', icon: Clock },
    { name: 'My Payslips', href: '/dashboard/payslips', icon: FileText },
  ]

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to log out?')) {
      await logout()
    }
  }

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden sticky top-0 z-50 border-b border-[#4f4931]/50 bg-[#132322] backdrop-blur-md text-white p-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-2">
          {/* Logo */}
          <div className="relative h-8 w-8 overflow-hidden rounded-md flex items-center justify-center bg-white/10">
            <Image 
              src="/logo.png" 
              alt="Logo" 
              fill 
              className="object-contain" 
            />
          </div>
          <span className="font-bold text-lg tracking-tight">Staff Portal</span>
        </div>
        <button onClick={() => setIsOpen(true)} className="p-1 hover:bg-[#be9a62]/20 rounded transition-colors">
          <Menu className="h-6 w-6 text-[#be9a62]" />
        </button>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setIsOpen(false)} />
      )}

      {/* Sidebar Menu */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-[#4f4931]/50 bg-[#132322] text-white transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:w-64 md:h-screen md:sticky md:top-0`}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
             {/* Logo */}
             <div className="relative h-10 w-10 overflow-hidden rounded-md flex items-center justify-center bg-white/10">
               <Image 
                 src="/logo.png" 
                 alt="Logo" 
                 fill 
                 className="object-contain" 
               />
             </div>
             <span className="font-bold text-xl tracking-tight">Staff Portal</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="md:hidden text-[#b09a77] hover:text-white transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navLinks.map((link) => {
            const isActive = pathname === link.href
            const Icon = link.icon
            return (
              <Link 
                key={link.name} 
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-[#be9a62] text-whitesmoke' : 'text-slate-300 hover:bg-[#be9a62]/20 hover:text-white'}`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{link.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer actions: Settings and Logout */}
        <div className="p-4 border-t border-[#4f4931]/50 space-y-2">
          <div className="px-4 py-3 flex items-center justify-between bg-[#be9a62]/10 rounded-xl">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="h-8 w-8 rounded-full bg-[#132322] border border-[#be9a62] text-[#be9a62] flex items-center justify-center font-bold text-sm shrink-0">
                {employeeName.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-white truncate">{employeeName}</p>
                <p className="text-xs text-[#b09a77] truncate">{shopName}</p>
              </div>
            </div>
            <button onClick={() => toast('Settings coming soon!')} className="text-[#b09a77] hover:text-[#be9a62] p-1 transition-colors" title="Settings">
              <Settings className="h-4 w-4" />
            </button>
          </div>

          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 w-full text-left text-red-400 hover:bg-red-500/10 rounded-xl transition-colors text-sm font-medium"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}
