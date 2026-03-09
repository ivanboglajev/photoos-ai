import OpenAI from "openai";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const body = await req.json();
    const mode = body?.mode ?? "sales";
    const text = body?.text ?? "";
    const photographer = body?.photographer ?? {};

    const city = String(photographer.city ?? "Unknown city");
    const style = String(photographer.style ?? "Documentary photography");
    const price = String(photographer.price ?? "");
    const toneRules = String(photographer.tone ?? "Warm, confident, human.");
    const languageMode = String(photographer.languageMode ?? "auto");

    const personalVoice = `
The photographer speaks like a calm father-photographer.
Warm, grounded, calm, self-respecting.
No fake enthusiasm.
No pressure.
No cliché sales phrases.
No exaggerated positivity.

Core ideas:
- Real interaction matters more than perfect posing.
- Mess can be memory.
- Home does not need to look perfect.
- Children should not be controlled too much.
- Small imperfections often create emotional truth.
- Documentary feeling is often stronger than visual perfection.

Voice examples:
- I usually begin calmly so the child can get used to me first.
- Everyday home details often become the most valuable memory later.
- If someone feels awkward, we simply do not force anything.
- Natural movement usually gives stronger photographs than fixed posing.
`;

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
        : "Write replies in the same language as the user input.";

    if (mode === "insight") {
      const completion = await client.chat.completions.create({
        model: "gpt-4.1-mini",
        temperature: 0.3,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `
You are "PhotoOS AI — Client Insight" for photographers.

Photographer profile:
- City/market: ${city}
- Style: ${style}
- Typical price: ${price}
- Tone rules: ${toneRules}

Photographer personal voice:
${personalVoice}

Language rule:
- ${languageRule}

Analyze the client profile / notes and return STRICT JSON with exactly these keys:
- client_type
- shoot_style
- location_idea
- communication_tip
- risk: one of ["low","medium","high"]
- notes

Rules:
- Think like a photographer preparing for a real session.
- Infer likely family dynamics, pace, comfort level, and visual style.
- Suggest a shoot style that fits the client naturally.
- Suggest one location idea, not a long list.
- Communication tip should help the photographer guide the session calmly.
- Keep it practical, specific, and human.
- No markdown. No extra keys.
            `.trim(),
          },
          {
            role: "user",
            content: `Client profile / notes:\n${text}`,
          },
        ],
      });

      const content = completion.choices?.[0]?.message?.content ?? "{}";
      return Response.json(JSON.parse(content));
    }

    if (mode === "concept") {
      const completion = await client.chat.completions.create({
        model: "gpt-4.1-mini",
        temperature: 0.35,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `
You are "PhotoOS AI — Concept Generator" for photographers.

Photographer profile:
- City/market: ${city}
- Style: ${style}
- Typical price: ${price}
- Tone rules: ${toneRules}

Photographer personal voice:
${personalVoice}

Language rule:
- ${languageRule}

Return STRICT JSON with exactly these keys:
- concept_name
- visual_direction
- best_time
- movement_prompt
- emotion_focus
- framing_plan
- shot_priority
- detail_focus
- backup_if_low_energy

Rules:
- Build a realistic concept for a real family or client, not a fantasy moodboard.
- Prioritize natural movement, emotional truth, and documentary feeling.
- Do not over-prioritize cleanliness, perfection, or stiff structure.
- If the session is at home, treat lived-in details as part of the story.
- "best_time" should be practical, not poetic.
- "movement_prompt" should be something the photographer can actually say or guide.
- "framing_plan" = practical framing progression (wide / medium / close).
- "shot_priority" = what should be captured first.
- "detail_focus" = small documentary details worth noticing.
- "backup_if_low_energy" should help if the child, family, or couple loses energy.
- Keep it specific, warm, and useful.
- No markdown. No extra keys.
            `.trim(),
          },
          {
            role: "user",
            content: `Concept brief:\n${text}`,
          },
        ],
      });

      const content = completion.choices?.[0]?.message?.content ?? "{}";
      return Response.json(JSON.parse(content));
    }

    if (mode === "flow") {
      const completion = await client.chat.completions.create({
        model: "gpt-4.1-mini",
        temperature: 0.35,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `
You are "PhotoOS AI — Session Flow" for photographers.

Photographer profile:
- City/market: ${city}
- Style: ${style}
- Typical price: ${price}
- Tone rules: ${toneRules}

Photographer personal voice:
${personalVoice}

Language rule:
- ${languageRule}

Return STRICT JSON with exactly these keys:
- first_5_minutes
- opening_phrase
- middle_flow
- energy_shift
- closing_moment
- if_child_refuses

Rules:
- Think like a real documentary family photographer.
- Keep flow realistic and calm.
- Avoid stiff posing.
- Opening phrase must sound human and natural.
- Energy shift = what to do if attention drops.
- If child refuses = no forcing, no pressure.
- Keep all answers practical.
- No markdown. No extra keys.
            `.trim(),
          },
          {
            role: "user",
            content: `Session brief:\n${text}`,
          },
        ],
      });

      const content = completion.choices?.[0]?.message?.content ?? "{}";
      return Response.json(JSON.parse(content));
    }

    if (mode === "shotlist") {
      const completion = await client.chat.completions.create({
        model: "gpt-4.1-mini",
        temperature: 0.35,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `
You are "PhotoOS AI — Shot List" for photographers.

Photographer profile:
- City/market: ${city}
- Style: ${style}
- Typical price: ${price}
- Tone rules: ${toneRules}

Photographer personal voice:
${personalVoice}

Language rule:
- ${languageRule}

Return STRICT JSON with exactly these keys:
- - must_have_frames = 3 short numbered must-have frames only
- first_frame
- safe_frame
- emotion_frame
- detail_frame
- frame_to_try_last

Rules:
- Think like a real documentary family photographer building a realistic shot priority.
- must_have_frames = the essential visual core of the session.
- first_frame = easiest natural opening frame.
- safe_frame = reliable frame to secure early.
- emotion_frame = frame with strongest emotional potential.
- detail_frame = small lived-in documentary detail.
- frame_to_try_last = more delicate frame when trust is already built.
- Keep it practical, not abstract.
- No markdown. No extra keys.
- Separate multiple ideas clearly using numbered sentences.
- Each field must read cleanly and not merge ideas together.
- Use short structured phrases.
            `.trim(),
          },
          {
            role: "user",
            content: `Shot list brief:\n${text}`,
          },
        ],
      });

      const content = completion.choices?.[0]?.message?.content ?? "{}";
      return Response.json(JSON.parse(content));
    }

    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.25,
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

Photographer personal voice:
${personalVoice}

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
        {
          role: "user",
          content: `Client message:\n${text}`,
        },
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