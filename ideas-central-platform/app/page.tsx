"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Lightbulb, Users, TrendingUp, Award } from "lucide-react"
import { useAuth } from "@/components/auth-provider" // Import useAuth

export default function HomePage() {
  const { user, loading } = useAuth() // Get user and loading state from auth context

  // Show loading state if auth is still loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Lightbulb className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Ideas Central</h1>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            {user && ( // Only show Dashboard if logged in
              <Link href="/dashboard" className="text-gray-600 hover:text-blue-600">
                Dashboard
              </Link>
            )}
            <Link href="/problems" className="text-gray-600 hover:text-blue-600">
              Problems
            </Link>
            <Link href="/ideas" className="text-gray-600 hover:text-blue-600">
              Ideas
            </Link>
            {user && ( // Only show Evaluation if logged in
              <Link href="/evaluation" className="text-gray-600 hover:text-blue-600">
                Evaluation
              </Link>
            )}
          </nav>
          <div className="flex items-center space-x-2">
            {!user ? ( // Show Login/Sign Up if not logged in
              <>
                <Link href="/auth/login">
                  <Button variant="outline">Login</Button>
                </Link>
                <Link href="/auth/register">
                  <Button>Sign Up</Button>
                </Link>
              </>
            ) : (
              // Optionally, show a profile link or sign out button if logged in
              <Link href="/dashboard">
                <Button variant="outline">Go to Dashboard</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">Transform Ideas into Innovation</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            A comprehensive platform for students, faculty, and administrators to collaborate, submit problems, propose
            solutions, and evaluate innovative ideas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="px-8">
                Get Started
              </Button>
            </Link>
            <Link href={user ? "/dashboard" : "/auth/login"}>
              <Button size="lg" variant="outline" className="px-8 bg-transparent">
                {user ? "View Dashboard" : "Login to View Dashboard"}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">Platform Features</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center">
              <CardHeader>
                <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Multi-Role Access</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Separate interfaces for Students, Faculty, and Administrators with role-based permissions
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Lightbulb className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <CardTitle>Problem & Idea Management</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Submit problems, propose innovative solutions, and track idea development
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <TrendingUp className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <CardTitle>AI-Powered Classification</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Automatic problem categorization and tagging using NLP classification</CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Award className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                <CardTitle>Evaluation System</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Comprehensive idea evaluation with scoring and approval workflows</CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">How It Works</h3>
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  1
                </div>
                <h4 className="text-xl font-semibold mb-2">Submit Problems</h4>
                <p className="text-gray-600">
                  Students and faculty submit real-world problems that need innovative solutions
                </p>
              </div>
              <div className="text-center">
                <div className="bg-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  2
                </div>
                <h4 className="text-xl font-semibold mb-2">Propose Ideas</h4>
                <p className="text-gray-600">Community members propose creative solutions and innovative ideas</p>
              </div>
              <div className="text-center">
                <div className="bg-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  3
                </div>
                <h4 className="text-xl font-semibold mb-2">Evaluate & Approve</h4>
                <p className="text-gray-600">
                  Faculty and administrators evaluate ideas and approve the best solutions
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-blue-100">Problems Submitted</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">1,200+</div>
              <div className="text-blue-100">Ideas Proposed</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">300+</div>
              <div className="text-blue-100">Ideas Approved</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-blue-100">Active Projects</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Lightbulb className="h-6 w-6" />
                <span className="text-xl font-bold">Ideas Central</span>
              </div>
              <p className="text-gray-400">
                Empowering innovation through collaborative problem-solving and idea development.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/dashboard" className="hover:text-white">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/problems" className="hover:text-white">
                    Problems
                  </Link>
                </li>
                <li>
                  <Link href="/ideas" className="hover:text-white">
                    Ideas
                  </Link>
                </li>
                <li>
                  <Link href="/evaluation" className="hover:text-white">
                    Evaluation
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/help" className="hover:text-white">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/docs" className="hover:text-white">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/feedback" className="hover:text-white">
                    Feedback
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/privacy" className="hover:text-white">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/cookies" className="hover:text-white">
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Ideas Central Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
