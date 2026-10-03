'use client'

import { useState } from 'react'
import { BadgeIndianRupee, Pencil, X, Loader2 } from 'lucide-react'
import { updateEmployeeFinancials } from '../actions'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface FinancialsProps {
  employeeId: string
  bankName: string | null
  bankAccountNo: string | null
  uan: string | null
  pan: string | null
}

export default function EmployeeFinancialsClient({
  employeeId,
  bankName,
  bankAccountNo,
  uan,
  pan,
}: FinancialsProps) {
  const router = useRouter()
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [bank, setBank] = useState(bankName || 'HDFC Bank')
  const [account, setAccount] = useState(bankAccountNo || '********6789')
  const [uanNum, setUanNum] = useState(uan || '102116804585')
  const [panCard, setPanCard] = useState(pan || 'DBFPJ0593E')

  async function handleSave() {
    setIsSaving(true)
    const res = await updateEmployeeFinancials(employeeId, {
      bank_name: bank,
      bank_account_no: account,
      uan: uanNum,
      pan: panCard,
    })

    if (res?.error) {
      toast.error(res.error)
      setIsSaving(false)
      return
    }

    toast.success('Financial details updated!')
    setIsSaving(false)
    setShowConfirm(false)
    setIsEditOpen(false)
    router.refresh()
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-xs border border-gray-100 space-y-4 md:col-span-2">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <h2 className="font-bold text-gray-900 flex items-center gap-2">
          <BadgeIndianRupee className="h-4 w-4 text-green-600" /> Financial & Statutory Info
        </h2>
        <button
          onClick={() => {
            setBank(bankName || 'HDFC Bank')
            setAccount(bankAccountNo || '********6789')
            setUanNum(uan || '102116804585')
            setPanCard(pan || 'DBFPJ0593E')
            setShowConfirm(false)
            setIsEditOpen(true)
          }}
          className="p-1 text-gray-400 hover:text-[#be9a62] hover:bg-[#be9a62]/10 rounded-lg transition-colors"
          title="Edit Financials"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div className="flex justify-between bg-gray-50 p-2.5 rounded-lg border border-gray-100">
          <span className="text-gray-500">Bank Name</span>
          <span className="font-semibold text-gray-800">{bankName || 'HDFC Bank'}</span>
        </div>
        <div className="flex justify-between bg-gray-50 p-2.5 rounded-lg border border-gray-100">
          <span className="text-gray-500">Account No</span>
          <span className="font-semibold text-gray-800">{bankAccountNo || '********6789'}</span>
        </div>
        <div className="flex justify-between bg-gray-50 p-2.5 rounded-lg border border-gray-100">
          <span className="text-gray-500">UAN Number</span>
          <span className="font-semibold text-gray-800">{uan || '102116804585'}</span>
        </div>
        <div className="flex justify-between bg-gray-50 p-2.5 rounded-lg border border-gray-100">
          <span className="text-gray-500">PAN Card</span>
          <span className="font-semibold text-gray-800">{pan || 'DBFPJ0593E'}</span>
        </div>
      </div>

      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#132322] border border-[#4f4931]/60 rounded-2xl w-full max-w-md p-5 shadow-2xl relative text-white space-y-4">
            
            <div className="flex items-center justify-between border-b border-[#4f4931]/40 pb-2.5">
              <h3 className="font-bold text-sm text-white">Edit Financial & Statutory Details</h3>
              <button onClick={() => setIsEditOpen(false)} className="text-gray-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            {!showConfirm ? (
              <form onSubmit={(e) => { e.preventDefault(); setShowConfirm(true) }} className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="text-[#b09a77] uppercase font-semibold">Bank Name</label>
                  <input
                    type="text"
                    required
                    value={bank}
                    onChange={(e) => setBank(e.target.value)}
                    className="w-full bg-[#192115] border border-[#4f4931]/60 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#be9a62]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[#b09a77] uppercase font-semibold">Account Number</label>
                  <input
                    type="text"
                    required
                    value={account}
                    onChange={(e) => setAccount(e.target.value)}
                    className="w-full bg-[#192115] border border-[#4f4931]/60 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#be9a62]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[#b09a77] uppercase font-semibold">UAN Number</label>
                    <input
                      type="text"
                      value={uanNum}
                      onChange={(e) => setUanNum(e.target.value)}
                      className="w-full bg-[#192115] border border-[#4f4931]/60 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#be9a62]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[#b09a77] uppercase font-semibold">PAN Card</label>
                    <input
                      type="text"
                      value={panCard}
                      onChange={(e) => setPanCard(e.target.value.toUpperCase())}
                      className="w-full bg-[#192115] border border-[#4f4931]/60 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#be9a62]"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[#4f4931]/40">
                  <button type="button" onClick={() => setIsEditOpen(false)} className="px-3 py-1.5 text-gray-300">
                    Cancel
                  </button>
                  <button type="submit" className="bg-[#be9a62] text-[#132322] font-bold px-4 py-1.5 rounded-xl">
                    Review Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3 text-xs">
                <p className="text-gray-300">Confirm updated statutory records?</p>
                <div className="bg-[#192115] p-3 rounded-xl border border-[#4f4931]/40 space-y-1 text-[11px]">
                  <p><strong className="text-white">Bank:</strong> {bank}</p>
                  <p><strong className="text-white">Account:</strong> {account}</p>
                  <p><strong className="text-white">UAN:</strong> {uanNum}</p>
                  <p><strong className="text-white">PAN:</strong> {panCard}</p>
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
                    Confirm & Update
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