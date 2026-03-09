
"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [mode, setMode] = useState("sales");
  const [text, setText] = useState("");

  const [city, setCity] = useState("Tallinn / Cork");
  const [style, setStyle] = useState("Warm documentary family photography, natural light, no stiff posing");
  const [price, setPrice] = useState("200€/hour");
  const [tone, setTone] = useState("Calm, confident, warm, human. Short sentences. No pushy sales.");
  const [languageMode, setLanguageMode] = useState("auto");

  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [savedReplies, setSavedReplies] = useState<any[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem("photoos_saved_replies");
    if (raw) {
      try {
        setSavedReplies(JSON.parse(raw));
      } catch {
        setSavedReplies([]);
      }
    }
  }, []);

  function persistReplies(nextReplies: any[]) {
    setSavedReplies(nextReplies);
    localStorage.setItem("photoos_saved_replies", JSON.stringify(nextReplies));
  }

  function saveCurrentReply() {
    if (!result || mode !== "sales") return;

    const item = {
      id: Date.now(),
      savedAt: new Date().toLocaleString(),
      sourceText: text,
      objection_type: result.objection_type,
      tone: result.tone,
      strategy: result.strategy,
      risk: result.risk,
      reply_short: result.reply_short,
      reply_long: result.reply_long,
      insight: result.insight,
    };

    const nextReplies = [item, ...savedReplies];
    persistReplies(nextReplies);
  }

  function deleteSavedReply(id: number) {
    const nextReplies = savedReplies.filter((item) => item.id !== id);
    persistReplies(nextReplies);
  }

  async function analyze() {
    setLoading(true);
    setResult(null);
    setError("");

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          text,
          photographer: { city, style, price, tone, languageMode },
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.details || data?.error || `HTTP ${res.status}`);
      setResult(data);
    } catch (e: any) {
      setError(e.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 1100, margin: "40px auto", padding: 16, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>PhotoOS AI</h1>
      <p style={{ opacity: 0.8 }}>
        Sales Brain + Client Insight for photographers.
      </p>

      <div style={{ marginTop: 16 }}>
        <label style={{ fontWeight: 600 }}>Mode</label>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          style={{ display: "block", marginTop: 6, padding: 10, borderRadius: 10, border: "1px solid #ccc" }}
        >
          <option value="sales">Sales Brain</option>
          <option value="insight">Client Insight</option>
        </select>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16 }}>
        <div>
          <label style={{ fontWeight: 600 }}>City / Market</label>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            style={{ width: "100%", marginTop: 6, padding: 10, borderRadius: 10, border: "1px solid #ccc" }}
          />
        </div>

        <div>
          <label style={{ fontWeight: 600 }}>Price</label>
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            style={{ width: "100%", marginTop: 6, padding: 10, borderRadius: 10, border: "1px solid #ccc" }}
          />
        </div>

        <div style={{ gridColumn: "1 / -1" }}>
          <label style={{ fontWeight: 600 }}>Style</label>
          <input
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            style={{ width: "100%", marginTop: 6, padding: 10, borderRadius: 10, border: "1px solid #ccc" }}
          />
        </div>

        <div style={{ gridColumn: "1 / -1" }}>
          <label style={{ fontWeight: 600 }}>Tone rules</label>
          <textarea
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            rows={3}
            style={{ width: "100%", marginTop: 6, padding: 10, borderRadius: 10, border: "1px solid #ccc" }}
          />
        </div>

        <div>
          <label style={{ fontWeight: 600 }}>Language</label>
          <select
            value={languageMode}
            onChange={(e) => setLanguageMode(e.target.value)}
            style={{ width: "100%", marginTop: 6, padding: 10, borderRadius: 10, border: "1px solid #ccc" }}
          >
            <option value="auto">Auto</option>
            <option value="ru">Russian</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <label style={{ fontWeight: 600 }}>
          {mode === "sales" ? "Client message" : "Client profile / notes"}
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          placeholder={
            mode === "sales"
              ? 'Example: "We love your photos but the price feels a bit high. Any smaller option?"'
              : 'Example: "young family, 2 kids, dog, loves nature, shy child, casual style"'
          }
          style={{ width: "100%", marginTop: 6, padding: 12, borderRadius: 10, border: "1px solid #ccc" }}
        />
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
        <button
          onClick={analyze}
          disabled={loading || text.trim().length < 2}
          style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #ccc", cursor: "pointer" }}
        >
          {loading ? "Analyzing..." : "Analyze"}
        </button>

        <button
          onClick={() => {
            setText("");
            setResult(null);
            setError("");
          }}
          style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #ccc", cursor: "pointer" }}
        >
          Clear
        </button>

        {mode === "sales" && result && (
          <button
            onClick={saveCurrentReply}
            style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #ccc", cursor: "pointer" }}
          >
            Save Reply
          </button>
        )}
      </div>

      {error && (
        <div style={{ marginTop: 16, padding: 12, borderRadius: 10, background: "#ffecec" }}>
          <b>Error:</b> {error}
        </div>
      )}

      {result && mode === "sales" && (
        <div style={{ marginTop: 16, padding: 14, borderRadius: 12, border: "1px solid #ddd" }}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <span><b>Objection:</b> {result.objection_type}</span>
            <span><b>Tone:</b> {result.tone}</span>
            <span><b>Strategy:</b> {result.strategy}</span>
            <span><b>Risk:</b> {result.risk}</span>
          </div>

          <hr style={{ margin: "12px 0" }} />

          <div><b>Insight:</b><br />{result.insight}</div>
          <br />
          <div><b>Reply (short):</b><br />{result.reply_short}</div>
          <br />
          <div><b>Reply (long):</b><br />{result.reply_long}</div>
          <br />
          <div><b>Upsell:</b><br />{result.upsell}</div>
        </div>
      )}

      {result && mode === "insight" && (
        <div style={{ marginTop: 16, padding: 14, borderRadius: 12, border: "1px solid #ddd" }}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <span><b>Client type:</b> {result.client_type}</span>
            <span><b>Risk:</b> {result.risk}</span>
          </div>

          <hr style={{ margin: "12px 0" }} />

          <div><b>Shoot style:</b><br />{result.shoot_style}</div>
          <br />
          <div><b>Location idea:</b><br />{result.location_idea}</div>
          <br />
          <div><b>Communication tip:</b><br />{result.communication_tip}</div>
          <br />
          <div><b>Notes:</b><br />{result.notes}</div>
        </div>
      )}

      {mode === "sales" && (
        <div style={{ marginTop: 24 }}>
          <h2 style={{ fontSize: 22, marginBottom: 12 }}>Saved Replies</h2>

          {savedReplies.length === 0 ? (
            <div style={{ padding: 14, borderRadius: 12, border: "1px solid #ddd", opacity: 0.7 }}>
              No saved replies yet.
            </div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {savedReplies.map((item) => (
                <div
                  key={item.id}
                  style={{ padding: 14, borderRadius: 12, border: "1px solid #ddd" }}
                >
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                    <span><b>Objection:</b> {item.objection_type}</span>
                    <span><b>Tone:</b> {item.tone}</span>
                    <span><b>Strategy:</b> {item.strategy}</span>
                    <span><b>Risk:</b> {item.risk}</span>
                    <span style={{ opacity: 0.7 }}><b>Saved:</b> {item.savedAt}</span>
                  </div>

                  <hr style={{ margin: "12px 0" }} />

                  <div><b>Client message:</b><br />{item.sourceText}</div>
                  <br />
                  <div><b>Insight:</b><br />{item.insight}</div>
                  <br />
                  <div><b>Reply (short):</b><br />{item.reply_short}</div>
                  <br />
                  <div><b>Reply (long):</b><br />{item.reply_long}</div>

                  <div style={{ marginTop: 12 }}>
                    <button
                      onClick={() => deleteSavedReply(item.id)}
                      style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid #ccc", cursor: "pointer" }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
