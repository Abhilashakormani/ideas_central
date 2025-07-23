"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { supabase, authService, type AuthUser, IS_SUPABASE_CONFIGURED, mockUser, mockProfile } from "@/lib/auth" // Import correctly
import type { User } from "@supabase/supabase-js"

interface AuthContextType {
  user: User | null
  profile: AuthUser | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        if (!IS_SUPABASE_CONFIGURED) {
          // Handle mock data for initial session as well
          setUser(mockUser)
          setProfile(mockProfile)
          setLoading(false)
          return
        }
        const session = await authService.getSession()
        if (session?.user) {
          const userData = await authService.getCurrentUser()
          if (userData) {
            setUser(userData.user)
            setProfile(userData.profile)
          }
        }
      } catch (error) {
        console.error("Error getting initial session:", error)
      } finally {
        if (IS_SUPABASE_CONFIGURED) {
          // Only set loading to false here if not mock
          setLoading(false)
        }
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!IS_SUPABASE_CONFIGURED) {
        setUser(mockUser)
        setProfile(mockProfile)
        setLoading(false)
        return
      }
      if (event === "SIGNED_IN" && session?.user) {
        try {
          const userData = await authService.getCurrentUser()
          if (userData) {
            setUser(userData.user)
            setProfile(userData.profile)
          }
        } catch (error) {
          console.error("Error getting user data:", error)
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null)
        setProfile(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    try {
      await authService.signOut()
      setUser(null)
      setProfile(null)
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
