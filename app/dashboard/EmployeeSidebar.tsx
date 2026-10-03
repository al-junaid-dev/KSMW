'use client'

import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Calendar, Menu, X, FileText, Clock, LogOut, Settings } from 'lucide-react'
import { logout } from '../auth/actions'
import toast from 'react-hot-toast'

export default function EmployeeSidebar({ employeeName, shopName }: { employeeName: string, shopName: string }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isDesktopExpanded, setIsDesktopExpanded] = useState(true)
  const pathname = usePathname()
  const isFirstRender = useRef(true)

  // Automatically shrink sidebar on desktop & close mobile drawer once page loads
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    setIsDesktopExpanded(false)
    setIsMobileOpen(false)
  }, [pathname])

  const navLinks = [
    { name: 'Time & Shifts', href: '/dashboard', icon: Clock },
    { name: 'My Payslips', href: '/dashboard/payslips', icon: FileText },
    { name: 'Attendance', href: '/dashboard/attendance', icon: Calendar }
  ]

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to log out?')) {
      await logout()
    }
  }

  const handleNavClick = () => {
    setIsMobileOpen(false)
    setIsDesktopExpanded(false)
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
          <p className="text-[#be9a62] text-sm">Staff Portal</p>
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
          
          {/* DESKTOP: Interactive Toggle (Logo -> Hamburger on hover) */}
          <button 
            onClick={() => setIsDesktopExpanded(!isDesktopExpanded)}
            title={isDesktopExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
            className="hidden md:block relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-white/10 group cursor-pointer"
          >
            {/* Layer 1: Logo */}
            <div className="absolute inset-0 flex items-center justify-center transition-all duration-300 opacity-100 group-hover:opacity-0 group-hover:scale-90">
              <Image 
                src="/logo.png" 
                alt="Logo" 
                fill 
                className="object-contain p-1" 
              />
            </div>
            
            {/* Layer 2: Menu Icon */}
            <div className="absolute inset-0 flex items-center justify-center bg-[#132322] transition-all duration-300 opacity-0 group-hover:opacity-100 group-hover:scale-100">
              <Menu className="h-5 w-5 text-[#be9a62]" />
            </div>
          </button>

          {/* MOBILE: Static Logo */}
          <div className="md:hidden relative h-10 w-10 shrink-0 overflow-hidden rounded-md flex items-center justify-center bg-white/10">
            <Image 
              src="/logo.png" 
              alt="Logo" 
              fill 
              className="object-contain p-1" 
            />
          </div>

          {/* Brand Text (Hidden when collapsed on desktop) */}
          <div className={`flex flex-col whitespace-nowrap overflow-hidden transition-all duration-300 ${isDesktopExpanded ? 'ml-3 opacity-100 w-auto' : 'md:opacity-0 md:w-0 md:hidden md:ml-0'}`}>
            <span className="font-bold text-xl tracking-tight leading-none text-white">KSWMG</span>
            <span className="text-[#be9a62] text-[10px] mt-1 uppercase tracking-widest font-semibold">Staff Portal</span>
          </div>

          {/* Mobile Close Button */}
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
                onClick={handleNavClick}
                className={`
                  flex items-center gap-3 py-3 rounded-xl transition-all duration-200
                  ${isActive ? 'bg-[#be9a62] text-[#132322] shadow-lg shadow-[#be9a62]/20 font-semibold' : 'text-slate-300 hover:bg-[#be9a62]/10 hover:text-white'}
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

        {/* Footer (Profile, Settings, & Logout) */}
        <div className="p-4 border-t border-[#4f4931]/50 overflow-hidden space-y-2">
          <div className={`flex items-center bg-[#be9a62]/10 rounded-xl border border-[#be9a62]/20 transition-all duration-300 ${isDesktopExpanded ? 'px-4 py-3 justify-between' : 'md:justify-center md:px-0 md:py-2'}`}>
            <div className={`flex items-center overflow-hidden ${isDesktopExpanded ? 'gap-3' : 'justify-center'}`}>
              <div className="h-10 w-10 shrink-0 rounded-full bg-[#132322] border-2 border-[#be9a62] text-white flex items-center justify-center font-bold text-sm shadow-inner">
                {employeeName.charAt(0)}
              </div>
              <div className={`overflow-hidden transition-all duration-300 ${isDesktopExpanded ? 'opacity-100 w-auto' : 'md:opacity-0 md:w-0 md:hidden'}`}>
                <p className="text-sm font-medium truncate text-white">{employeeName}</p>
                <p className="text-[10px] uppercase tracking-wider font-semibold text-[#be9a62] truncate">{shopName}</p>
              </div>
            </div>
            
            {/* Settings Button */}
            <button 
              onClick={() => toast('Settings coming soon!')} 
              className={`text-[#b09a77] hover:text-[#be9a62] p-1 transition-colors ${isDesktopExpanded ? 'block' : 'md:hidden'}`} 
              title="Settings"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>

          {/* Logout Button */}
          <button 
            onClick={handleLogout}
            title={!isDesktopExpanded ? "Logout" : undefined}
            className={`
              flex items-center gap-3 py-3 w-full text-red-400 hover:bg-red-500/10 rounded-xl transition-colors text-sm font-medium
              ${isDesktopExpanded ? 'px-4 justify-start text-left' : 'md:justify-center px-0'}
            `}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span className={`whitespace-nowrap transition-all duration-300 ${isDesktopExpanded ? 'opacity-100 md:block' : 'md:opacity-0 md:w-0 md:hidden'}`}>
              Logout
            </span>
          </button>
        </div>
      </aside>
    </>
  )
}