import { createClient, SupabaseClient } from '@supabase/supabase-js'

function createSupabaseClient(): SupabaseClient | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase environment variables are missing. Some features may not work.')
    return null
  }

  return createClient(supabaseUrl, supabaseAnonKey)
}

let _supabase: SupabaseClient | null | undefined = undefined

export function getSupabase(): SupabaseClient | null {
  if (_supabase === undefined) {
    _supabase = createSupabaseClient()
  }
  return _supabase
}

// 为了向后兼容，导出 supabase 对象（懒加载）
export const supabase = new Proxy({} as SupabaseClient, {
  get(target, prop) {
    const client = getSupabase()
    if (!client) {
      throw new Error('Supabase client not initialized. Please check environment variables.')
    }
    return client[prop as keyof SupabaseClient]
  },
})
