'use client'

import dynamic from 'next/dynamic'
import { FileText } from 'lucide-react'

const PDFDownloadButton = dynamic(() => import('../admin/payroll/PDFDownloadButton'), { ssr: false })

export default function PayslipList({ payslips, profile }: { payslips: any[], profile: any }) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
      <div className="p-6 border-b border-gray-100 flex items-center gap-2 bg-slate-50">
        <FileText className="h-5 w-5 text-gray-500" />
        <h3 className="text-lg font-semibold text-gray-900">My Payslips</h3>
      </div>
      <div className="divide-y divide-gray-50">
        {payslips && payslips.length > 0 ? (
          payslips.map((slip) => {
            const monthName = new Date(slip.year, slip.month - 1).toLocaleString('default', { month: 'long' })
            return (
              <div key={slip.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors flex items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-gray-900">{monthName} {slip.year}</p>
                  <p className="text-sm text-gray-500">
                    Net Pay: <span className="font-semibold text-gray-800">₹{slip.final_pay_amount.toFixed(2)}</span> ({slip.paid_days} paid days)
                  </p>
                </div>
                <div>
                  <PDFDownloadButton 
                    slip={slip} 
                    emp={profile} 
                    month={slip.month} 
                    year={slip.year} 
                  />
                </div>
              </div>
            )
          })
        ) : (
          <p className="p-6 text-center text-gray-500 text-sm">No finalized payslips available yet.</p>
        )}
      </div>
    </div>
  )
}