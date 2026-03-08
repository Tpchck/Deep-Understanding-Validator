'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
          <div className="text-5xl mb-4">💥</div>
          <h1 className="text-xl font-semibold mb-2">Critical error</h1>
          <p className="text-neutral-500 text-sm mb-6 max-w-md">
            {error.message || "Something went seriously wrong. Please reload the page."}
          </p>
          <button
            onClick={reset}
            className="px-5 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium"
          >
            Reload
          </button>
        </main>
      </body>
    </html>
  );
}
