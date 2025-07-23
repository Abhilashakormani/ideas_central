"use client"

import Link from "next/link"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Lightbulb, PlusCircle, TrendingUp, CheckCircle, Clock, AlertCircle, Star, LogOut } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { problemService, ideaService, type Problem, type Idea } from "@/lib/database"
import ProblemsPage from "@/app/problems/page" // Import the ProblemsPage
import IdeasPage from "@/app/ideas/page" // Import the new IdeasPage
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function DashboardPage() {
  const { user, profile, loading, signOut } = useAuth()
  const router = useRouter()

  const [recentProblems, setRecentProblems] = useState<Problem[]>([])
  const [recentIdeas, setRecentIdeas] = useState<Idea[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [stats, setStats] = useState({
    problemsSubmitted: 0,
    ideasProposed: 0,
    ideasApproved: 0,
    pendingReviews: 0,
  })

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    if (!user || !profile) return // Only fetch if user and profile are authenticated

    // Log the profile role to help debug
    console.log("Current user profile role:", profile.role)

    setDataLoading(true)
    try {
      let problemsSubmittedCount = 0
      let ideasProposedCount = 0
      let ideasApprovedCount = 0
      let pendingReviewsCount = 0
      let fetchedRecentProblems: Problem[] = []
      let fetchedRecentIdeas: Idea[] = []

      if (profile.role === "student") {
        // Student: problems and ideas submitted by them
        const studentProblems = await problemService.getAll({ submittedBy: user.id })
        problemsSubmittedCount = studentProblems.length
        fetchedRecentProblems = studentProblems.slice(0, 2)

        const studentIdeas = await ideaService.getAll({ submittedBy: user.id })
        ideasProposedCount = studentIdeas.length
        ideasApprovedCount = studentIdeas.filter((idea) => idea.status === "approved").length
        fetchedRecentIdeas = studentIdeas.slice(0, 2)

        // For students, "pending reviews" means their ideas that are pending/under-review
        pendingReviewsCount = studentIdeas.filter(
          (idea) => idea.status === "pending" || idea.status === "under-review",
        ).length
      } else if (profile.role === "faculty" || profile.role === "admin") {
        // Faculty/Admin: overall platform stats
        const problemStats = await problemService.getStats()
        problemsSubmittedCount = problemStats.total
        fetchedRecentProblems = (await problemService.getAll()).slice(0, 2) // Get all recent problems

        const allIdeas = await ideaService.getAll()
        ideasProposedCount = allIdeas.length
        ideasApprovedCount = allIdeas.filter((idea) => idea.status === "approved").length
        fetchedRecentIdeas = allIdeas.slice(0, 2) // Get all recent ideas

        // For faculty/admin, "pending reviews" means ideas awaiting their evaluation
        pendingReviewsCount = allIdeas.filter(
          (idea) => idea.status === "pending" || idea.status === "under-review",
        ).length
      }

      setRecentProblems(fetchedRecentProblems)
      setRecentIdeas(fetchedRecentIdeas)
      setStats({
        problemsSubmitted: problemsSubmittedCount,
        ideasProposed: ideasProposedCount,
        ideasApproved: ideasApprovedCount,
        pendingReviews: pendingReviewsCount,
      })
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
    } finally {
      setDataLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [user, profile]) // Re-fetch when user or profile changes (e.g., after login)

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user || !profile) {
    return null // Will redirect to login
  }

  const statCards = [
    {
      title: profile.role === "student" ? "Problems Submitted by You" : "Total Problems",
      value: stats.problemsSubmitted,
      icon: AlertCircle,
      color: "text-blue-600",
    },
    {
      title: profile.role === "student" ? "Ideas Proposed by You" : "Total Ideas",
      value: stats.ideasProposed,
      icon: Lightbulb,
      color: "text-green-600",
    },
    {
      title: profile.role === "student" ? "Your Ideas Approved" : "Ideas Approved",
      value: stats.ideasApproved,
      icon: CheckCircle,
      color: "text-purple-600",
    },
    {
      title: profile.role === "student" ? "Your Ideas Under Review" : "Pending Reviews",
      value: stats.pendingReviews,
      icon: Clock,
      color: "text-orange-600",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Lightbulb className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold">Ideas Central Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="/placeholder-user.jpg" alt="User Avatar" />
                      <AvatarFallback>{getInitials(profile.first_name, profile.last_name)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {profile.first_name} {profile.last_name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">{profile.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Display role using Badge */}
              <Badge variant="secondary" className="capitalize">
                {profile.role}
              </Badge>
              <Link href="/problems/submit">
                <Button>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  New Submission
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Message */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {profile.first_name}! 👋</h2>
          <p className="text-gray-600">
            {profile.department && `${profile.department} • `}
            {profile.role === "student" && profile.student_id && `Student ID: ${profile.student_id} • `}
            Ready to innovate today?
          </p>
        </div>

        {/* Quick Actions - Role-based */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/problems/submit">
              <Button className="w-full py-6 text-lg">
                <PlusCircle className="h-5 w-5 mr-3" />
                Submit a New Problem
              </Button>
            </Link>
            {profile.role === "student" ? (
              <Link href="/ideas/submit">
                <Button variant="outline" className="w-full py-6 text-lg bg-white">
                  <Lightbulb className="h-5 w-5 mr-3" />
                  Propose a New Idea
                </Button>
              </Link>
            ) : (
              <Link href="/evaluation">
                <Button variant="outline" className="w-full py-6 text-lg bg-white">
                  <TrendingUp className="h-5 w-5 mr-3" />
                  Go to Evaluation Center
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="problems">Problems</TabsTrigger>
            <TabsTrigger value="ideas">Ideas</TabsTrigger>
            <TabsTrigger value="evaluations">Evaluations</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Recent Problems */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2 text-blue-600" />
                    {profile.role === "student" ? "Your Recent Problems" : "Recent Problems"}
                  </CardTitle>
                  <CardDescription>
                    {profile.role === "student"
                      ? "Problems you have recently submitted"
                      : "Latest problems submitted to the platform"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentProblems.length > 0 ? (
                    recentProblems.map((problem) => (
                      <Link key={problem.id} href={`/problems/${problem.id}`} className="block">
                        <div className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold">{problem.title}</h4>
                            <Badge variant={problem.status === "open" ? "default" : "secondary"}>
                              {problem.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{problem.description}</p>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex space-x-2">
                              {problem.tags?.map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            <span>by {problem.submitted_by_name}</span>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-4">
                      {profile.role === "student" ? "You haven't submitted any problems yet." : "No recent problems."}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Ideas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Lightbulb className="h-5 w-5 mr-2 text-green-600" />
                    {profile.role === "student" ? "Your Recent Ideas" : "Recent Ideas"}
                  </CardTitle>
                  <CardDescription>
                    {profile.role === "student"
                      ? "Ideas you have recently proposed"
                      : "Latest ideas proposed by the community"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentIdeas.length > 0 ? (
                    recentIdeas.map((idea) => (
                      <div key={idea.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold">{idea.title}</h4>
                          <div className="flex items-center space-x-2">
                            {idea.score && (
                              <div className="flex items-center">
                                <Star className="h-4 w-4 text-yellow-500 mr-1" />
                                <span className="text-sm font-medium">{idea.score}</span>
                              </div>
                            )}
                            <Badge variant={idea.status === "approved" ? "default" : "secondary"}>{idea.status}</Badge>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{idea.description}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Problem #{idea.problem_id}</span>
                          <span>by {idea.submitted_by_name}</span>
                        </div>
                        {idea.status === "approved" && (
                          <div className="mt-3">
                            <Button asChild size="sm" className="w-full">
                              <a
                                href={`mailto:${process.env.NEXT_PUBLIC_MENTOR_CONTACT_EMAIL}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Contact Mentor
                              </a>
                            </Button>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-4">
                      {profile.role === "student" ? "You haven't proposed any ideas yet." : "No recent ideas."}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="problems">
            {/* Embed the ProblemsPage component here */}
            <ProblemsPage />
          </TabsContent>

          <TabsContent value="ideas">
            {/* Embed the new IdeasPage component here */}
            <IdeasPage />
          </TabsContent>

          <TabsContent value="evaluations">
            <Card>
              <CardHeader>
                <CardTitle>Evaluation Center</CardTitle>
                <CardDescription>
                  {profile.role === "student"
                    ? "Track the evaluation status of your submitted ideas"
                    : "Review and evaluate submitted ideas from the community"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  {profile.role === "student" ? (
                    stats.pendingReviews > 0 ? (
                      <>
                        <Clock className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                          {stats.pendingReviews} of your idea
                          {stats.pendingReviews > 1 ? "s are" : " is"} awaiting review.
                        </h3>
                        <p className="text-gray-600 mb-4">Check back later for evaluation results.</p>
                        <Link href="/ideas">
                          <Button variant="outline">
                            <Lightbulb className="h-4 w-4 mr-2" />
                            View Your Ideas
                          </Button>
                        </Link>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">All your submitted ideas have been evaluated.</h3>
                        <p className="text-gray-600">
                          You can view their status on the "Ideas" tab or submit new ones!
                        </p>
                        <Link href="/ideas/submit">
                          <Button>
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Submit New Idea
                          </Button>
                        </Link>
                      </>
                    )
                  ) : stats.pendingReviews > 0 ? (
                    <>
                      <Clock className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        There are {stats.pendingReviews} idea{stats.pendingReviews > 1 ? "s" : ""} awaiting your review.
                      </h3>
                      <p className="text-gray-600 mb-4">Click below to start evaluating them.</p>
                      <Link href="/evaluation">
                        <Button>
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Go to Evaluation Center
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No ideas currently awaiting review.</h3>
                      <p className="text-gray-600">All ideas have been reviewed or there are no new submissions.</p>
                      <Link href="/evaluation">
                        <Button variant="outline">
                          <TrendingUp className="h-4 w-4 mr-2" />
                          View All Evaluations
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
