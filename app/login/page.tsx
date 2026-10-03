'use client'

import { useState } from 'react'
import { login } from './actions'
import { Loader2 } from 'lucide-react'
import Image from 'next/image'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)

    try {
      // Call our server action
      const result = await login(formData)
      
      if (result?.error) {
        setError(result.error)
        setIsLoading(false)
      }
    } catch (err) {
      // Next.js redirect throws a routing exception on success, 
      // but if an error occurs or it settles, ensure loading resets if needed
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 selection:bg-[#be9a62] selection:text-[#132322]">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-gradient-to-b from-[#132322] to-[#192115] p-8 shadow-xl relative overflow-hidden">
        
        {/* Subtle luxury glow effect */}
        <div className="absolute -right-16 -top-16 w-40 h-40 bg-[#be9a62]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="text-center">
          <div className="text-center w-full flex items-center justify-center">
            <div className="relative h-20 w-20 overflow-hidden rounded-xl flex items-center justify-center shadow-lg shadow-[#be9a62]/20 bg-[#132322]">
              <Image
                src="/logo.png"
                alt="Logo"
                fill
                className="object-contain"
              />
            </div>
          </div>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-white">
            Staff Portal
          </h2>
          <p className="mt-2 text-sm text-[#b09a77]">
            Sign in to manage your shifts and payslips
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                disabled={isLoading}
                className="relative block w-full rounded-md border-0 py-2.5 text-white bg-[#192115]/50 ring-1 ring-inset ring-[#b09a77] placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-[#be9a62] sm:text-sm sm:leading-6 px-3 disabled:opacity-50 transition-all"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                disabled={isLoading}
                className="relative block w-full rounded-md border-0 py-2.5 text-white bg-[#192115]/50 ring-1 ring-inset ring-[#b09a77] placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-[#be9a62] sm:text-sm sm:leading-6 px-3 disabled:opacity-50 transition-all"
                placeholder="Password"
              />
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 py-2 px-3 rounded-lg text-center font-medium">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full justify-center items-center gap-2 rounded-md bg-[#be9a62] px-3 py-3 text-sm font-semibold text-[#132322] hover:bg-[#b79c68] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#be9a62] disabled:opacity-70 transition-all cursor-pointer shadow-md shadow-[#be9a62]/20"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}