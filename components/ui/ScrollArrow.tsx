'use client';

import { useEffect, useRef, useState } from "react";

export default function ScrollArrow({ targetId, direction = 'down' }: { targetId: string, direction?: 'down' | 'up' }) {
  const [isVisible, setIsVisible] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // We observe the parent section to know when it comes fully into view
    const parent = buttonRef.current?.closest('section') || buttonRef.current?.parentElement;
    if (!parent) return;

    let timeout: NodeJS.Timeout;

    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      // When the section is mostly in view (>= 0.75), we assume scrolling is stopping on it
      if (entry.isIntersecting && entry.intersectionRatio >= 0.75) {
        clearTimeout(timeout);
        // Delay the arrow appearance so the smooth scroll finishes first
        timeout = setTimeout(() => {
          setIsVisible(true);
        }, 600);
      } else if (entry.intersectionRatio < 0.25) {
        // Hide it if we scroll away
        clearTimeout(timeout);
        setIsVisible(false);
      }
    }, {
      threshold: [0, 0.25, 0.75, 1.0],
      rootMargin: "0px"
    });

    observer.observe(parent);
    return () => {
      clearTimeout(timeout);
      observer.disconnect();
    };
  }, []);

  const handleClick = () => {
    // Hide immediately upon clicking so it doesn't linger while scrolling
    setIsVisible(false);
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <button 
      ref={buttonRef}
      onClick={handleClick}
      className={`absolute bottom-12 left-1/2 -translate-x-1/2 text-neutral-500 hover:text-purple-400 transition-all duration-700 animate-float flex flex-col items-center gap-2 cursor-pointer z-50 focus:outline-none ${
        isVisible ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-4 pointer-events-none'
      }`}
      aria-label={`Scroll to ${targetId}`}
    >
      <div className="p-3 rounded-full bg-neutral-900/50 border border-neutral-800 hover:border-purple-500/50 backdrop-blur shadow-lg transition-transform duration-300 hover:scale-[1.15]">
        <svg 
          className="w-5 h-5" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor" 
          strokeWidth={2}
        >
          {direction === 'down' ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
          )}
        </svg>
      </div>
    </button>
  );
}
