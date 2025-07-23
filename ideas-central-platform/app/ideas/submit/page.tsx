"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation" // Import useSearchParams
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Lightbulb, Search, Loader2 } from "lucide-react"
import { problemService, ideaService, type Problem } from "@/lib/database" // Import problemService and ideaService
import { useAuth } from "@/components/auth-provider" // Import useAuth

export default function SubmitIdeaPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, profile, loading: authLoading } = useAuth() // Get user and profile from auth context

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    problemId: searchParams.get("problemId") || "", // Pre-fill from URL param
    title: "",
    description: "",
    solution: "",
    implementation: "",
    resources: "",
    timeline: "",
  })

  const [searchTerm, setSearchTerm] = useState("")
  const [problems, setProblems] = useState<Problem[]>([])
  const [problemsLoading, setProblemsLoading] = useState(true)

  const selectedProblem = problems.find((p) => p.id === formData.problemId)

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login")
    }
  }, [user, authLoading, router])

  // Fetch problems for selection
  useEffect(() => {
    const fetchProblems = async () => {
      setProblemsLoading(true)
      try {
        const fetchedProblems = await problemService.getAll({ category: "all", priority: "all", search: "" })
        setProblems(fetchedProblems)
        console.log("Fetched problems for idea submission:", fetchedProblems.length, fetchedProblems)
      } catch (error) {
        console.error("Failed to fetch problems for idea submission:", error)
      } finally {
        setProblemsLoading(false)
      }
    }
    if (user) {
      fetchProblems()
    }
  }, [user])

  const filteredProblems = problems.filter(
    (problem) =>
      problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      problem.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    if (!user || !profile) {
      alert("You must be logged in to submit an idea.")
      setIsSubmitting(false)
      return
    }

    try {
      const ideaData = {
        problem_id: formData.problemId,
        title: formData.title,
        description: formData.description,
        solution: formData.solution,
        implementation: formData.implementation || null,
        resources: formData.resources || null,
        timeline: formData.timeline || null,
        submitted_by: user.id,
        submitted_by_name: `${profile.first_name} ${profile.last_name}`,
      }

      const newIdea = await ideaService.create(ideaData)

      // Redirect to the problem detail page or a success page
      router.push(`/problems/${newIdea.problem_id}`)
      alert("Idea submitted successfully!")
    } catch (error) {
      console.error("Failed to submit idea:", error)
      alert("Failed to submit idea. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading idea submission...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lightbulb className="h-6 w-6 mr-2 text-green-600" />
                Submit New Idea
              </CardTitle>
              <CardDescription>
                Propose an innovative solution to an existing problem. Your idea will be reviewed and evaluated by
                faculty members.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="problem-search">Select Problem to Solve *</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="problem-search"
                      placeholder="Search for a problem..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      disabled={isSubmitting || problemsLoading}
                    />
                  </div>

                  {problemsLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                      <span className="ml-2 text-gray-600">Loading problems...</span>
                    </div>
                  ) : searchTerm && filteredProblems.length > 0 ? (
                    <div className="border rounded-lg max-h-48 overflow-y-auto">
                      {filteredProblems.map((problem) => (
                        <div
                          key={problem.id}
                          className={`p-3 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 ${
                            formData.problemId === problem.id ? "bg-blue-50 border-blue-200" : ""
                          }`}
                          onClick={() => {
                            setFormData({ ...formData, problemId: problem.id })
                            setSearchTerm("")
                          }}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium">{problem.title}</h4>
                              <p className="text-sm text-gray-600 mt-1">{problem.description}</p>
                            </div>
                            <Badge variant="outline">{problem.category}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : searchTerm && filteredProblems.length === 0 ? (
                    <div className="text-center text-gray-500 py-4">No problems found matching your search.</div>
                  ) : null}

                  {selectedProblem && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <h4 className="font-medium text-green-900">Selected Problem:</h4>
                      <p className="text-green-800 mt-1">{selectedProblem.title}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Idea Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter a clear, compelling title for your idea"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    disabled={isSubmitting}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Idea Overview *</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide a brief overview of your innovative solution..."
                    className="min-h-[100px]"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    disabled={isSubmitting}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="solution">Detailed Solution *</Label>
                  <Textarea
                    id="solution"
                    placeholder="Explain your solution in detail. How does it address the problem? What makes it innovative?"
                    className="min-h-[120px]"
                    value={formData.solution}
                    onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
                    disabled={isSubmitting}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="implementation">Implementation Plan</Label>
                  <Textarea
                    id="implementation"
                    placeholder="Describe how your idea can be implemented. Include steps, methodology, or technical approach..."
                    className="min-h-[100px]"
                    value={formData.implementation}
                    onChange={(e) => setFormData({ ...formData, implementation: e.target.value })}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="resources">Required Resources</Label>
                    <Textarea
                      id="resources"
                      placeholder="List the resources needed (budget, tools, team, etc.)"
                      className="min-h-[80px]"
                      value={formData.resources}
                      onChange={(e) => setFormData({ ...formData, resources: e.target.value })}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timeline">Estimated Timeline</Label>
                    <Textarea
                      id="timeline"
                      placeholder="Provide an estimated timeline for implementation"
                      className="min-h-[80px]"
                      value={formData.timeline}
                      onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-2">Evaluation Process</h4>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• Your idea will be reviewed by faculty members</li>
                    <li>• Ideas are scored based on innovation, feasibility, and impact</li>
                    <li>• You'll receive feedback and evaluation results via email</li>
                    <li>• Approved ideas may be selected for implementation</li>
                  </ul>
                </div>

                <div className="flex space-x-4">
                  <Button type="submit" className="flex-1" disabled={!formData.problemId || isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Lightbulb className="h-4 w-4 mr-2" />
                        Submit Idea
                      </>
                    )}
                  </Button>
                  <Button type="button" variant="outline" disabled={isSubmitting}>
                    Save as Draft
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
