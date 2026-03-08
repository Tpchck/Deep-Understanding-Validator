import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/layout/Sidebar";
import { listTempSessions } from "@/lib/temp-store";
import { validateEnv } from "@/lib/env";
import ClientParticleBackground from "@/components/ui/ClientParticleBackground";

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
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let history: { id: string; language: string; code_snippet: string; created_at: string }[] = [];
  if (user) {
    if (process.env.STORAGE_MODE === "temp") {
      // In-memory mode — read from temp store
      history = listTempSessions().map(s => ({
        id: s.id,
        language: s.language,
        code_snippet: s.codeSnippet,
        created_at: s.created_at,
      }));
    } else {
      // Supabase mode
      const { data } = await supabase
        .from("questions")
        .select("id, language, code_snippet, created_at, session_id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(150);

      // deduplicate by session_id, keep first occurrence (most recent within session)
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

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClientParticleBackground />
        {user ? (
          <div className="flex">
            <Sidebar email={user.email ?? ""} history={history} />
            <div className="md:ml-64 flex-1 min-h-screen">
              {children}
            </div>
          </div>
        ) : (
          children
        )}
      </body>
    </html>
  );
}
