'use client'

import { useState } from 'react'
import { login } from './actions'
import { Loader2 } from 'lucide-react'
import Image from 'next/image';

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError(null)
    
    // Call our server action
    const result = await login(formData)
    
    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[white] px-4">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-gradient-to-b from-[#132322] to-[#192115] p-8 shadow-lg ">
        <div className="text-center">
           <div className="text-center w-full flex items-center justify-center">
          <div className="relative h-20 w-20 overflow-hidden rounded-xl flex items-center justify-center shadow-lg shadow-[#be9a62]/20">
                        <Image
                          src="/logo.png"
                          alt="Logo"
                          fill
                          className="object-contain"
                        />
                      </div>
                      </div>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-[white]">
            Staff Portal
          </h2>
          <p className="mt-2 text-sm text-[#b09a77]">
            Sign in to manage your shifts and payslips
          </p>
        </div>

        <form action={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="relative block w-full rounded-md border-0 py-2.5 text-[white] ring-1 ring-inset ring-[#b09a77] placeholder:text-[whitesmoke]/90 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-[wheat] sm:text-sm sm:leading-6 px-3"
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
                className="relative block w-full rounded-md border-0 py-2.5 text-[white] ring-1 ring-inset ring-[#b09a77] placeholder:text-[whitesmoke]/90 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-[wheat] sm:text-sm sm:leading-6 px-3"
                placeholder="Password"
              />
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-500 text-center font-medium">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full justify-center rounded-md bg-[#be9a62] px-3 py-3 text-sm font-semibold text-white hover:bg-[#b79c68] hover:text-[#132322] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-70"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
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