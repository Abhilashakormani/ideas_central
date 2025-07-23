// lib/auth.ts
import { createClient } from "@supabase/supabase-js"
import { customAlphabet } from "nanoid"
const nanoid = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 10)

// ✅ 1) Load env vars safely so the preview/build doesn't crash
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  (() => {
    console.warn("⚠️  NEXT_PUBLIC_SUPABASE_URL is not defined – set it in your Environment Variables.")
    return "https://YOUR-SUPABASE-PROJECT.supabase.co" // fallback placeholder
  })()

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  (() => {
    console.warn("⚠️  NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined – set it in your Environment Variables.")
    return "YOUR_SUPABASE_ANON_KEY" // fallback placeholder
  })()

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const IS_SUPABASE_CONFIGURED =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL!.includes("YOUR-SUPABASE-PROJECT")

// -------- MOCK AUTH HELPERS (preview mode) --------
export const mockUser = {
  // Exported
  id: `mock-${nanoid()}`,
  email: "preview@vnrvjiet.in",
} as unknown as import("@supabase/supabase-js").User

export const mockProfile: AuthUser = {
  // Exported and role changed
  id: mockUser.id,
  email: mockUser.email,
  first_name: "Preview",
  last_name: "User",
  role: "faculty", // <--- IMPORTANT: CHANGE THIS TO "student", "faculty", or "admin" for testing mock roles
  department: "Preview Dept",
}

// Define a mock password for the preview user
const MOCK_PASSWORD = "password" // You can change this to any password for testing

// ---------------------- MOCK USER STORAGE ----------------------
type MockCred = { email: string; password: string; profile: AuthUser }
const STORAGE_KEY = "ideas-central:mock-users"

function getMockUsers(): MockCred[] {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")
  } catch {
    return []
  }
}

function setMockUsers(users: MockCred[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users))
  }
}

// Ensure the default preview account is present once
if (typeof window !== "undefined") {
  const existing = getMockUsers()
  const cleanEmail = mockUser.email.toLowerCase()
  if (!existing.find((u) => u.email === cleanEmail)) {
    existing.push({ email: cleanEmail, password: MOCK_PASSWORD.trim(), profile: mockProfile })
    setMockUsers(existing)
  }
}

export interface AuthUser {
  id: string
  email: string
  first_name: string
  last_name: string
  role: "student" | "faculty" | "admin"
  department?: string
  student_id?: string
}

// Auth service functions
export const authService = {
  // Sign up new user
  signUp: async (userData: {
    email: string
    password: string
    firstName: string
    lastName: string
    role: string
    department?: string
    studentId?: string
  }) => {
    if (!IS_SUPABASE_CONFIGURED) {
      const mockCreds = getMockUsers()
      const cleanEmail = userData.email.trim().toLowerCase()
      const cleanPassword = userData.password.trim()
      if (mockCreds.find((u) => u.email.toLowerCase() === cleanEmail)) {
        throw new Error("User already exists (mock).")
      }
      const newProfile: AuthUser = {
        id: `mock-${nanoid()}`,
        email: userData.email,
        first_name: userData.firstName,
        last_name: userData.lastName,
        role: userData.role as AuthUser["role"],
        department: userData.department,
        student_id: userData.studentId,
      }
      mockCreds.push({ email: cleanEmail, password: cleanPassword, profile: newProfile })
      setMockUsers(mockCreds)
      return { user: mockUser, profile: newProfile }
    }
    try {
      // First, sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
      })

      if (authError) throw authError

      if (authData.user) {
        // Then create user profile in our users table
        const { data: profileData, error: profileError } = await supabase.from("users").insert([
          {
            id: authData.user.id,
            email: userData.email,
            first_name: userData.firstName,
            last_name: userData.lastName,
            role: userData.role,
            department: userData.department,
            student_id: userData.studentId,
          },
        ])

        if (profileError) throw profileError

        return { user: authData.user, profile: profileData }
      }
    } catch (error) {
      console.error("Sign up error:", error)
      throw error
    }
  },

  // Sign in user
  signIn: async (email: string, password: string) => {
    if (!IS_SUPABASE_CONFIGURED) {
      const cleanEmail = email.trim().toLowerCase()
      const cleanPassword = password.trim()
      const account = getMockUsers().find((u) => u.email === cleanEmail)
      if (!account || account.password !== cleanPassword) {
        throw new Error("Invalid mock email or password.")
      }
      return { user: mockUser, profile: account.profile }
    }
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Get user profile
      if (data.user) {
        const { data: profile, error: profileError } = await supabase
          .from("users")
          .select("*")
          .eq("id", data.user.id)
          .single()

        if (profileError) throw profileError

        return { user: data.user, profile }
      }
    } catch (error) {
      console.error("Sign in error:", error)
      throw error
    }
  },

  // Sign out user
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  // Get current user
  getCurrentUser: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const { data: profile, error } = await supabase.from("users").select("*").eq("id", user.id).single()

      if (error) throw error

      return { user, profile }
    }

    return null
  },

  // Get current session
  getSession: async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    return session
  },

  // Reset password for email
  resetPassword: async (email: string, redirectTo: string) => {
    if (!IS_SUPABASE_CONFIGURED) {
      const cleanEmail = email.trim().toLowerCase()
      const account = getMockUsers().find((u) => u.email === cleanEmail)
      if (!account) {
        // Simulate success even if email doesn't exist to prevent enumeration attacks
        console.log(`Mock: Password reset link simulated for ${email}.`)
        console.log(`Mock Reset URL (for testing): ${redirectTo}?token=mock_reset_token&type=recovery`)
        return
      }
      console.log(`Mock: Password reset link simulated for ${email}.`)
      console.log(`Mock Reset URL (for testing): ${redirectTo}?token=mock_reset_token&type=recovery`)
      return
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    })
    if (error) {
      throw new Error(error.message)
    }
  },

  // Update user password
  updateUserPassword: async (password: string) => {
    if (!IS_SUPABASE_CONFIGURED) {
      // In mock mode, we can't actually update the password without a session.
      // This would typically be handled by the update-password page.
      console.warn("Mock: Password update not fully functional without a real Supabase session.")
      return
    }
    const { data, error } = await supabase.auth.updateUser({ password })
    if (error) {
      throw new Error(error.message)
    }
    return data.user
  },
}
