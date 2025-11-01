import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCalendarEvents } from "@/lib/google";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const access = (session as any)?.token?.google?.access_token || (session as any)?.google?.access_token || (session as any)?.user?.google?.access_token;
    if (!access) return Response.json({ events: [] }, { status: 200 });
    const events = await getCalendarEvents(access, 10);
    return Response.json({ events });
  } catch (e: any) {
    return Response.json({ error: e?.message || "Calendar error" }, { status: 500 });
  }
}
