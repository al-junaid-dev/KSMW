'use client'

import { useState } from 'react'
import { generateDrafts, finalizePayslips } from './actions'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Calculator, Edit, CheckCircle2, AlertCircle } from 'lucide-react'
import dynamic from 'next/dynamic'
import EditPayslipModal from './EditPayslipModal'

const PDFDownloadButton = dynamic(() => import('./PDFDownloadButton'), { ssr: false })

export default function PayrollClient({ payslips, currentMonth, currentYear }: { payslips: any[], currentMonth: number, currentYear: number }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [month, setMonth] = useState(currentMonth)
  const [year, setYear] = useState(currentYear)
  const [editingSlip, setEditingSlip] = useState<any>(null)
  
  const hasDrafts = payslips.some(s => s.status === 'draft')

  const handleGenerate = async () => {
    try {
      setLoading(true)
      await generateDrafts(month, year)
      toast.success(`Drafts generated for ${month}/${year}`)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate payroll')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (m: number, y: number) => {
    setMonth(m)
    setYear(y)
    router.push(`/admin/payroll?month=${m}&year=${y}`)
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex items-center gap-3">
          <select 
            value={month} 
            onChange={(e) => handleFilterChange(Number(e.target.value), year)}
            className="rounded-lg border-gray-300 py-2 pl-3 pr-10 text-base font-bold text-gray-900 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 sm:text-sm shadow-sm"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
              <option key={m} value={m}>{new Date(0, m - 1).toLocaleString('default', { month: 'long' })}</option>
            ))}
          </select>
          <select 
            value={year} 
            onChange={(e) => handleFilterChange(month, Number(e.target.value))}
            className="rounded-lg border-gray-300 py-2 pl-3 pr-10 text-base font-bold text-gray-900 bg-gray-50 focus:ring-[#132322] focus:border[#132322] sm:text-sm shadow-sm"
          >
            {[currentYear - 1, currentYear, currentYear + 1].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={handleGenerate}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-[#132322] hover:bg-[#132322]/80 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 w-full sm:w-auto"
          >
            <Calculator className="h-4 w-4" />
            {loading ? 'Calculating...' : 'Run Engine'}
          </button>

          {hasDrafts && (
            <button 
              onClick={async () => {
                if (window.confirm('Are you sure you want to finalize these payslips? They will become visible to employees.')) {
                  await finalizePayslips(month, year)
                  toast.success('Payslips finalized!')
                }
              }}
              className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors w-full sm:w-auto"
            >
              <CheckCircle2 className="h-4 w-4" /> Finalize Month
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
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
                  
                  // Safely calculate totals with fallback to 0
                  const gross = (slip.basic_earning || 0) + (slip.hra_earning || 0) + (slip.lta_earning || 0) + (slip.special_allowance_earning || 0) + (slip.overtime_earning || 0)
                  const deductions = (slip.pf_deduction || 0) + (slip.pt_deduction || 0) + (slip.esic_deduction || 0) + (slip.lwf_deduction || 0)
                  const finalAmount = slip.final_pay_amount || 0

                  return (
                    <tr key={slip.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-bold text-gray-900">{emp?.full_name}</td>
                      <td className="p-4 text-center text-sm text-gray-800">
                        <span className="font-bold text-gray-900">{slip.paid_days}</span> / {slip.payable_days}
                      </td>
                      <td className="p-4 text-right text-sm font-semibold text-gray-900">₹{gross.toFixed(2)}</td>
                      <td className="p-4 text-right text-sm font-semibold text-red-700">-₹{Math.abs(deductions).toFixed(2)}</td>
                      <td className="p-4 text-right font-black text-gray-900 text-base">₹{Math.max(0, finalAmount).toFixed(2)}</td>
                      <td className="p-4 text-center">
                        {slip.status === 'draft' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800 border border-orange-200">
                            <AlertCircle className="h-3.5 w-3.5" /> Draft
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Finalized
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setEditingSlip(slip)}
                          disabled={slip.status === 'finalized'}
                          className="p-1.5 text-gray-500 hover:text-blue-600 transition-colors disabled:opacity-30 disabled:hover:text-gray-500" 
                          title="Edit Draft"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <PDFDownloadButton slip={slip} emp={emp} month={month} year={year} />
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-gray-500 font-medium">
                    No payslips found for this period. Click "Run Engine" to generate drafts.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editingSlip && (
        <EditPayslipModal 
          slip={editingSlip} 
          onClose={() => setEditingSlip(null)} 
        />
      )}
    </div>
  )
}