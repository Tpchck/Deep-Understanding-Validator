import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardInput from "../DashboardInput";

export default async function NewAnalysisPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 pt-16 pb-24 relative z-0">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/duvlogo.png"
        alt="DUV"
        className="w-20 h-20 rounded-2xl mb-6 opacity-90 shadow-[0_0_20px_rgba(168,85,247,0.3)]"
      />
      <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 text-center">
        Start New <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-500">Analysis</span>
      </h2>
      <p className="text-neutral-500 text-sm mb-8 text-center max-w-md">
        Paste your code and let the AI challenge your understanding.
      </p>

      <DashboardInput />
    </main>
  );
}
