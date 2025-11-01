import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCalendarEvents, createCalendarEvent, listUnreadEmails } from "@/lib/google";
import { searchNotion, createNotionPage } from "@/lib/notion";
import { planFromContext } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const goal: string = body.goal || "";
    const action: string | undefined = body.action;
    const payload: any = body.payload || {};

    const session = await getServerSession(authOptions);
    const googleToken = (session as any)?.token?.google?.access_token || (session as any)?.google?.access_token;
    const notionToken = (session as any)?.token?.notion?.access_token || (session as any)?.notion?.access_token;

    if (action === "create_event") {
      if (!googleToken) return Response.json({ error: "Google not connected" }, { status: 400 });
      const created = await createCalendarEvent(googleToken, payload);
      return Response.json({ message: `Event created: ${created?.htmlLink || created?.id}` });
    }
    if (action === "create_notion_page") {
      if (!notionToken) return Response.json({ error: "Notion not connected" }, { status: 400 });
      const created = await createNotionPage(notionToken, payload?.title || "Untitled task");
      return Response.json({ message: `Notion page created: ${created?.url}` });
    }

    // Default: plan according to current context
    const events = googleToken ? await getCalendarEvents(googleToken, 5) : [];
    const emails = googleToken ? await listUnreadEmails(googleToken, 5) : { count: 0, items: [] };
    const tasks = notionToken ? await searchNotion(notionToken, "todo") : [];

    const message = await planFromContext(goal, { events, emails, tasks });
    return Response.json({ message });
  } catch (e: any) {
    return Response.json({ error: e?.message || "Agent error" }, { status: 500 });
  }
}
