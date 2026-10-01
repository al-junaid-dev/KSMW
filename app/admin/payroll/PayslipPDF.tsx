'use client'

import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

// Create styles matching the reference document
const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 10, fontFamily: 'Helvetica' },
  headerCenter: { textAlign: 'center', marginBottom: 20 },
  companyName: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  address: { fontSize: 9, color: '#444', marginBottom: 2 },
  payslipTitle: { fontSize: 12, fontWeight: 'bold', marginTop: 10, textDecoration: 'underline' },
  
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20, borderTop: '1px solid #ccc', paddingTop: 10 },
  gridCol: { width: '50%', flexDirection: 'row', marginBottom: 6 },
  gridLabel: { width: '40%', fontWeight: 'bold', color: '#333' },
  gridValue: { width: '60%', color: '#000' },

  table: { width: '100%', borderStyle: 'solid', borderWidth: 1, borderColor: '#ccc', marginBottom: 20 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#ccc' },
  tableHeader: { backgroundColor: '#f0f0f0', fontWeight: 'bold' },
  colHead: { width: '40%', padding: 5, borderRightWidth: 1, borderRightColor: '#ccc' },
  colVal: { width: '15%', padding: 5, borderRightWidth: 1, borderRightColor: '#ccc', textAlign: 'right' },
  colValLast: { width: '15%', padding: 5, textAlign: 'right' },

  footer: { marginTop: 20 },
  netSalaryText: { fontSize: 11, fontWeight: 'bold', marginBottom: 15 },
  disclaimer: { fontSize: 8, color: '#666', fontStyle: 'italic', textAlign: 'center', marginTop: 30 }
})

// Simple Number to Words Converter
const numToWords = (num: number) => {
  const a = ['','One ','Two ','Three ','Four ', 'Five ','Six ','Seven ','Eight ','Nine ','Ten ','Eleven ','Twelve ','Thirteen ','Fourteen ','Fifteen ','Sixteen ','Seventeen ','Eighteen ','Nineteen '];
  const b = ['', '', 'Twenty','Thirty','Forty','Fifty', 'Sixty','Seventy','Eighty','Ninety'];
  
  const numStr = num.toString();
  if (numStr.length > 9) return 'overflow';
  
  const n = ('000000000' + numStr).slice(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return ''; 
  
  let str = '';
  str += (n[1] !== '00') ? (a[Number(n[1])] || b[Number(n[1][0])] + ' ' + a[Number(n[1][1])]) + 'Crore ' : '';
  str += (n[2] !== '00') ? (a[Number(n[2])] || b[Number(n[2][0])] + ' ' + a[Number(n[2][1])]) + 'Lakh ' : '';
  str += (n[3] !== '00') ? (a[Number(n[3])] || b[Number(n[3][0])] + ' ' + a[Number(n[3][1])]) + 'Thousand ' : '';
  str += (n[4] !== '0') ? (a[Number(n[4])] || b[Number(n[4][0])] + ' ' + a[Number(n[4][1])]) + 'Hundred ' : '';
  str += (n[5] !== '00') ? ((str !== '') ? 'and ' : '') + (a[Number(n[5])] || b[Number(n[5][0])] + ' ' + a[Number(n[5][1])]) : '';
  
  return str.trim();
}

export const PayslipDocument = ({ slip, emp }: { slip: any, emp: any }) => {
  // 1. Safely extract all values with fallbacks to prevent null crashes
  const monthName = new Date(slip.year || new Date().getFullYear(), (slip.month || 1) - 1).toLocaleString('default', { month: 'short' })
  
  const basic = slip.basic_earning || 0
  const hra = slip.hra_earning || 0
  const lta = slip.lta_earning || 0
  const special = slip.special_allowance_earning || 0
  const overtime = slip.overtime_earning || 0
  
  const pf = Math.abs(slip.pf_deduction || 0)
  const pt = Math.abs(slip.pt_deduction || 0)
  const esic = Math.abs(slip.esic_deduction || 0)
  const lwf = Math.abs(slip.lwf_deduction || 0)
  
  const payableDays = slip.payable_days || 0
  const paidDays = slip.paid_days || 0

  const totalEarnings = basic + hra + lta + special + overtime
  const totalDeductions = pf + pt + esic + lwf
  const finalPay = Math.max(0, slip.final_pay_amount || 0)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerCenter}>
          <Text style={styles.companyName}>KSWMG Business Solutions</Text>
          <Text style={styles.address}>Corporate Office, Hyderabad, Telangana</Text>
          <Text style={styles.payslipTitle}>Payslip for the Month of {monthName} {slip.year}</Text>
        </View>

        {/* Employee Details Grid */}
        <View style={styles.gridContainer}>
          <View style={styles.gridCol}><Text style={styles.gridLabel}>Employee Name</Text><Text style={styles.gridValue}>| {emp.full_name}</Text></View>
          <View style={styles.gridCol}><Text style={styles.gridLabel}>Bank Name</Text><Text style={styles.gridValue}>| {emp.bank_name || 'N/A'}</Text></View>
          
          <View style={styles.gridCol}><Text style={styles.gridLabel}>Employee Code</Text><Text style={styles.gridValue}>| {emp.employee_code || 'N/A'}</Text></View>
          <View style={styles.gridCol}><Text style={styles.gridLabel}>Bank Account No</Text><Text style={styles.gridValue}>| {emp.bank_account_no || 'N/A'}</Text></View>
          
          <View style={styles.gridCol}><Text style={styles.gridLabel}>Designation</Text><Text style={styles.gridValue}>| {emp.designation || 'Sales Executive'}</Text></View>
          <View style={styles.gridCol}><Text style={styles.gridLabel}>Provident Fund No</Text><Text style={styles.gridValue}>| {emp.pf_no || 'N/A'}</Text></View>
          
          <View style={styles.gridCol}><Text style={styles.gridLabel}>Payable Days</Text><Text style={styles.gridValue}>| {payableDays}</Text></View>
          <View style={styles.gridCol}><Text style={styles.gridLabel}>UAN</Text><Text style={styles.gridValue}>| {emp.uan || 'N/A'}</Text></View>
          
          <View style={styles.gridCol}><Text style={styles.gridLabel}>Paid Days</Text><Text style={styles.gridValue}>| {paidDays}</Text></View>
          <View style={styles.gridCol}><Text style={styles.gridLabel}>PAN</Text><Text style={styles.gridValue}>| {emp.pan || 'N/A'}</Text></View>
        </View>

        {/* Financial Table */}
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.colHead}>Head</Text>
            <Text style={styles.colVal}>Earning (₹)</Text>
            <Text style={styles.colVal}>Deduction (₹)</Text>
            <Text style={styles.colVal}>YTD Earning</Text>
            <Text style={styles.colValLast}>YTD Deduct</Text>
          </View>
          
          <View style={styles.tableRow}>
            <Text style={styles.colHead}>Basic</Text>
            <Text style={styles.colVal}>{basic.toFixed(2)}</Text>
            <Text style={styles.colVal}>0.00</Text>
            <Text style={styles.colVal}>-</Text>
            <Text style={styles.colValLast}>-</Text>
          </View>
          
          <View style={styles.tableRow}>
            <Text style={styles.colHead}>House Rent Allowance</Text>
            <Text style={styles.colVal}>{hra.toFixed(2)}</Text>
            <Text style={styles.colVal}>0.00</Text>
            <Text style={styles.colVal}>-</Text>
            <Text style={styles.colValLast}>-</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.colHead}>Overtime / Incentives</Text>
            <Text style={styles.colVal}>{overtime.toFixed(2)}</Text>
            <Text style={styles.colVal}>0.00</Text>
            <Text style={styles.colVal}>-</Text>
            <Text style={styles.colValLast}>-</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.colHead}>Provident Fund</Text>
            <Text style={styles.colVal}>0.00</Text>
            <Text style={styles.colVal}>{pf.toFixed(2)}</Text>
            <Text style={styles.colVal}>-</Text>
            <Text style={styles.colValLast}>-</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.colHead}>Profession Tax</Text>
            <Text style={styles.colVal}>0.00</Text>
            <Text style={styles.colVal}>{pt.toFixed(2)}</Text>
            <Text style={styles.colVal}>-</Text>
            <Text style={styles.colValLast}>-</Text>
          </View>

          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.colHead}>Total</Text>
            <Text style={styles.colVal}>{totalEarnings.toFixed(2)}</Text>
            <Text style={styles.colVal}>{totalDeductions.toFixed(2)}</Text>
            <Text style={styles.colVal}>-</Text>
            <Text style={styles.colValLast}>-</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.netSalaryText}>
            Net Salary: {finalPay.toFixed(2)} (Rs. {numToWords(Math.round(finalPay))} Only)
          </Text>
          <Text style={styles.disclaimer}>
            "This is a computer generated statement and does not require any signature or stamp."
          </Text>
        </View>
      </Page>
    </Document>
  )
}