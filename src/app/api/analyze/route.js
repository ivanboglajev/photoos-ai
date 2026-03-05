import OpenAI from "openai";

export async function POST(req) {
  try {
    const { text } = await req.json();

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: "You analyze client messages for photographers and suggest better responses."
        },
        {
          role: "user",
          content: text
        }
      ],
    });

    return Response.json({
      result: response.choices[0].message.content,
    });

  } catch (error) {
    return Response.json(
      { error: "Something went wrong", details: error.message },
      { status: 500 }
    );
  }
}