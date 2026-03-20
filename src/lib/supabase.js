import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ofuedkzwzbtabgummrip.supabase.co'
const supabaseAnonKey = 'sb_publishable_exqNNgMGaUp2MYx5ojM-1A_hBozB749'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)