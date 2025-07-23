"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Lightbulb, Search, Filter, PlusCircle, User, Calendar, Loader2, Star } from "lucide-react"
import { ideaService, problemService, type Idea, type Problem } from "@/lib/database"
import { useAuth } from "@/components/auth-provider"

export default function IdeasPage() {
  const { user, loading, profile } = useAuth()
  const router = useRouter()
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [problems, setProblems] = useState<Problem[]>([]) // To get problem titles for display

  const ideaStatuses = ["all", "pending", "under-review", "approved", "rejected"]

  // Load ideas and problems for display regardless of authentication status
  useEffect(() => {
    loadIdeas()
    loadProblemsForTitles()
  }, [searchTerm, selectedStatus, profile]) // Re-fetch when user, filters, or profile changes

  const loadIdeas = async () => {
    try {
      setDataLoading(true)
      const filters: { status?: string; submittedBy?: string } = {
        status: selectedStatus === "all" ? undefined : selectedStatus,
      }

      // If the user is a student, only show their ideas
      if (profile?.role === "student" && user) {
        // Ensure user is defined before accessing user.id
        filters.submittedBy = user.id
      }
      // If faculty/admin, show all ideas (no submittedBy filter)

      const fetchedIdeas = await ideaService.getAll(filters)

      // Filter by search term on the client side for simplicity with mock data
      const filteredBySearch = fetchedIdeas.filter(
        (idea) =>
          idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          idea.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )

      setIdeas(filteredBySearch)
    } catch (error) {
      console.error("Failed to load ideas:", error)
    } finally {
      setDataLoading(false)
    }
  }

  const loadProblemsForTitles = async () => {
    try {
      const fetchedProblems = await problemService.getAll()
      setProblems(fetchedProblems)
    } catch (error) {
      console.error("Failed to load problems for idea titles:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200"
      case "under-review":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getProblemTitle = (problemId: string) => {
    const problem = problems.find((p) => p.id === problemId)
    return problem ? problem.title : "Unknown Problem"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (loading && !user) {
    // Only show loading if auth is still in progress and user is not logged in
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading ideas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Ideas Hub</h1>
              <p className="text-gray-600 mt-1">Explore and propose innovative solutions</p>
            </div>
            <Link href={user ? "/ideas/submit" : "/auth/login"}>
              <Button>
                <PlusCircle className="h-4 w-4 mr-2" />
                Submit Idea
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Search & Filter Ideas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search ideas, descriptions..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  {ideaStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status === "all"
                        ? "All Statuses"
                        : status.charAt(0).toUpperCase() + status.slice(1).replace("-", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Ideas List */}
        <Tabs defaultValue="grid" className="space-y-6">
          <TabsList>
            <TabsTrigger value="grid">Grid View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>

          <TabsContent value="grid">
            {dataLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading ideas...</span>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ideas.map((idea) => (
                  <Card key={idea.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <Badge className={getStatusColor(idea.status)}>
                          {idea.status.replace("-", " ").toUpperCase()}
                        </Badge>
                        {idea.score && (
                          <div className="flex items-center text-sm text-yellow-600">
                            <Star className="h-4 w-4 mr-1 fill-current" />
                            {idea.score}/10
                          </div>
                        )}
                      </div>
                      <CardTitle className="text-lg line-clamp-2">{idea.title}</CardTitle>
                      <CardDescription className="line-clamp-3">{idea.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="text-sm text-gray-500">
                          Problem:{" "}
                          <Link href={`/problems/${idea.problem_id}`} className="text-blue-600 hover:underline">
                            {getProblemTitle(idea.problem_id)}
                          </Link>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            {idea.submitted_by_name}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(idea.created_at)}
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <Link href={`/ideas/${idea.id}`} className="flex-1">
                            <Button variant="outline" className="w-full bg-transparent">
                              View Details
                            </Button>
                          </Link>
                          {idea.status === "approved" && (
                            <Button asChild className="flex-1">
                              <a
                                href={`mailto:${process.env.NEXT_PUBLIC_MENTOR_CONTACT_EMAIL}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Contact Mentor
                              </a>
                            </Button>
                          )}
                          {/* Add other actions if needed, e.g., Edit Idea */}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="list">
            {dataLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading ideas...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {ideas.map((idea) => (
                  <Card key={idea.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge className={getStatusColor(idea.status)}>
                              {idea.status.replace("-", " ").toUpperCase()}
                            </Badge>
                            {idea.score && (
                              <div className="flex items-center text-sm text-yellow-600 ml-2">
                                <Star className="h-4 w-4 mr-1 fill-current" />
                                {idea.score}/10
                              </div>
                            )}
                          </div>

                          <h3 className="text-xl font-semibold mb-2">{idea.title}</h3>
                          <p className="text-gray-600 mb-3 line-clamp-2">{idea.description}</p>

                          <div className="text-sm text-gray-500 mb-3">
                            Problem:{" "}
                            <Link href={`/problems/${idea.problem_id}`} className="text-blue-600 hover:underline">
                              {getProblemTitle(idea.problem_id)}
                            </Link>
                          </div>

                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center">
                                <User className="h-4 w-4 mr-1" />
                                {formatDate(idea.created_at)}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col space-y-2 ml-4">
                          <Link href={`/ideas/${idea.id}`}>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </Link>
                          {idea.status === "approved" && (
                            <Button asChild size="sm">
                              <a
                                href={`mailto:${process.env.NEXT_PUBLIC_MENTOR_CONTACT_EMAIL}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Contact Mentor
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {!dataLoading && ideas.length === 0 && (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Ideas Found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || selectedStatus !== "all"
                    ? "Try adjusting your search criteria"
                    : "Be the first to propose an idea!"}
                </p>
                <Link href={user ? "/ideas/submit" : "/auth/login"}>
                  <Button>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Submit First Idea
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
