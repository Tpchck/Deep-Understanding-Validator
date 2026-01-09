import { processCodeSubmission } from "@/actions/submit-code";

export default function Home() { // async не обязателен, если внутри нет await
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
          DUV: Deep Understanding Validator
        </h1>
        
        {/* ИСПРАВЛЕНИЕ: Передаем ссылку на функцию напрямую */}
        <form action={processCodeSubmission} className="w-full max-w-2xl mx-auto flex flex-col gap-4">
          <div className="relative">
            <textarea
              name="code"
              placeholder="// Paste your C++, Python, or Java code here..."
              className="w-full h-64 p-4 rounded-lg bg-neutral-900 border border-neutral-800 text-green-400 font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              required
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-white px-8 py-3 text-black font-bold hover:bg-gray-200 transition-colors"
          >
            INITIATE ANALYSIS_
          </button>
        </form>
      </div>
    </main>
  );
}