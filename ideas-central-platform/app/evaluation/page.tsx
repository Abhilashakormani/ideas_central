"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { CheckCircle, XCircle, Clock, User, Calendar, TrendingUp, Loader2 } from "lucide-react"
import { ideaService, evaluationService, type Idea, type Evaluation } from "@/lib/database" // Import services and types
import { useAuth } from "@/components/auth-provider" // Import useAuth

export default function EvaluationPage() {
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth() // Get user and profile from auth context

  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null)
  const [evaluation, setEvaluation] = useState({
    innovation: [7],
    feasibility: [6],
    impact: [8],
    comments: "",
  })
  const [ideasForReview, setIdeasForReview] = useState<Idea[]>([])
  const [evaluatedEvaluations, setEvaluatedEvaluations] = useState<Evaluation[]>([]) // Changed to store Evaluation objects
  const [loadingIdeas, setLoadingIdeas] = useState(true)
  const [isSubmittingEvaluation, setIsSubmittingEvaluation] = useState(false)
  const [evaluatedIdeas, setEvaluatedIdeas] = useState<Idea[]>([])

  // Redirect if not authenticated or not a faculty/admin
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login")
    } else if (!authLoading && user && profile?.role !== "faculty" && profile?.role !== "admin") {
      console.log("User role:", profile?.role)
      alert("You don't have permission to access the evaluation page. Faculty or admin role required.")
      router.push("/dashboard")
    }
  }, [user, profile, authLoading, router])

  // Fetch ideas for review and evaluated ideas
  useEffect(() => {
    const fetchIdeas = async () => {
      setLoadingIdeas(true)
      try {
        // Get all ideas regardless of status
        const allIdeas = await ideaService.getAll()

        // Filter for pending and under-review ideas
        const pending = allIdeas.filter((idea) => idea.status === "pending" || idea.status === "under-review")

        // Filter for already evaluated ideas
        const evaluated = allIdeas.filter((idea) => idea.status === "approved" || idea.status === "rejected")

        const allEvaluations = await evaluationService.getAll()
        setEvaluatedEvaluations(allEvaluations)

        console.log("Pending ideas found:", pending.length)
        console.log("Evaluated ideas found:", evaluated.length)

        setIdeasForReview(pending)
        setEvaluatedIdeas(evaluated)
      } catch (error) {
        console.error("Failed to fetch ideas for evaluation:", error)
      } finally {
        setLoadingIdeas(false)
      }
    }
    if (user && (profile?.role === "faculty" || profile?.role === "admin")) {
      fetchIdeas()
    }
  }, [user, profile])

  const handleEvaluate = async (approved: boolean) => {
    if (!selectedIdea || !user || !profile) return

    setIsSubmittingEvaluation(true)
    try {
      const overallScore = (evaluation.innovation[0] + evaluation.feasibility[0] + evaluation.impact[0]) / 3

      // Create evaluation record
      await evaluationService.create({
        idea_id: selectedIdea.id,
        evaluator_id: user.id,
        evaluator_name: `${profile.first_name} ${profile.last_name}`,
        innovation_score: evaluation.innovation[0],
        feasibility_score: evaluation.feasibility[0],
        impact_score: evaluation.impact[0],
        comments: evaluation.comments || null,
        status: approved ? "approved" : "rejected",
      })

      // Update idea status and score
      await ideaService.updateStatusAndScore(
        selectedIdea.id,
        approved ? "approved" : "rejected",
        Number.parseFloat(overallScore.toFixed(1)),
      )

      // Refresh ideas list
      const allIdeas = await ideaService.getAll()
      const pending = allIdeas.filter((idea) => idea.status === "pending" || idea.status === "under-review")
      setIdeasForReview(pending)

      const allEvaluations = await evaluationService.getAll()
      setEvaluatedEvaluations(allEvaluations)

      setSelectedIdea(null)
      setEvaluation({
        innovation: [7],
        feasibility: [6],
        impact: [8],
        comments: "",
      })
      alert("Idea evaluated successfully!")
    } catch (error) {
      console.error("Failed to evaluate idea:", error)
      alert("Failed to evaluate idea. Please try again.")
    } finally {
      setIsSubmittingEvaluation(false)
    }
  }

  if (authLoading || !user || (profile?.role !== "faculty" && profile?.role !== "admin")) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading evaluation center...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Idea Evaluation Center</h1>
          <p className="text-gray-600">Review and evaluate submitted ideas from the community</p>
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending">Pending Review ({ideasForReview.length})</TabsTrigger>
            <TabsTrigger value="evaluated">Evaluated ({evaluatedEvaluations.length})</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Ideas List */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Ideas Awaiting Review</h3>
                {loadingIdeas ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <span className="ml-2 text-gray-600">Loading ideas...</span>
                  </div>
                ) : ideasForReview.length > 0 ? (
                  ideasForReview.map((idea) => (
                    <Card
                      key={idea.id}
                      className={`cursor-pointer transition-colors ${
                        selectedIdea?.id === idea.id ? "ring-2 ring-blue-500" : "hover:bg-gray-50"
                      }`}
                      onClick={() => setSelectedIdea(idea)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg">{idea.title}</CardTitle>
                          <Badge variant="outline">{idea.status}</Badge>
                        </div>
                        <CardDescription className="text-sm">Solution for: {idea.problem_title}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 mb-3">{idea.description}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center">
                            <User className="h-3 w-3 mr-1" />
                            {idea.submitted_by_name}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(idea.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No ideas awaiting review</h3>
                      <p className="text-gray-600">All pending ideas have been evaluated.</p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Evaluation Panel */}
              <div>
                {selectedIdea ? (
                  <Card>
                    {selectedIdea && (
                      <>
                        <CardContent className="border-b pb-4">
                          <div className="space-y-4">
                            <div>
                              <h3 className="text-lg font-semibold">{selectedIdea.title}</h3>
                              <p className="text-gray-600">{selectedIdea.description}</p>
                            </div>

                            <div>
                              <h4 className="font-medium text-gray-800">Detailed Solution:</h4>
                              <p className="text-gray-600 mt-1">{selectedIdea.solution}</p>
                            </div>

                            {selectedIdea.implementation && (
                              <div>
                                <h4 className="font-medium text-gray-800">Implementation Plan:</h4>
                                <p className="text-gray-600 mt-1">{selectedIdea.implementation}</p>
                              </div>
                            )}

                            <div className="grid md:grid-cols-2 gap-4">
                              {selectedIdea.resources && (
                                <div>
                                  <h4 className="font-medium text-gray-800">Required Resources:</h4>
                                  <p className="text-gray-600 mt-1">{selectedIdea.resources}</p>
                                </div>
                              )}

                              {selectedIdea.timeline && (
                                <div>
                                  <h4 className="font-medium text-gray-800">Timeline:</h4>
                                  <p className="text-gray-600 mt-1">{selectedIdea.timeline}</p>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center justify-between text-sm text-gray-500 pt-2">
                              <div className="flex items-center">
                                <User className="h-4 w-4 mr-2" />
                                Submitted by: {selectedIdea.submitted_by_name}
                              </div>
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-2" />
                                {new Date(selectedIdea.created_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                        <CardHeader className="pt-4">
                          <CardTitle>Evaluate This Idea</CardTitle>
                          <CardDescription>Provide scores and feedback for the selected idea</CardDescription>
                        </CardHeader>
                      </>
                    )}
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium">Innovation Score</Label>
                          <div className="mt-2">
                            <Slider
                              value={evaluation.innovation}
                              onValueChange={(value) => setEvaluation({ ...evaluation, innovation: value })}
                              max={10}
                              min={1}
                              step={1}
                              className="w-full"
                              disabled={isSubmittingEvaluation}
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                              <span>1 (Low)</span>
                              <span className="font-medium">{evaluation.innovation[0]}/10</span>
                              <span>10 (High)</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm font-medium">Feasibility Score</Label>
                          <div className="mt-2">
                            <Slider
                              value={evaluation.feasibility}
                              onValueChange={(value) => setEvaluation({ ...evaluation, feasibility: value })}
                              max={10}
                              min={1}
                              step={1}
                              className="w-full"
                              disabled={isSubmittingEvaluation}
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                              <span>1 (Low)</span>
                              <span className="font-medium">{evaluation.feasibility[0]}/10</span>
                              <span>10 (High)</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm font-medium">Impact Score</Label>
                          <div className="mt-2">
                            <Slider
                              value={evaluation.impact}
                              onValueChange={(value) => setEvaluation({ ...evaluation, impact: value })}
                              max={10}
                              min={1}
                              step={1}
                              className="w-full"
                              disabled={isSubmittingEvaluation}
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                              <span>1 (Low)</span>
                              <span className="font-medium">{evaluation.impact[0]}/10</span>
                              <span>10 (High)</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="text-sm font-medium mb-1">Overall Score</div>
                          <div className="text-2xl font-bold text-blue-600">
                            {(
                              (evaluation.innovation[0] + evaluation.feasibility[0] + evaluation.impact[0]) /
                              3
                            ).toFixed(1)}
                            /10
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="comments">Evaluation Comments</Label>
                        <Textarea
                          id="comments"
                          placeholder="Provide detailed feedback about the idea..."
                          value={evaluation.comments}
                          onChange={(e) => setEvaluation({ ...evaluation, comments: e.target.value })}
                          className="min-h-[100px]"
                          disabled={isSubmittingEvaluation}
                        />
                      </div>

                      <div className="flex space-x-3">
                        <Button
                          onClick={() => handleEvaluate(true)}
                          className="flex-1"
                          disabled={isSubmittingEvaluation}
                        >
                          {isSubmittingEvaluation ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <CheckCircle className="h-4 w-4 mr-2" />
                          )}
                          {isSubmittingEvaluation ? "Approving..." : "Approve"}
                        </Button>
                        <Button
                          onClick={() => handleEvaluate(false)}
                          variant="destructive"
                          className="flex-1"
                          disabled={isSubmittingEvaluation}
                        >
                          {isSubmittingEvaluation ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <XCircle className="h-4 w-4 mr-2" />
                          )}
                          {isSubmittingEvaluation ? "Rejecting..." : "Reject"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Select an Idea to Evaluate</h3>
                        <p className="text-gray-600">Choose an idea from the list to begin the evaluation process</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="evaluated" className="space-y-4">
            <h3 className="text-lg font-semibold">Previously Evaluated Ideas</h3>
            {loadingIdeas ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Loading evaluated ideas...</span>
              </div>
            ) : evaluatedEvaluations.length > 0 ? (
              evaluatedEvaluations.map((evaluationItem) => (
                <Card key={evaluationItem.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{evaluationItem.idea_title}</CardTitle>
                        <CardDescription>{evaluationItem.idea_description}</CardDescription>
                      </div>
                      <Badge variant={evaluationItem.status === "approved" ? "default" : "destructive"}>
                        {evaluationItem.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-600 mb-2">Evaluation Scores</div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Innovation:</span>
                            <span className="font-medium">{evaluationItem.innovation_score}/10</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Feasibility:</span>
                            <span className="font-medium">{evaluationItem.feasibility_score}/10</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Impact:</span>
                            <span className="font-medium">{evaluationItem.impact_score}/10</span>
                          </div>
                          <div className="flex justify-between text-sm font-semibold border-t pt-1">
                            <span>Overall:</span>
                            <span className="text-blue-600">{evaluationItem.overall_score}/10</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        <div>Submitted by: {evaluationItem.submitted_by_name}</div>
                        <div>Evaluated by: {evaluationItem.evaluator_name}</div>
                        <div>Date: {new Date(evaluationItem.created_at).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No ideas have been evaluated yet</h3>
                  <p className="text-gray-600">Start evaluating ideas in the "Pending Review" tab.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Evaluation Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="text-2xl font-bold">{evaluatedEvaluations.length}</div>
                      <div className="text-sm text-gray-600">Total Evaluations</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {evaluatedEvaluations.filter((i) => i.status === "approved").length}
                      </div>
                      <div className="text-sm text-gray-600">Approved Ideas</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">
                        {evaluatedEvaluations.filter((i) => i.status === "rejected").length}
                      </div>
                      <div className="text-sm text-gray-600">Rejected Ideas</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Average Scores</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* These will need to be calculated from actual evaluation data */}
                    <div className="flex justify-between">
                      <span className="text-sm">Innovation</span>
                      <span className="font-medium">
                        {(
                          evaluatedEvaluations.reduce((sum, e) => sum + e.innovation_score, 0) /
                          (evaluatedEvaluations.length || 1)
                        ).toFixed(1)}
                        /10
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Feasibility</span>
                      <span className="font-medium">
                        {(
                          evaluatedEvaluations.reduce((sum, e) => sum + e.feasibility_score, 0) /
                          (evaluatedEvaluations.length || 1)
                        ).toFixed(1)}
                        /10
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Impact</span>
                      <span className="font-medium">
                        {(
                          evaluatedEvaluations.reduce((sum, e) => sum + e.impact_score, 0) /
                          (evaluatedEvaluations.length || 1)
                        ).toFixed(1)}
                        /10
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-sm font-medium">Overall</span>
                      <span className="font-bold text-blue-600">
                        {(
                          evaluatedEvaluations.reduce((sum, e) => sum + e.overall_score, 0) /
                          (evaluatedEvaluations.length || 1)
                        ).toFixed(1)}
                        /10
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* This will need to be calculated from actual idea categories */}
                    <div className="flex justify-between">
                      <span className="text-sm">Technology</span>
                      <Badge variant="secondary">N/A</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Environment</span>
                      <Badge variant="secondary">N/A</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Education</span>
                      <Badge variant="secondary">N/A</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
