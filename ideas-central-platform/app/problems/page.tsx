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
import { AlertCircle, Search, Filter, PlusCircle, User, Calendar, Tag, TrendingUp, Loader2 } from "lucide-react"
import { problemService, type Problem } from "@/lib/database"
import { useAuth } from "@/components/auth-provider"

export default function ProblemsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [problems, setProblems] = useState<Problem[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedPriority, setSelectedPriority] = useState("all")
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    urgent: 0,
    inProgress: 0,
  })

  const categories = [
    "all",
    "environment",
    "education",
    "technology",
    "security",
    "healthcare",
    "transportation",
    "infrastructure",
    "social",
    "finance",
  ]
  const priorities = ["all", "urgent", "high", "medium", "low"]

  // Load problems and stats regardless of authentication status
  useEffect(() => {
    loadProblems()
    loadStats()
  }, [searchTerm, selectedCategory, selectedPriority])

  const loadProblems = async () => {
    try {
      setDataLoading(true)
      const filters = {
        category: selectedCategory,
        priority: selectedPriority,
        search: searchTerm,
      }
      const data = await problemService.getAll(filters)
      setProblems(data)
    } catch (error) {
      console.error("Failed to load problems:", error)
    } finally {
      setDataLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const statsData = await problemService.getStats()
      setStats(statsData)
    } catch (error) {
      console.error("Failed to load stats:", error)
    }
  }

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
          <p>Loading problems...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Problems Hub</h1>
              <p className="text-gray-600 mt-1">Discover and solve real-world challenges</p>
            </div>
            <Link href={user ? "/problems/submit" : "/auth/login"}>
              <Button>
                <PlusCircle className="h-4 w-4 mr-2" />
                Submit Problem
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Problems</CardTitle>
              <AlertCircle className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">Active challenges</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Problems</CardTitle>
              <AlertCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.open}</div>
              <p className="text-xs text-muted-foreground">Awaiting solutions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Ideas</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{problems.reduce((sum, p) => sum + (p.ideas_count || 0), 0)}</div>
              <p className="text-xs text-muted-foreground">Proposed solutions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Urgent Issues</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.urgent}</div>
              <p className="text-xs text-muted-foreground">Need immediate attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search problems, tags, or descriptions..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category === "all" ? "All Categories" : category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      {priority === "all" ? "All Priorities" : priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Problems List */}
        <Tabs defaultValue="grid" className="space-y-6">
          <TabsList>
            <TabsTrigger value="grid">Grid View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>

          <TabsContent value="grid">
            {dataLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading problems...</span>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {problems.map((problem) => (
                  <Card key={problem.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <Badge className={getPriorityColor(problem.priority)}>{problem.priority.toUpperCase()}</Badge>
                        <Badge className={getStatusColor(problem.status)}>
                          {problem.status.replace("-", " ").toUpperCase()}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg line-clamp-2">{problem.title}</CardTitle>
                      <CardDescription className="line-clamp-3">{problem.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-1">
                          {problem.tags?.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                          {(problem.tags?.length || 0) > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{(problem.tags?.length || 0) - 3} more
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            {problem.submitted_by_name}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(problem.created_at)}
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-blue-600 font-medium">{problem.ideas_count || 0} Ideas</span>
                          <span className="text-gray-500">{problem.views_count || 0} Views</span>
                        </div>

                        <div className="flex space-x-2">
                          <Link href={`/problems/${problem.id}`} className="flex-1">
                            <Button variant="outline" className="w-full bg-transparent">
                              View Details
                            </Button>
                          </Link>
                          <Link href={user ? `/ideas/submit?problemId=${problem.id}` : "/auth/login"}>
                            <Button className="flex-1">Propose Solution</Button>
                          </Link>
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
                <span className="ml-2">Loading problems...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {problems.map((problem) => (
                  <Card key={problem.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge className={getPriorityColor(problem.priority)}>
                              {problem.priority.toUpperCase()}
                            </Badge>
                            <Badge className={getStatusColor(problem.status)}>
                              {problem.status.replace("-", " ").toUpperCase()}
                            </Badge>
                          </div>

                          <h3 className="text-xl font-semibold mb-2">{problem.title}</h3>
                          <p className="text-gray-600 mb-3 line-clamp-2">{problem.description}</p>

                          <div className="flex flex-wrap gap-1 mb-3">
                            {problem.tags?.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                <Tag className="h-3 w-3 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                          </div>

                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center">
                                <User className="h-4 w-4 mr-1" />
                                {problem.submitted_by_name}
                              </div>
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {formatDate(problem.created_at)}
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <span className="text-blue-600 font-medium">{problem.ideas_count || 0} Ideas</span>
                              <span>{problem.views_count || 0} Views</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col space-y-2 ml-4">
                          <Link href={`/problems/${problem.id}`}>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </Link>
                          <Link href={user ? `/ideas/submit?problemId=${problem.id}` : "/auth/login"}>
                            <Button size="sm">Propose Solution</Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {!dataLoading && problems.length === 0 && (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Problems Found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || selectedCategory !== "all" || selectedPriority !== "all"
                    ? "Try adjusting your search criteria"
                    : "Be the first to submit a problem that needs solving"}
                </p>
                <Link href={user ? "/problems/submit" : "/auth/login"}>
                  <Button>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Submit First Problem
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
