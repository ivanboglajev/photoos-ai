
import OpenAI from "openai";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const body = await req.json();
    const text = body?.text ?? "";
    const photographer = body?.photographer ?? {};

    const city = String(photographer.city ?? "Unknown city");
    const style = String(photographer.style ?? "Documentary photography");
    const price = String(photographer.price ?? "");
    const tone = String(photographer.tone ?? "Warm, confident, human.");
    const languageMode = String(photographer.languageMode ?? "auto"); // auto | ru | en

    if (!process.env.OPENAI_API_KEY) {
      return Response.json(
        { error: "OPENAI_API_KEY is missing in .env.local" },
        { status: 500 }
      );
    }

    if (!text || text.trim().length < 2) {
      return Response.json({ error: "Text is too short" }, { status: 400 });
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const languageRule =
      languageMode === "ru"
        ? "Write replies in Russian."
        : languageMode === "en"
        ? "Write replies in English."
        : "Write replies in the same language as the client message.";

    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `
You are "PhotoOS AI — Sales Brain" for photographers.
Goal: convert inquiries into booked sessions with a warm, confident, non-pushy tone.

Photographer profile:
- City/market: ${city}
- Style: ${style}
- Typical price: ${price}
- Tone rules: ${tone}

Language rule:
- ${languageRule}

Return STRICT JSON with exactly these keys:
- objection_type: one of ["greeting","price","time","awkward","kids","partner_resistance","planning","value","other"]
- risk: one of ["low","medium","high"]
- insight: 2-4 sentences explaining what's behind the message
- reply_short: <= 400 characters, ready-to-send message
- reply_long: 4-8 sentences, ready-to-send message
- upsell: 1-2 sentences with an optional add-on suggestion
No extra keys. No markdown.

Rules:
- If the message is greeting/small talk (e.g., "How are you?", "Hi", "Hello"), set objection_type="greeting".
- For "greeting": reply must include 2–3 qualifying questions (shoot type, date/time window, location) and 1 next step (offer 2–3 slots or propose a quick call).
- Never use generic phrasing like "How can I assist you today?".
- Keep it human and specific.
          `.trim(),
        },
        { role: "user", content: `Client message:\n${text}` },
      ],
    });

    const content = completion.choices?.[0]?.message?.content ?? "{}";
    return Response.json(JSON.parse(content));
  } catch (err) {
    return Response.json(
      { error: "Server error", details: String(err?.message || err) },
      { status: 500 }
    );
  }
}
