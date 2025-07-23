import { supabase } from "@/lib/auth"
import { IS_SUPABASE_CONFIGURED } from "@/lib/auth"
import { mockProblems, mockIdeas, mockEvaluations } from "@/lib/mock-data"
import { sendEmail } from "@/app/actions/send-email" // Import the new sendEmail action

// Add mentor contact email
const mentorContactEmail = process.env.NEXT_PUBLIC_MENTOR_CONTACT_EMAIL || "mentorship@example.com"

// Database Types (omitted for brevity, as they are unchanged)
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
  problem_title?: string
  title: string
  description: string
  solution: string
  implementation?: string
  resources?: string
  timeline?: string
  submitted_by: string
  submitted_by_name: string
  submitted_by_email?: string // Add submitted_by_email to Idea interface
  status: "pending" | "under-review" | "approved" | "rejected"
  score?: number
  created_at: string
  updated_at: string
}

export interface Evaluation {
  id: string
  idea_id: string
  idea_title?: string
  idea_description?: string
  submitted_by_name?: string
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

// --- Problem Service ---
const getAllProblems = async (filters?: {
  category?: string
  priority?: string
  search?: string
  submittedBy?: string
}) => {
  console.log("problemService.getAll called with filters:", filters)
  if (!IS_SUPABASE_CONFIGURED) {
    let filtered = mockProblems
    if (filters?.category && filters.category !== "all") {
      filtered = filtered.filter((p) => p.category === filters.category)
    }
    if (filters?.priority && filters.priority !== "all") {
      filtered = filtered.filter((p) => p.priority === filters.priority)
    }
    if (filters?.search) {
      const lowerSearch = filters.search.toLowerCase()
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(lowerSearch) ||
          p.description.toLowerCase().includes(lowerSearch) ||
          p.tags.some((tag) => tag.toLowerCase().includes(lowerSearch)),
      )
    }
    // The 'submittedBy' filter is only applied if explicitly provided.
    // For the /problems page, it's not provided, so all problems are returned.
    if (filters?.submittedBy) {
      filtered = filtered.filter((p) => p.submitted_by === filters.submittedBy)
    }
    const sorted = filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    console.log("Mock problems returned:", sorted.length)
    return sorted
  }

  try {
    let query = supabase.from("problems").select("*").order("created_at", { ascending: false })

    if (filters?.category && filters.category !== "all") {
      query = query.eq("category", filters.category)
    }

    if (filters?.priority && filters.priority !== "all") {
      query = query.eq("priority", filters.priority)
    }

    if (filters?.search) {
      query = query.ilike("title", `%${filters.search}%`)
    }

    if (filters?.submittedBy) {
      query = query.eq("submitted_by", filters.submittedBy)
    }

    const { data, error } = await query

    console.log("Supabase problems returned:", data.length)

    if (error) throw error
    return data as Problem[]
  } catch (err) {
    console.error("Error fetching problems:", err)
    return []
  }
}

const getProblemById = async (id: string) => {
  if (!IS_SUPABASE_CONFIGURED) {
    return mockProblems.find((p) => p.id === id) || null
  }
  try {
    const { data, error } = await supabase.from("problems").select("*").eq("id", id).single()
    if (error) throw error
    return data as Problem
  } catch (err) {
    console.error(`Error fetching problem ${id}:`, err)
    return null
  }
}

const getProblemStats = async () => {
  if (!IS_SUPABASE_CONFIGURED) {
    const total = mockProblems.length
    const open = mockProblems.filter((p) => p.status === "open").length
    const urgent = mockProblems.filter((p) => p.priority === "urgent").length
    const inProgress = mockProblems.filter((p) => p.status === "in-progress").length
    return { total, open, urgent, inProgress }
  }
  try {
    const {
      data: total,
      error: totalError,
      count: totalCount,
    } = await supabase.from("problems").select("*", { count: "exact", head: true })

    const {
      data: open,
      error: openError,
      count: openCount,
    } = await supabase.from("problems").select("*", { count: "exact", head: true }).eq("status", "open")

    const {
      data: urgent,
      error: urgentError,
      count: urgentCount,
    } = await supabase.from("problems").select("*", { count: "exact", head: true }).eq("priority", "urgent")

    const {
      data: inProgress,
      error: inProgressError,
      count: inProgressCount,
    } = await supabase.from("problems").select("*", { count: "exact", head: true }).eq("status", "in-progress")

    if (totalError || openError || urgentError || inProgressError) {
      console.error("Error fetching problem stats:", totalError, openError, urgentError, inProgressError)
      return { total: 0, open: 0, urgent: 0, inProgress: 0 }
    }

    return {
      total: totalCount || 0,
      open: openCount || 0,
      urgent: urgentCount || 0,
      inProgress: inProgressCount || 0,
    }
  } catch (err) {
    console.error("Error fetching problem stats:", err)
    return { total: 0, open: 0, urgent: 0, inProgress: 0 }
  }
}

const createProblem = async (
  problem: Omit<Problem, "id" | "created_at" | "updated_at" | "views_count" | "ideas_count" | "comments_count">,
) => {
  if (!IS_SUPABASE_CONFIGURED) {
    const newMockProblem: Problem = {
      ...problem,
      id: `mock-problem-${mockProblems.length + 1}`,
      views_count: 0,
      ideas_count: 0,
      comments_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    mockProblems.push(newMockProblem)
    return newMockProblem
  }
  const { data, error } = await supabase.from("problems").insert([problem]).select().single()

  if (error) {
    throw new Error(`Could not create problem: ${error.message}`)
  }

  return data as Problem
}

export const problemService = {
  getAll: getAllProblems,
  getById: getProblemById,
  getStats: getProblemStats,
  create: createProblem,
}

// --- Idea Service ---
const getAllIdeas = async (filters?: { problemId?: string; status?: string; submittedBy?: string }) => {
  if (!IS_SUPABASE_CONFIGURED) {
    let filtered = mockIdeas

    if (filters?.problemId) {
      filtered = filtered.filter((idea) => idea.problem_id === filters.problemId)
    }

    if (filters?.status) {
      filtered = filtered.filter((idea) => idea.status === filters.status)
    }

    if (filters?.submittedBy) {
      filtered = filtered.filter((idea) => idea.submitted_by === filters.submittedBy)
    }

    console.log(`Returning ${filtered.length} mock ideas with filters:`, filters)

    return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  try {
    // Select user email along with idea details
    let query = supabase
      .from("ideas")
      .select("*, users(email)") // Select email from the users table
      .order("created_at", { ascending: false })

    if (filters?.problemId) {
      query = query.eq("problem_id", filters.problemId)
    }

    if (filters?.status) {
      query = query.eq("status", filters.status)
    }

    if (filters?.submittedBy) {
      query = query.eq("submitted_by", filters.submittedBy)
    }

    const { data, error } = await query

    if (error) throw error
    console.log(`Returning ${data.length} ideas from Supabase with filters:`, filters)

    // Map the data to include submitted_by_email
    return data.map((item: any) => ({
      ...item,
      submitted_by_email: item.users?.email,
    })) as Idea[]
  } catch (err) {
    console.error("Error fetching ideas:", err)
    return []
  }
}

const getIdeaById = async (id: string) => {
  if (!IS_SUPABASE_CONFIGURED) {
    return mockIdeas.find((idea) => idea.id === id) || null
  }
  try {
    const { data, error } = await supabase.from("ideas").select("*, users(email)").eq("id", id).single()
    if (error) throw error
    return { ...data, submitted_by_email: data.users?.email } as Idea
  } catch (err) {
    console.error(`Error fetching idea ${id}:`, err)
    return null
  }
}

const createIdea = async (
  idea: Omit<Idea, "id" | "created_at" | "updated_at" | "status" | "score" | "problem_title" | "submitted_by_email">,
) => {
  if (!IS_SUPABASE_CONFIGURED) {
    const newMockIdea: Idea = {
      ...idea,
      id: `mock-idea-${mockIdeas.length + 1}`,
      status: "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    mockIdeas.push(newMockIdea)
    return newMockIdea
  }
  const { data, error } = await supabase
    .from("ideas")
    .insert([{ ...idea, status: "pending" }])
    .select()
    .single()
  if (error) {
    throw new Error(`Could not create idea: ${error.message}`)
  }
  return data as Idea
}

const updateIdeaStatusAndScore = async (id: string, status: Idea["status"], score?: number) => {
  if (!IS_SUPABASE_CONFIGURED) {
    const ideaIndex = mockIdeas.findIndex((i) => i.id === id)
    if (ideaIndex !== -1) {
      mockIdeas[ideaIndex].status = status
      mockIdeas[ideaIndex].score = score
      mockIdeas[ideaIndex].updated_at = new Date().toISOString()

      // Simulate email sending for mock data
      const idea = mockIdeas[ideaIndex]
      const subject = `Your Idea "${idea.title}" has been ${status}!`
      const body = `Dear ${idea.submitted_by_name},<br><br>Your idea "${idea.title}" for problem "${idea.problem_id}" has been reviewed and its status is now: <strong>${status.toUpperCase()}</strong>.<br><br>Overall Score: ${score?.toFixed(1) || "N/A"}<br><br>Thank you for your contribution!`
      console.log(`MOCK EMAIL SENT to ${idea.submitted_by_email || "submitter"} - Subject: ${subject} - Body: ${body}`)

      return mockIdeas[ideaIndex]
    }
    return null
  }
  const { data, error } = await supabase
    .from("ideas")
    .update({ status, score })
    .eq("id", id)
    .select("*, users(email)")
    .single()
  if (error) {
    throw new Error(`Could not update idea ${id}: ${error.message}`)
  }

  // Send email notification
  if (data && data.users?.email) {
    const idea = data as Idea & { users: { email: string } }
    const subject = `Your Idea "${idea.title}" has been ${status}!`
    const body = `Dear ${idea.submitted_by_name},<br><br>Your idea "${idea.title}" for problem "${idea.problem_id}" has been reviewed and its status is now: <strong>${status.toUpperCase()}</strong>.<br><br>Overall Score: ${score?.toFixed(1) || "N/A"}<br><br>Congratulations! Your idea has been approved. You can now approach a mentor for guidance on the next steps. Please contact our mentorship program at <a href="mailto:${mentorContactEmail}">${mentorContactEmail}</a>.<br><br>You can view more details on the platform.<br><br>Thank you for your contribution!`

    await sendEmail({
      to: idea.users.email,
      subject,
      html: body,
    })
  }

  return data as Idea
}

export const ideaService = {
  getAll: getAllIdeas,
  getById: getIdeaById,
  create: createIdea,
  updateStatusAndScore: updateIdeaStatusAndScore,
}

// --- Evaluation Service ---
const getAllEvaluations = async (filters?: { ideaId?: string; evaluatorId?: string }) => {
  if (!IS_SUPABASE_CONFIGURED) {
    let filtered = mockEvaluations
    if (filters?.ideaId) {
      filtered = filtered.filter((evalu) => evalu.idea_id === filters.ideaId)
    }
    if (filters?.evaluatorId) {
      filtered = filtered.filter((evalu) => evalu.evaluator_id === filters.evaluatorId)
    }
    return filtered
      .map((evalu) => ({
        ...evalu,
        idea_title: mockIdeas.find((i) => i.id === evalu.idea_id)?.title || "Unknown Idea",
        idea_description: mockIdeas.find((i) => i.id === evalu.idea_id)?.description || "",
        submitted_by_name: mockIdeas.find((i) => i.id === evalu.idea_id)?.submitted_by_name || "Unknown Submitter",
      }))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }
  try {
    let query = supabase
      .from("evaluations")
      .select("*, ideas(title, description, submitted_by_name), users(first_name, last_name)")
      .order("created_at", { ascending: false })

    if (filters?.ideaId) {
      query = query.eq("idea_id", filters.ideaId)
    }
    if (filters?.evaluatorId) {
      query = query.eq("evaluator_id", filters.evaluatorId)
    }
    const { data, error } = await query
    if (error) throw error

    return data.map((item: any) => ({
      ...item,
      idea_title: item.ideas?.title,
      idea_description: item.ideas?.description,
      submitted_by_name: item.ideas?.submitted_by_name,
      evaluator_name: `${item.users?.first_name} ${item.users?.last_name}`,
    })) as (Evaluation & { idea_title: string; idea_description: string; submitted_by_name: string })[]
  } catch (err) {
    console.error("Error fetching evaluations:", err)
    return []
  }
}

const createEvaluation = async (evaluation: Omit<Evaluation, "id" | "created_at" | "updated_at">) => {
  if (!IS_SUPABASE_CONFIGURED) {
    const newMockEvaluation: Evaluation = {
      ...evaluation,
      id: `mock-evaluation-${mockEvaluations.length + 1}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    mockEvaluations.push(newMockEvaluation)
    return newMockEvaluation
  }
  const { data, error } = await supabase.from("evaluations").insert([evaluation]).select().single()

  if (error) {
    throw new Error(`Could not create evaluation: ${error.message}`)
  }

  return data as Evaluation
}

export const evaluationService = {
  getAll: getAllEvaluations,
  create: createEvaluation,
}
