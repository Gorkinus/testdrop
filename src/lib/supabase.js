import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://oauoxzqrrwnqvrheljjm.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_GJ6a1NPq8HGoswPC8niNLA_ytJ641cO'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
