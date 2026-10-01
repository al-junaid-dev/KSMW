'use client'

import { PDFDownloadLink } from '@react-pdf/renderer'
import { PayslipDocument } from './PayslipPDF'
import { Download } from 'lucide-react'

export default function PDFDownloadButton({ slip, emp, month, year }: { slip: any, emp: any, month: number, year: number }) {
  return (
    <PDFDownloadLink 
      document={<PayslipDocument slip={slip} emp={emp} />} 
      fileName={`Payslip_${emp?.full_name}_${month}_${year}.pdf`}
      className="p-1.5 text-gray-400 hover:text-green-600 transition-colors"
      title="Download PDF"
    >
      {({ loading }) => (
        loading ? <span className="text-xs">...</span> : <Download className="h-4 w-4" />
      )}
    </PDFDownloadLink>
  )
}