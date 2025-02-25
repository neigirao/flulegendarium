
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bysoylrjhsoiwbsdffdc.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2c295bHJqaHNvaXdic2RmZmRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDg4MjY0MDQsImV4cCI6MjAyNDQwMjQwNH0.zvl9FbQVxm_cZvtcwHA8-BVwnJ32bbF1Biqb5nwBXVY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
