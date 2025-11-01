"use client";
import React from "react";

export default function AgentChat() {
  const [goal, setGoal] = React.useState("");
  const [output, setOutput] = React.useState("");
  const [working, setWorking] = React.useState(false);

  const run = async () => {
    setWorking(true);
    setOutput("");
    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal }),
      });
      const data = await res.json();
      setOutput(data?.message || JSON.stringify(data));
    } catch (e: any) {
      setOutput(e?.message || "Failed to run agent");
    } finally {
      setWorking(false);
    }
  };

  return (
    <div>
      <textarea rows={5} placeholder="E.g. Summarize unread emails, add a 30-min focus block tomorrow 9am, and create a Notion task for 'Follow up with Alex'." value={goal} onChange={e => setGoal(e.target.value)} />
      <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
        <button onClick={run} disabled={working || !goal.trim()}>{working ? "Working..." : "Run Agent"}</button>
        <button className="secondary" onClick={() => { setGoal(""); setOutput(""); }}>Clear</button>
      </div>
      {output && (
        <pre style={{ marginTop: 12, whiteSpace: "pre-wrap" }}>{output}</pre>
      )}
    </div>
  );
}
