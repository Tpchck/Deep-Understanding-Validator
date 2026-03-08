import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="text-6xl font-bold text-neutral-700 mb-2">404</div>
      <h1 className="text-xl font-semibold text-white mb-2">Page not found</h1>
      <p className="text-neutral-500 text-sm mb-6 max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or the analysis session has expired.
      </p>
      <Link
        href="/"
        className="px-5 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-colors"
      >
        ← Back to Home
      </Link>
    </main>
  );
}
