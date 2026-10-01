import Link from 'next/link'
import Image from 'next/image';
import { Store, ShieldCheck, Clock, Calculator, FileText, ArrowRight, Building2 } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#192115] text-[#b09a77] flex flex-col selection:bg-[#be9a62] selection:text-[#132322]">

      {/* Navbar */}
      <header className="border-b border-[#4f4931]/50 bg-[#132322]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative h-15 w-15 overflow-hidden rounded-xl  flex items-center justify-center shadow-lg shadow-[#be9a62]/20">
              <Image
                src="/logo.png"
                alt="Logo"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white block leading-tight">KSWMG</span>
              <span className="text-[10px] tracking-widest uppercase font-semibold text-[#be9a62] block">Business Solutions</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="bg-[#be9a62] hover:bg-[#b79c68] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-[#be9a62]/20 transition-all transform hover:-translate-y-0.5 hover:text-[#132322]"
            >
              Sign in
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-white text-black pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#132322] border border-[#7f7254]/40 text-[#be9a62] text-xs sm:text-sm font-semibold tracking-wide">
            <ShieldCheck className="h-4 w-4 text-[#be9a62]" /> Enterprise Retail Workforce & Payroll Management
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight max-w-4xl mx-auto text-[black]/80 bleading-tight">
            Streamline Operations Across All Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#be9a62] to-[#b09a77]">Retail Outlets</span>
          </h1>

          <p className="text-[black]/70 text-lg sm:text-xl max-w-2xl mx-auto font-normal leading-relaxed">
            Empower your electronic sales shops with automated attendance tracking, precise monthly salary proration, statutory compliance, and audit-ready digital payslips.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/login"
              className="w-full sm:w-auto flex items-center justify-center gap-3 bg-[#be9a62] hover:bg-[#b79c68] text-white hover:text-[#132322] px-8 py-4 rounded-xl font-bold text-base shadow-xl shadow-[#be9a62]/20 transition-all"
            >
              Access Portal <ArrowRight className="h-5 w-5" />
            </Link>
            <a
              href="#features"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#132322] hover:bg-[#2f2a15] text-[white]/80 hover:text-white border border-[#4f4931] px-8 py-4 rounded-xl font-bold text-base transition-colors"
            >
              Explore Features
            </a>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-[#132322] border-y border-[#4f4931]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Built Specifically for Multi-Store Retail
            </h2>
            <p className="text-[#b09a77] text-base sm:text-lg max-w-xl mx-auto">
              Everything store owners and managers need to eliminate administrative overhead.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

            {/* Feature 1 */}
            <div className="bg-[#132322] border border-[#4f4931]/60 p-8 rounded-2xl space-y-4 hover:border-[#be9a62] transition-all group">
              <div className="h-12 w-12 rounded-xl bg-[#2f2a15] text-[#be9a62] flex items-center justify-center group-hover:bg-[#be9a62] group-hover:text-[#132322] transition-colors">
                <Building2 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Multi-Store Control</h3>
              <p className="text-[#b09a77] text-sm leading-relaxed">
                Monitor live staff status, active shifts, and shop performance metrics from a unified administrative dashboard.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#132322] border border-[#4f4931]/60 p-8 rounded-2xl space-y-4 hover:border-[#be9a62] transition-all group">
              <div className="h-12 w-12 rounded-xl bg-[#2f2a15] text-[#be9a62] flex items-center justify-center group-hover:bg-[#be9a62] group-hover:text-[#132322] transition-colors">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Smart Attendance</h3>
              <p className="text-[#b09a77] text-sm leading-relaxed">
                Single-shift daily lockouts, automatic grace-period tracking, and real-time late/early leave monitoring.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#132322] border border-[#4f4931]/60 p-8 rounded-2xl space-y-4 hover:border-[#be9a62] transition-all group">
              <div className="h-12 w-12 rounded-xl bg-[#2f2a15] text-[#be9a62] flex items-center justify-center group-hover:bg-[#be9a62] group-hover:text-[#132322] transition-colors">
                <Calculator className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Monthly Proration Engine</h3>
              <p className="text-[#b09a77] text-sm leading-relaxed">
                Automatic salary calculations based on paid vs. payable days with built-in zero-deduction leave protection.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-[#132322] border border-[#4f4931]/60 p-8 rounded-2xl space-y-4 hover:border-[#be9a62] transition-all group">
              <div className="h-12 w-12 rounded-xl bg-[#2f2a15] text-[#be9a62] flex items-center justify-center group-hover:bg-[#be9a62] group-hover:text-[#132322] transition-colors">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Instant PDF Payslips</h3>
              <p className="text-[#b09a77] text-sm leading-relaxed">
                Generate professional, audit-ready Indian salary statements with automated number-to-words conversion.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Trust Banner */}
      <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 bg-[whitesmoke] border border-[#4f4931]/40  shadow-lg shadow-[#be9a62]/10 relative overflow-hidden">
        <div className="bg-gradient-to-b from-[#132322] to-[#192115] border border-[#4f4931]/60 p-10 sm:p-16 rounded-3xl space-y-6 relative overflow-hidden shadow-2xl">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#be9a62]/10 rounded-full blur-3xl pointer-events-none" />

          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Ready to Optimize Your Workforce?
          </h2>
          <p className="text-[#b09a77] max-w-lg mx-auto text-base">
            Log in now to experience seamless administrative control and employee self-service capabilities.
          </p>
          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-[#be9a62] hover:bg-[#b79c68] text-[#132322] px-8 py-4 rounded-xl font-bold text-base shadow-lg shadow-[#be9a62]/20 transition-all"
            >
              Sign In to Portal <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-[#4f4931]/40 bg-[#132322] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-[#be9a62] flex items-center justify-center text-[#132322]">
              <Store className="h-4 w-4" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">KSWMG Business Solutions</p>
              <p className="text-xs text-[#7f7254]">Retail Workforce & Payroll Ecosystem</p>
            </div>
          </div>
          <p className="text-xs text-[#7f7254]">
            &copy; {new Date().getFullYear()} KSWMG Business Solutions. All rights reserved.
          </p>
        </div>
      </footer>

    </div>
  )
}