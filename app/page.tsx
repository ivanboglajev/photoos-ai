
"use client";

import { useState } from "react";

export default function Home() {
  const [text, setText] = useState("");

  // Photographer profile fields (Step 4)
  const [city, setCity] = useState("Tallinn / Cork");
  const [style, setStyle] = useState("Warm documentary family photography, natural light, no stiff posing");
  const [price, setPrice] = useState("200€/hour");
  const [tone, setTone] = useState("Calm, confident, warm, human. Short sentences. No pushy sales.");
  const [languageMode, setLanguageMode] = useState("auto"); // auto / ru / en

  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function analyze() {
    setLoading(true);
    setResult(null);
    setError("");

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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
    <main style={{ maxWidth: 980, margin: "40px auto", padding: 16, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>PhotoOS AI — Sales Brain</h1>
      <p style={{ opacity: 0.8 }}>
        Paste a client message → get objection, risk, and ready-to-send replies. Now personalized to your voice.
      </p>

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
          <label style={{ fontWeight: 600 }}>Price (text)</label>
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
            <option value="auto">Auto (same as client)</option>
            <option value="ru">Russian</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <label style={{ fontWeight: 600 }}>Client message</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          placeholder='Example: "We love your photos but the price feels a bit high. Any smaller option?"'
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
          onClick={() => { setText(""); setResult(null); setError(""); }}
          style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #ccc", cursor: "pointer" }}
        >
          Clear
        </button>
      </div>

      {error && (
        <div style={{ marginTop: 16, padding: 12, borderRadius: 10, background: "#ffecec" }}>
          <b>Error:</b> {error}
        </div>
      )}

      {result && (
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

          <hr style={{ margin: "12px 0" }} />
          <details>
            <summary>Raw JSON</summary>
            <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(result, null, 2)}</pre>
          </details>
        </div>
      )}
    </main>
  );
}
