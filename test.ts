import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function test() {
  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content:
          "Abbiamo deciso di sostituire Notion con Jira per il project management.",
      },
    ],
    temperature: 0.2,
  });

  console.log(response.choices[0].message.content);
}

test();
