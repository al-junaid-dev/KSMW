'use client'

import { useState, useTransition } from 'react'
import { generateDrafts, finalizePayslips, deleteFinalizedPayslip } from './actions'
import { useRouter } from 'next/navigation'
import toast, { Toaster } from 'react-hot-toast'
import { 
  Calculator, 
  Edit, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  X, 
  Loader2, 
  AlertTriangle 
} from 'lucide-react'
import dynamic from 'next/dynamic'
import EditPayslipModal from './EditPayslipModal'

const PDFDownloadButton = dynamic(() => import('./PDFDownloadButton'), { ssr: false })

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export default function PayrollClient({ 
  payslips, 
  currentMonth, 
  currentYear 
}: { 
  payslips: any[]
  currentMonth: number
  currentYear: number 
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Local state for Month / Year selectors (no auto-fetch on change)
  const [selectedMonth, setSelectedMonth] = useState(currentMonth)
  const [selectedYear, setSelectedYear] = useState(currentYear)

  const [loading, setLoading] = useState(false)
  const [editingSlip, setEditingSlip] = useState<any>(null)

  // Finalized Payslip Deletion State
  const [deletingSlip, setDeletingSlip] = useState<any>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const hasDrafts = payslips.some(s => s.status === 'draft')

  // Triggered ONLY on button click
  const handleFetchRecords = () => {
    startTransition(() => {
      router.push(`/admin/payroll?month=${selectedMonth}&year=${selectedYear}`)
    })
  }

  const handleGenerate = async () => {
    try {
      setLoading(true)
      await generateDrafts(selectedMonth, selectedYear)
      toast.success(`Drafts generated for ${selectedMonth}/${selectedYear}`)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate payroll')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteFinalized = async () => {
    if (!deletingSlip) return
    try {
      setIsDeleting(true)
      const res = await deleteFinalizedPayslip(deletingSlip.id)
      if (res?.error) {
        toast.error(res.error)
        setIsDeleting(false)
        return
      }

      toast.success('Finalized payslip deleted successfully')
      setDeletingSlip(null)
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete payslip')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* Control Bar: Selectors, Manual Fetch, and Engine Triggers */}
      <div className="bg-white p-4 rounded-xl shadow-xs border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
        
        {/* Date Selector with Dedicated Fetch Button */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <select 
            value={selectedMonth} 
            disabled={isPending}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="rounded-lg border-gray-300 py-2 pl-3 pr-8 text-sm font-bold text-gray-900 bg-gray-50 focus:ring-[#132322] focus:border-[#132322] shadow-2xs cursor-pointer disabled:opacity-50"
          >
            {MONTH_NAMES.map((name, i) => (
              <option key={i + 1} value={i + 1}>{name}</option>
            ))}
          </select>

          <select 
            value={selectedYear} 
            disabled={isPending}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="rounded-lg border-gray-300 py-2 pl-3 pr-8 text-sm font-bold text-gray-900 bg-gray-50 focus:ring-[#132322] focus:border-[#132322] shadow-2xs cursor-pointer disabled:opacity-50"
          >
            {[currentYear - 2, currentYear - 1, currentYear, currentYear + 1].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          {/* Manual Fetch Button */}
          <button
            type="button"
            onClick={handleFetchRecords}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 bg-[#132322] hover:bg-[#be9a62] hover:text-[#132322] text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-[#be9a62]" />
                <span>Fetching...</span>
              </>
            ) : (
              <span>Fetch Records</span>
            )}
          </button>
        </div>
        
        {/* Payroll Generation & Finalize Actions */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <button 
            onClick={handleGenerate}
            disabled={loading || isPending}
            className="flex items-center justify-center gap-2 bg-[#132322] hover:bg-[#132322]/80 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 w-full sm:w-auto cursor-pointer"
          >
            <Calculator className="h-4 w-4" />
            {loading ? 'Calculating...' : 'Run Engine'}
          </button>

          {hasDrafts && (
            <button 
              onClick={async () => {
                if (window.confirm('Are you sure you want to finalize these payslips? They will become permanently visible to employees in their portal.')) {
                  await finalizePayslips(selectedMonth, selectedYear)
                  toast.success('Payslips finalized!')
                  router.refresh()
                }
              }}
              className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors w-full sm:w-auto cursor-pointer"
            >
              <CheckCircle2 className="h-4 w-4" /> Finalize Month
            </button>
          )}
        </div>
      </div>

      {/* Payroll Table */}
      <div className={`bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden transition-opacity duration-200 ${isPending ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-100 text-xs font-bold text-gray-600 uppercase tracking-wider">
                <th className="p-4">Employee</th>
                <th className="p-4 text-center">Days (Pd/Py)</th>
                <th className="p-4 text-right">Gross Earnings</th>
                <th className="p-4 text-right">Deductions</th>
                <th className="p-4 text-right">Net Salary</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payslips.length > 0 ? (
                payslips.map(slip => {
                  const emp = Array.isArray(slip.profiles) ? slip.profiles[0] : slip.profiles
                  
                  const gross = (slip.basic_earning || 0) + (slip.hra_earning || 0) + (slip.lta_earning || 0) + (slip.special_allowance_earning || 0) + (slip.overtime_earning || 0)
                  const deductions = (slip.pf_deduction || 0) + (slip.pt_deduction || 0) + (slip.esic_deduction || 0) + (slip.lwf_deduction || 0)
                  const finalAmount = slip.final_pay_amount || 0
                  const isFinalized = slip.status === 'finalized'

                  return (
                    <tr key={slip.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-bold text-gray-900">{emp?.full_name || 'Staff Member'}</td>
                      <td className="p-4 text-center text-sm text-gray-800">
                        <span className="font-bold text-gray-900">{slip.paid_days}</span> / {slip.payable_days}
                      </td>
                      <td className="p-4 text-right text-sm font-semibold text-gray-900">₹{gross.toFixed(2)}</td>
                      <td className="p-4 text-right text-sm font-semibold text-red-700">-₹{Math.abs(deductions).toFixed(2)}</td>
                      <td className="p-4 text-right font-black text-gray-900 text-base">₹{Math.max(0, finalAmount).toFixed(2)}</td>
                      <td className="p-4 text-center">
                        {!isFinalized ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800 border border-orange-200">
                            <AlertCircle className="h-3.5 w-3.5" /> Draft
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Finalized
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Edit only enabled for drafts */}
                          <button 
                            onClick={() => setEditingSlip(slip)}
                            disabled={isFinalized}
                            className="p-1.5 text-gray-500 hover:text-blue-600 transition-colors disabled:opacity-30 disabled:hover:text-gray-500 cursor-pointer disabled:cursor-not-allowed" 
                            title={isFinalized ? "Finalized slips cannot be edited" : "Edit Draft"}
                          >
                            <Edit className="h-4 w-4" />
                          </button>

                          {/* PDF Download Button */}
                          <PDFDownloadButton slip={slip} emp={emp} month={currentMonth} year={currentYear} />

                          {/* Delete Option strictly for Finalized Payslips */}
                          {isFinalized && (
                            <button
                              onClick={() => setDeletingSlip(slip)}
                              className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Finalized Payslip"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-gray-500 font-medium">
                    No payslips found for {MONTH_NAMES[selectedMonth - 1]} {selectedYear}. Click "Run Engine" to generate drafts.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Draft Modal */}
      {editingSlip && (
        <EditPayslipModal 
          slip={editingSlip} 
          onClose={() => setEditingSlip(null)} 
        />
      )}

      {/* Finalized Payslip Deletion Caution Modal */}
      {deletingSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#132322] border border-red-500/40 rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-white space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#4f4931]/40 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                  <Trash2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Delete Finalized Payslip</h3>
                  <p className="text-xs text-red-300 font-medium">Permanent Record Deletion</p>
                </div>
              </div>
              <button
                onClick={() => setDeletingSlip(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl space-y-2 text-xs">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>Irreversible Ledger Action</span>
              </div>
              <p className="text-amber-200/90 leading-relaxed">
                You are about to delete the finalized payslip for{' '}
                <strong className="text-white">
                  {Array.isArray(deletingSlip.profiles) ? deletingSlip.profiles[0]?.full_name : deletingSlip.profiles?.full_name || 'Staff Member'}
                </strong>{' '}
                for <strong className="text-white">{MONTH_NAMES[selectedMonth - 1]} {selectedYear}</strong> with net salary of{' '}
                <strong className="text-white">₹{(deletingSlip.final_pay_amount || 0).toFixed(2)}</strong>.
              </p>
              <p className="text-amber-300/80 text-[11px] pt-1">
                The employee will no longer have access to this payslip in their portal.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#4f4931]/40">
              <button
                type="button"
                onClick={() => setDeletingSlip(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-medium text-gray-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteFinalized}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all disabled:opacity-50 cursor-pointer shadow-md"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Yes, Delete Payslip</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}