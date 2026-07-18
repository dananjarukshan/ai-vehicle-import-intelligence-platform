import { createContext } from 'react'

// The context object is dependency-free so tests can provide safe mock auth
// values without loading Supabase or adding a production authentication bypass.
export const AuthContext = createContext(null)
