
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
const toneRules = String(photographer.tone ?? "Warm, confident, human.");
const languageMode = String(photographer.languageMode ?? "auto");

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
Goal: help photographers reply calmly, protect their energy, and increase booking conversion without being pushy.

Photographer profile:
- City/market: ${city}
- Style: ${style}
- Typical price: ${price}
- Tone rules: ${toneRules}

Language rule:
- ${languageRule}

Return STRICT JSON with exactly these keys:
- objection_type: one of ["greeting","price","time","awkward","kids","partner_resistance","planning","value","other"]
- tone: one of ["neutral","warm","uncertain","sarcastic","negative","passive_aggressive"]
- strategy: one of ["soften","clarify","boundary","disengage"]
- risk: one of ["low","medium","high"]
- insight: 2-4 sentences explaining what's behind the message
- reply_short: <= 400 characters, ready-to-send message
- reply_long: 4-8 sentences, ready-to-send message
- upsell: 1-2 sentences with an optional add-on suggestion, or empty string if upsell is inappropriate

Rules:
- If the message is greeting/small talk (e.g. "How are you?", "Hi", "Hello"), set objection_type="greeting".
- For "greeting": reply must include 2–3 qualifying questions (shoot type, date/time window, location) and 1 next step.
- Detect emotional tone carefully.
- If client is sarcastic, passive-aggressive, or openly negative, do NOT sound defensive, needy, apologetic, or overly eager.
- Use "boundary" when the client is pushing, devaluing, mocking, or trying to force a discount.
- Use "clarify" when the client sounds sharp but may still be reasonable.
- Use "disengage" only when the tone is clearly hostile or disrespectful and further engagement is not productive.
- Never use generic phrases like "How can I assist you today?".
- Never beg, chase, or oversell.
- If tone is negative, sarcastic, or passive_aggressive, upsell should usually be empty.
- If tone is sarcastic or passive_aggressive and the client is devaluing price, mocking, comparing unfairly, or testing boundaries, risk should usually be "high".
- Use "medium" only when the tone is sharp but still cooperative.
- Use "high" when future communication may become emotionally draining or unstable.
- If the client uses irony, rhetorical price comments, or mocking phrasing, classify tone as "sarcastic" even if the message mentions price.
- If tone is sarcastic, do not offer upsell.
- Keep replies human, calm, and self-respecting.
- No markdown. No extra keys.
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
