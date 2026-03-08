# 🌰 CryptoSentinel — AI Market Manipulation Intelligence

**Live Demo:** https://lucaisgrowing.github.io/cryptosentinel/  
**Repository:** https://github.com/lucaisgrowing/cryptosentinel

## Overview

CryptoSentinel is an AI-powered cryptocurrency market manipulation detection system that automatically monitors exchanges for anomalous trading patterns and generates weekly intelligence briefs. Built on the [product-kit-template](https://github.com/1712n/product-kit-template), it goes far beyond the template by implementing a comprehensive multi-vector detection pipeline with AI analysis.

## 🌰 Key Features

✅ **Multi-Vector Detection** — 7 simultaneous query vectors across wash trading, spoofing, pump-and-dump, fake volume, and insider trading  
✅ **AI Intelligence Briefs** — GitHub Models (GPT-4o-mini) generates executive summaries, threat assessments, and risk matrices  
✅ **Entity Watchlist** — Automatic extraction and risk scoring of exchanges and entities  
✅ **Real-Time Dashboard** — Beautiful, responsive web interface with threat levels, risk matrix, and event timeline  
✅ **Automated Pipeline** — GitHub Actions workflow fetches data weekly, runs AI analysis, and deploys to GitHub Pages  
✅ **Social Media Integration** — Auto-generates Twitter/X threads with market intelligence  
✅ **Historical Archive** — Maintains 500-event rolling archive for trend analysis  

## 🌰 How It's Different from the Template

| Aspect | Template | CryptoSentinel |
|--------|----------|---|
| **Data Sources** | Single API query | 7 parallel query vectors |
| **Analysis** | None | 3-pass AI pipeline (entity extraction, brief generation, social content) |
| **Dashboard** | None | Professional dark-mode UI with threat levels, risk matrix, event timeline |
| **Deduplication** | None | Intelligent event deduplication by fingerprint |
| **Severity Classification** | None | AI-powered severity scoring (critical/high/medium/low) |
| **Archive** | None | 500-event rolling history with metadata |
| **Social Media** | Optional Twitter stub | Full Twitter/X thread generation |
| **Deployment** | Manual | Fully automated GitHub Pages + Actions |

## 🌰 Technical Stack

- **Data Fetching:** Node.js ESM, CPW Tracker API (RapidAPI)
- **AI Analysis:** GitHub Models API (GPT-4o-mini) — no extra API keys needed
- **Frontend:** Vanilla HTML/CSS/JavaScript, responsive design
- **Deployment:** GitHub Actions + GitHub Pages
- **Data Format:** JSON with metadata, stats, AI enrichment

## 🌰 Architecture

```
scripts/api-call.js
  ↓ (fetches 7 query vectors)
data/events.json (raw signals)
  ↓
scripts/ai-analysis.js
  ├─ Pass 1: Entity extraction & risk scoring
  ├─ Pass 2: Intelligence brief generation
  └─ Pass 3: Social media content
  ↓
data/events.json (enriched with AI analysis)
  ↓
index.html (renders dashboard)
  ↓
GitHub Pages (live deployment)
```

## 🌰 Setup & Deployment

### 1. Fork & Clone
```bash
gh repo clone lucaisgrowing/cryptosentinel
cd cryptosentinel
```

### 2. Add Secrets
Go to **Settings → Secrets and variables → Actions** and add:
- `RAPIDAPI_KEY` — Get from [CPW Tracker API](https://rapidapi.com/CPWatch/api/cpw-tracker) (100 free requests/month)
- `TWITTER_BEARER_TOKEN` (optional) — For social media posting

### 3. Enable GitHub Pages
- Go to **Settings → Pages**
- Set source to `Deploy from a branch`
- Select `main` branch, root folder
- Save

### 4. Manual Test
```bash
npm install  # (optional, no dependencies needed)
RAPIDAPI_KEY=your_key node scripts/api-call.js
GITHUB_TOKEN=your_token node scripts/ai-analysis.js
```

### 5. Automated Workflow
The GitHub Actions workflow runs:
- **Weekly** (Sundays at 12:00 UTC)
- **On push** to main
- **On manual trigger** (workflow_dispatch)

## 🌰 Data Format

### Raw Events (from api-call.js)
```json
{
  "meta": {
    "product": "CryptoSentinel",
    "version": "1.0.0",
    "lastUpdated": "2026-03-08T13:30:00Z",
    "totalSignals": 12,
    "queryVectors": 7
  },
  "stats": {
    "critical": 2,
    "high": 4,
    "medium": 4,
    "low": 2,
    "byCategory": [...]
  },
  "events": [
    {
      "timestamp": "2026-03-07T14:22:00Z",
      "entities": "Binance",
      "eventSummary": "...",
      "category": "wash-trading",
      "severity": "high",
      "queryEntities": "cryptocurrency exchanges",
      "queryTopic": "wash trading"
    }
  ]
}
```

### AI Enrichment (from ai-analysis.js)
```json
{
  "ai": {
    "brief": {
      "threatLevel": "HIGH",
      "executiveSummary": "...",
      "keyFindings": [...],
      "manipulationTrends": [...],
      "riskMatrix": {
        "washTrading": 8,
        "spoofing": 9,
        "pumpAndDump": 7,
        "fakeVolume": 6,
        "insiderTrading": 4
      },
      "recommendations": [...],
      "weeklyScore": 72
    },
    "entityWatchlist": {
      "watchlist": [
        {"entity": "OKX", "risk": "critical", "manipulationType": "spoofing"}
      ]
    },
    "social": {
      "tweets": ["🌰 Tweet 1", "🌰 Tweet 2"],
      "hashtags": ["#CryptoSentinel"]
    }
  }
}
```

## 🌰 Customization

### Change Detection Categories
Edit `scripts/api-call.js` — modify `QUERY_VECTORS`:
```javascript
const QUERY_VECTORS = [
  { entities: "cryptocurrency exchanges", topic: "wash trading" },
  { entities: "DeFi protocols", topic: "market manipulation" },
  // Add more...
]
```

### Adjust AI Prompts
Edit `scripts/ai-analysis.js` — modify system prompts in `callModel()` calls.

### Customize Dashboard
Edit `index.html` — modify CSS colors, layout, or add new sections.

## 🌰 Use Cases

- **Traders** — Monitor exchange security before choosing where to trade
- **Researchers** — Track market manipulation trends across the crypto ecosystem
- **Compliance Teams** — Automated monitoring for regulatory reporting
- **Journalists** — Source data for crypto market integrity reporting
- **Exchanges** — Benchmark against peer security incidents

## 🌰 Submission Details

**Challenge:** [dn-institute Issue #489](https://github.com/1712n/dn-institute/issues/489)  
**Bounty:** $500  
**Built with:** [product-kit-template](https://github.com/1712n/product-kit-template)  
**Addresses:** Market manipulation detection for crypto ecosystem integrity

## 🌰 License

MIT — Feel free to fork, modify, and deploy your own instance.

---

**Built by:** lucaisgrowing  
**Last Updated:** 2026-03-08  
**Status:** Active & Maintained 🌰
