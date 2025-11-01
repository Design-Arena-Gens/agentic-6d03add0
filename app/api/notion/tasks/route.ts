import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { searchNotion } from "@/lib/notion";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const access = (session as any)?.token?.notion?.access_token || (session as any)?.notion?.access_token || (session as any)?.user?.notion?.access_token;
    if (!access) return Response.json({ tasks: [] }, { status: 200 });
    const tasks = await searchNotion(access, "todo");
    return Response.json({ tasks });
  } catch (e: any) {
    return Response.json({ error: e?.message || "Notion error" }, { status: 500 });
  }
}
