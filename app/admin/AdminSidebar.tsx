'use client'

import Image from 'next/image'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, LayoutDashboard, Users, FileText, LogOut } from 'lucide-react'
import { logout } from '../auth/actions'

export default function AdminSidebar({ adminName }: { adminName: string }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isDesktopExpanded, setIsDesktopExpanded] = useState(true)
  const pathname = usePathname()

  const navLinks = [
    { name: 'Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'Directory', href: '/admin/directory', icon: Users },
    { name: 'Payroll', href: '/admin/payroll', icon: FileText },
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
          <div className="relative h-8 w-8 overflow-hidden rounded-md flex items-center justify-center bg-white/10">
            <Image 
              src="/logo.png" 
              alt="Logo" 
              fill 
              className="object-contain p-1" 
            />
          </div>
          <span className="font-bold text-lg tracking-tight"> KSWMG </span>
          <p className="text-[#be9a62] text-sm">Business Solutions</p>
        </div>
        <button onClick={() => setIsMobileOpen(true)} className="p-1 hover:bg-[#be9a62]/20 rounded transition-colors text-[#be9a62]">
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Sidebar Overlay (Mobile Only) */}
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 md:hidden transition-opacity" onClick={() => setIsMobileOpen(false)} />
      )}

      {/* Sidebar Menu */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-50 bg-[#132322] text-white flex flex-col border-r border-[#4f4931]/50
          transition-all duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'} 
          md:translate-x-0 md:static md:sticky md:top-0 md:h-screen
          ${isDesktopExpanded ? 'md:w-64' : 'md:w-20'}
        `}
      >
        {/* Header / Brand */}
        <div className={`p-5 flex items-center ${isDesktopExpanded ? 'justify-start' : 'md:justify-center'}`}>
          
          {/* --- DESKTOP: Interactive Toggle (Logo -> Menu on hover) --- */}
          <button 
            onClick={() => setIsDesktopExpanded(!isDesktopExpanded)}
            title={isDesktopExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
            className="hidden md:block relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-white/10 group cursor-pointer"
          >
            {/* Layer 1: Logo (Visible by default, fades out on hover) */}
            <div className="absolute inset-0 flex items-center justify-center transition-all duration-300 opacity-100 group-hover:opacity-0 group-hover:scale-90">
              <Image 
                src="/logo.png" 
                alt="Logo" 
                fill 
                className="object-contain p-1" 
              />
            </div>
            
            {/* Layer 2: Menu Icon (Hidden by default, fades in on hover) */}
            <div className="absolute inset-0 flex items-center justify-center bg-[#132322] transition-all duration-300 opacity-0 group-hover:opacity-100 group-hover:scale-100">
              <Menu className="h-5 w-5 text-[#be9a62]" />
            </div>
          </button>

          {/* --- MOBILE: Static Logo (No hover effects) --- */}
          <div className="md:hidden relative h-10 w-10 shrink-0 overflow-hidden rounded-md flex items-center justify-center bg-white/10">
            <Image 
              src="/logo.png" 
              alt="Logo" 
              fill 
              className="object-contain p-1" 
            />
          </div>

          {/* --- BRAND TEXT (Hidden on desktop when collapsed) --- */}
          <div className={`flex flex-col whitespace-nowrap overflow-hidden transition-all duration-300 ${isDesktopExpanded ? 'ml-3 opacity-100 w-auto' : 'md:opacity-0 md:w-0 md:hidden md:ml-0'}`}>
            <span className="font-bold text-xl tracking-tight leading-none text-white">KSWMG</span>
            <span className="text-[#be9a62] text-[10px] mt-1 uppercase tracking-widest font-semibold">Business Solutions</span>
          </div>

          {/* --- MOBILE: Close Sidebar Button --- */}
          <button onClick={() => setIsMobileOpen(false)} className="md:hidden ml-auto text-slate-400 hover:text-white transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 space-y-2 mt-4 overflow-x-hidden">
          {navLinks.map((link) => {
            const isActive = pathname === link.href
            const Icon = link.icon
            return (
              <Link 
                key={link.name} 
                href={link.href}
                title={!isDesktopExpanded ? link.name : undefined}
                onClick={() => setIsMobileOpen(false)}
                className={`
                  flex items-center gap-3 py-3 rounded-xl transition-all duration-200
                  ${isActive ? 'bg-[#be9a62] text-[#132322] shadow-lg shadow-[#be9a62]/20' : 'text-slate-300 hover:bg-[#be9a62]/10 hover:text-white'}
                  ${isDesktopExpanded ? 'px-4 justify-start' : 'md:justify-center px-0'}
                `}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className={`font-medium whitespace-nowrap transition-all duration-300 ${isDesktopExpanded ? 'opacity-100 md:w-auto md:block' : 'md:opacity-0 md:w-0 md:hidden'}`}>
                  {link.name}
                </span>
              </Link>
            )
          })}
        </nav>

        {/* Footer (Profile & Logout) */}
        <div className="p-4 border-t border-[#4f4931]/50 overflow-hidden">
          <div className={`flex items-center mb-3 bg-[#be9a62]/10 rounded-xl border border-[#be9a62]/20 transition-all duration-300 ${isDesktopExpanded ? 'px-4 py-3 gap-3 justify-start' : 'md:justify-center md:px-0 md:py-2 md:gap-0'}`}>
            <div className="h-10 w-10 shrink-0 rounded-full bg-[#132322] border-2 border-[#be9a62] flex items-center justify-center font-bold text-white text-sm shadow-inner">
              {adminName.charAt(0)}
            </div>
            <div className={`overflow-hidden transition-all duration-300 ${isDesktopExpanded ? 'opacity-100 w-auto' : 'md:opacity-0 md:w-0 md:hidden'}`}>
              <p className="text-sm font-medium text-white truncate">{adminName}</p>
              <p className="text-[10px] uppercase tracking-wider font-semibold text-[#be9a62] truncate">System Admin</p>
            </div>
          </div>

          <button 
            onClick={handleLogout}
            title={!isDesktopExpanded ? "Logout" : undefined}
            className={`
              flex items-center gap-3 py-3 w-full text-red-400 hover:bg-red-500/10 rounded-xl transition-colors
              ${isDesktopExpanded ? 'px-4 justify-start text-left' : 'md:justify-center px-0'}
            `}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span className={`font-medium whitespace-nowrap transition-all duration-300 ${isDesktopExpanded ? 'opacity-100 md:block' : 'md:opacity-0 md:w-0 md:hidden'}`}>
              Secure Logout
            </span>
          </button>
        </div>
      </aside>
    </>
  )
}