'use client'

import { useState } from 'react'
import { 
  Users, 
  Search, 
  Store, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  Loader2, 
  ArrowRightLeft,
  UserMinus,
  UserCheck
} from 'lucide-react'
import { assignEmployeeStore } from './actions'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface Shop {
  id: string
  name: string
  location: string | null
}

interface Employee {
  id: string
  full_name: string
  designation: string | null
  employee_code: string | null
  shop_id: string | null
  shops?: { name: string } | { name: string }[] | null
}

interface PendingAction {
  employee: Employee
  targetShopId: string | null
  targetShopName: string
  actionType: 'assign' | 'reassign' | 'unassign'
}

export default function EmployeeAssignmentManager({
  employees,
  shops,
}: {
  employees: Employee[]
  shops: Shop[]
}) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterShopId, setFilterShopId] = useState<string>('all')
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Filter employees by name/code and current store
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch = 
      emp.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.employee_code && emp.employee_code.toLowerCase().includes(searchTerm.toLowerCase()))

    if (filterShopId === 'all') return matchesSearch
    if (filterShopId === 'unassigned') return matchesSearch && !emp.shop_id
    return matchesSearch && emp.shop_id === filterShopId
  })

  const getShopName = (emp: Employee) => {
    if (!emp.shop_id) return 'Unassigned'
    if (emp.shops) {
      return Array.isArray(emp.shops) ? emp.shops[0]?.name : emp.shops.name
    }
    return shops.find((s) => s.id === emp.shop_id)?.name || 'Assigned'
  }

  const handleSelectChange = (employee: Employee, selectedValue: string) => {
    const targetShopId = selectedValue === 'unassigned' ? null : selectedValue
    const currentShopId = employee.shop_id

    // No change made
    if (targetShopId === currentShopId) return

    let actionType: 'assign' | 'reassign' | 'unassign' = 'assign'
    let targetShopName = 'Unassigned'

    if (!targetShopId) {
      actionType = 'unassign'
    } else {
      const target = shops.find((s) => s.id === targetShopId)
      targetShopName = target?.name || 'Selected Store'
      actionType = currentShopId ? 'reassign' : 'assign'
    }

    setPendingAction({
      employee,
      targetShopId,
      targetShopName,
      actionType,
    })
  }

  const handleConfirmAssignment = async () => {
    if (!pendingAction) return

    setIsProcessing(true)
    const result = await assignEmployeeStore(
      pendingAction.employee.id,
      pendingAction.targetShopId
    )

    if (result?.error) {
      toast.error(result.error)
      setIsProcessing(false)
      return
    }

    if (pendingAction.actionType === 'unassign') {
      toast.success(`${pendingAction.employee.full_name} unassigned successfully.`)
    } else {
      toast.success(`${pendingAction.employee.full_name} assigned to ${pendingAction.targetShopName}.`)
    }

    setIsProcessing(false)
    setPendingAction(null)
    router.refresh()
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden space-y-4">
      {/* Header and Filter Controls */}
      <div className="p-6 border-b border-gray-100 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-5 w-5 text-[#be9a62]" /> Staff Store Allocation
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Assign active personnel or relocate staff between store branches
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search Field */}
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search staff or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-xs pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#be9a62] w-48 transition-colors"
            />
          </div>

          {/* Filter Dropdown */}
          <select
            value={filterShopId}
            onChange={(e) => setFilterShopId(e.target.value)}
            className="text-xs py-2 px-3 bg-white border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:border-[#be9a62] cursor-pointer"
          >
            <option value="all">All Outlets ({employees.length})</option>
            <option value="unassigned">
              Unassigned ({employees.filter((e) => !e.shop_id).length})
            </option>
            {shops.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({employees.filter((e) => e.shop_id === s.id).length})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Allocation Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-xs font-semibold uppercase tracking-wider text-gray-400 bg-white">
              <th className="p-4 pl-6">Staff Member</th>
              <th className="p-4">Designation</th>
              <th className="p-4">Current Branch</th>
              <th className="p-4 pr-6 text-right">Assign Store</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((emp) => {
                const currentBranchName = getShopName(emp)
                const isAssigned = Boolean(emp.shop_id)

                return (
                  <tr key={emp.id} className="hover:bg-gray-50/80 transition-colors">
                    {/* Name + Code */}
                    <td className="p-4 pl-6 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-[#132322] text-[#be9a62] flex items-center justify-center font-bold text-xs shrink-0">
                          {emp.full_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{emp.full_name}</p>
                          <p className="text-[11px] text-gray-400 font-mono">
                            {emp.employee_code || 'EMP-N/A'}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Designation */}
                    <td className="p-4 whitespace-nowrap text-xs text-gray-600">
                      {emp.designation || 'Store Staff'}
                    </td>

                    {/* Current Branch Badge */}
                    <td className="p-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          isAssigned
                            ? 'bg-[#be9a62]/10 text-[#be9a62] border border-[#be9a62]/20'
                            : 'bg-red-50 text-red-600 border border-red-100'
                        }`}
                      >
                        <Store className="h-3 w-3" />
                        {currentBranchName}
                      </span>
                    </td>

                    {/* Assignment Selector */}
                    <td className="p-4 pr-6 whitespace-nowrap text-right">
                      <select
                        value={emp.shop_id || 'unassigned'}
                        onChange={(e) => handleSelectChange(emp, e.target.value)}
                        className="text-xs font-medium py-1.5 px-2.5 rounded-lg border border-gray-200 bg-white text-gray-800 hover:border-[#be9a62] focus:outline-none focus:border-[#be9a62] cursor-pointer transition-colors shadow-2xs"
                      >
                        <option value="unassigned" className="text-red-600">
                          ✕ Unassigned
                        </option>
                        {shops.map((shop) => (
                          <option key={shop.id} value={shop.id}>
                            ✓ {shop.name}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={4} className="p-8 text-center text-xs text-gray-400">
                  No staff members match the selected criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Confirmation & Caution Modal */}
      {pendingAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#132322] border border-[#4f4931]/60 rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-white space-y-5">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#4f4931]/40 pb-4">
              <div className="flex items-center gap-2.5">
                <div
                  className={`h-9 w-9 rounded-lg flex items-center justify-center ${
                    pendingAction.actionType === 'unassign'
                      ? 'bg-red-500/10 border border-red-500/30 text-red-400'
                      : 'bg-[#be9a62]/10 border border-[#be9a62]/30 text-[#be9a62]'
                  }`}
                >
                  {pendingAction.actionType === 'unassign' ? (
                    <UserMinus className="h-5 w-5" />
                  ) : pendingAction.actionType === 'reassign' ? (
                    <ArrowRightLeft className="h-5 w-5" />
                  ) : (
                    <UserCheck className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">
                    {pendingAction.actionType === 'unassign'
                      ? 'Unassign Employee'
                      : pendingAction.actionType === 'reassign'
                      ? 'Transfer Store Allocation'
                      : 'Assign Employee to Store'}
                  </h3>
                  <p className="text-xs text-[#b09a77]">Confirmation required</p>
                </div>
              </div>
              <button
                onClick={() => setPendingAction(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Caution Banner for Unassigning */}
            {pendingAction.actionType === 'unassign' && (
              <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl space-y-2 text-xs">
                <div className="flex items-center gap-2 text-amber-400 font-bold">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>Caution: Roster Disconnection</span>
                </div>
                <p className="text-amber-200/90 leading-relaxed">
                  <strong className="text-white">{pendingAction.employee.full_name}</strong> is currently assigned to{' '}
                  <strong className="text-white">{getShopName(pendingAction.employee)}</strong>. Unassigning will remove them from daily shift rosters and live attendance tracking until re-allocated.
                </p>
              </div>
            )}

            {/* Caution Banner for Store Relocation */}
            {pendingAction.actionType === 'reassign' && (
              <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-xl space-y-2 text-xs">
                <div className="flex items-center gap-2 text-blue-400 font-bold">
                  <ArrowRightLeft className="h-4 w-4 shrink-0" />
                  <span>Transfer Notice</span>
                </div>
                <p className="text-blue-200/90 leading-relaxed">
                  Moving <strong className="text-white">{pendingAction.employee.full_name}</strong> from{' '}
                  <span className="text-[#be9a62] font-semibold">{getShopName(pendingAction.employee)}</span> to{' '}
                  <span className="text-green-400 font-semibold">{pendingAction.targetShopName}</span>. Future shift logs will be credited to the new branch.
                </p>
              </div>
            )}

            {/* Plain Confirmation for New Assignment */}
            {pendingAction.actionType === 'assign' && (
              <div className="bg-gray-800/40 border border-[#4f4931]/40 p-4 rounded-xl text-xs space-y-1">
                <p className="text-gray-300">
                  Assign <strong className="text-white">{pendingAction.employee.full_name}</strong> to:
                </p>
                <p className="text-[#be9a62] font-bold text-sm">
                  {pendingAction.targetShopName}
                </p>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#4f4931]/40">
              <button
                type="button"
                onClick={() => setPendingAction(null)}
                disabled={isProcessing}
                className="px-4 py-2 text-xs font-medium text-gray-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAssignment}
                disabled={isProcessing}
                className={`inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-md disabled:opacity-50 ${
                  pendingAction.actionType === 'unassign'
                    ? 'bg-red-600 hover:bg-red-500 text-white'
                    : 'bg-[#be9a62] hover:bg-[#b79c68] text-[#132322]'
                }`}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Applying...</span>
                  </>
                ) : (
                  <span>
                    {pendingAction.actionType === 'unassign'
                      ? 'Confirm Unassignment'
                      : 'Confirm Assignment'}
                  </span>
                )}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}