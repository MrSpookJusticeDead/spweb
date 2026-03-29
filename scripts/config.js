const SUPABASE_URL  = 'https://lzggaayoqjehihlwqszj.supabase.co'
const SUPABASE_KEY  = 'sb_publishable_HNUFMEnxvVh0ota2VD_xPA_rV8kgVWP'

// Single shared instance
const { createClient } = supabase
const sb = createClient(SUPABASE_URL, SUPABASE_KEY)