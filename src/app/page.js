"use client";

import { useState } from "react";

export default function Home() {
  const [text, setText] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function analyze() {
    setLoading(true);
    setResult("");

    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    const data = await res.json();
    setResult(data.result || data.error);
    setLoading(false);
  }

  return (
    <main style={{ padding: 40, fontFamily: "system-ui" }}>
      <h1>PhotoOS AI</h1>

      <textarea
        rows={8}
        style={{ width: "100%", marginTop: 20 }}
        placeholder="Paste client message..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <button
        onClick={analyze}
        style={{ marginTop: 20, padding: 10 }}
      >
        {loading ? "Analyzing..." : "Analyze"}
      </button>

      {result && (
        <div style={{ marginTop: 30 }}>
          <h3>AI Response</h3>
          <p>{result}</p>
        </div>
      )}
    </main>
  );
}