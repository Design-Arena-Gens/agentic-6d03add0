import OpenAI from "openai";

const client = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

export async function planFromContext(goal: string, context: { events: any[]; emails: any; tasks: any[] }) {
  if (!client) {
    return `Planned (mock): ${goal}\n- Events considered: ${context.events.length}\n- Unread emails: ${context.emails.count}\n- Tasks: ${context.tasks.length}\nProvide OPENAI_API_KEY to enable real AI planning.`;
  }
  const prompt = `You are an executive assistant. Based on the user's goal and their current context, propose a short plan and concrete actions. Keep it under 10 lines.\n\nUser goal: ${goal}\n\nUpcoming events: ${JSON.stringify(context.events).slice(0, 1500)}\n\nUnread emails summary: ${JSON.stringify(context.emails).slice(0, 1500)}\n\nNotion tasks: ${JSON.stringify(context.tasks).slice(0, 1500)}\n`;
  const resp = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a concise, helpful personal assistant." },
      { role: "user", content: prompt },
    ],
    temperature: 0.3,
  });
  return resp.choices[0]?.message?.content?.trim() || "(No response)";
}
