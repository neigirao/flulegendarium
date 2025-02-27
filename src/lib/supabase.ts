
import { createClient } from '@supabase/supabase-js'

// Corrigindo a URL do Supabase (havia um erro de digitação)
const supabaseUrl = 'https://hafxruwnggitvtyngedy.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhZnhydXduZ2dpdHZ0eW5nZWR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzNDE0NTIsImV4cCI6MjA1NTkxNzQ1Mn0.gWlNlVeJyISEIjjfLN46hrZ7OZSKd_6rQFJ2LnUkVDw'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
