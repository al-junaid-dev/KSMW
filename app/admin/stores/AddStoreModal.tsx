'use client'

import { useState } from 'react'
import { Plus, Store, MapPin, X, Loader2 } from 'lucide-react'
import { createStore } from './actions'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

export default function AddStoreModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await createStore(formData)

    if (result?.error) {
      toast.error(result.error)
      setIsLoading(false)
      return
    }

    toast.success('Store added successfully!')
    setIsLoading(false)
    setIsOpen(false)
    router.refresh()
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 bg-[#be9a62] hover:bg-[#b79c68] text-[#132322] font-semibold text-sm px-4 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
      >
        <Plus className="h-4 w-4" />
        <span>Add Store</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#132322] border border-[#4f4931]/60 rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-white space-y-5">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#4f4931]/40 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-lg bg-[#be9a62]/10 border border-[#be9a62]/30 flex items-center justify-center text-[#be9a62]">
                  <Store className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">Create New Outlet</h3>
                  <p className="text-xs text-[#b09a77]">ID and timestamps are generated automatically</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#b09a77]">
                  Store Name *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#7f7254]">
                    <Store className="h-4 w-4" />
                  </span>
                  <input
                    name="name"
                    type="text"
                    required
                    disabled={isLoading}
                    placeholder="e.g. KSWMG Electronics - Branch 3"
                    className="w-full bg-[#192115] border border-[#4f4931]/60 rounded-xl px-3.5 py-2.5 pl-9 text-sm text-white placeholder-[#7f7254] focus:outline-none focus:border-[#be9a62] transition-colors disabled:opacity-50"
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
                    name="location"
                    type="text"
                    disabled={isLoading}
                    placeholder="e.g. Banjara Hills, Hyderabad"
                    className="w-full bg-[#192115] border border-[#4f4931]/60 rounded-xl px-3.5 py-2.5 pl-9 text-sm text-white placeholder-[#7f7254] focus:outline-none focus:border-[#be9a62] transition-colors disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#4f4931]/40">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 bg-[#be9a62] hover:bg-[#b79c68] text-[#132322] font-semibold text-sm px-4 py-2 rounded-xl transition-all disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Create Store</span>
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </>
  )
}