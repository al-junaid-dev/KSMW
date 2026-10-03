'use server'

import { createClient } from '../../../utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createStore(formData: FormData) {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const location = formData.get('location') as string

  if (!name || !name.trim()) {
    return { error: 'Store name is required' }
  }

  const { error } = await supabase.from('shops').insert({
    name: name.trim(),
    location: location?.trim() || null,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/stores')
  revalidatePath('/admin')
  return { success: true }
}

export async function updateStore(storeId: string, formData: FormData) {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const location = formData.get('location') as string

  if (!name || !name.trim()) {
    return { error: 'Store name is required' }
  }

  const { error } = await supabase
    .from('shops')
    .update({
      name: name.trim(),
      location: location?.trim() || null,
    })
    .eq('id', storeId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/stores')
  revalidatePath(`/admin/stores/${storeId}`)
  revalidatePath('/admin')
  return { success: true }
}

export async function deleteStore(storeId: string) {
  const supabase = await createClient()

  // Supabase foreign key is set to ON DELETE SET NULL on profiles.shop_id,
  // so employees assigned will automatically have shop_id set to null.
  const { error } = await supabase.from('shops').delete().eq('id', storeId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/stores')
  revalidatePath('/admin')
  revalidatePath('/admin/directory')
  return { success: true }
}

export async function assignEmployeeStore(employeeId: string, shopId: string | null) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('profiles')
    .update({ shop_id: shopId })
    .eq('id', employeeId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/stores')
  revalidatePath('/admin')
  revalidatePath('/admin/directory')
  return { success: true }
}