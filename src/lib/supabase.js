import { createClient } from '@supabase/supabase-js'

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

    export const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Helper function for user login
    export async function signInWithEmail(email, password) {
      const { user, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      return { user, error }
    }

    // Helper function for user logout
    export async function signOut() {
      const { error } = await supabase.auth.signOut()
      return { error }
    }
