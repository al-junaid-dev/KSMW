'use client'

import { useState } from 'react'
import { Pencil, Trash2, AlertTriangle, X, Loader2, Store, MapPin } from 'lucide-react'
import { updateStore, deleteStore } from '../actions'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface StoreActionsProps {
  store: {
    id: string
    name: string
    location: string | null
  }
  employeeCount: number
}

export default function StoreActions({ store, employeeCount }: StoreActionsProps) {
  const router = useRouter()

  // Modal states
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  // Loading states
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Edit form state
  const [name, setName] = useState(store.name)
  const [location, setLocation] = useState(store.location || '')

  // Confirm state for editing
  const [showEditConfirm, setShowEditConfirm] = useState(false)

  async function handleUpdateSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setShowEditConfirm(true)
  }

  async function confirmUpdate() {
    setIsSaving(true)
    const formData = new FormData()
    formData.append('name', name)
    formData.append('location', location)

    const result = await updateStore(store.id, formData)

    if (result?.error) {
      toast.error(result.error)
      setIsSaving(false)
      setShowEditConfirm(false)
      return
    }

    toast.success('Store details updated successfully!')
    setIsSaving(false)
    setShowEditConfirm(false)
    setIsEditOpen(false)
    router.refresh()
  }

  async function confirmDelete() {
    setIsDeleting(true)
    const result = await deleteStore(store.id)

    if (result?.error) {
      toast.error(result.error)
      setIsDeleting(false)
      return
    }

    toast.success('Store deleted successfully!')
    router.push('/admin/stores')
  }

  return (
    <div className="flex items-center gap-2">
      {/* Edit Button */}
      <button
        onClick={() => {
          setName(store.name)
          setLocation(store.location || '')
          setShowEditConfirm(false)
          setIsEditOpen(true)
        }}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-gray-200 text-gray-700 hover:border-[#be9a62] hover:text-[#be9a62] transition-colors shadow-2xs cursor-pointer"
      >
        <Pencil className="h-3.5 w-3.5" />
        <span>Edit</span>
      </button>

      {/* Delete Button */}
      <button
        onClick={() => setIsDeleteOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 transition-colors shadow-2xs cursor-pointer"
      >
        <Trash2 className="h-3.5 w-3.5" />
        <span>Delete</span>
      </button>

      {/* ================= EDIT MODAL ================= */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#132322] border border-[#4f4931]/60 rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-white space-y-5">
            <div className="flex items-center justify-between border-b border-[#4f4931]/40 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-lg bg-[#be9a62]/10 border border-[#be9a62]/30 flex items-center justify-center text-[#be9a62]">
                  <Pencil className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-lg text-white">Edit Store Details</h3>
              </div>
              <button
                onClick={() => setIsEditOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {!showEditConfirm ? (
              <form onSubmit={handleUpdateSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#b09a77]">
                    Store Name *
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#7f7254]">
                      <Store className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#192115] border border-[#4f4931]/60 rounded-xl px-3.5 py-2.5 pl-9 text-sm text-white placeholder-[#7f7254] focus:outline-none focus:border-[#be9a62] transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#b09a77]">
                    Location / Address
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#7f7254]">
                      <MapPin className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full bg-[#192115] border border-[#4f4931]/60 rounded-xl px-3.5 py-2.5 pl-9 text-sm text-white placeholder-[#7f7254] focus:outline-none focus:border-[#be9a62] transition-colors"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#4f4931]/40">
                  <button
                    type="button"
                    onClick={() => setIsEditOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-[#be9a62] hover:bg-[#b79c68] text-[#132322] font-semibold text-sm px-4 py-2 rounded-xl transition-all cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              /* Confirmation Prompt before saving */
              <div className="space-y-4 py-2">
                <div className="bg-[#192115] p-4 rounded-xl border border-[#4f4931]/60 space-y-2 text-sm">
                  <p className="text-gray-300 font-medium">Are you sure you want to apply these changes?</p>
                  <div className="text-xs text-[#b09a77] space-y-1">
                    <p><strong className="text-white">Name:</strong> {name}</p>
                    <p><strong className="text-white">Location:</strong> {location || 'None'}</p>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowEditConfirm(false)}
                    disabled={isSaving}
                    className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={confirmUpdate}
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 bg-[#be9a62] hover:bg-[#b79c68] text-[#132322] font-semibold text-sm px-4 py-2 rounded-xl transition-all disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Updating...</span>
                      </>
                    ) : (
                      <span>Confirm & Update</span>
                    )}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ================= DELETE CONFIRMATION MODAL ================= */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#132322] border border-red-500/40 rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-white space-y-5">
            <div className="flex items-center justify-between border-b border-[#4f4931]/40 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                  <Trash2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">Delete Outlet</h3>
                  <p className="text-xs text-red-300 font-medium">Permanent action confirmation</p>
                </div>
              </div>
              <button
                onClick={() => setIsDeleteOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Caution Banner */}
            {employeeCount > 0 ? (
              <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>Assigned Employees Warning</span>
                </div>
                <p className="text-xs text-amber-200/90 leading-relaxed">
                  There {employeeCount === 1 ? 'is' : 'are'} currently <strong className="text-white font-bold">{employeeCount} employee{employeeCount === 1 ? '' : 's'}</strong> assigned to this store. If you proceed with deletion, the store will be removed and these employees will be automatically set to <span className="underline font-semibold">Unassigned</span>.
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-300">
                Are you sure you want to delete <strong className="text-white">{store.name}</strong>? This action cannot be undone.
              </p>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#4f4931]/40">
              <button
                type="button"
                onClick={() => setIsDeleteOpen(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-semibold text-sm px-4 py-2 rounded-xl transition-all disabled:opacity-50 cursor-pointer shadow-md"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Yes, Delete Store</span>
                )}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}