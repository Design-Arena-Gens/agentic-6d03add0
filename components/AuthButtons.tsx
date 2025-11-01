"use client";
import { signIn, signOut, useSession } from "next-auth/react";

export default function AuthButtons() {
  const { data: session, status } = useSession();
  const connected = (session as any)?.connected ?? { google: false, notion: false };

  return (
    <div>
      <p>Status: {status}</p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button className={connected.google ? "secondary" : ""} onClick={() => signIn("google")}> 
          {connected.google ? "Connected Google" : "Connect Google"}
        </button>
        <button className={connected.notion ? "secondary" : ""} onClick={() => signIn("notion")}> 
          {connected.notion ? "Connected Notion" : "Connect Notion"}
        </button>
        <button className="secondary" onClick={() => signOut()}>Sign out</button>
      </div>
      <p style={{ marginTop: 8, fontSize: 12, color: "#9ca3af" }}>
        Configure OAuth env variables to enable connections. Without them, buttons will error at sign-in.
      </p>
    </div>
  );
}
