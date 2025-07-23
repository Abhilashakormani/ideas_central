"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, User, Calendar, Tag, Eye, Lightbulb, TrendingUp, MessageSquare, Share2, Bookmark, Loader2, AlertCircle } from 'lucide-react'
import { problemService, ideaService, type Problem, type Idea } from "@/lib/database" // Import ideaService and types

interface PageProps {
  params: {
    id: string
  }
}

export default function ProblemDetailPage({ params }: PageProps) {
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [problem, setProblem] = useState<Problem | null>(null)
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [loadingProblem, setLoadingProblem] = useState(true)
  const [loadingIdeas, setLoadingIdeas] = useState(true)

  useEffect(() => {
    const fetchProblemAndIdeas = async () => {
      setLoadingProblem(true)
      setLoadingIdeas(true)
      try {
        const fetchedProblem = await problemService.getById(params.id)
        setProblem(fetchedProblem)

        if (fetchedProblem) {
          const fetchedIdeas = await ideaService.getAll({ problemId: fetchedProblem.id })
          setIdeas(fetchedIdeas)
        }
      } catch (error) {
        console.error("Failed to fetch problem or ideas:", error)
      } finally {
        setLoadingProblem(false)
        setLoadingIdeas(false)
      }
    }

    fetchProblemAndIdeas()
  }, [params.id])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "in-progress":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "solved":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  if (loadingProblem) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading problem details...</p>
        </div>
      </div>
    )
  }

  if (!problem) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Problem Not Found</h2>
          <p className="text-gray-600 mb-4">The problem you are looking for does not exist or has been removed.</p>
          <Link href="/problems">
            <Button>Back to Problems</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/problems">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Problems
            </Button>
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Problem Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex space-x-2">
                    <Badge className={getPriorityColor(problem.priority)}>{problem.priority.toUpperCase()}</Badge>
                    <Badge className={getStatusColor(problem.status)}>
                      {problem.status.replace("-", " ").toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setIsBookmarked(!isBookmarked)}>
                      <Bookmark className={`h-4 w-4 mr-2 ${isBookmarked ? "fill-current" : ""}`} />
                      {isBookmarked ? "Saved" : "Save"}
                    </Button>
                  </div>
                </div>

                <CardTitle className="text-2xl mb-2">{problem.title}</CardTitle>
                <CardDescription className="text-base">{problem.description}</CardDescription>

                <div className="flex flex-wrap gap-2 mt-4">
                  {problem.tags?.map((tag) => (
                    <Badge key={tag} variant="outline">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardHeader>
            </Card>

            {/* Problem Details */}
            <Tabs defaultValue="description" className="space-y-4">
              <TabsList>
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="ideas">Ideas ({ideas.length})</TabsTrigger>
                <TabsTrigger value="discussion">Discussion ({problem.comments_count})</TabsTrigger>
              </TabsList>

              <TabsContent value="description">
                <Card>
                  <CardHeader>
                    <CardTitle>Problem Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none">
                      {problem.full_description?.split("\n\n").map((paragraph, index) => (
                        <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="ideas">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Proposed Solutions</h3>
                    <Link href={`/ideas/submit?problemId=${problem.id}`}>
                      <Button>
                        <Lightbulb className="h-4 w-4 mr-2" />
                        Propose Solution
                      </Button>
                    </Link>
                  </div>

                  {loadingIdeas ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                      <span className="ml-2 text-gray-600">Loading ideas...</span>
                    </div>
                  ) : ideas.length > 0 ? (
                    ideas.map((idea) => (
                      <Card key={idea.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg">{idea.title}</CardTitle>
                              <CardDescription>{idea.description}</CardDescription>
                            </div>
                            <div className="flex items-center space-x-2">
                              {idea.score && (
                                <div className="flex items-center">
                                  <TrendingUp className="h-4 w-4 text-yellow-500 mr-1" />
                                  <span className="font-medium">{idea.score}</span>
                                </div>
                              )}
                              <Badge variant={idea.status === "approved" ? "default" : "secondary"}>
                                {idea.status}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-2 text-gray-500" />
                              {idea.submitted_by_name}
                            </div>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                              {new Date(idea.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card>
                      <CardContent className="text-center py-8">
                        <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No ideas proposed yet</h3>
                        <p className="text-gray-600">Be the first to propose a solution for this problem.</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="discussion">
                <Card>
                  <CardHeader>
                    <CardTitle>Discussion</CardTitle>
                    <CardDescription>Join the conversation about this problem</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No discussions yet</h3>
                      <p className="text-gray-600">Be the first to start a discussion about this problem</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Problem Info */}
            <Card>
              <CardHeader>
                <CardTitle>Problem Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2 text-gray-500" />
                  <div>
                    <p className="font-medium">{problem.submitted_by_name}</p>
                    <p className="text-sm text-gray-500">{problem.department}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm">Submitted on {new Date(problem.created_at).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center">
                  <Eye className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm">{problem.views_count || 0} views</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Ideas Submitted</span>
                  <span className="font-medium">{ideas.length}</span> {/* Use actual ideas count */}
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Comments</span>
                  <span className="font-medium">{problem.comments_count || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Category</span>
                  <Badge variant="outline">{problem.category}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <Link href={`/ideas/submit?problemId=${problem.id}`}>
                    <Button className="w-full">
                      <Lightbulb className="h-4 w-4 mr-2" />
                      Propose Solution
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full bg-transparent">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Join Discussion
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
