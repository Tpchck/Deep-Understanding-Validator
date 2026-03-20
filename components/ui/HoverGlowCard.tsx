export function HoverGlowCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`group relative transition-all duration-500 will-change-transform hover:-translate-y-2 hover:shadow-[0_8px_40px_rgba(168,85,247,0.35)] hover:border-purple-500/50 ${className}`}
    >
      {/* Soft inner bloom on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-[inherit]" />
      
      {/* Ensure children stay above the glow */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
}
