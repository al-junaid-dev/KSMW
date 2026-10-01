'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { updatePayslip } from './actions'
import toast from 'react-hot-toast'

export default function EditPayslipModal({ slip, onClose }: { slip: any, onClose: () => void }) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    overtime_earning: slip.overtime_earning,
    special_allowance_earning: slip.special_allowance_earning,
    lwf_deduction: slip.lwf_deduction,
    // Add other fields here if you want to make them editable
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      await updatePayslip(slip.id, formData)
      toast.success('Payslip updated successfully')
      onClose()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-slate-50">
          <h3 className="font-bold text-gray-900">Edit Payslip: {slip.profiles.full_name}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Overtime / Incentives (₹)</label>
            <input 
              type="number" 
              step="0.01"
              value={formData.overtime_earning}
              onChange={e => setFormData({...formData, overtime_earning: parseFloat(e.target.value) || 0})}
              className="w-full rounded-lg border-gray-300 py-2 px-3 border focus:ring-blue-500 focus:border-blue-500 text-gray-400" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Special Allowance / Bonus (₹)</label>
            <input 
              type="number" 
              step="0.01"
              value={formData.special_allowance_earning}
              onChange={e => setFormData({...formData, special_allowance_earning: parseFloat(e.target.value) || 0})}
              className="w-full rounded-lg border-gray-300 py-2 px-3 border focus:ring-blue-500 focus:border-blue-500 text-gray-400" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Other Deductions (LWF, etc.) (₹)</label>
            <input 
              type="number" 
              step="0.01"
              value={formData.lwf_deduction}
              onChange={e => setFormData({...formData, lwf_deduction: parseFloat(e.target.value) || 0})}
              className="w-full rounded-lg border-gray-300 py-2 px-3 border focus:ring-blue-500 focus:border-blue-500 text-gray-400" 
            />
          </div>
          
          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-50 rounded-lg">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}