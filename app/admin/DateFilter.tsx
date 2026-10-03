'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, RotateCcw, Loader2 } from 'lucide-react'

export default function DateFilter({ selectedDate, todayStr }: { selectedDate: string, todayStr: string }) {
  const [dateInput, setDateInput] = useState(selectedDate)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const isToday = selectedDate === todayStr

  function handleApply(e: React.FormEvent) {
    e.preventDefault()
    if (!dateInput || isPending) return

    startTransition(() => {
      if (dateInput === todayStr) {
        router.push('/admin')
      } else {
        router.push(`/admin?date=${dateInput}`)
      }
    })
  }

  function handleReset() {
    if (isPending) return
    setDateInput(todayStr)
    startTransition(() => {
      router.push('/admin')
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <form onSubmit={handleApply} className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-gray-200 shadow-xs">
        <div className="flex items-center gap-2 px-2.5 text-gray-500">
          <Calendar className="h-4 w-4 text-[#be9a62]" />
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Date:</span>
        </div>
        <input 
          type="date"
          max={todayStr}
          value={dateInput}
          disabled={isPending}
          onChange={(e) => setDateInput(e.target.value)}
          className="text-xs sm:text-sm font-medium text-gray-800 bg-transparent focus:outline-none cursor-pointer pr-2 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-1.5 bg-[#132322] hover:bg-[#be9a62] hover:text-[#132322] text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-70"
        >
          {isPending ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin text-[#be9a62]" />
              <span>Fetching...</span>
            </>
          ) : (
            <span>Apply</span>
          )}
        </button>
      </form>

      {!isToday && (
        <button
          type="button"
          onClick={handleReset}
          disabled={isPending}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
          title="Reset to today"
        >
          <RotateCcw className={`h-3.5 w-3.5 ${isPending ? 'animate-spin' : ''}`} />
          <span>Reset to Today</span>
        </button>
      )}
    </div>
  )
}