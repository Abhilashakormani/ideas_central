export interface AnalysisResult {
  category: string
  tags: string[]
  confidence: number
}

/**
 * Client-side helper that calls the existing `/api/analyze-problem` route
 * and returns a trimmed result for the submit-problem page.
 */
export async function analyzeContent(text: string): Promise<AnalysisResult> {
  const res = await fetch("/api/analyze-problem", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  })

  if (!res.ok) {
    throw new Error("Content analysis failed")
  }

  const json = await res.json()
  return {
    category: json.suggestedCategory,
    tags: json.suggestedTags ?? [],
    confidence: json.confidence ?? 0,
  }
}
