import { createClient } from '@supabase/supabase-js'
import { env } from '../config/env'

// This is the only browser Supabase client. Supabase owns session persistence.
export const supabase = createClient(env.supabaseUrl, env.supabasePublishableKey)
