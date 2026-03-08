// 🌰 CryptoSentinel — Market Manipulation Signal Fetcher
// Fetches data from CPW Tracker API across multiple manipulation categories
// Built on product-kit-template: https://github.com/1712n/product-kit-template

import { writeFile, readFile, mkdir } from "fs/promises"

const API_URL = "https://cpw-tracker.p.rapidapi.com/"
const API_KEY = process.env.RAPIDAPI_KEY

if (!API_KEY) {
  console.error("Error: RAPIDAPI_KEY environment variable is required")
  process.exit(1)
}

// 🌰 Multi-vector query matrix for comprehensive manipulation coverage
const QUERY_VECTORS = [
  { entities: "cryptocurrency exchanges", topic: "wash trading" },
  { entities: "cryptocurrency exchanges", topic: "market manipulation" },
  { entities: "cryptocurrency exchanges", topic: "spoofing" },
  { entities: "cryptocurrency exchanges", topic: "fake volume" },
  { entities: "DeFi protocols", topic: "market manipulation" },
  { entities: "cryptocurrency exchanges", topic: "pump and dump" },
  { entities: "cryptocurrency exchanges", topic: "insider trading" },
]

/**
 * Get date range for data fetch (7-day lookback) 🌰
 */
function getDateRange() {
  const now = new Date()
  const endTime = now
  const startTime = new Date(now)
  startTime.setDate(startTime.getDate() - 7) // Full week lookback
  return {
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
  }
}

/**
 * Fetch data for a single query vector 🌰
 */
async function fetchVector(entities, topic, startTime, endTime) {
  console.log(`  Querying: ${entities} × ${topic}`)

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-rapidapi-host": "cpw-tracker.p.rapidapi.com",
      "x-rapidapi-key": API_KEY,
    },
    body: JSON.stringify({ entities, topic, startTime, endTime }),
  })

  if (!response.ok) {
    console.warn(`  ⚠️ API returned ${response.status} for ${entities}/${topic}`)
    return []
  }

  const data = await response.json()
  const results = Array.isArray(data) ? data : []
  console.log(`  Found ${results.length} signals`)
  return results.map((item) => ({
    ...item,
    queryEntities: entities,
    queryTopic: topic,
    category: categorizeSignal(topic, item.eventSummary || ""),
  }))
}

/**
 * Categorize signal by manipulation type 🌰
 */
function categorizeSignal(topic, summary) {
  const lower = summary.toLowerCase()
  if (lower.includes("wash trad")) return "wash-trading"
  if (lower.includes("spoof")) return "spoofing"
  if (lower.includes("pump") || lower.includes("dump")) return "pump-dump"
  if (lower.includes("insider")) return "insider-trading"
  if (lower.includes("fake volume") || lower.includes("artificial volume")) return "fake-volume"
  if (lower.includes("front-run") || lower.includes("frontrun")) return "front-running"
  if (lower.includes("rug pull") || lower.includes("rugpull")) return "rug-pull"
  // Fall back to topic
  return topic.replace(/\s+/g, "-").toLowerCase()
}

/**
 * Classify severity based on content analysis 🌰
 */
function classifySeverity(summary) {
  const lower = summary.toLowerCase()
  if (
    lower.includes("billion") ||
    lower.includes("major exchange") ||
    lower.includes("regulatory action") ||
    lower.includes("arrested") ||
    lower.includes("sec ") ||
    lower.includes("doj ")
  )
    return "critical"
  if (
    lower.includes("million") ||
    lower.includes("investigation") ||
    lower.includes("lawsuit") ||
    lower.includes("significant")
  )
    return "high"
  if (lower.includes("warning") || lower.includes("concern") || lower.includes("unusual")) return "medium"
  return "low"
}

/**
 * Deduplicate events by URL/summary similarity 🌰
 */
function deduplicateEvents(events) {
  const seen = new Set()
  return events.filter((event) => {
    // Create a fingerprint from summary + timestamp
    const fingerprint = `${(event.eventSummary || "").substring(0, 100)}|${event.timestamp}`
    if (seen.has(fingerprint)) return false
    seen.add(fingerprint)
    return true
  })
}

/**
 * Main fetch pipeline 🌰
 */
async function updateData() {
  try {
    const { startTime, endTime } = getDateRange()
    console.log(`🌰 CryptoSentinel: Fetching manipulation signals`)
    console.log(`   Period: ${startTime} to ${endTime}`)
    console.log(`   Vectors: ${QUERY_VECTORS.length} query combinations\n`)

    // Fetch all vectors in parallel
    const results = await Promise.all(
      QUERY_VECTORS.map((v) => fetchVector(v.entities, v.topic, startTime, endTime))
    )

    // Flatten, deduplicate, enrich
    let allEvents = results.flat()
    allEvents = deduplicateEvents(allEvents)

    // Add severity classification
    allEvents = allEvents.map((event) => ({
      ...event,
      severity: classifySeverity(event.eventSummary || ""),
    }))

    // Sort by timestamp (newest first)
    allEvents.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

    // Load existing archive for historical tracking
    let archive = []
    try {
      const existing = await readFile("data/events.json", "utf-8")
      archive = JSON.parse(existing)
      if (archive.events) archive = archive.events // Handle wrapped format
    } catch {
      // No existing file
    }

    // Merge with archive, keep last 500 events
    const mergedEvents = deduplicateEvents([...allEvents, ...archive])
    const trimmedEvents = mergedEvents.slice(0, 500)

    // Build output
    const output = {
      meta: {
        product: "CryptoSentinel",
        version: "1.0.0",
        lastUpdated: new Date().toISOString(),
        period: { start: startTime, end: endTime },
        totalSignals: allEvents.length,
        queryVectors: QUERY_VECTORS.length,
        archiveSize: trimmedEvents.length,
      },
      stats: {
        critical: allEvents.filter((e) => e.severity === "critical").length,
        high: allEvents.filter((e) => e.severity === "high").length,
        medium: allEvents.filter((e) => e.severity === "medium").length,
        low: allEvents.filter((e) => e.severity === "low").length,
        byCategory: Object.entries(
          allEvents.reduce((acc, e) => {
            acc[e.category] = (acc[e.category] || 0) + 1
            return acc
          }, {})
        ).map(([category, count]) => ({ category, count })),
      },
      events: trimmedEvents,
    }

    await mkdir("data", { recursive: true })
    await writeFile("data/events.json", JSON.stringify(output, null, 2))

    console.log(`\n🌰 CryptoSentinel Update Complete:`)
    console.log(`   New signals: ${allEvents.length}`)
    console.log(`   Archive size: ${trimmedEvents.length}`)
    console.log(
      `   Severity: ${output.stats.critical} critical, ${output.stats.high} high, ${output.stats.medium} medium, ${output.stats.low} low`
    )
  } catch (error) {
    console.error("🌰 Update failed:", error.message)
    process.exit(1)
  }
}

updateData()
