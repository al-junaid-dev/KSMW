import { Loader2 } from 'lucide-react'

export default function AdminLoading() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="h-10 w-10 text-[#be9a62] animate-spin" />
      <p className="text-slate-500 text-sm font-medium animate-pulse">Loading data...</p>
    </div>
  )
}