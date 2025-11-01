"use client";
import React from "react";

export default function Dashboard() {
  const [events, setEvents] = React.useState<any[]>([]);
  const [emails, setEmails] = React.useState<{ count: number; items: any[] }>({ count: 0, items: [] });
  const [tasks, setTasks] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [evRes, emRes, ntRes] = await Promise.all([
        fetch("/api/calendar/list").then(r => r.json()),
        fetch("/api/email/summary").then(r => r.json()),
        fetch("/api/notion/tasks").then(r => r.json()),
      ]);
      setEvents(evRes.events || []);
      setEmails({ count: emRes.count || 0, items: emRes.items || [] });
      setTasks(ntRes.tasks || []);
    } catch (e: any) {
      setError(e?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { load(); }, []);

  return (
    <div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button onClick={load} disabled={loading}>{loading ? "Refreshing..." : "Refresh"}</button>
        {error && <span className="badge">{error}</span>}
      </div>
      <div className="row" style={{ marginTop: 16 }}>
        <div className="col-4">
          <h4>Upcoming Events</h4>
          <ul>
            {events.length === 0 && <li>No events available</li>}
            {events.map((e: any, idx: number) => (
              <li key={idx}>
                <div>{e.summary || e.title || "(no title)"}</div>
                <div className="badge">{e.start?.dateTime || e.start?.date || e.start}</div>
              </li>
            ))}
          </ul>
        </div>
        <div className="col-4">
          <h4>Unread Emails (7d)</h4>
          <div className="badge">{emails.count} total</div>
          <ul>
            {emails.items.map((m: any) => (
              <li key={m.id}>
                <div>{m.snippet}</div>
                <div className="badge">{m.from || m.subject || m.id}</div>
              </li>
            ))}
          </ul>
        </div>
        <div className="col-4">
          <h4>Notion Tasks</h4>
          <ul>
            {tasks.length === 0 && <li>No tasks available</li>}
            {tasks.map((t: any) => (
              <li key={t.id}>
                <div>{t.title || t.name || t.id}</div>
                {t.url && (
                  <div>
                    <a className="link" href={t.url} target="_blank">Open</a>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
