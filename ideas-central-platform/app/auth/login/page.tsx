"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Lightbulb, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react"
import { authService } from "@/lib/auth"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [errors, setErrors] = useState({
    email: "",
    general: "",
  })

  const validateEmail = (raw: string) => {
    const email = raw.trim().toLowerCase()
    if (!email) return "Email is required"
    if (!email.endsWith("@vnrvjiet.in")) return "Only @vnrvjiet.in email addresses are allowed"
    return /^[^\s@]+@vnrvjiet\.in$/.test(email) ? "" : "Please enter a valid @vnrvjiet.in email address"
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value.trim()
    setFormData({ ...formData, email })

    // Clear previous errors
    setErrors({ ...errors, email: "", general: "" })

    // Validate email on change
    if (email) {
      const emailError = validateEmail(email)
      setErrors({ ...errors, email: emailError })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({ email: "", general: "" })

    try {
      // Validate email
      const emailError = validateEmail(formData.email)
      if (emailError) {
        setErrors({ ...errors, email: emailError })
        return
      }

      // Validate password
      if (!formData.password) {
        setErrors({ ...errors, general: "Password is required" })
        return
      }

      // Sign in user
      const email = formData.email.trim().toLowerCase()
      const password = formData.password.trim()
      const result = await authService.signIn(email, password)

      if (result) {
        // Redirect to dashboard
        router.push("/dashboard")
      }
    } catch (error: any) {
      console.error("Login error:", error)
      setErrors({
        ...errors,
        general: error.message || "Invalid email or password. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Lightbulb className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold">Ideas Central</span>
          </div>
          <CardTitle className="text-2xl">VNR Vignana Jyothi Institute</CardTitle>
          <CardDescription>Sign in with your institutional email address</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Institutional Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="yourname@vnrvjiet.in"
                value={formData.email}
                onChange={handleEmailChange}
                className={errors.email ? "border-red-500" : ""}
                disabled={isLoading}
                required
              />
              {errors.email && (
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.email}
                </p>
              )}
              <p className="text-xs text-gray-500">Only VNR Vignana Jyothi Institute email addresses are accepted</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  disabled={isLoading}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {errors.general && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.general}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isLoading || !!errors.email || !formData.email}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>

            <div className="text-center">
              <Link href="/auth/forgot-password" className="text-sm text-blue-600 hover:underline">
                Forgot your password?
              </Link>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link href="/auth/register" className="text-blue-600 hover:underline">
                Sign up
              </Link>
            </p>
          </div>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800">
              <strong>Welcome!</strong> This platform is for VNR Vignana Jyothi Institute members. Sign up with your
              institutional email to get started immediately.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
