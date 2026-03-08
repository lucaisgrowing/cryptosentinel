// 🌰 CryptoSentinel — AI Analysis Pipeline
// Uses GitHub Models (GPT-4o-mini) to generate intelligence briefs
// Built on product-kit-template: https://github.com/1712n/product-kit-template

import { readFile, writeFile } from "fs/promises"

const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const MODEL_ENDPOINT = "https://models.inference.ai.azure.com/chat/completions"
const MODEL = "gpt-4o-mini"

if (!GITHUB_TOKEN) {
  console.error("Error: GITHUB_TOKEN environment variable is required for AI analysis")
  process.exit(1)
}

/**
 * Call GitHub Models API 🌰
 */
async function callModel(systemPrompt, userPrompt) {
  const response = await fetch(MODEL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GITHUB_TOKEN}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    }),
  })

  if (!response.ok) {
    throw new Error(`GitHub Models API error: ${response.status} ${await response.text()}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

/**
 * Pass 1: Entity extraction and risk scoring 🌰
 */
async function extractEntities(events) {
  console.log("🌰 Pass 1: Entity extraction & risk scoring...")

  const eventSummaries = events
    .slice(0, 30) // Top 30 most recent
    .map((e) => `[${e.severity?.toUpperCase() || "UNKNOWN"}] ${e.entities}: ${e.eventSummary?.substring(0, 200)}`)
    .join("\n")

  const result = await callModel(
    `You are a crypto market manipulation analyst. Extract entities and assess manipulation risk.
Return valid JSON only, no markdown fences.`,
    `Analyze these market manipulation signals and extract a watchlist of entities with risk levels.

Signals:
${eventSummaries}

Return JSON with this structure:
{
  "watchlist": [
    {"entity": "ExchangeName", "risk": "critical|high|medium|low", "reason": "brief reason", "manipulationType": "wash-trading|spoofing|pump-dump|fake-volume|other"}
  ],
  "totalEntitiesTracked": number,
  "mostCommonManipulation": "type"
}`
  )

  try {
    return JSON.parse(result.replace(/```json?\n?/g, "").replace(/```/g, "").trim())
  } catch {
    console.warn("  ⚠️ Could not parse entity extraction result")
    return { watchlist: [], totalEntitiesTracked: 0, mostCommonManipulation: "unknown" }
  }
}

/**
 * Pass 2: Intelligence brief generation 🌰
 */
async function generateBrief(events, entityData) {
  console.log("🌰 Pass 2: Intelligence brief generation...")

  const eventSummaries = events
    .slice(0, 25)
    .map(
      (e) =>
        `[${e.severity?.toUpperCase() || "UNKNOWN"}] [${e.category || "unknown"}] ${e.entities}: ${e.eventSummary?.substring(0, 300)}`
    )
    .join("\n\n")

  const severityCounts = {
    critical: events.filter((e) => e.severity === "critical").length,
    high: events.filter((e) => e.severity === "high").length,
    medium: events.filter((e) => e.severity === "medium").length,
    low: events.filter((e) => e.severity === "low").length,
  }

  const result = await callModel(
    `You are a senior crypto market integrity analyst at CryptoSentinel, a market manipulation intelligence service.
Write professional, data-driven intelligence briefs. Be specific about exchanges, patterns, and risks.
Return valid JSON only, no markdown fences.`,
    `Generate a weekly intelligence brief from these market manipulation signals.

Signal Count: ${events.length} total (${severityCounts.critical} critical, ${severityCounts.high} high, ${severityCounts.medium} medium, ${severityCounts.low} low)

Entity Watchlist: ${JSON.stringify(entityData.watchlist?.slice(0, 10))}

Recent Signals:
${eventSummaries}

Return JSON:
{
  "threatLevel": "CRITICAL|HIGH|ELEVATED|MODERATE|LOW",
  "executiveSummary": "2-3 sentence overview of the week's manipulation landscape",
  "keyFindings": ["finding 1", "finding 2", "finding 3"],
  "manipulationTrends": [
    {"trend": "description", "severity": "critical|high|medium|low", "affectedExchanges": ["exchange1"]}
  ],
  "riskMatrix": {
    "washTrading": 1-10,
    "spoofing": 1-10,
    "pumpAndDump": 1-10,
    "fakeVolume": 1-10,
    "insiderTrading": 1-10
  },
  "recommendations": ["recommendation 1", "recommendation 2"],
  "weeklyScore": 0-100
}`
  )

  try {
    return JSON.parse(result.replace(/```json?\n?/g, "").replace(/```/g, "").trim())
  } catch {
    console.warn("  ⚠️ Could not parse brief, using default")
    return {
      threatLevel: "MODERATE",
      executiveSummary: "Analysis pending — AI brief generation encountered an issue.",
      keyFindings: [],
      manipulationTrends: [],
      riskMatrix: { washTrading: 5, spoofing: 5, pumpAndDump: 5, fakeVolume: 5, insiderTrading: 5 },
      recommendations: [],
      weeklyScore: 50,
    }
  }
}

/**
 * Pass 3: Social media content generation 🌰
 */
async function generateSocialContent(brief) {
  console.log("🌰 Pass 3: Social media content generation...")

  const result = await callModel(
    `You are a social media manager for CryptoSentinel, a crypto market manipulation intelligence service.
Create engaging, informative threads. Use emojis sparingly. Be factual. Include 🌰 occasionally.
Return valid JSON only, no markdown fences.`,
    `Generate a Twitter/X thread (5-7 tweets, each under 280 chars) based on this weekly intelligence brief.

Threat Level: ${brief.threatLevel}
Summary: ${brief.executiveSummary}
Key Findings: ${JSON.stringify(brief.keyFindings)}
Weekly Integrity Score: ${brief.weeklyScore}/100
Risk Matrix: ${JSON.stringify(brief.riskMatrix)}
Recommendations: ${JSON.stringify(brief.recommendations)}

Return JSON:
{
  "tweets": ["tweet 1", "tweet 2", ...],
  "hashtags": ["#hashtag1", "#hashtag2"]
}`
  )

  try {
    return JSON.parse(result.replace(/```json?\n?/g, "").replace(/```/g, "").trim())
  } catch {
    return { tweets: [], hashtags: ["#CryptoSentinel", "#MarketManipulation"] }
  }
}

/**
 * Main AI analysis pipeline 🌰
 */
async function analyze() {
  try {
    console.log("🌰 CryptoSentinel AI Analysis Pipeline\n")

    // Load event data
    const raw = await readFile("data/events.json", "utf-8")
    const data = JSON.parse(raw)
    const events = data.events || data

    if (!events.length) {
      console.log("No events to analyze")
      return
    }

    console.log(`Analyzing ${events.length} signals...\n`)

    // 3-pass AI pipeline
    const entityData = await extractEntities(events)
    const brief = await generateBrief(events, entityData)
    const social = await generateSocialContent(brief)

    // Enrich the data file with AI analysis
    const enriched = {
      ...data,
      ai: {
        generatedAt: new Date().toISOString(),
        model: MODEL,
        entityWatchlist: entityData,
        brief,
        social,
      },
    }

    await writeFile("data/events.json", JSON.stringify(enriched, null, 2))

    console.log(`\n🌰 AI Analysis Complete:`)
    console.log(`   Threat Level: ${brief.threatLevel}`)
    console.log(`   Weekly Score: ${brief.weeklyScore}/100`)
    console.log(`   Entities on Watchlist: ${entityData.watchlist?.length || 0}`)
    console.log(`   Social Posts Generated: ${social.tweets?.length || 0}`)
  } catch (error) {
    console.error("🌰 AI Analysis failed:", error.message)
    // Don't exit with error — data is still valid without AI enrichment
  }
}

analyze()
