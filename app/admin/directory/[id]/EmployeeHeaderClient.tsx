'use client'

import { useState } from 'react'
import { 
  User, 
  MapPin, 
  Calendar, 
  BadgeIndianRupee, 
  Clock, 
  Pencil, 
  Trash2, 
  X, 
  AlertTriangle, 
  Loader2 
} from 'lucide-react'
import { updateEmployeeHeader, deleteEmployeeProfile } from '../actions'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface EmployeeHeaderProps {
  employee: {
    id: string
    full_name: string
    designation: string | null
    joining_date: string | null
    fixed_basic: number | null
    fixed_hra: number | null
    shift_start: string | null
    shift_end: string | null
  }
  shopName: string
}

export default function EmployeeHeaderClient({ employee, shopName }: EmployeeHeaderProps) {
  const router = useRouter()

  // Edit Modal States
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [showEditConfirm, setShowEditConfirm] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Form Fields
  const [fullName, setFullName] = useState(employee.full_name)
  const [joiningDate, setJoiningDate] = useState(employee.joining_date || '')
  const [basicPay, setBasicPay] = useState(employee.fixed_basic || 0)
  const [hraPay, setHraPay] = useState(employee.fixed_hra || 0)
  const [shiftStart, setShiftStart] = useState(employee.shift_start || '09:30:00')
  const [shiftEnd, setShiftEnd] = useState(employee.shift_end || '18:30:00')

  // Delete Modal States
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const monthlyCTC = basicPay + hraPay
  const currentCTC = (employee.fixed_basic || 0) + (employee.fixed_hra || 0)

  async function handleConfirmEdit() {
    setIsSaving(true)
    const res = await updateEmployeeHeader(employee.id, {
      full_name: fullName,
      joining_date: joiningDate,
      fixed_basic: Number(basicPay),
      fixed_hra: Number(hraPay),
      shift_start: shiftStart,
      shift_end: shiftEnd,
    })

    if (res?.error) {
      toast.error(res.error)
      setIsSaving(false)
      return
    }

    toast.success('Employee profile & schedule updated!')
    setIsSaving(false)
    setShowEditConfirm(false)
    setIsEditOpen(false)
    router.refresh()
  }

  async function handleConfirmDelete() {
    setIsDeleting(true)
    const res = await deleteEmployeeProfile(employee.id)

    if (res?.error) {
      toast.error(res.error)
      setIsDeleting(false)
      return
    }

    toast.success('Employee profile and records removed.')
    router.push('/admin/directory')
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
      
      {/* Left: Avatar & Identity */}
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-[#132322] border-2 border-[#be9a62] text-[#be9a62] flex items-center justify-center font-bold text-2xl shadow-inner shrink-0">
          {employee.full_name.charAt(0)}
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{employee.full_name}</h1>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  setFullName(employee.full_name)
                  setJoiningDate(employee.joining_date || '')
                  setBasicPay(employee.fixed_basic || 0)
                  setHraPay(employee.fixed_hra || 0)
                  setShiftStart(employee.shift_start || '09:30:00')
                  setShiftEnd(employee.shift_end || '18:30:00')
                  setShowEditConfirm(false)
                  setIsEditOpen(true)
                }}
                className="p-1.5 text-gray-400 hover:text-[#be9a62] hover:bg-[#be9a62]/10 rounded-lg transition-colors"
                title="Edit Employee & Schedule"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsDeleteOpen(true)}
                className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete Employee"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
          <p className="text-gray-500 text-xs sm:text-sm flex items-center gap-2">
            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium text-xs">
              {employee.designation || 'Store Staff'}
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-gray-400" /> {shopName}
            </span>
          </p>
        </div>
      </div>

      {/* Right: Key Details (Joining Date, CTC, Shift Schedule) */}
      <div className="flex flex-wrap sm:flex-nowrap gap-3 text-sm border-t md:border-t-0 pt-4 md:pt-0 border-gray-100">
        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 min-w-[110px]">
          <p className="text-gray-400 text-xs font-medium flex items-center gap-1">
            <Calendar className="h-3 w-3" /> Joining Date
          </p>
          <p className="font-bold text-gray-800 mt-0.5">
            {employee.joining_date
              ? new Date(employee.joining_date).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })
              : 'Not Set'}
          </p>
        </div>

        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 min-w-[120px]">
          <p className="text-gray-400 text-xs font-medium flex items-center gap-1">
            <BadgeIndianRupee className="h-3 w-3" /> Monthly CTC
          </p>
          <p className="font-bold text-gray-800 mt-0.5">
            ₹{currentCTC.toLocaleString('en-IN')}
          </p>
        </div>

        {/* Shift Schedule (Relocated Here) */}
        <div className="bg-[#be9a62]/10 p-3 rounded-xl border border-[#be9a62]/20 min-w-[130px]">
          <p className="text-[#be9a62] text-xs font-semibold flex items-center gap-1">
            <Clock className="h-3 w-3" /> Shift Schedule
          </p>
          <p className="font-bold text-gray-900 mt-0.5">
            {employee.shift_start ? employee.shift_start.slice(0, 5) : '09:30'} -{' '}
            {employee.shift_end ? employee.shift_end.slice(0, 5) : '18:30'}
          </p>
        </div>
      </div>

      {/* ================= EDIT MODAL ================= */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#132322] border border-[#4f4931]/60 rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-white space-y-4">
            
            <div className="flex items-center justify-between border-b border-[#4f4931]/40 pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Pencil className="h-4 w-4 text-[#be9a62]" /> Edit Profile & Schedule
              </h3>
              <button onClick={() => setIsEditOpen(false)} className="text-gray-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            {!showEditConfirm ? (
              <form onSubmit={(e) => { e.preventDefault(); setShowEditConfirm(true) }} className="space-y-3 text-xs">
                
                <div className="space-y-1">
                  <label className="text-[#b09a77] font-semibold uppercase">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[#192115] border border-[#4f4931]/60 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#be9a62]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[#b09a77] font-semibold uppercase">Joining Date</label>
                  <input
                    type="date"
                    value={joiningDate}
                    onChange={(e) => setJoiningDate(e.target.value)}
                    className="w-full bg-[#192115] border border-[#4f4931]/60 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#be9a62]"
                  />
                </div>

                {/* Monthly CTC Breakdown */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="space-y-1">
                    <label className="text-[#b09a77] font-semibold uppercase">Basic Salary (₹)</label>
                    <input
                      type="number"
                      value={basicPay}
                      onChange={(e) => setBasicPay(Number(e.target.value))}
                      className="w-full bg-[#192115] border border-[#4f4931]/60 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#be9a62]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[#b09a77] font-semibold uppercase">HRA Allowance (₹)</label>
                    <input
                      type="number"
                      value={hraPay}
                      onChange={(e) => setHraPay(Number(e.target.value))}
                      className="w-full bg-[#192115] border border-[#4f4931]/60 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#be9a62]"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-gray-400">Total Calculated CTC: ₹{monthlyCTC.toLocaleString('en-IN')}/month</p>

                {/* Shift Schedule Inputs */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#4f4931]/30">
                  <div className="space-y-1">
                    <label className="text-[#b09a77] font-semibold uppercase">Shift Start</label>
                    <input
                      type="time"
                      value={shiftStart}
                      onChange={(e) => setShiftStart(e.target.value)}
                      className="w-full bg-[#192115] border border-[#4f4931]/60 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#be9a62]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[#b09a77] font-semibold uppercase">Shift End</label>
                    <input
                      type="time"
                      value={shiftEnd}
                      onChange={(e) => setShiftEnd(e.target.value)}
                      className="w-full bg-[#192115] border border-[#4f4931]/60 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#be9a62]"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-[#4f4931]/40">
                  <button
                    type="button"
                    onClick={() => setIsEditOpen(false)}
                    className="px-3 py-1.5 text-gray-300 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-[#be9a62] hover:bg-[#b79c68] text-[#132322] font-bold px-4 py-1.5 rounded-xl transition-all"
                  >
                    Review & Save
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3 py-2 text-xs">
                <div className="bg-[#192115] p-3.5 rounded-xl border border-[#4f4931]/60 space-y-1.5">
                  <p className="font-semibold text-[#be9a62]">Confirm Updated Information:</p>
                  <p><strong className="text-white">Name:</strong> {fullName}</p>
                  <p><strong className="text-white">Joining Date:</strong> {joiningDate || 'None'}</p>
                  <p><strong className="text-white">Total CTC:</strong> ₹{monthlyCTC.toLocaleString('en-IN')}/mo</p>
                  <p><strong className="text-white">Schedule:</strong> {shiftStart} - {shiftEnd}</p>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setShowEditConfirm(false)}
                    className="px-3 py-1.5 text-gray-300"
                    disabled={isSaving}
                  >
                    Back
                  </button>
                  <button
                    onClick={handleConfirmEdit}
                    disabled={isSaving}
                    className="bg-[#be9a62] text-[#132322] font-bold px-4 py-1.5 rounded-xl flex items-center gap-1.5"
                  >
                    {isSaving && <Loader2 className="h-3 w-3 animate-spin" />}
                    Confirm Changes
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= DELETE CAUTION MODAL ================= */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#132322] border border-red-500/40 rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-white space-y-4">
            
            <div className="flex items-center gap-2.5 border-b border-[#4f4931]/40 pb-3">
              <div className="h-8 w-8 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                <Trash2 className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Delete Employee Record</h3>
                <p className="text-xs text-red-300">Irreversible Action</p>
              </div>
            </div>

            <div className="bg-red-500/10 border border-red-500/30 p-3.5 rounded-xl text-xs space-y-2 text-red-200">
              <div className="flex items-center gap-1.5 text-red-400 font-bold">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>Critical Warning</span>
              </div>
              <p>
                You are about to delete <strong className="text-white">{employee.full_name}</strong>. All associated attendance time logs and historical payslip statements will be purged from the database.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#4f4931]/40">
              <button
                onClick={() => setIsDeleteOpen(false)}
                disabled={isDeleting}
                className="px-3 py-1.5 text-xs text-gray-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-4 py-1.5 rounded-xl flex items-center gap-1.5"
              >
                {isDeleting ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                Yes, Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}