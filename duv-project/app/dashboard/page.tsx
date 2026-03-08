import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

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

  // basic stats
  const total = items.length;
  const byDifficulty = { easy: 0, medium: 0, hard: 0 };
  const byLanguage: Record<string, number> = {};
  for (const q of items) {
    const d = q.difficulty as keyof typeof byDifficulty;
    if (d in byDifficulty) byDifficulty[d]++;
    byLanguage[q.language] = (byLanguage[q.language] || 0) + 1;
  }

  const topLanguages = Object.entries(byLanguage)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <main className="min-h-screen p-6 md:p-10 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-neutral-500 text-sm mt-1">{user.email}</p>
      </div>

      {/* stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Analyses" value={total} />
        <StatCard label="Easy" value={byDifficulty.easy} color="text-green-400" />
        <StatCard label="Medium" value={byDifficulty.medium} color="text-yellow-400" />
        <StatCard label="Hard" value={byDifficulty.hard} color="text-red-400" />
      </div>

      {/* top languages */}
      {topLanguages.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-white">Languages</h2>
          <div className="flex flex-wrap gap-2">
            {topLanguages.map(([lang, count]) => (
              <span
                key={lang}
                className="px-3 py-1 rounded-full bg-neutral-800 text-neutral-300 text-xs font-mono"
              >
                {lang} <span className="text-neutral-500">({count})</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* history table */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-white">Recent Analyses</h2>

        {items.length === 0 ? (
          <div className="text-center py-12 text-neutral-500">
            <p>No analyses yet.</p>
            <Link href="/" className="text-purple-400 hover:underline text-sm mt-2 inline-block">
              Submit your first code snippet
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((q) => (
              <Link
                key={q.id}
                href={`/result/${q.id}`}
                className="block p-4 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-600 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-purple-400">{q.language}</span>
                    <DifficultyBadge difficulty={q.difficulty} />
                  </div>
                  <span className="text-xs text-neutral-600">
                    {new Date(q.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-neutral-300 truncate">{q.question_text}</p>
                <p className="text-xs text-neutral-600 mt-1 truncate font-mono">
                  {q.code_snippet.split("\n")[0]}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="p-4 rounded-lg bg-neutral-900 border border-neutral-800">
      <p className="text-xs text-neutral-500">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${color ?? "text-white"}`}>{value}</p>
    </div>
  );
}

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const colors: Record<string, string> = {
    easy: "bg-green-900/30 text-green-400",
    medium: "bg-yellow-900/30 text-yellow-400",
    hard: "bg-red-900/30 text-red-400",
  };
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full ${colors[difficulty] ?? "bg-neutral-800 text-neutral-400"}`}>
      {difficulty}
    </span>
  );
}
