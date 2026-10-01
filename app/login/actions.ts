'use server'

import { redirect } from 'next/navigation'
import { createClient } from '../../utils/supabase/server'

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createClient()

  // 1. Authenticate the user
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (authError) {
    return { error: authError.message }
  }

  // 2. Fetch the user's role from the profiles table
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', authData.user.id)
    .single()

  if (profileError) {
    return { error: 'Failed to fetch user profile.' }
  }

  // 3. Redirect based on role
  if (profileData?.role === 'admin') {
    redirect('/admin')
  } else {
    redirect('/dashboard')
  }
}