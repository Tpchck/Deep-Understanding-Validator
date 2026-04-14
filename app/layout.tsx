import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import { createClient } from "@/lib/supabase/server";
import ClientLayoutWrapper from "@/components/layout/ClientLayoutWrapper";
import { listTempSessions } from "@/lib/temp-store";
import { validateEnv } from "@/lib/env";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Deep Understanding Validator",
  description: "AI-powered code analysis tool that generates conceptual questions to validate deep understanding of submitted code snippets.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  validateEnv();

  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "/";
  const isLandingPage = pathname === "/";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let history: { id: string; language: string; code_snippet: string; created_at: string }[] = [];
  if (user && !isLandingPage) {
    if (process.env.STORAGE_MODE === "temp") {
      history = listTempSessions().map(s => ({
        id: s.id,
        language: s.language,
        code_snippet: s.codeSnippet,
        created_at: s.created_at,
      }));
    } else {
      const { data } = await supabase
        .from("questions")
        .select("id, language, code_snippet, created_at, session_id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(150);

      const seen = new Set<string>();
      for (const row of data ?? []) {
        const key = row.session_id ?? row.id;
        if (!seen.has(key)) {
          seen.add(key);
          history.push(row);
        }
      }
      history = history.slice(0, 50);
    }
  }

  const nickname = (user?.user_metadata?.nickname as string) ?? "";

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClientLayoutWrapper
          userEmail={user?.email ?? null}
          nickname={nickname}
          history={history}
        >
          {children}
        </ClientLayoutWrapper>
      </body>
    </html>
  );
}

