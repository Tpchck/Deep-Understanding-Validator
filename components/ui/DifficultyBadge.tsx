interface DifficultyBadgeProps {
  difficulty: string;
}

const colorMap: Record<string, string> = {
  beginner: "bg-green-500/10 text-green-400 border-green-500/20",
  easy: "bg-green-500/10 text-green-400 border-green-500/20",
  intermediate: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  advanced: "bg-red-500/10 text-red-400 border-red-500/20",
  hard: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function DifficultyBadge({ difficulty }: DifficultyBadgeProps) {
  if (difficulty === "pending") {
    return (
      <span className="text-[10px] px-2 py-0.5 rounded-full border bg-neutral-800/50 text-neutral-500 border-neutral-700/50 animate-pulse">
        analyzing...
      </span>
    );
  }

  return (
    <span
      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
        colorMap[difficulty] ?? "bg-neutral-800 text-neutral-400 border-neutral-700"
      }`}
    >
      {difficulty}
    </span>
  );
}
