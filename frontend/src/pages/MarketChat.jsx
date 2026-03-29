import { useState, useRef, useEffect } from "react";

const API = "http://localhost:8000";

const SUGGESTED = [
  "What's driving IT sector outperformance today?",
  "Analyze BHARTIARTL's bulk deal — institutional conviction or short-term play?",
  "Compare HDFC Bank vs ICICI Bank risk/reward at current levels",
  "Which sectors typically outperform when FII inflows are strong?",
  "What does the India VIX at 14 signal for the next 30 days?",
  "Explain the SEBI circular impact on F&O retail traders",
];

function MessageBubble({ msg }) {
  const isUser = msg.role === "user";

  function renderMarkdown(text) {
    return text
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/^### (.+)$/gm, "<h3 style='color:var(--accent);font-size:13px;margin:10px 0 6px;font-family:Syne,sans-serif'>$1</h3>")
      .replace(/^## (.+)$/gm, "<h2 style='font-family:Syne,sans-serif;margin:12px 0 8px'>$1</h2>")
      .replace(/^- (.+)$/gm, "<li>$1</li>")
      .replace(/(<li>.*?<\/li>(\n<li>.*?<\/li>)*)/gs, "<ul style='padding-left:18px;margin:8px 0'>$1</ul>")
      .replace(/\n\n/g, "<br/>")
      .replace(/`([^`]+)`/g, "<code style='font-family:JetBrains Mono,monospace;font-size:12px;background:var(--bg4);padding:1px 6px;border-radius:4px;color:var(--accent)'>$1</code>");
  }

  return (
    <div style={{
      display: "flex",
      justifyContent: isUser ? "flex-end" : "flex-start",
      marginBottom: 16,
      animation: "fadeInUp 0.3s ease",
    }}>
      {!isUser && (
        <div style={{
          width: 32, height: 32, borderRadius: "50%",
          background: "linear-gradient(135deg, var(--accent), var(--purple))",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, marginRight: 10, flexShrink: 0, marginTop: 2,
        }}>⬡</div>
      )}
      <div style={{
        maxWidth: "75%",
        padding: "12px 16px",
        borderRadius: isUser ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
        background: isUser ? "var(--accent2)" : "var(--surface)",
        border: `1px solid ${isUser ? "transparent" : "var(--border)"}`,
        fontSize: 13,
        lineHeight: 1.7,
      }}>
        {isUser ? (
          <span style={{ color: "white" }}>{msg.content}</span>
        ) : (
          <div
            className="markdown"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
          />
        )}

        {msg.sources && (
          <div style={{ marginTop: 10, paddingTop: 8, borderTop: "1px solid var(--border)", display: "flex", gap: 6, flexWrap: "wrap" }}>
            {msg.sources.map(s => (
              <span key={s} className="tag" style={{ fontSize: 9 }}>📊 {s}</span>
            ))}
          </div>
        )}
      </div>
      {isUser && (
        <div style={{
          width: 32, height: 32, borderRadius: "50%",
          background: "var(--bg4)",
          border: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, marginLeft: 10, flexShrink: 0, marginTop: 2, color: "var(--text2)",
        }}>U</div>
      )}
    </div>
  );
}

export default function MarketChat() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "**नमस्ते!** I'm your ET Markets AI analyst — trained on NSE data, corporate filings, bulk deals, and insider trade patterns.\n\nI give you **signal-level insights**, not generic advice. Ask me about specific stocks, sectors, patterns, or what the data is telling us today.\n\nWhat would you like to analyze?",
      sources: ["NSE", "BSE Bulk Deals", "SEBI Filings", "ET Markets"],
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(text) {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput("");

    const userMsg = { role: "user", content: msg };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    const history = messages.map(m => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch(`${API}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, history }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, {
        role: "assistant",
        content: data.response,
        sources: data.sources,
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "**Demo Mode** — I'm running without a live backend.\n\nTo enable AI responses, start the FastAPI backend and set your `ANTHROPIC_API_KEY`.\n\nIn a live demo, I'd analyze your question using NSE data, bulk deal feeds, and filing intelligence.",
        sources: ["Demo"],
      }]);
    }
    setLoading(false);
    inputRef.current?.focus();
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 100px)" }}>
      <div className="page-header" style={{ flexShrink: 0 }}>
        <div className="page-title">Market ChatGPT — Next Gen</div>
        <div className="page-sub">Portfolio-aware · Source-cited · Multi-step analysis · ET Markets depth</div>
      </div>

      {/* Suggestions (only show when empty) */}
      {messages.length <= 1 && (
        <div style={{ flexShrink: 0, marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: "var(--text3)", fontFamily: "JetBrains Mono, monospace", marginBottom: 8 }}>TRY ASKING</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {SUGGESTED.map(s => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                style={{
                  background: "var(--bg2)",
                  border: "1px solid var(--border)",
                  borderRadius: 20,
                  padding: "6px 12px",
                  fontSize: 12,
                  color: "var(--text2)",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  fontFamily: "DM Sans, sans-serif",
                }}
                onMouseEnter={e => { e.target.style.borderColor = "var(--accent)"; e.target.style.color = "var(--accent)"; }}
                onMouseLeave={e => { e.target.style.borderColor = "var(--border)"; e.target.style.color = "var(--text2)"; }}
              >{s}</button>
            ))}
          </div>
        </div>
      )}

      {/* Messages area */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: "8px 0",
        scrollbarWidth: "thin",
        scrollbarColor: "var(--border2) transparent",
      }}>
        <style>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>

        {messages.map((m, i) => (
          <MessageBubble key={i} msg={m} />
        ))}

        {loading && (
          <div style={{ display: "flex", gap: 10, alignItems: "center", padding: "8px 0" }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "linear-gradient(135deg, var(--accent), var(--purple))",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
            }}>⬡</div>
            <div style={{
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: "4px 16px 16px 16px", padding: "12px 16px",
              display: "flex", gap: 5, alignItems: "center",
            }}>
              {[0, 0.2, 0.4].map(d => (
                <div key={d} style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: "var(--accent)",
                  animation: "pulse 1.2s ease-in-out infinite",
                  animationDelay: `${d}s`,
                }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        flexShrink: 0,
        marginTop: 12,
        background: "var(--bg2)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "12px 14px",
        display: "flex",
        gap: 10,
        alignItems: "flex-end",
        transition: "border-color 0.2s",
      }}
        onFocus={() => {}}
      >
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask about any stock, sector, pattern, or market signal..."
          style={{
            flex: 1, background: "transparent", border: "none", outline: "none",
            color: "var(--text)", fontFamily: "DM Sans, sans-serif", fontSize: 14,
            resize: "none", lineHeight: 1.5, maxHeight: 120, overflow: "auto",
            scrollbarWidth: "none",
          }}
          rows={1}
          onInput={e => {
            e.target.style.height = "auto";
            e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
          }}
        />
        <button
          className="btn btn-primary"
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
          style={{ padding: "8px 16px", opacity: (!input.trim() || loading) ? 0.5 : 1 }}
        >
          {loading ? "..." : "Send ↵"}
        </button>
      </div>
      <div style={{ fontSize: 10, color: "var(--text3)", textAlign: "center", marginTop: 6, fontFamily: "JetBrains Mono, monospace" }}>
        Not investment advice · Verify with SEBI-registered advisor · Data sources: NSE, BSE, SEBI
      </div>
    </div>
  );
}
