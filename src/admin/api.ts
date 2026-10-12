import { supabase } from '../auth/supabase'
import type { Overrides } from '../i18n/texts'

export async function fetchOverrides(): Promise<Overrides> {
  const { data, error } = await supabase.from('text_overrides').select('key,value')
  if (error) throw error
  return Object.fromEntries((data ?? []).map((r: { key: string; value: string }) => [r.key, r.value]))
}

export async function checkAdmin(): Promise<boolean> {
  const { data, error } = await supabase.rpc('is_admin')
  if (error) return false
  return data === true
}

export async function saveText(key: string, value: string): Promise<void> {
  const { error } = await supabase.rpc('admin_set_text', { p_key: key, p_value: value })
  if (error) throw new Error(error.message)
}

export async function resetText(key: string): Promise<void> {
  const { error } = await supabase.rpc('admin_reset_text', { p_key: key })
  if (error) throw new Error(error.message)
}
