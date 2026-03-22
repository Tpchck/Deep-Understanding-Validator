import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import DashboardHistory from "@/components/dashboard/DashboardHistory";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: questions } = await supabase
    .from("questions")
    .select("id, question_text, code_snippet, difficulty, language, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const items = questions ?? [];

  return (
    <main className="flex flex-col relative z-0 min-h-screen px-4 md:px-8 lg:px-12 pt-16 pb-24 max-w-6xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 pt-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-500">Dashboard</span>
          </h1>
          <p className="text-neutral-500 text-sm mt-2">Track your progress and review past code comprehension validations.</p>
        </div>
        <Link
          href="/dashboard/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-purple-900/30 shrink-0 sm:w-auto w-full"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Analysis
        </Link>
      </div>

      <DashboardHistory initialItems={items} />
    </main>
  );
}
