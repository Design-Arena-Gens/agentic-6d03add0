import { auth } from "@/lib/auth";

async function authToken(): Promise<string | null> {
  const session = await auth();
  const access = (session as any)?.token?.google?.access_token || (session as any)?.google?.access_token;
  // For route handlers we can't access session.token; re-fetch via auth again inside handlers that need it
  return access ?? null;
}

export async function getCalendarEvents(accessToken: string, maxResults = 10) {
  const params = new URLSearchParams({
    maxResults: String(maxResults),
    timeMin: new Date().toISOString(),
    singleEvents: "true",
    orderBy: "startTime",
  });
  const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?${params.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Google Calendar error: ${res.status}`);
  const json = await res.json();
  return json.items ?? [];
}

export async function listUnreadEmails(accessToken: string, max = 5) {
  const listRes = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent("is:unread category:primary newer_than:7d")}&maxResults=${max}`,
    { headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store" }
  );
  if (!listRes.ok) throw new Error(`Gmail list error: ${listRes.status}`);
  const list = await listRes.json();
  const messages = list.messages || [];
  const details = await Promise.all(
    messages.slice(0, max).map(async (m: any) => {
      const r = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      });
      if (!r.ok) return { id: m.id, snippet: "(unable to fetch)" };
      const j = await r.json();
      const headers = Object.fromEntries((j.payload?.headers || []).map((h: any) => [h.name, h.value]));
      return { id: m.id, snippet: j.snippet, subject: headers["Subject"], from: headers["From"] };
    })
  );
  return { count: list.resultSizeEstimate ?? messages.length, items: details };
}

export async function createCalendarEvent(accessToken: string, event: any) {
  const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(event),
  });
  if (!res.ok) throw new Error(`Create event error: ${res.status}`);
  return await res.json();
}
