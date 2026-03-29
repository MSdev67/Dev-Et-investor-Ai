import { useState, useEffect } from "react";
import Dashboard from "./pages/Dashboard";
import OpportunityRadar from "./pages/OpportunityRadar";
import ChartPatterns from "./pages/ChartPatterns";
import MarketChat from "./pages/MarketChat";
import "./App.css";

const PAGES = ["Dashboard", "Opportunity Radar", "Chart Patterns", "Market Chat"];

export default function App() {
  const [page, setPage] = useState("Dashboard");
  const [indices, setIndices] = useState([]);
  const [marketOpen, setMarketOpen] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/api/market/indices")
      .then(r => r.json())
      .then(d => setIndices(d.data))
      .catch(() => {
        setIndices([
          { name: "NIFTY 50", value: 22456.80, change: 0.68, change_abs: 151.30 },
          { name: "SENSEX", value: 73891.50, change: 0.72, change_abs: 527.40 },
          { name: "BANK NIFTY", value: 48234.60, change: -0.23, change_abs: -111.20 },
          { name: "NIFTY IT", value: 36789.30, change: 1.45, change_abs: 526.40 },
        ]);
      });
  }, []);

  return (
    <div className="app">
      {/* Top bar */}
      <header className="topbar">
        <div className="topbar-left">
          <div className="logo">
            <span className="logo-et">ET</span>
            <span className="logo-ai">AI</span>
            <span className="logo-tag">Investor Intelligence</span>
          </div>
          <div className="market-status">
            <span className={`status-dot ${marketOpen ? "open" : "closed"}`}></span>
            <span>{marketOpen ? "Market Open" : "Market Closed"}</span>
          </div>
        </div>

        <div className="indices-ticker">
          {indices.map(idx => (
            <div key={idx.name} className="ticker-item">
              <span className="ticker-name">{idx.name}</span>
              <span className="ticker-value">{idx.value?.toLocaleString("en-IN")}</span>
              <span className={`ticker-change ${idx.change >= 0 ? "pos" : "neg"}`}>
                {idx.change >= 0 ? "▲" : "▼"} {Math.abs(idx.change)}%
              </span>
            </div>
          ))}
        </div>

        <div className="topbar-right">
          <span className="live-badge">● LIVE</span>
        </div>
      </header>

      {/* Nav */}
      <nav className="sidenav">
        {PAGES.map(p => (
          <button
            key={p}
            className={`nav-btn ${page === p ? "active" : ""}`}
            onClick={() => setPage(p)}
          >
            <span className="nav-icon">{navIcon(p)}</span>
            <span className="nav-label">{p}</span>
          </button>
        ))}
        <div className="nav-footer">
          <div className="api-badge">
            <span>Powered by</span>
            <strong>MSDEV</strong>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="content">
        {page === "Dashboard" && <Dashboard />}
        {page === "Opportunity Radar" && <OpportunityRadar />}
        {page === "Chart Patterns" && <ChartPatterns />}
        {page === "Market Chat" && <MarketChat />}
      </main>
    </div>
  );
}

function navIcon(page) {
  const icons = {
    "Dashboard": "◈",
    "Opportunity Radar": "◎",
    "Chart Patterns": "⟋",
    "Market Chat": "⬡",
  };
  return icons[page] || "○";
}
