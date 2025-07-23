import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Types
export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  role: "student" | "faculty" | "admin"
  department?: string
  student_id?: string
  created_at: string
  updated_at: string
}

export interface Problem {
  id: string
  title: string
  description: string
  full_description?: string
  category: string
  priority: "low" | "medium" | "high" | "urgent"
  status: "open" | "in-progress" | "solved" | "closed"
  tags: string[]
  submitted_by: string
  submitted_by_name: string
  department?: string
  views_count: number
  ideas_count: number
  comments_count: number
  created_at: string
  updated_at: string
}

export interface Idea {
  id: string
  problem_id: string
  title: string
  description: string
  solution: string
  implementation?: string
  resources?: string
  timeline?: string
  submitted_by: string
  submitted_by_name: string
  status: "pending" | "under-review" | "approved" | "rejected"
  score?: number
  created_at: string
  updated_at: string
}

export interface Evaluation {
  id: string
  idea_id: string
  evaluator_id: string
  evaluator_name: string
  innovation_score: number
  feasibility_score: number
  impact_score: number
  overall_score: number
  comments?: string
  status: "approved" | "rejected"
  created_at: string
  updated_at: string
}

export interface Comment {
  id: string
  problem_id?: string
  idea_id?: string
  user_id: string
  user_name: string
  content: string
  created_at: string
  updated_at: string
}
