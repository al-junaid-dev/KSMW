'use client'

import { useState } from 'react'
import { Shield, Pencil, X, Loader2 } from 'lucide-react'
import { updateEmployeeTerms } from '../actions'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface TermsProps {
  employeeId: string
  employeeCode: string | null
  department: string | null
  hourlyRate: number | null
}

export default function EmployeeTermsClient({
  employeeId,
  employeeCode,
  department,
  hourlyRate,
}: TermsProps) {
  const router = useRouter()
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [code, setCode] = useState(employeeCode || 'EMP-101')
  const [dept, setDept] = useState(department || 'Retail Sales')
  const [rate, setRate] = useState(hourlyRate || 100)

  async function handleSave() {
    setIsSaving(true)
    const res = await updateEmployeeTerms(employeeId, {
      employee_code: code,
      department: dept,
      hourly_rate: Number(rate),
    })

    if (res?.error) {
      toast.error(res.error)
      setIsSaving(false)
      return
    }

    toast.success('Terms updated successfully!')
    setIsSaving(false)
    setShowConfirm(false)
    setIsEditOpen(false)
    router.refresh()
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-xs border border-gray-100 space-y-4">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <h2 className="font-bold text-gray-900 flex items-center gap-2">
          <Shield className="h-4 w-4 text-blue-600" /> Terms & Specifications
        </h2>
        <button
          onClick={() => {
            setCode(employeeCode || 'EMP-101')
            setDept(department || 'Retail Sales')
            setRate(hourlyRate || 100)
            setShowConfirm(false)
            setIsEditOpen(true)
          }}
          className="p-1 text-gray-400 hover:text-[#be9a62] hover:bg-[#be9a62]/10 rounded-lg transition-colors"
          title="Edit Terms"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Employee Code</span>
          <span className="font-semibold text-gray-800">{employeeCode || 'EMP-101'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Department</span>
          <span className="font-semibold text-gray-800">{department || 'Retail Sales'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Hourly Rate</span>
          <span className="font-semibold text-gray-800">₹{hourlyRate || 100}/hr</span>
        </div>
      </div>

      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#132322] border border-[#4f4931]/60 rounded-2xl w-full max-w-sm p-5 shadow-2xl relative text-white space-y-4">
            
            <div className="flex items-center justify-between border-b border-[#4f4931]/40 pb-2.5">
              <h3 className="font-bold text-sm text-white">Edit Terms</h3>
              <button onClick={() => setIsEditOpen(false)} className="text-gray-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            {!showConfirm ? (
              <form onSubmit={(e) => { e.preventDefault(); setShowConfirm(true) }} className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="text-[#b09a77] uppercase font-semibold">Employee Code</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full bg-[#192115] border border-[#4f4931]/60 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#be9a62]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[#b09a77] uppercase font-semibold">Department</label>
                  <input
                    type="text"
                    required
                    value={dept}
                    onChange={(e) => setDept(e.target.value)}
                    className="w-full bg-[#192115] border border-[#4f4931]/60 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#be9a62]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[#b09a77] uppercase font-semibold">Hourly Rate (₹)</label>
                  <input
                    type="number"
                    required
                    value={rate}
                    onChange={(e) => setRate(Number(e.target.value))}
                    className="w-full bg-[#192115] border border-[#4f4931]/60 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#be9a62]"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-[#4f4931]/40">
                  <button type="button" onClick={() => setIsEditOpen(false)} className="px-3 py-1.5 text-gray-300">
                    Cancel
                  </button>
                  <button type="submit" className="bg-[#be9a62] text-[#132322] font-bold px-4 py-1.5 rounded-xl">
                    Next
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3 text-xs">
                <p className="text-gray-300">Confirm terms update for this employee?</p>
                <div className="bg-[#192115] p-3 rounded-xl border border-[#4f4931]/40 space-y-1 text-[11px]">
                  <p><strong className="text-white">Code:</strong> {code}</p>
                  <p><strong className="text-white">Dept:</strong> {dept}</p>
                  <p><strong className="text-white">Rate:</strong> ₹{rate}/hr</p>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button onClick={() => setShowConfirm(false)} className="px-3 py-1.5 text-gray-300">
                    Back
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-[#be9a62] text-[#132322] font-bold px-4 py-1.5 rounded-xl flex items-center gap-1.5"
                  >
                    {isSaving && <Loader2 className="h-3 w-3 animate-spin" />}
                    Confirm Update
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  )
}