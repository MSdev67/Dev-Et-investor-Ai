# ET AI Investor Intelligence 🚀
### ET AI Hackathon 2026 — Problem Statement 6

> **Signal finder, not a summarizer.** AI that continuously monitors corporate filings, bulk/block deals, insider trades, and management commentary — surfacing missed opportunities as daily alerts.

---

## 🏗 Project Structure

```
et-investor-ai/
├── backend/
│   ├── main.py              # FastAPI app — all routes + AI integration
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Root app with layout + navigation
│   │   ├── App.css          # Global design system (dark financial terminal)
│   │   └── pages/
│   │       ├── Dashboard.jsx       # Market overview, heatmap, FII/DII
│   │       ├── OpportunityRadar.jsx # Core feature — AI signal detection
│   │       ├── ChartPatterns.jsx   # Technical pattern detection
│   │       └── MarketChat.jsx      # Conversational AI analyst
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── docs/
    └── ARCHITECTURE.md      # Hackathon submission doc
```

---

## ⚡ Quick Start

### 1. Backend Setup

```bash
cd backend
pip install -r requirements.txt

# Set your Anthropic API key
export ANTHROPIC_API_KEY=sk-ant-...

# Run the server
uvicorn main:app --reload --port 8000
```

Backend runs at: `http://localhost:8000`
API docs at: `http://localhost:8000/docs`

> **Note:** Works in demo mode without API key — mock data is served.

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:3000`

---

## 🎯 Features

### Dashboard
- Live NSE/SENSEX/BANKNIFTY indices ticker
- Sector heatmap with % change color coding
- FII/DII flow visualization (last 5 sessions)
- Sortable stocks table with market cap, P/E, volume

### Opportunity Radar ⭐ Core Feature
- **AI-scored signals** from insider trades, bulk deals, promoter buying, management commentary shifts
- Each signal shows: back-tested accuracy %, potential upside, time horizon
- Click any signal → Claude AI generates deep analysis in seconds
- Separate tabs for Bulk Deals and Insider Trades data

### Chart Pattern Intelligence
- 6+ active patterns across NSE stocks (Cup & Handle, H&S, Bull Flag, etc.)
- Visual price level display: Target / CMP / Stop Loss
- Risk:Reward ratio computed per trade
- Historical success rate for each pattern type
- Filter by signal direction (BUY/SELL) and timeframe

### Market Chat — Next Gen
- Conversational AI analyst with ET Markets context
- Source-cited responses (NSE, BSE, SEBI Filings)
- Suggested questions for quick exploration
- Full conversation history maintained per session

---

## 🔌 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/market/stocks` | GET | NSE top stocks with live prices |
| `/api/market/indices` | GET | NIFTY, SENSEX, BANKNIFTY, NIFTY IT |
| `/api/signals/bulk-deals` | GET | Recent bulk & block deals |
| `/api/signals/insider-trades` | GET | Insider and promoter transactions |
| `/api/signals/opportunities` | GET | AI-scored opportunity signals |
| `/api/patterns` | GET | Chart pattern detections |
| `/api/chat` | POST | Conversational AI analyst |
| `/api/analyze` | POST | Deep signal analysis for a stock |

---

## 🤖 AI Integration

Uses **Claude Sonnet** via Anthropic API:
- Signal scoring and strength assessment
- Bull/bear case generation with Indian market context
- Risk factor identification
- Conversational market analysis with source citation

---

## 📊 Impact Model

- **14 crore+** demat accounts in India
- Signal detection: 6-8 hours manual → **<5 minutes automated**
- Conservative annual impact: **₹1,500 Cr** in improved retail investor returns
- See `/docs/ARCHITECTURE.md` for full assumptions

---

## 🚀 Production Deployment

```bash
# Docker (both services)
docker-compose up

# Or deploy backend to Railway/Render
# Deploy frontend to Vercel/Netlify
```

---

## ⚠️ Disclaimer

This tool provides market signal intelligence for informational purposes only.
Not investment advice. Always verify with a SEBI-registered investment advisor.
Data sources: NSE, BSE, SEBI public filings.
