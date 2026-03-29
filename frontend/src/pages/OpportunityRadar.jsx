import { useState, useEffect } from "react";

const API = "http://localhost:8000";

const MOCK_OPPS = [
  {
    id: "opp_1", symbol: "DIXON", urgency: "HIGH", category: "INSIDER_SIGNAL",
    title: "Insider accumulation spike — 3 directors bought in 7 days",
    detail: "Dixon Technologies saw 3 independent directors buy shares worth ₹12.4 Cr in the last week. Historically, similar patterns preceded 18–22% moves within 3-6 months.",
    data_points: ["3 directors purchased", "₹12.4 Cr total value", "All purchases above CMP"],
    back_tested_accuracy: 74, potential_upside: "18-22%", time_horizon: "3-6 months"
  },
  {
    id: "opp_2", symbol: "IREDA", urgency: "MEDIUM", category: "BULK_DEAL",
    title: "Bulk deal cluster — FIIs accumulating before Q4 results",
    detail: "3 foreign institutional investors have bought ₹234 Cr worth of IREDA shares in March. Q4 results due in 3 weeks with analyst consensus EPS beat expected at +12%.",
    data_points: ["₹234 Cr FII buying", "Q4 results in 21 days", "Analyst EPS est. ↑ 12%"],
    back_tested_accuracy: 61, potential_upside: "12-16%", time_horizon: "1-3 months"
  },
  {
    id: "opp_3", symbol: "CESC", urgency: "LOW", category: "PROMOTER_BUY",
    title: "Promoter buying consistently for 4 quarters — below 52w high",
    detail: "CESC promoters have increased stake by 2.3% over 4 quarters. Stock is 34% below its 52-week high with stable utility earnings and 3.2% dividend yield.",
    data_points: ["Promoter stake +2.3%", "34% below 52w high", "Dividend yield 3.2%"],
    back_tested_accuracy: 58, potential_upside: "25-35%", time_horizon: "6-12 months"
  },
  {
    id: "opp_4", symbol: "ZYDUSLIFE", urgency: "HIGH", category: "MGMT_COMMENTARY",
    title: "Management commentary shift — aggressive guidance upgrade",
    detail: "Zydus Life Sciences Q3 concall showed language shift from 'steady growth' to 'accelerated expansion'. CEO mentioned US pipeline '3x stronger than last year'.",
    data_points: ["Revenue guidance +28%", "US pipeline expanded", "EBITDA margin expansion expected"],
    back_tested_accuracy: 68, potential_upside: "20-30%", time_horizon: "2-4 months"
  },
];

const BULK_DEALS = [
  { date: "28 Mar", symbol: "ZOMATO", client: "Goldman Sachs", type: "BUY", quantity: "25L", price: 234.50, value: "₹58.6 Cr" },
  { date: "28 Mar", symbol: "PAYTM", client: "Morgan Stanley", type: "SELL", quantity: "18L", price: 456.20, value: "₹82.1 Cr" },
  { date: "27 Mar", symbol: "ADANIENT", client: "Blackrock", type: "BUY", quantity: "32L", price: 2345, value: "₹750.4 Cr" },
  { date: "27 Mar", symbol: "IRFC", client: "LIC", type: "BUY", quantity: "50L", price: 189.30, value: "₹94.65 Cr" },
  { date: "26 Mar", symbol: "NYKAA", client: "Fidelity", type: "SELL", quantity: "9L", price: 178.40, value: "₹16.1 Cr" },
];

const INSIDER = [
  { date: "28 Mar", symbol: "WIPRO", person: "Rishad Premji", role: "Chairman", type: "BUY", value: "₹25.6 Cr", signal: "BULLISH" },
  { date: "27 Mar", symbol: "BAJFINANCE", person: "Sanjiv Bajaj", role: "MD & CEO", type: "SELL", value: "₹136.2 Cr", signal: "BEARISH" },
  { date: "26 Mar", symbol: "HCLTECH", person: "Roshni Nadar", role: "Chairperson", type: "BUY", value: "₹91.5 Cr", signal: "BULLISH" },
  { date: "25 Mar", symbol: "ULTRACEMCO", person: "K K Maheshwari", role: "MD", type: "BUY", value: "₹82.3 Cr", signal: "BULLISH" },
];

const CAT_LABELS = {
  INSIDER_SIGNAL: { label: "Insider Signal", color: "badge-purple" },
  BULK_DEAL: { label: "Bulk Deal", color: "badge-blue" },
  PROMOTER_BUY: { label: "Promoter Buy", color: "badge-gold" },
  MGMT_COMMENTARY: { label: "Mgmt Signal", color: "badge-green" },
};

const URGENCY_COLORS = {
  HIGH: { bg: "rgba(255,82,82,0.08)", border: "rgba(255,82,82,0.3)", dot: "var(--red)" },
  MEDIUM: { bg: "rgba(240,180,41,0.08)", border: "rgba(240,180,41,0.3)", dot: "var(--gold)" },
  LOW: { bg: "rgba(0,212,255,0.06)", border: "rgba(0,212,255,0.25)", dot: "var(--accent)" },
};

export default function OpportunityRadar() {
  const [opps, setOpps] = useState(MOCK_OPPS);
  const [selected, setSelected] = useState(null);
  const [analysis, setAnalysis] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [tab, setTab] = useState("opportunities");

  useEffect(() => {
    fetch(`${API}/api/signals/opportunities`)
      .then(r => r.json())
      .then(d => setOpps(d.data))
      .catch(() => {});
  }, []);

  async function analyzeOpp(opp) {
    setSelected(opp);
    setAnalysis("");
    setAnalyzing(true);
    try {
      const res = await fetch(`${API}/api/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol: opp.symbol, opportunity_id: opp.id }),
      });
      const data = await res.json();
      setAnalysis(data.analysis);
    } catch {
      setAnalysis("**Demo Mode** — Analysis would appear here with Anthropic API key.\n\n**Signal Strength:** 8/10\n\n**Bull Case:**\n- Strong institutional buying pattern\n- Management confidence evident\n- Technical setup aligned\n\n**Risk Factors:**\n- Broad market correction risk\n- Sector-specific headwinds");
    }
    setAnalyzing(false);
  }

  function renderMarkdown(text) {
    return text
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/^### (.+)$/gm, "<h3>$1</h3>")
      .replace(/^## (.+)$/gm, "<h2>$1</h2>")
      .replace(/^# (.+)$/gm, "<h1>$1</h1>")
      .replace(/^- (.+)$/gm, "<li>$1</li>")
      .replace(/(<li>.*<\/li>)/gs, "<ul>$1</ul>")
      .replace(/\n\n/g, "<br/><br/>");
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Opportunity Radar</div>
        <div className="page-sub">Signal finder — not a summarizer · Powered by Claude AI</div>
      </div>

      {/* Tab switcher */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {[
          { id: "opportunities", label: "AI Signals" },
          { id: "bulk", label: "Bulk Deals" },
          { id: "insider", label: "Insider Trades" },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`btn ${tab === t.id ? "btn-primary" : "btn-ghost"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "opportunities" && (
        <div className="grid-2">
          {/* Left: Opportunity cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {opps.map(opp => {
              const uc = URGENCY_COLORS[opp.urgency];
              const cat = CAT_LABELS[opp.category];
              const isSelected = selected?.id === opp.id;
              return (
                <div
                  key={opp.id}
                  onClick={() => analyzeOpp(opp)}
                  style={{
                    background: isSelected ? "var(--bg4)" : "var(--bg2)",
                    border: `1px solid ${isSelected ? "var(--accent)" : uc.border}`,
                    borderRadius: 12,
                    padding: 18,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* Urgency strip */}
                  <div style={{
                    position: "absolute", top: 0, left: 0, right: 0, height: 3,
                    background: uc.dot, opacity: 0.6,
                  }} />

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{
                        fontFamily: "Syne, sans-serif", fontWeight: 800,
                        fontSize: 16, color: "var(--gold)"
                      }}>{opp.symbol}</span>
                      <span className={`badge ${cat.color}`}>{cat.label}</span>
                    </div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: uc.dot, display: "inline-block" }} />
                      <span style={{ fontSize: 10, color: "var(--text3)", fontFamily: "JetBrains Mono, monospace" }}>{opp.urgency}</span>
                    </div>
                  </div>

                  <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8, lineHeight: 1.4 }}>{opp.title}</div>

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                    {opp.data_points.map(dp => (
                      <span key={dp} className="tag" style={{ fontSize: 10 }}>{dp}</span>
                    ))}
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontSize: 10, color: "var(--text3)", fontFamily: "JetBrains Mono, monospace" }}>UPSIDE</div>
                      <div style={{ color: "var(--green)", fontFamily: "JetBrains Mono, monospace", fontWeight: 600, fontSize: 14 }}>{opp.potential_upside}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: "var(--text3)", fontFamily: "JetBrains Mono, monospace" }}>ACCURACY</div>
                      <div style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 600, fontSize: 14 }}>
                        <span style={{ color: opp.back_tested_accuracy >= 70 ? "var(--green)" : "var(--gold)" }}>
                          {opp.back_tested_accuracy}%
                        </span>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: "var(--text3)", fontFamily: "JetBrains Mono, monospace" }}>HORIZON</div>
                      <div style={{ color: "var(--accent)", fontFamily: "JetBrains Mono, monospace", fontSize: 12 }}>{opp.time_horizon}</div>
                    </div>
                    <button className="btn btn-primary" style={{ fontSize: 11, padding: "5px 10px" }}
                      onClick={e => { e.stopPropagation(); analyzeOpp(opp); }}>
                      Analyze ⟶
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: AI analysis panel */}
          <div className="card" style={{ position: "sticky", top: 0, alignSelf: "flex-start" }}>
            {!selected ? (
              <div style={{ padding: "40px 20px", textAlign: "center" }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>◎</div>
                <div style={{ color: "var(--text3)", fontSize: 13 }}>Click any signal to run deep AI analysis</div>
                <div style={{ color: "var(--text3)", fontSize: 11, marginTop: 6, fontFamily: "JetBrains Mono, monospace" }}>
                  powered by claude ai · live nseindia data
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div>
                    <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 20, color: "var(--gold)" }}>
                      {selected.symbol}
                    </span>
                    <span style={{ fontSize: 12, color: "var(--text3)", marginLeft: 8 }}>AI Analysis</span>
                  </div>
                  <button className="btn btn-ghost" style={{ fontSize: 11 }} onClick={() => setSelected(null)}>✕</button>
                </div>

                {/* Accuracy meter */}
                <div style={{ marginBottom: 16, padding: 12, background: "var(--bg3)", borderRadius: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 10, color: "var(--text3)", fontFamily: "JetBrains Mono, monospace" }}>BACK-TESTED ACCURACY</span>
                    <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: "var(--green)" }}>{selected.back_tested_accuracy}%</span>
                  </div>
                  <div style={{ height: 4, background: "var(--border)", borderRadius: 2 }}>
                    <div style={{
                      height: "100%", borderRadius: 2,
                      width: `${selected.back_tested_accuracy}%`,
                      background: selected.back_tested_accuracy >= 70 ? "var(--green)" : "var(--gold)",
                      transition: "width 0.6s ease",
                    }} />
                  </div>
                </div>

                {analyzing ? (
                  <div className="loading"><div className="spinner" /> Analyzing with Claude AI...</div>
                ) : (
                  <div
                    className="markdown"
                    style={{ fontSize: 13, lineHeight: 1.7 }}
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(analysis) }}
                  />
                )}

                <div style={{ marginTop: 16, padding: 10, background: "var(--bg3)", borderRadius: 6, fontSize: 10, color: "var(--text3)", fontFamily: "JetBrains Mono, monospace" }}>
                  ⚠ Not investment advice. Always verify with your advisor.
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "bulk" && (
        <div className="card">
          <div className="card-title">Bulk & Block Deals — Last 5 Sessions</div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Date", "Symbol", "Client", "Type", "Qty", "Price", "Value"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "8px 10px", fontSize: 10, fontFamily: "JetBrains Mono, monospace", color: "var(--text3)", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {BULK_DEALS.map((d, i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}
                  onMouseEnter={e => e.currentTarget.style.background = "var(--bg4)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "10px", fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: "var(--text3)" }}>{d.date}</td>
                  <td style={{ padding: "10px", fontFamily: "Syne, sans-serif", fontWeight: 700, color: "var(--gold)" }}>{d.symbol}</td>
                  <td style={{ padding: "10px", fontSize: 12 }}>{d.client}</td>
                  <td style={{ padding: "10px" }}>
                    <span className={`badge ${d.type === "BUY" ? "badge-green" : "badge-red"}`}>{d.type}</span>
                  </td>
                  <td style={{ padding: "10px", fontFamily: "JetBrains Mono, monospace", fontSize: 12 }}>{d.quantity}</td>
                  <td style={{ padding: "10px", fontFamily: "JetBrains Mono, monospace", fontSize: 12 }}>₹{d.price}</td>
                  <td style={{ padding: "10px", fontFamily: "JetBrains Mono, monospace", fontSize: 12, fontWeight: 500 }}>{d.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "insider" && (
        <div className="card">
          <div className="card-title">Insider & Promoter Trades</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {INSIDER.map((d, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "14px 16px", background: "var(--bg3)", borderRadius: 8,
                border: `1px solid ${d.signal === "BULLISH" ? "rgba(0,230,118,0.15)" : "rgba(255,82,82,0.15)"}`,
              }}>
                <div>
                  <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 16, color: "var(--gold)", marginRight: 10 }}>{d.symbol}</span>
                  <span className={`badge ${d.signal === "BULLISH" ? "badge-green" : "badge-red"}`}>{d.signal}</span>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 12, fontWeight: 500 }}>{d.person}</div>
                  <div style={{ fontSize: 11, color: "var(--text3)" }}>{d.role}</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <span className={`badge ${d.type === "BUY" ? "badge-green" : "badge-red"}`}>{d.type}</span>
                </div>
                <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 14, fontWeight: 500 }}>{d.value}</div>
                <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: "var(--text3)" }}>{d.date}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
