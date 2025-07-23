"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, X, Plus, Sparkles, Copy, Loader2, CheckCircle } from "lucide-react"
import { problemService } from "@/lib/database"
import { useAuth } from "@/components/auth-provider" // Import useAuth
import { analyzeContent } from "@/lib/ai-analysis" // Declare the analyzeContent function

export default function SubmitProblemPage() {
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth() // Get user, profile, and authLoading
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    full_description: "",
    category: "",
    priority: "",
    tags: [] as string[],
    department: "",
  })
  const [newTag, setNewTag] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisComplete, setAnalysisComplete] = useState(false)
  const [suggestedCategory, setSuggestedCategory] = useState("")
  const [suggestedTags, setSuggestedTags] = useState<string[]>([])
  const [confidence, setConfidence] = useState(0)

  const categories = [
    {
      value: "technology",
      label: "Technology",
      keywords: ["software", "app", "system", "digital", "automation", "AI", "computer", "internet", "database"],
    },
    {
      value: "environment",
      label: "Environment",
      keywords: ["waste", "pollution", "green", "sustainability", "energy", "recycling", "carbon", "climate", "eco"],
    },
    {
      value: "education",
      label: "Education",
      keywords: [
        "learning",
        "student",
        "teaching",
        "curriculum",
        "classroom",
        "academic",
        "study",
        "knowledge",
        "training",
      ],
    },
    {
      value: "healthcare",
      label: "Healthcare",
      keywords: ["medical", "health", "hospital", "patient", "treatment", "medicine", "wellness", "care", "therapy"],
    },
    {
      value: "transportation",
      label: "Transportation",
      keywords: ["traffic", "vehicle", "transport", "parking", "road", "bus", "travel", "mobility", "logistics"],
    },
    {
      value: "infrastructure",
      label: "Infrastructure",
      keywords: ["building", "facility", "maintenance", "construction", "utilities", "network", "structure", "campus"],
    },
    {
      value: "security",
      label: "Security",
      keywords: ["safety", "protection", "surveillance", "access", "crime", "emergency", "risk", "threat", "guard"],
    },
    {
      value: "social",
      label: "Social Issues",
      keywords: [
        "community",
        "social",
        "cultural",
        "diversity",
        "inclusion",
        "communication",
        "collaboration",
        "engagement",
      ],
    },
    {
      value: "finance",
      label: "Finance",
      keywords: ["budget", "cost", "funding", "payment", "financial", "money", "expense", "revenue", "economic"],
    },
    { value: "other", label: "Other", keywords: [] },
  ]

  const priorities = [
    { value: "low", label: "Low Priority", description: "Can be addressed over time" },
    { value: "medium", label: "Medium Priority", description: "Should be addressed soon" },
    { value: "high", label: "High Priority", description: "Needs attention within weeks" },
    { value: "urgent", label: "Urgent", description: "Requires immediate action" },
  ]

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login")
    }
  }, [user, authLoading, router])

  // Trigger analysis when description changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.description.length > 50) {
        setIsAnalyzing(true)
        analyzeContent(formData.description)
          .then((result) => {
            setSuggestedCategory(result.category)
            setSuggestedTags(result.tags)
            setConfidence(result.confidence)
            setAnalysisComplete(true)
          })
          .catch((err) => console.error("AI analysis error:", err))
          .finally(() => setIsAnalyzing(false))
      }
    }, 1000) // Debounce for 1 second

    return () => clearTimeout(timer)
  }, [formData.description])

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()],
      })
      setNewTag("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    })
  }

  const handleAcceptSuggestion = () => {
    setFormData({
      ...formData,
      category: suggestedCategory,
      tags: [...new Set([...formData.tags, ...suggestedTags])],
    })
  }

  const handlePasteContent = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text) {
        setFormData({
          ...formData,
          description: formData.description + (formData.description ? "\n\n" : "") + text,
        })
      }
    } catch (err) {
      console.error("Failed to read clipboard:", err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    if (!user || !profile) {
      alert("You must be logged in to submit a problem.")
      setIsSubmitting(false)
      return
    }

    try {
      const problemData = {
        title: formData.title,
        description: formData.description,
        full_description: formData.full_description || formData.description,
        category: formData.category,
        priority: formData.priority as "low" | "medium" | "high" | "urgent",
        status: "open" as const,
        tags: formData.tags,
        submitted_by: user.id, // Use actual user ID
        submitted_by_name: `${profile.first_name} ${profile.last_name}`, // Use actual user name
        department: formData.department || profile.department, // Use actual user department
        views_count: 0,
        ideas_count: 0,
        comments_count: 0,
      }

      const newProblem = await problemService.create(problemData)

      // Redirect to the new problem page
      router.push(`/problems/${newProblem.id}`)
    } catch (error) {
      console.error("Failed to submit problem:", error)
      alert("Failed to submit problem. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (authLoading || !user || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading problem submission form...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="h-6 w-6 mr-2 text-blue-600" />
                Submit New Problem
              </CardTitle>
              <CardDescription>
                Describe a problem that needs an innovative solution. Our AI will help categorize and tag your
                submission automatically.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Problem Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter a clear, descriptive title for the problem"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                  <p className="text-sm text-gray-500">
                    Make it specific and actionable (e.g., "Campus WiFi connectivity issues in dormitories")
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="description">Problem Description *</Label>
                    <div className="flex space-x-2">
                      <Button type="button" variant="outline" size="sm" onClick={handlePasteContent}>
                        <Copy className="h-4 w-4 mr-1" />
                        Paste
                      </Button>
                    </div>
                  </div>

                  <Textarea
                    id="description"
                    placeholder="Provide a detailed description of the problem. Include:
• What is the current situation?
• Why is this a problem?
• Who is affected?
• What are the consequences?
• Any specific requirements or constraints?"
                    className="min-h-[200px] resize-y"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{formData.description.length} characters</span>
                    {formData.description.length > 50 && (
                      <div className="flex items-center">
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            Analyzing content...
                          </>
                        ) : analysisComplete ? (
                          <>
                            <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                            Analysis complete
                          </>
                        ) : null}
                      </div>
                    )}
                  </div>
                </div>

                {/* AI Suggestions */}
                {analysisComplete && suggestedCategory && (
                  <Card className="border-blue-200 bg-blue-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center">
                        <Sparkles className="h-5 w-5 mr-2 text-blue-600" />
                        AI Analysis Results
                      </CardTitle>
                      <CardDescription>Based on your description, here are our suggestions:</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Suggested Category:</span>
                          <span className="text-sm text-blue-600">{confidence.toFixed(0)}% confidence</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="bg-white">
                            {categories.find((c) => c.value === suggestedCategory)?.label}
                          </Badge>
                        </div>
                      </div>

                      {suggestedTags.length > 0 && (
                        <div>
                          <span className="text-sm font-medium">Suggested Tags:</span>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {suggestedTags.map((tag) => (
                              <Badge key={tag} variant="outline" className="bg-white capitalize">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAcceptSuggestion}
                        className="bg-white"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Accept Suggestions
                      </Button>
                    </CardContent>
                  </Card>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {suggestedCategory && formData.category !== suggestedCategory && (
                      <p className="text-sm text-blue-600">
                        💡 AI suggests: {categories.find((c) => c.value === suggestedCategory)?.label}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority Level *</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) => setFormData({ ...formData, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        {priorities.map((priority) => (
                          <SelectItem key={priority.value} value={priority.value}>
                            <div>
                              <div className="font-medium">{priority.label}</div>
                              <div className="text-xs text-gray-500">{priority.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Add a tag (press Enter)"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          handleAddTag()
                        }
                      }}
                    />
                    <Button type="button" onClick={handleAddTag} variant="outline">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                          {tag}
                          <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemoveTag(tag)} />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    placeholder="Enter your department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  />
                </div>

                <Alert>
                  <Sparkles className="h-4 w-4" />
                  <AlertDescription>
                    <strong>AI-Powered Processing:</strong> Your problem will be automatically analyzed for better
                    categorization, duplicate detection, and matching with relevant experts.
                  </AlertDescription>
                </Alert>

                <div className="flex space-x-4">
                  <Button type="submit" className="flex-1" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Submit Problem
                      </>
                    )}
                  </Button>
                  <Button type="button" variant="outline" className="bg-transparent">
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
