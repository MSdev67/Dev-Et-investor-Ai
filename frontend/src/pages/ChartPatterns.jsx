import { useState, useEffect } from "react";

const API = "http://localhost:8000";

const MOCK_PATTERNS = [
  {
    symbol: "TITAN", pattern: "Cup & Handle", timeframe: "Weekly", signal: "BUY",
    confidence: 82, target: 3890, stop_loss: 3250, current_price: 3445,
    historical_success: 76,
    description: "Classic cup and handle breakout forming after 14-week consolidation. Volume contraction in handle phase is textbook. Neckline at 3520 is the key level to watch."
  },
  {
    symbol: "AUROPHARMA", pattern: "Inv. Head & Shoulders", timeframe: "Daily", signal: "BUY",
    confidence: 78, target: 1345, stop_loss: 1050, current_price: 1156,
    historical_success: 71,
    description: "Strong inverse H&S with neckline resistance at 1180. RSI divergence on daily and weekly supports the reversal thesis. Volume on right shoulder declining — bullish."
  },
  {
    symbol: "ONGC", pattern: "Double Top", timeframe: "Daily", signal: "SELL",
    confidence: 71, target: 198, stop_loss: 278, current_price: 248,
    historical_success: 68,
    description: "Double top at 275-278 resistance zone confirmed with bearish MACD crossover. Measured target at 198 based on pattern height. Stop above 280."
  },
  {
    symbol: "NESTLEIND", pattern: "Bull Flag", timeframe: "Daily", signal: "BUY",
    confidence: 85, target: 2780, stop_loss: 2380, current_price: 2456,
    historical_success: 79,
    description: "Tight bull flag after strong impulse move of 18% in 3 weeks. Low volume flag phase followed by high-volume breakout bar yesterday. Risk:reward = 1:2.8."
  },
  {
    symbol: "TATASTEEL", pattern: "Descending Triangle", timeframe: "Weekly", signal: "SELL",
    confidence: 65, target: 118, stop_loss: 148, current_price: 134,
    historical_success: 62,
    description: "Descending triangle with flat support at 128 and declining highs. Three touches on support — watch for breakdown. Sector headwinds from China steel oversupply."
  },
  {
    symbol: "POLYCAB", pattern: "Breakout Retest", timeframe: "Daily", signal: "BUY",
    confidence: 88, target: 6800, stop_loss: 5450, current_price: 5890,
    historical_success: 81,
    description: "Polycab broke out of a 9-month base at 5600 and is now retesting the breakout level. This is a textbook entry — tight stop, high probability continuation."
  },
];

function MiniChart({ signal, confidence, target, stop_loss, current }) {
  const isLong = signal === "BUY";
  const rr = isLong
    ? ((target - current) / (current - stop_loss)).toFixed(1)
    : ((current - target) / (stop_loss - current)).toFixed(1);

  const pct = isLong
    ? ((target - current) / current * 100).toFixed(1)
    : ((current - target) / current * 100).toFixed(1);

  return (
    <div style={{ background: "var(--bg3)", borderRadius: 8, padding: 14 }}>
      {/* Price levels visual */}
      <div style={{ display: "flex", alignItems: "stretch", gap: 0, height: 90, marginBottom: 12 }}>
        {/* Bar */}
        <div style={{ width: 24, display: "flex", flexDirection: "column", alignItems: "center", gap: 0, marginRight: 12 }}>
          <div style={{ flex: 1, width: 6, background: isLong ? "rgba(0,230,118,0.25)" : "rgba(255,82,82,0.25)", borderRadius: "3px 3px 0 0", position: "relative" }}>
            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0,
              background: isLong ? "var(--green)" : "var(--red)",
              height: `${confidence}%`,
              borderRadius: "3px 3px 0 0",
              opacity: 0.7,
            }} />
          </div>
          <div style={{ width: 12, height: 2, background: "var(--accent)", marginTop: 2 }} />
          <div style={{ flex: 0.3, width: 6, background: "rgba(255,82,82,0.25)", borderRadius: "0 0 3px 3px" }} />
        </div>
        {/* Labels */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 10, color: "var(--text3)", fontFamily: "JetBrains Mono, monospace" }}>TARGET</span>
            <span style={{ fontFamily: "JetBrains Mono, monospace", color: "var(--green)", fontSize: 13, fontWeight: 500 }}>₹{target.toLocaleString("en-IN")}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 10, color: "var(--accent)", fontFamily: "JetBrains Mono, monospace" }}>CMP</span>
            <span style={{ fontFamily: "JetBrains Mono, monospace", color: "var(--accent)", fontSize: 14, fontWeight: 600 }}>₹{current.toLocaleString("en-IN")}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 10, color: "var(--text3)", fontFamily: "JetBrains Mono, monospace" }}>STOP</span>
            <span style={{ fontFamily: "JetBrains Mono, monospace", color: "var(--red)", fontSize: 13, fontWeight: 500 }}>₹{stop_loss.toLocaleString("en-IN")}</span>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 9, color: "var(--text3)", fontFamily: "JetBrains Mono, monospace" }}>POTENTIAL</div>
          <div style={{ color: isLong ? "var(--green)" : "var(--red)", fontFamily: "JetBrains Mono, monospace", fontWeight: 600, fontSize: 13 }}>
            {isLong ? "+" : "-"}{pct}%
          </div>
        </div>
        <div>
          <div style={{ fontSize: 9, color: "var(--text3)", fontFamily: "JetBrains Mono, monospace" }}>R:R</div>
          <div style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 600, fontSize: 13, color: rr >= 2 ? "var(--green)" : "var(--gold)" }}>
            1:{rr}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 9, color: "var(--text3)", fontFamily: "JetBrains Mono, monospace" }}>SUCCESS</div>
          <div style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 600, fontSize: 13, color: "var(--text2)" }}>
            {isLong ? "🟢" : "🔴"} 
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChartPatterns() {
  const [patterns, setPatterns] = useState(MOCK_PATTERNS);
  const [filter, setFilter] = useState("ALL");
  const [tfFilter, setTfFilter] = useState("ALL");

  useEffect(() => {
    fetch(`${API}/api/patterns`)
      .then(r => r.json())
      .then(d => setPatterns(d.data))
      .catch(() => {});
  }, []);

  const filtered = patterns.filter(p => {
    if (filter !== "ALL" && p.signal !== filter) return false;
    if (tfFilter !== "ALL" && p.timeframe !== tfFilter) return false;
    return true;
  });

  const buyCount = patterns.filter(p => p.signal === "BUY").length;
  const sellCount = patterns.filter(p => p.signal === "SELL").length;
  const avgConf = Math.round(patterns.reduce((a, p) => a + p.confidence, 0) / patterns.length);

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Chart Pattern Intelligence</div>
        <div className="page-sub">Real-time pattern detection · NSE universe · Back-tested success rates</div>
      </div>

      {/* Summary stats */}
      <div className="grid-4" style={{ marginBottom: 20 }}>
        {[
          { label: "Patterns Found", value: patterns.length, color: "var(--accent)" },
          { label: "Buy Signals", value: buyCount, color: "var(--green)" },
          { label: "Sell Signals", value: sellCount, color: "var(--red)" },
          { label: "Avg Confidence", value: `${avgConf}%`, color: "var(--gold)" },
        ].map(s => (
          <div key={s.label} className="card" style={{ textAlign: "center" }}>
            <div style={{ color: s.color, fontFamily: "JetBrains Mono, monospace", fontSize: 28, fontWeight: 700 }}>{s.value}</div>
            <div style={{ fontSize: 10, color: "var(--text3)", fontFamily: "JetBrains Mono, monospace", marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {["ALL", "BUY", "SELL"].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`btn ${filter === f ? "btn-primary" : "btn-ghost"}`} style={{ fontSize: 12 }}>
            {f}
          </button>
        ))}
        <div style={{ width: 1, background: "var(--border)", margin: "0 4px" }} />
        {["ALL", "Daily", "Weekly"].map(f => (
          <button key={f} onClick={() => setTfFilter(f)} className={`btn ${tfFilter === f ? "btn-primary" : "btn-ghost"}`} style={{ fontSize: 12 }}>
            {f}
          </button>
        ))}
      </div>

      {/* Pattern grid */}
      <div className="grid-2">
        {filtered.map(p => (
          <div key={p.symbol} className="card" style={{
            borderColor: p.signal === "BUY" ? "rgba(0,230,118,0.2)" : "rgba(255,82,82,0.2)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
              <div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 18, color: "var(--gold)" }}>{p.symbol}</span>
                  <span className={`badge ${p.signal === "BUY" ? "badge-green" : "badge-red"}`}>{p.signal}</span>
                </div>
                <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 13, color: "var(--accent)", fontWeight: 500 }}>{p.pattern}</div>
                <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2 }}>{p.timeframe} chart</div>
              </div>
              {/* Confidence ring */}
              <div style={{ textAlign: "center" }}>
                <div style={{ position: "relative", width: 52, height: 52 }}>
                  <svg width="52" height="52" viewBox="0 0 52 52">
                    <circle cx="26" cy="26" r="22" fill="none" stroke="var(--border)" strokeWidth="3" />
                    <circle cx="26" cy="26" r="22" fill="none"
                      stroke={p.signal === "BUY" ? "var(--green)" : "var(--red)"}
                      strokeWidth="3"
                      strokeDasharray={`${p.confidence * 1.38} 138`}
                      strokeLinecap="round"
                      transform="rotate(-90 26 26)"
                    />
                    <text x="26" y="26" textAnchor="middle" dominantBaseline="central"
                      style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, fontWeight: 700, fill: "var(--text)" }}>
                      {p.confidence}%
                    </text>
                  </svg>
                </div>
                <div style={{ fontSize: 9, color: "var(--text3)", fontFamily: "JetBrains Mono, monospace" }}>CONF.</div>
              </div>
            </div>

            {/* Chart levels visual */}
            <MiniChart
              signal={p.signal}
              confidence={p.confidence}
              target={p.target}
              stop_loss={p.stop_loss}
              current={p.current_price}
            />

            <div style={{ marginTop: 12, fontSize: 12, color: "var(--text2)", lineHeight: 1.6 }}>
              {p.description}
            </div>

            {/* Historical success bar */}
            <div style={{ marginTop: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 10, color: "var(--text3)", fontFamily: "JetBrains Mono, monospace" }}>
                  HISTORICAL SUCCESS RATE — {p.pattern.toUpperCase()}
                </span>
                <span style={{ fontSize: 10, fontFamily: "JetBrains Mono, monospace", color: "var(--text2)" }}>{p.historical_success}%</span>
              </div>
              <div style={{ height: 3, background: "var(--border)", borderRadius: 2 }}>
                <div style={{
                  height: "100%", borderRadius: 2,
                  width: `${p.historical_success}%`,
                  background: p.historical_success >= 75 ? "var(--green)" : p.historical_success >= 65 ? "var(--gold)" : "var(--red)",
                  transition: "width 0.8s ease",
                }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="loading">No patterns match current filters</div>
      )}
    </div>
  );
}
