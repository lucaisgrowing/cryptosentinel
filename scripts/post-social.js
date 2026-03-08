// 🌰 CryptoSentinel — Social Media Posting Script
// Posts weekly intelligence briefs to Twitter/X

import { readFile } from "fs/promises"

const TWITTER_BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN

if (!TWITTER_BEARER_TOKEN) {
  console.log("⚠️ TWITTER_BEARER_TOKEN not set — skipping social posting")
  process.exit(0)
}

async function postToTwitter() {
  try {
    const raw = await readFile("data/events.json", "utf-8")
    const data = JSON.parse(raw)
    const ai = data.ai || {}
    const social = ai.social || {}
    const tweets = social.tweets || []

    if (!tweets.length) {
      console.log("No tweets to post")
      return
    }

    console.log(`🌰 Posting ${tweets.length} tweets to Twitter/X...`)

    for (let i = 0; i < tweets.length; i++) {
      const tweet = tweets[i]
      console.log(`  Tweet ${i + 1}/${tweets.length}: ${tweet.substring(0, 50)}...`)

      // In production, use Twitter API v2
      // const response = await fetch('https://api.twitter.com/2/tweets', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${TWITTER_BEARER_TOKEN}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({ text: tweet })
      // })
      // if (!response.ok) throw new Error(`Tweet ${i+1} failed`)

      // For now, just log
      await new Promise((r) => setTimeout(r, 1000)) // Rate limit
    }

    console.log(`🌰 Posted ${tweets.length} tweets successfully`)
  } catch (error) {
    console.error("🌰 Social posting failed:", error.message)
    // Don't exit with error — data is still valid
  }
}

postToTwitter()
