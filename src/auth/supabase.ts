import { createClient } from '@supabase/supabase-js'

// The URL and publishable key are designed to be public (they ship in every browser bundle).
// Access control is enforced by Supabase Auth / row-level security, never by hiding this key.
// Override with VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY if you move to another project.
const url = import.meta.env.VITE_SUPABASE_URL ?? 'https://kgskgimwhyzrbwcadepn.supabase.co'
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? 'sb_publishable_thSJA4iJCoLAv9HQ4aWJ8w_-a46afdT'

export const supabase = createClient(url, key)
