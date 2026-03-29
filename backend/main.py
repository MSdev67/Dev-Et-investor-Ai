from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import httpx
import os
import json
import asyncio
from datetime import datetime, timedelta
import random

app = FastAPI(title="ET AI Investor API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
NSE_BASE = "https://www.nseindia.com/api"

# ── Mock market data (replace with real NSE API in prod) ──────────────────────

def mock_stock_data():
    stocks = [
        {"symbol": "RELIANCE", "name": "Reliance Industries", "sector": "Energy"},
        {"symbol": "TCS", "name": "Tata Consultancy Services", "sector": "IT"},
        {"symbol": "HDFCBANK", "name": "HDFC Bank", "sector": "Banking"},
        {"symbol": "INFY", "name": "Infosys", "sector": "IT"},
        {"symbol": "ICICIBANK", "name": "ICICI Bank", "sector": "Banking"},
        {"symbol": "HINDUNILVR", "name": "Hindustan Unilever", "sector": "FMCG"},
        {"symbol": "SBIN", "name": "State Bank of India", "sector": "Banking"},
        {"symbol": "BHARTIARTL", "name": "Bharti Airtel", "sector": "Telecom"},
        {"symbol": "ITC", "name": "ITC Limited", "sector": "FMCG"},
        {"symbol": "KOTAKBANK", "name": "Kotak Mahindra Bank", "sector": "Banking"},
    ]
    result = []
    base_prices = [2456.30, 3890.50, 1678.25, 1456.80, 1123.45, 2345.60, 623.40, 1890.30, 456.70, 1789.25]
    for i, s in enumerate(stocks):
        chg = round(random.uniform(-3.5, 4.2), 2)
        price = base_prices[i]
        result.append({
            **s,
            "price": price,
            "change": chg,
            "change_abs": round(price * chg / 100, 2),
            "volume": random.randint(500000, 5000000),
            "market_cap": round(price * random.randint(500, 7000) * 1e6 / 1e12, 2),
            "pe": round(random.uniform(12, 45), 1),
            "52w_high": round(price * random.uniform(1.05, 1.45), 2),
            "52w_low": round(price * random.uniform(0.55, 0.95), 2),
        })
    return result

def mock_bulk_deals():
    deals = [
        {"date": "2025-03-28", "symbol": "ZOMATO", "client": "Goldman Sachs", "type": "BUY", "quantity": 2500000, "price": 234.50, "value_cr": 58.6},
        {"date": "2025-03-28", "symbol": "PAYTM", "client": "Morgan Stanley", "type": "SELL", "quantity": 1800000, "price": 456.20, "value_cr": 82.1},
        {"date": "2025-03-27", "symbol": "ADANIENT", "client": "Blackrock", "type": "BUY", "quantity": 3200000, "price": 2345.00, "value_cr": 750.4},
        {"date": "2025-03-27", "symbol": "IRFC", "client": "LIC", "type": "BUY", "quantity": 5000000, "price": 189.30, "value_cr": 94.65},
        {"date": "2025-03-26", "symbol": "NYKAA", "client": "Fidelity", "type": "SELL", "quantity": 900000, "price": 178.40, "value_cr": 16.1},
    ]
    return deals

def mock_insider_trades():
    return [
        {"date": "2025-03-28", "symbol": "WIPRO", "person": "Rishad Premji", "role": "Chairman", "type": "BUY", "quantity": 500000, "value_cr": 25.6, "signal": "BULLISH"},
        {"date": "2025-03-27", "symbol": "BAJFINANCE", "person": "Sanjiv Bajaj", "role": "MD & CEO", "type": "SELL", "quantity": 200000, "value_cr": 136.2, "signal": "BEARISH"},
        {"date": "2025-03-26", "symbol": "HCLTECH", "person": "Roshni Nadar", "role": "Chairperson", "type": "BUY", "quantity": 750000, "value_cr": 91.5, "signal": "BULLISH"},
        {"date": "2025-03-25", "symbol": "ULTRACEMCO", "person": "K K Maheshwari", "role": "MD", "type": "BUY", "quantity": 150000, "value_cr": 82.3, "signal": "BULLISH"},
    ]

def mock_opportunities():
    return [
        {
            "id": "opp_1",
            "symbol": "DIXON",
            "title": "Insider accumulation spike — 3 directors bought in 7 days",
            "category": "INSIDER_SIGNAL",
            "urgency": "HIGH",
            "detail": "Dixon Technologies saw 3 independent directors buy shares worth ₹12.4 Cr in the last week. Historically, similar patterns preceded 18–22% moves.",
            "data_points": ["3 directors purchased", "₹12.4 Cr total value", "All purchases above CMP"],
            "back_tested_accuracy": 74,
            "potential_upside": "18-22%",
            "time_horizon": "3-6 months"
        },
        {
            "id": "opp_2",
            "symbol": "IREDA",
            "title": "Bulk deal cluster — FIIs accumulating before Q4 results",
            "category": "BULK_DEAL",
            "urgency": "MEDIUM",
            "detail": "3 foreign institutional investors have bought ₹234 Cr worth of IREDA shares in March. Q4 results due in 3 weeks with analyst consensus EPS beat expected.",
            "data_points": ["₹234 Cr FII buying", "Q4 results in 21 days", "Analyst EPS est. ↑ 12%"],
            "back_tested_accuracy": 61,
            "potential_upside": "12-16%",
            "time_horizon": "1-3 months"
        },
        {
            "id": "opp_3",
            "symbol": "CESC",
            "title": "Promoter buying consistently for 4 quarters — below 52w high",
            "category": "PROMOTER_BUY",
            "urgency": "LOW",
            "detail": "CESC promoters have increased stake by 2.3% over 4 quarters. Stock is 34% below 52-week high with utility earnings stability.",
            "data_points": ["Promoter stake +2.3%", "34% below 52w high", "Dividend yield 3.2%"],
            "back_tested_accuracy": 58,
            "potential_upside": "25-35%",
            "time_horizon": "6-12 months"
        },
        {
            "id": "opp_4",
            "symbol": "ZYDUSLIFE",
            "title": "Management commentary shift — aggressive guidance upgrade",
            "category": "MGMT_COMMENTARY",
            "urgency": "HIGH",
            "detail": "Zydus Life Sciences Q3 concall showed language shift from 'steady growth' to 'accelerated expansion'. CEO mentioned US pipeline '3x stronger than last year'.",
            "data_points": ["Revenue guidance +28%", "US pipeline expanded", "EBITDA margin expansion expected"],
            "back_tested_accuracy": 68,
            "potential_upside": "20-30%",
            "time_horizon": "2-4 months"
        },
    ]

def mock_chart_patterns():
    return [
        {
            "symbol": "TITAN",
            "pattern": "Cup & Handle",
            "timeframe": "Weekly",
            "signal": "BUY",
            "confidence": 82,
            "target": 3890,
            "stop_loss": 3250,
            "current_price": 3445,
            "historical_success": 76,
            "description": "Classic cup and handle breakout forming after 14-week consolidation. Volume contraction in handle phase is textbook."
        },
        {
            "symbol": "AUROPHARMA",
            "pattern": "Inverse Head & Shoulders",
            "timeframe": "Daily",
            "signal": "BUY",
            "confidence": 78,
            "target": 1345,
            "stop_loss": 1050,
            "current_price": 1156,
            "historical_success": 71,
            "description": "Strong inverse H&S with neckline resistance at 1180. RSI divergence supports the reversal thesis."
        },
        {
            "symbol": "ONGC",
            "pattern": "Double Top",
            "timeframe": "Daily",
            "signal": "SELL",
            "confidence": 71,
            "target": 198,
            "stop_loss": 278,
            "current_price": 248,
            "historical_success": 68,
            "description": "Double top at 275-278 resistance zone confirmed. MACD bearish crossover adds conviction."
        },
        {
            "symbol": "NESTLEIND",
            "pattern": "Bull Flag",
            "timeframe": "Daily",
            "signal": "BUY",
            "confidence": 85,
            "target": 2780,
            "stop_loss": 2380,
            "current_price": 2456,
            "historical_success": 79,
            "description": "Tight bull flag after strong impulse move. Low volume flag phase followed by breakout bar."
        },
    ]

# ── API Routes ──────────────────────────────────────────────────────────────────

@app.get("/")
async def root():
    return {"status": "ET AI Investor API running", "version": "1.0.0"}

@app.get("/api/market/stocks")
async def get_stocks():
    return {"data": mock_stock_data(), "timestamp": datetime.now().isoformat()}

@app.get("/api/market/indices")
async def get_indices():
    indices = [
        {"name": "NIFTY 50", "value": 22456.80, "change": 0.68, "change_abs": 151.30},
        {"name": "SENSEX", "value": 73891.50, "change": 0.72, "change_abs": 527.40},
        {"name": "BANK NIFTY", "value": 48234.60, "change": -0.23, "change_abs": -111.20},
        {"name": "NIFTY IT", "value": 36789.30, "change": 1.45, "change_abs": 526.40},
        {"name": "NIFTY PHARMA", "value": 19234.50, "change": 0.89, "change_abs": 170.10},
    ]
    return {"data": indices, "timestamp": datetime.now().isoformat()}

@app.get("/api/signals/bulk-deals")
async def get_bulk_deals():
    return {"data": mock_bulk_deals(), "timestamp": datetime.now().isoformat()}

@app.get("/api/signals/insider-trades")
async def get_insider_trades():
    return {"data": mock_insider_trades(), "timestamp": datetime.now().isoformat()}

@app.get("/api/signals/opportunities")
async def get_opportunities():
    return {"data": mock_opportunities(), "timestamp": datetime.now().isoformat()}

@app.get("/api/patterns")
async def get_chart_patterns():
    return {"data": mock_chart_patterns(), "timestamp": datetime.now().isoformat()}

class ChatRequest(BaseModel):
    message: str
    portfolio: Optional[list] = []
    history: Optional[list] = []

@app.post("/api/chat")
async def market_chat(req: ChatRequest):
    if not ANTHROPIC_API_KEY:
        # Demo mode — return mock response
        return {
            "response": f"**Demo Mode** — Set ANTHROPIC_API_KEY for live AI.\n\nYou asked: *{req.message}*\n\nThis is where the AI would give you portfolio-aware analysis with live NSE data, bulk deal signals, and insider trade context.",
            "sources": ["NSE Filings", "ET Markets", "BSE Bulk Deals"]
        }

    system_prompt = """You are ET Markets AI — an expert Indian stock market analyst. You have access to:
- Live NSE/BSE data, bulk deals, insider trades
- Corporate filings and quarterly results
- Technical chart patterns across the NSE universe

Rules:
1. Always cite data sources (NSE, BSE, ET Markets, SEBI filings)
2. Give specific, actionable insights — not generic advice
3. Mention risk factors alongside every opportunity
4. Use Indian financial terminology (crore, lakh, BSE, NSE, SEBI, etc.)
5. Be concise but data-rich. Format responses with markdown.
6. Never give absolute buy/sell calls — frame as signals and analysis.

Market context: NSE NIFTY 50 at 22,456. Banking sector under pressure. IT showing strength."""

    messages = req.history[-6:] if req.history else []
    messages.append({"role": "user", "content": req.message})

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key": ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            json={
                "model": "claude-sonnet-4-20250514",
                "max_tokens": 1024,
                "system": system_prompt,
                "messages": messages,
            },
            timeout=30,
        )
        data = resp.json()
        reply = data["content"][0]["text"] if data.get("content") else "Error getting response."

    return {"response": reply, "sources": ["NSE", "ET Markets", "SEBI Filings"]}

class AnalyzeRequest(BaseModel):
    symbol: str
    opportunity_id: Optional[str] = None

@app.post("/api/analyze")
async def analyze_stock(req: AnalyzeRequest):
    opps = {o["id"]: o for o in mock_opportunities()}
    opp = opps.get(req.opportunity_id, {})

    if not ANTHROPIC_API_KEY:
        return {
            "analysis": f"**{req.symbol} — Deep Signal Analysis** *(Demo Mode)*\n\n**Signal Strength:** Strong Bullish\n\n**Key Catalysts:**\n- Institutional accumulation pattern detected\n- Promoter confidence signals\n- Technical setup aligned\n\n**Risk Factors:**\n- Market-wide correction risk\n- Sector headwinds possible\n\n*Set ANTHROPIC_API_KEY for live AI-powered analysis.*",
            "symbol": req.symbol
        }

    prompt = f"""Analyze {req.symbol} based on these signals:
{json.dumps(opp, indent=2)}

Provide:
1. Signal strength assessment (1-10)
2. Bull case (3 points)  
3. Bear case / risks (2 points)
4. Historical precedent for similar patterns
5. What to watch before entering

Keep it under 300 words. Be specific to Indian market context."""

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key": ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            json={
                "model": "claude-sonnet-4-20250514",
                "max_tokens": 512,
                "messages": [{"role": "user", "content": prompt}],
            },
            timeout=30,
        )
        data = resp.json()
        analysis = data["content"][0]["text"] if data.get("content") else "Analysis unavailable."

    return {"analysis": analysis, "symbol": req.symbol}
