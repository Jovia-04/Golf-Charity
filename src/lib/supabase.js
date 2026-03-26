import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://fdkfcxvtnloqfigihhcu.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZka2ZjeHZ0bmxvcWZpZ2loaGN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0NDI3MDEsImV4cCI6MjA5MDAxODcwMX0.z4KTOk1XGoWBNA3AkT0YpRAuSvQbxiKTg1gP4qzEpy0"

export const supabase = createClient(supabaseUrl, supabaseKey)