import { Store } from 'lucide-react'

export default function LoginLoading() {
  return (
    <div className="min-h-screen bg-[#192115] flex flex-col items-center justify-center p-4 selection:bg-[#be9a62] selection:text-[#132322]">
      <div className="w-full max-w-md bg-[#132322] border border-[#4f4931]/60 p-8 sm:p-10 rounded-3xl shadow-2xl text-center space-y-6 relative overflow-hidden backdrop-blur-sm">
        
        {/* Luxury Background Glow */}
        <div className="absolute -right-16 -top-16 w-48 h-48 bg-[#be9a62]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-[#4f4931]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Icon with Pulse Animation */}
        <div className="mx-auto h-16 w-16 rounded-2xl bg-[#be9a62] flex items-center justify-center shadow-lg shadow-[#be9a62]/20 animate-pulse relative z-10">
          <Store className="h-8 w-8 text-[#132322]" />
        </div>

        {/* Title & Subtitle */}
        <div className="space-y-1 relative z-10">
          <h1 className="text-xl font-extrabold text-white tracking-tight">KSWMG Business Solutions</h1>
          <p className="text-xs text-[#be9a62] uppercase tracking-widest font-semibold">Secure Portal Gateway</p>
        </div>

        {/* Custom Dual-Ring Spinner */}
        <div className="flex flex-col items-center justify-center pt-4 space-y-4 relative z-10">
          <div className="relative h-12 w-12">
            <div className="absolute inset-0 rounded-full border-2 border-[#4f4931]/40" />
            <div className="absolute inset-0 rounded-full border-2 border-[#be9a62] border-t-transparent animate-spin" />
          </div>
          <p className="text-xs text-[#b09a77] font-medium tracking-wide animate-pulse">
            Establishing secure session...
          </p>
        </div>

      </div>
    </div>
  )
}
