import { useState, useEffect } from "react";

const API = "http://localhost:8000";

const MOCK_STOCKS = [
  { symbol: "RELIANCE", name: "Reliance Industries", sector: "Energy", price: 2456.30, change: 1.24, volume: 2340000, pe: 24.5 },
  { symbol: "TCS", name: "Tata Consultancy Services", sector: "IT", price: 3890.50, change: 2.18, volume: 890000, pe: 31.2 },
  { symbol: "HDFCBANK", name: "HDFC Bank", sector: "Banking", price: 1678.25, change: -0.45, volume: 3120000, pe: 18.7 },
  { symbol: "INFY", name: "Infosys", sector: "IT", price: 1456.80, change: 1.87, volume: 1450000, pe: 27.3 },
  { symbol: "ICICIBANK", name: "ICICI Bank", sector: "Banking", price: 1123.45, change: 0.63, volume: 2890000, pe: 16.4 },
  { symbol: "HINDUNILVR", name: "Hindustan Unilever", sector: "FMCG", price: 2345.60, change: -0.92, volume: 450000, pe: 58.1 },
  { symbol: "SBIN", name: "State Bank of India", sector: "Banking", price: 623.40, change: -1.23, volume: 5670000, pe: 9.8 },
  { symbol: "BHARTIARTL", name: "Bharti Airtel", sector: "Telecom", price: 1890.30, change: 3.45, volume: 1230000, pe: 89.2 },
];

const SECTOR_HEATMAP = [
  { name: "IT", change: 1.84, stocks: ["TCS", "INFY", "WIPRO", "HCL"] },
  { name: "Banking", change: -0.34, stocks: ["HDFC", "ICICI", "SBI", "KOTAK"] },
  { name: "Energy", change: 0.92, stocks: ["RELIANCE", "ONGC", "BPCL"] },
  { name: "FMCG", change: -0.21, stocks: ["HUL", "ITC", "NESTLE"] },
  { name: "Pharma", change: 1.45, stocks: ["SUNPHARMA", "DRREDDY", "CIPLA"] },
  { name: "Auto", change: 0.67, stocks: ["MARUTI", "TATAMOTORS", "M&M"] },
  { name: "Telecom", change: 2.11, stocks: ["AIRTEL", "JIO"] },
  { name: "Metals", change: -1.56, stocks: ["TATASTEEL", "JSWSTEEL"] },
];

const FII_DII = [
  { date: "28 Mar", fii: 1240, dii: -450 },
  { date: "27 Mar", fii: -890, dii: 1120 },
  { date: "26 Mar", fii: 2340, dii: 890 },
  { date: "25 Mar", fii: -1560, dii: 2100 },
  { date: "24 Mar", fii: 560, dii: -230 },
];

export default function Dashboard() {
  const [stocks, setStocks] = useState(MOCK_STOCKS);
  const [loading, setLoading] = useState(false);
  const [sort, setSort] = useState({ key: "change", dir: -1 });

  useEffect(() => {
    fetch(`${API}/api/market/stocks`)
      .then(r => r.json())
      .then(d => setStocks(d.data))
      .catch(() => {});
  }, []);

  const sorted = [...stocks].sort((a, b) =>
    sort.dir * ((a[sort.key] ?? 0) > (b[sort.key] ?? 0) ? 1 : -1)
  );

  function toggleSort(key) {
    setSort(s => ({ key, dir: s.key === key ? -s.dir : -1 }));
  }

  const totalFIIBuy = FII_DII.filter(d => d.fii > 0).reduce((a, d) => a + d.fii, 0);
  const totalFIISell = FII_DII.filter(d => d.fii < 0).reduce((a, d) => a + Math.abs(d.fii), 0);

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Market Dashboard</div>
        <div className="page-sub">NSE · BSE · Real-time · {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</div>
      </div>

      {/* Sector Heatmap */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-title">Sector Heatmap</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {SECTOR_HEATMAP.map(s => (
            <div
              key={s.name}
              style={{
                flex: "1 1 100px",
                minWidth: 80,
                padding: "10px 12px",
                borderRadius: 8,
                background: s.change >= 0
                  ? `rgba(0,230,118,${Math.min(0.05 + Math.abs(s.change) * 0.08, 0.25)})`
                  : `rgba(255,82,82,${Math.min(0.05 + Math.abs(s.change) * 0.08, 0.25)})`,
                border: `1px solid ${s.change >= 0 ? "rgba(0,230,118,0.2)" : "rgba(255,82,82,0.2)"}`,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13 }}>{s.name}</div>
              <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 14, fontWeight: 500, marginTop: 2 }}
                className={s.change >= 0 ? "pos" : "neg"}>
                {s.change >= 0 ? "+" : ""}{s.change}%
              </div>
              <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 4 }}>{s.stocks.slice(0, 2).join(", ")}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 16 }}>
        {/* FII/DII Flow */}
        <div className="card">
          <div className="card-title">FII / DII Flow — Last 5 Sessions (₹ Cr)</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {FII_DII.map(d => (
              <div key={d.date} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: "var(--text3)", width: 46 }}>{d.date}</span>
                <div style={{ flex: 1, position: "relative", height: 22 }}>
                  {/* FII bar */}
                  <div style={{
                    position: "absolute",
                    height: 9, top: 0,
                    background: d.fii >= 0 ? "var(--green)" : "var(--red)",
                    opacity: 0.7,
                    borderRadius: 3,
                    width: `${Math.min(Math.abs(d.fii) / 30, 100)}%`,
                    left: d.fii >= 0 ? "50%" : `calc(50% - ${Math.min(Math.abs(d.fii) / 30, 100)}%)`,
                  }} />
                  {/* DII bar */}
                  <div style={{
                    position: "absolute",
                    height: 9, bottom: 0,
                    background: d.dii >= 0 ? "rgba(0,212,255,0.7)" : "rgba(255,152,0,0.7)",
                    opacity: 0.7,
                    borderRadius: 3,
                    width: `${Math.min(Math.abs(d.dii) / 30, 100)}%`,
                    left: d.dii >= 0 ? "50%" : `calc(50% - ${Math.min(Math.abs(d.dii) / 30, 100)}%)`,
                  }} />
                  <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, background: "var(--border2)" }} />
                </div>
                <div style={{ display: "flex", gap: 8, fontSize: 11, fontFamily: "JetBrains Mono, monospace", minWidth: 140, justifyContent: "flex-end" }}>
                  <span className={d.fii >= 0 ? "pos" : "neg"}>FII {d.fii >= 0 ? "+" : ""}{d.fii}</span>
                  <span className={d.dii >= 0 ? "pos" : "neg"} style={{ color: d.dii >= 0 ? "var(--accent)" : "var(--orange)" }}>DII {d.dii >= 0 ? "+" : ""}{d.dii}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
            <div>
              <div style={{ fontSize: 10, color: "var(--text3)", fontFamily: "JetBrains Mono, monospace" }}>FII NET (5D)</div>
              <div className={totalFIIBuy > totalFIISell ? "pos" : "neg"} style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 14, fontWeight: 500, marginTop: 2 }}>
                ₹{(totalFIIBuy - totalFIISell).toLocaleString("en-IN")} Cr
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="card">
          <div className="card-title">Market Pulse</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              { label: "Advances", value: "1,423", color: "var(--green)" },
              { label: "Declines", value: "867", color: "var(--red)" },
              { label: "Unchanged", value: "134", color: "var(--text3)" },
              { label: "52W Highs", value: "89", color: "var(--gold)" },
              { label: "52W Lows", value: "23", color: "var(--red)" },
              { label: "A:D Ratio", value: "1.64", color: "var(--green)" },
              { label: "Total Volume", value: "₹89,234 Cr", color: "var(--text)" },
              { label: "VIX", value: "14.23 ▼", color: "var(--green)" },
            ].map(s => (
              <div key={s.label} style={{ background: "var(--bg3)", borderRadius: 6, padding: "10px 12px" }}>
                <div style={{ fontSize: 10, color: "var(--text3)", fontFamily: "JetBrains Mono, monospace" }}>{s.label}</div>
                <div style={{ color: s.color, fontFamily: "JetBrains Mono, monospace", fontSize: 15, fontWeight: 500, marginTop: 3 }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stocks Table */}
      <div className="card">
        <div className="card-title">NSE Top Stocks</div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {[
                { key: "symbol", label: "Symbol" },
                { key: "sector", label: "Sector" },
                { key: "price", label: "Price" },
                { key: "change", label: "Change %" },
                { key: "volume", label: "Volume" },
                { key: "pe", label: "P/E" },
              ].map(col => (
                <th
                  key={col.key}
                  onClick={() => toggleSort(col.key)}
                  style={{
                    textAlign: "left", padding: "8px 10px",
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: 10, color: "var(--text3)",
                    cursor: "pointer", userSelect: "none",
                    letterSpacing: "0.5px", textTransform: "uppercase",
                  }}
                >
                  {col.label} {sort.key === col.key ? (sort.dir === 1 ? "↑" : "↓") : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((s, i) => (
              <tr
                key={s.symbol}
                style={{
                  borderBottom: "1px solid var(--border)",
                  cursor: "pointer",
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--bg4)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <td style={{ padding: "10px 10px" }}>
                  <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13 }}>{s.symbol}</div>
                  <div style={{ fontSize: 11, color: "var(--text3)" }}>{s.name}</div>
                </td>
                <td style={{ padding: "10px 10px" }}>
                  <span className="tag">{s.sector}</span>
                </td>
                <td style={{ padding: "10px 10px", fontFamily: "JetBrains Mono, monospace", fontSize: 13 }}>
                  ₹{s.price?.toLocaleString("en-IN")}
                </td>
                <td style={{ padding: "10px 10px" }}>
                  <span className={`badge ${s.change >= 0 ? "badge-green" : "badge-red"}`}>
                    {s.change >= 0 ? "▲" : "▼"} {Math.abs(s.change)}%
                  </span>
                </td>
                <td style={{ padding: "10px 10px", fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: "var(--text2)" }}>
                  {(s.volume / 1e6).toFixed(2)}M
                </td>
                <td style={{ padding: "10px 10px", fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: "var(--text2)" }}>
                  {s.pe}x
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
