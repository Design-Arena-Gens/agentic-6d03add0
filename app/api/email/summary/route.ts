import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { listUnreadEmails } from "@/lib/google";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const access = (session as any)?.token?.google?.access_token || (session as any)?.google?.access_token || (session as any)?.user?.google?.access_token;
    if (!access) return Response.json({ count: 0, items: [] }, { status: 200 });
    const emails = await listUnreadEmails(access, 5);
    return Response.json(emails);
  } catch (e: any) {
    return Response.json({ error: e?.message || "Gmail error" }, { status: 500 });
  }
}
