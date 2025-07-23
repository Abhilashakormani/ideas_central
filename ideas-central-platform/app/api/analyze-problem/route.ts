import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text || text.length < 20) {
      return NextResponse.json({ error: "Text too short for analysis" }, { status: 400 })
    }

    // Simulate AI analysis - in production, you'd use a real AI service
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
        keywords: [
          "building",
          "facility",
          "maintenance",
          "construction",
          "utilities",
          "network",
          "structure",
          "campus",
        ],
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
    ]

    const lowerText = text.toLowerCase()

    // Calculate category scores
    const categoryScores = categories.map((category) => {
      const matches = category.keywords.filter((keyword) => lowerText.includes(keyword.toLowerCase())).length

      const score = matches / Math.max(category.keywords.length, 1)
      return { category: category.value, label: category.label, score, matches, keywords: category.keywords }
    })

    // Find best matching category
    const bestMatch = categoryScores.sort((a, b) => b.score - a.score)[0]

    let suggestedCategory = "other"
    let confidence = 60
    let suggestedTags: string[] = []

    if (bestMatch && bestMatch.matches > 0) {
      suggestedCategory = bestMatch.category
      confidence = Math.min(bestMatch.score * 100, 95)

      // Generate suggested tags based on found keywords
      suggestedTags = bestMatch.keywords.filter((keyword) => lowerText.includes(keyword.toLowerCase())).slice(0, 4)
    }

    // Extract additional context-based tags
    const contextTags = []
    if (lowerText.includes("urgent") || lowerText.includes("immediate")) contextTags.push("urgent")
    if (lowerText.includes("cost") || lowerText.includes("budget")) contextTags.push("budget")
    if (lowerText.includes("student")) contextTags.push("student-focused")
    if (lowerText.includes("faculty")) contextTags.push("faculty-focused")

    return NextResponse.json({
      suggestedCategory,
      confidence,
      suggestedTags: [...new Set([...suggestedTags, ...contextTags])],
      analysis: {
        wordCount: text.split(/\s+/).length,
        categoryScores: categoryScores.slice(0, 3),
      },
    })
  } catch (error) {
    console.error("Analysis error:", error)
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 })
  }
}
