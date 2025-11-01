import "./globals.css";
import Providers from "@/components/Providers";
import React from "react";

export const metadata = {
  title: "AI Personal Agent",
  description: "Manage Notion, Google Calendar, and Gmail",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="container">
          <h1>AI Personal Agent</h1>
          <p className="badge">Notion ? Google Calendar ? Gmail</p>
          <hr />
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
