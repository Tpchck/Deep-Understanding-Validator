'use client';

export default function LoadingLogo({ size = 32, animated = false }: { size?: number; animated?: boolean }) {
  return (
    <div
      className={`rounded-full overflow-hidden shrink-0${animated ? ' animate-blur-focus-slow' : ''}`}
      style={{ width: size, height: size }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/duvlogo.png"
        alt=""
        width={size}
        height={size}
        className="opacity-90"
      />
    </div>
  );
}
