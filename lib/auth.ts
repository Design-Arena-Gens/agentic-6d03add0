import type { NextAuthOptions } from "next-auth";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import OAuthProvider from "next-auth/providers/oauth";

function getEnv(name: string, fallback?: string) {
  const v = process.env[name];
  return v && v.length > 0 ? v : fallback;
}

export const authOptions: NextAuthOptions = {
  secret: getEnv("NEXTAUTH_SECRET", "dev-secret"),
  session: { strategy: "jwt" },
  providers: [
    GoogleProvider({
      clientId: getEnv("GOOGLE_CLIENT_ID", "")!,
      clientSecret: getEnv("GOOGLE_CLIENT_SECRET", "")!,
      authorization: {
        params: {
          scope: [
            "openid",
            "email",
            "profile",
            "https://www.googleapis.com/auth/calendar.events",
            "https://www.googleapis.com/auth/gmail.modify",
          ].join(" "),
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
    OAuthProvider({
      id: "notion",
      name: "Notion",
      type: "oauth",
      checks: ["state"],
      authorization: {
        url: "https://api.notion.com/v1/oauth/authorize",
        params: {
          client_id: getEnv("NOTION_CLIENT_ID", ""),
          response_type: "code",
          owner: "user",
          redirect_uri: getEnv("NEXTAUTH_URL", "http://localhost:3000") + 
            "/api/auth/callback/notion",
        },
      },
      token: {
        url: "https://api.notion.com/v1/oauth/token",
      },
      userinfo: {
        request: async ({ tokens }) => {
          const res = await fetch("https://api.notion.com/v1/users/me", {
            headers: {
              Authorization: `Bearer ${tokens.access_token}`,
              "Notion-Version": "2022-06-28",
            },
          });
          const json = await res.json();
          return json;
        },
      },
      profile: (profile: any) => {
        return {
          id: profile?.bot_id || profile?.id || profile?.user?.id || "notion-user",
          name: profile?.name || profile?.user?.name || "Notion User",
          email: profile?.user?.person?.email ?? null,
          image: profile?.avatar_url ?? null,
        } as any;
      },
      clientId: getEnv("NOTION_CLIENT_ID", ""),
      clientSecret: getEnv("NOTION_CLIENT_SECRET", ""),
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account?.provider === "google") {
        token.google = {
          access_token: account.access_token,
          refresh_token: account.refresh_token,
          expires_at: account.expires_at,
        };
      }
      if (account?.provider === "notion") {
        token.notion = {
          access_token: account.access_token,
          workspace_name: (profile as any)?.workspace_name,
        };
      }
      return token;
    },
    async session({ session, token }) {
      // Only expose connection status, not raw tokens, to the client
      (session as any).connected = {
        google: Boolean((token as any).google?.access_token),
        notion: Boolean((token as any).notion?.access_token),
      };
      return session;
    },
  },
};

export const { auth } = NextAuth(authOptions);
