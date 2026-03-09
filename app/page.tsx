
"use client";

import { useState } from "react";

export default function Home() {
  const [mode, setMode] = useState("sales");
  const [text, setText] = useState("");

  const [city, setCity] = useState("Tallinn / Cork");
  const [style, setStyle] = useState(
    "Warm documentary family photography, natural light, no stiff posing"
  );
  const [price, setPrice] = useState("200€/hour");
  const [tone, setTone] = useState(
    "Calm, confident, warm, human. Short sentences. No pushy sales."
  );
  const [languageMode, setLanguageMode] = useState("auto");

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

  const fieldStyle = {
    width: "100%",
    marginTop: 6,
    padding: 10,
    borderRadius: 10,
    border: "1px solid #e6e2dc",
    background: "white",
    color: "#1f1f1f",
    boxSizing: "border-box" as const,
  };

  const cardStyle = {
    marginTop: 16,
    padding: 18,
    borderRadius: 18,
    border: "1px solid #e6e2dc",
    background: "white",
    boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
  };

  return (
    <main
      style={{
        maxWidth: 980,
        margin: "40px auto",
        padding: 24,
        fontFamily: "system-ui",
        background: "#f7f5f2",
        minHeight: "100vh",
        color: "#1f1f1f",
      }}
    >
      <div
        style={{
          background: "white",
          padding: 24,
          borderRadius: 18,
          border: "1px solid #e8e4de",
          marginBottom: 20,
        }}
      >
        <h1 style={{ fontSize: 30, fontWeight: 700, marginBottom: 8 }}>
          PhotoOS — AI assistant for photographers
        </h1>
        <p style={{ opacity: 0.7, color: "#4b4b4b" }}>
          Understand clients. Prepare shoots. Protect your energy.
        </p>
      </div>

      <div
        style={{
          background: "white",
          padding: 20,
          borderRadius: 18,
          border: "1px solid #e8e4de",
          marginBottom: 20,
        }}
      >
        <div style={{ marginTop: 8 }}>
          <label style={{ fontWeight: 600, color: "#2a2a2a", display: "block", marginBottom: 8 }}>
            Mode
          </label>

          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              padding: 6,
              background: "#f3f1ed",
              borderRadius: 14,
              border: "1px solid #e6e2dc",
            }}
          >
            {[
              { key: "sales", label: "Sales Brain" },
              { key: "insight", label: "Client Insight" },
              { key: "concept", label: "Concept Generator" },
              { key: "flow", label: "Session Flow" },
              { key: "shotlist", label: "Shot List" },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setMode(item.key)}
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "none",
                  cursor: "pointer",
                  background: mode === item.key ? "#111" : "transparent",
                  color: mode === item.key ? "white" : "#2a2a2a",
                  fontWeight: 600,
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
            marginTop: 18,
          }}
        >
          <div>
            <label style={{ fontWeight: 600, color: "#2a2a2a" }}>Market</label>
            <input value={city} onChange={(e) => setCity(e.target.value)} style={fieldStyle} />
          </div>

          <div>
            <label style={{ fontWeight: 600, color: "#2a2a2a" }}>Price</label>
            <input value={price} onChange={(e) => setPrice(e.target.value)} style={fieldStyle} />
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ fontWeight: 600, color: "#2a2a2a" }}>Style</label>
            <input value={style} onChange={(e) => setStyle(e.target.value)} style={fieldStyle} />
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ fontWeight: 600, color: "#2a2a2a" }}>Tone rules</label>
            <textarea value={tone} onChange={(e) => setTone(e.target.value)} rows={3} style={fieldStyle} />
          </div>

          <div>
            <label style={{ fontWeight: 600, color: "#2a2a2a" }}>Language</label>
            <select value={languageMode} onChange={(e) => setLanguageMode(e.target.value)} style={fieldStyle}>
              <option value="auto">Auto</option>
              <option value="ru">Russian</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <label style={{ fontWeight: 600, color: "#2a2a2a" }}>
            {mode === "sales"
              ? "Client message"
              : mode === "insight"
              ? "Client profile / notes"
              : mode === "concept"
              ? "Concept brief"
              : mode === "flow"
              ? "Session flow brief"
              : "Shot list brief"}
          </label>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
            placeholder="Write your input here..."
            style={{
              ...fieldStyle,
              padding: 12,
            }}
          />
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
          <button
            onClick={analyze}
            disabled={loading || text.trim().length < 2}
            style={{
              padding: "12px 18px",
              borderRadius: 12,
              border: "none",
              background: "#111",
              color: "white",
              cursor: "pointer",
            }}
          >
            {loading ? "Analyzing..." : "Analyze"}
          </button>

          <button
            onClick={() => {
              setText("");
              setResult(null);
              setError("");
            }}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid #ddd",
              background: "white",
              cursor: "pointer",
            }}
          >
            Clear
          </button>
        </div>
      </div>

      {error && (
        <div
          style={{
            marginTop: 16,
            padding: 12,
            borderRadius: 12,
            border: "1px solid #f0c9c9",
            background: "#fff4f4",
          }}
        >
          <b>Error:</b> {error}
        </div>
      )}

      {result && mode === "sales" && (
        <div style={cardStyle}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
            <span><b>Objection:</b> {result.objection_type}</span>
            <span><b>Tone:</b> {result.tone}</span>
            <span><b>Strategy:</b> {result.strategy}</span>
            <span><b>Risk:</b> {result.risk}</span>
          </div>

          <div><b>Insight</b><br />{result.insight}</div>
          <br />
          <div><b>Reply (short)</b><br />{result.reply_short}</div>
          <br />
          <div><b>Reply (long)</b><br />{result.reply_long}</div>
          <br />
          <div><b>Upsell</b><br />{result.upsell}</div>
        </div>
      )}

      {result && mode === "insight" && (
        <div style={cardStyle}>
          <div><b>Client type</b><br />{result.client_type}</div>
          <br />
          <div><b>Shoot style</b><br />{result.shoot_style}</div>
          <br />
          <div><b>Location idea</b><br />{result.location_idea}</div>
          <br />
          <div><b>Communication tip</b><br />{result.communication_tip}</div>
          <br />
          <div><b>Risk</b><br />{result.risk}</div>
          <br />
          <div><b>Notes</b><br />{result.notes}</div>
        </div>
      )}

      {result && mode === "concept" && (
        <div style={cardStyle}>
          <div><b>Concept name</b><br />{result.concept_name}</div>
          <br />
          <div><b>Visual direction</b><br />{result.visual_direction}</div>
          <br />
          <div><b>Best time</b><br />{result.best_time}</div>
          <br />
          <div><b>Movement prompt</b><br />{result.movement_prompt}</div>
          <br />
          <div><b>Emotion focus</b><br />{result.emotion_focus}</div>
          <br />
          <div><b>Framing plan</b><br />{result.framing_plan}</div>
          <br />
          <div><b>Shot priority</b><br />{result.shot_priority}</div>
          <br />
          <div><b>Detail focus</b><br />{result.detail_focus}</div>
          <br />
          <div><b>Backup if low energy</b><br />{result.backup_if_low_energy}</div>
        </div>
      )}

      {result && mode === "flow" && (
        <div style={cardStyle}>
          <div><b>First 5 minutes</b><br />{result.first_5_minutes}</div>
          <br />
          <div><b>Opening phrase</b><br />{result.opening_phrase}</div>
          <br />
          <div><b>Middle flow</b><br />{result.middle_flow}</div>
          <br />
          <div><b>Energy shift</b><br />{result.energy_shift}</div>
          <br />
          <div><b>Closing moment</b><br />{result.closing_moment}</div>
          <br />
          <div><b>If child refuses</b><br />{result.if_child_refuses}</div>
        </div>
      )}

      {result && mode === "shotlist" && (
        <div style={cardStyle}>
          <div><b>Must-have frames</b><br />{result.must_have_frames}</div>
          <br />
          <div><b>First frame</b><br />{result.first_frame}</div>
          <br />
          <div><b>Safe frame</b><br />{result.safe_frame}</div>
          <br />
          <div><b>Emotion frame</b><br />{result.emotion_frame}</div>
          <br />
          <div><b>Detail frame</b><br />{result.detail_frame}</div>
          <br />
          <div><b>Frame to try last</b><br />{result.frame_to_try_last}</div>
        </div>
      )}
    </main>
  );
}
