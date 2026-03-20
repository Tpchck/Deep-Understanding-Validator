'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import ScrollArrow from '@/components/ui/ScrollArrow';
import { NextjsLogo, ReactLogo, TypeScriptLogo, TailwindLogo, SupabaseLogo, GroqLogo, OpenAILogo, VercelLogo, ZodLogo, NodejsLogo, PlaywrightLogo, VitestLogo } from '@/components/ui/TechLogos';
import { HoverGlowCard } from '@/components/ui/HoverGlowCard';

/* ───────────────────── Animated counter hook ───────────────────── */
function useCountUp(target: number, duration = 2000) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          setValue(Math.floor(progress * target));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return { value, ref };
}

/* ───────────────────── Scroll-reveal wrapper ───────────────────── */
function Reveal({ children, className = '', delay = 0 }: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); io.disconnect(); } },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(40px)',
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ═══════════════════════ ICONS (inline SVG) ═══════════════════════ */

function IconBrain() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
      <path d="M12 2a5 5 0 0 1 4.546 2.914A4 4 0 0 1 18 11a4 4 0 0 1-1.5 7.5H14" />
      <path d="M12 2a5 5 0 0 0-4.546 2.914A4 4 0 0 0 6 11a4 4 0 0 0 1.5 7.5H10" />
      <path d="M10 22v-8m4 8v-8" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

function IconCode() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
      <line x1="14" y1="4" x2="10" y2="20" />
    </svg>
  );
}

function IconLayers() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}

function IconHistory() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
      <path d="M2 12h2" />
    </svg>
  );
}

function IconUpload() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function IconChat() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      <line x1="8" y1="9" x2="16" y2="9" />
      <line x1="8" y1="13" x2="14" y2="13" />
    </svg>
  );
}

function IconAward() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
      <circle cx="12" cy="8" r="7" />
      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
      <path d="M12 4v4" />
      <path d="M10 8h4" />
    </svg>
  );
}

function IconGitHub() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

function TechIcon({ d, stroke }: { d: string; stroke?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill={stroke ? "none" : "currentColor"} stroke={stroke ? "currentColor" : "none"} strokeWidth={stroke ? 1.5 : 0}>
      <path d={d} />
    </svg>
  );
}

/* ═══════════════════════ PARTICLES (landing-specific, lighter) ═══════════════════════ */

function LandingParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    const particles: { x: number; y: number; r: number; vx: number; vy: number; alpha: number }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const init = () => {
      particles.length = 0;
      const count = canvas.width < 768 ? 30 : 50;
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: Math.random() * 2 + 0.5,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          alpha: Math.random() * 0.3 + 0.05,
        });
      }
    };

    resize();
    init();

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        a.x += a.vx;
        a.y += a.vy;
        if (a.x < 0) a.x = canvas.width;
        if (a.x > canvas.width) a.x = 0;
        if (a.y < 0) a.y = canvas.height;
        if (a.y > canvas.height) a.y = 0;

        ctx.beginPath();
        ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(168, 85, 247, ${a.alpha})`;
        ctx.fill();

        // draw connections
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(168, 85, 247, ${(1 - dist / 140) * 0.08})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      raf = requestAnimationFrame(draw);
    };

    draw();
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }} aria-hidden="true" />;
}

/* ═══════════════════════════════════════════════════════════════════
   LANDING PAGE COMPONENT
   ═══════════════════════════════════════════════════════════════════ */

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-[rgb(10,10,10)] text-white overflow-x-hidden">

      {/* ──── STICKY HEADER ──── */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-white/5" style={{ background: 'rgba(10,10,10,0.75)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/duvlogo.png" alt="DUV Logo" className="w-8 h-8 rounded-full" />
            <span className="font-semibold text-sm md:text-base text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">
              Deep Understanding Validator
            </span>
          </div>
          <Link
            href="/login"
            id="header-cta"
            className="px-4 py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 transition-all duration-300 shadow-lg shadow-purple-900/30"
          >
            Start Validating
          </Link>
        </div>
      </header>

      {/* ──── HERO SECTION ──── */}
      <section id="hero" className="relative flex flex-col items-center justify-center text-center min-h-screen px-6 pt-8 pb-16">
        {/* Decorative radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(147,51,234,0.4) 0%, transparent 70%)' }} />

        <Reveal>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/20 bg-purple-500/5 text-purple-300 text-xs font-medium mb-8 tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            AI-Powered Code Understanding Analysis
          </div>
        </Reveal>

        <Reveal delay={100}>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold leading-tight max-w-4xl">
            Do You <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-400 to-purple-600 animate-gradient-shift">Truly Understand</span>{' '}
            Your Code?
          </h1>
        </Reveal>

        <Reveal delay={200}>
          <p className="mt-6 text-neutral-400 text-lg md:text-xl max-w-2xl leading-relaxed">
            Paste your code and let our AI agent challenge you with conceptual questions.
            Discover blind spots. Prove mastery. Level up your understanding.
          </p>
        </Reveal>

        <Reveal delay={350}>
          <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
            <Link
              href="/login"
              id="hero-cta"
              className="px-8 py-4 text-base font-bold rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 transition-all duration-300 shadow-xl shadow-purple-900/40 animate-glow-pulse"
            >
              Test Your Understanding →
            </Link>
            <a
              href="#how-it-works"
              className="px-6 py-4 text-base font-medium rounded-xl border border-neutral-700 hover:border-purple-500/50 hover:bg-white/[0.02] transition-all duration-300 text-neutral-300"
            >
              How It Works
            </a>
          </div>
        </Reveal>

        {/* Down arrow */}
        <ScrollArrow targetId="how-it-works" />
      </section>

      {/* ──── HOW IT WORKS ──── */}
      <section id="how-it-works" className="relative min-h-screen flex flex-col justify-center py-20 px-6">
        <div className="max-w-5xl mx-auto w-full">
          <Reveal>
            <h2 className="text-center text-3xl md:text-4xl font-bold mb-4">
              How It <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-500">Works</span>
            </h2>
            <p className="text-center text-neutral-500 mb-16 max-w-lg mx-auto">Three simple steps to validate your deep understanding of any code snippet.</p>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <IconUpload />, step: '01', title: 'Submit Your Code', desc: 'Paste any code snippet — C++, Python, Java, JavaScript, or other languages. Our AI instantly analyzes its structure and logic.' },
              { icon: <IconChat />, step: '02', title: 'Answer AI Questions', desc: 'Engage in a dynamic conversation with the AI agent. Answer conceptual questions that probe your deep understanding.' },
              { icon: <IconAward />, step: '03', title: 'Get Your Verdict', desc: 'Receive a comprehensive understanding score with detailed feedback on your strengths and areas to explore.' },
            ].map((item, i) => (
              <Reveal key={item.step} delay={i * 150}>
                <HoverGlowCard className="landing-glass rounded-2xl h-full border border-white/5 shadow-lg transition-all duration-500">
                  <div className="flex flex-col items-center p-8 text-center h-full w-full relative z-10">
                    {/* Step number watermark */}
                    <span className="absolute -top-4 -right-2 text-8xl font-black text-white/[0.02] select-none group-hover:text-purple-500/[0.05] transition-colors duration-500">
                      {item.step}
                    </span>
                    <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-500/10 text-purple-400 mb-6 group-hover:bg-purple-500/20 transition-colors duration-300 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
                      {item.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-4 text-white">{item.title}</h3>
                    <p className="text-neutral-400 text-sm leading-relaxed max-w-[280px]">{item.desc}</p>
                  </div>
                </HoverGlowCard>
              </Reveal>
            ))}
          </div>
        </div>
        <ScrollArrow targetId="features" />
      </section>

      {/* ──── FEATURES GRID ──── */}
      <section id="features" className="relative min-h-screen flex flex-col justify-center pt-20 pb-32 px-6">
        {/* Subtle bg accent */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(88,28,135,0.04) 50%, transparent 100%)' }} />

        <div className="max-w-5xl mx-auto w-full relative">
          <Reveal>
            <h2 className="text-center text-3xl md:text-4xl font-bold mb-4">
              What We <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-500">Offer</span>
            </h2>
            <p className="text-center text-neutral-500 mb-16 max-w-lg mx-auto">Powerful tools designed to deepen your code comprehension.</p>
          </Reveal>

          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { icon: <IconBrain />, title: 'AI-Driven Analysis', desc: 'Advanced language models dissect your code and generate targeted conceptual questions that go beyond syntax — challenging your understanding of data flow, edge cases, and design patterns.' },
              { icon: <IconCode />, title: 'Multi-Language Support', desc: 'Submit code in C++, Python, Java, JavaScript, TypeScript, and more. The AI adapts its questioning style and depth to the specific language and paradigm.' },
              { icon: <IconLayers />, title: 'Adaptive Difficulty', desc: 'Questions dynamically adjust in complexity based on your responses. Start with fundamentals and progress to expert-level conceptual challenges.' },
              { icon: <IconHistory />, title: 'Session History', desc: 'Every analysis is saved to your personal dashboard. Review past conversations, track your progress, and revisit challenging concepts anytime.' },
            ].map((f, i) => (
              <Reveal key={f.title} delay={i * 100}>
                <HoverGlowCard className="landing-glass rounded-2xl h-full border border-white/5 shadow-lg transition-all duration-500">
                  <div className="flex flex-col items-center p-8 text-center h-full w-full">
                    <div className="text-purple-400 mb-5 group-hover:text-purple-300 transition-colors duration-300 group-hover:scale-110 transform transition-transform duration-500 drop-shadow-[0_0_8px_rgba(168,85,247,0.3)]">
                      {f.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-white">{f.title}</h3>
                    <p className="text-neutral-400 text-sm leading-relaxed">{f.desc}</p>
                  </div>
                </HoverGlowCard>
              </Reveal>
            ))}
          </div>
        </div>
        <ScrollArrow targetId="technologies" />
      </section>

      {/* ──── TECHNOLOGIES ──── */}
      <section id="technologies" className="relative min-h-screen flex flex-col justify-center py-20 px-6">
        <div className="max-w-5xl mx-auto w-full">
          <Reveal>
            <h2 className="text-center text-3xl md:text-4xl font-bold mb-4">
              Technologies We <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-500">Use</span>
            </h2>
            <p className="text-center text-neutral-500 mb-16 max-w-lg mx-auto">Built with a modern, production-grade stack.</p>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[
              { name: 'Next.js', icon: <NextjsLogo className="w-10 h-10 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]" /> },
              { name: 'React', icon: <ReactLogo className="w-10 h-10 text-[#61DAFB] drop-shadow-[0_0_15px_rgba(97,218,251,0.3)]" /> },
              { name: 'TypeScript', icon: <TypeScriptLogo className="w-10 h-10 text-[#3178C6] drop-shadow-[0_0_15px_rgba(49,120,198,0.3)]" /> },
              { name: 'Tailwind CSS', icon: <TailwindLogo className="w-10 h-10 text-[#06B6D4] drop-shadow-[0_0_15px_rgba(6,182,212,0.3)]" /> },
              { name: 'Supabase', icon: <SupabaseLogo className="w-10 h-10 text-[#3ECF8E] drop-shadow-[0_0_15px_rgba(62,207,142,0.3)]" /> },
              { name: 'Groq SDK', icon: <GroqLogo className="w-10 h-10 text-[#F55036] drop-shadow-[0_0_15px_rgba(245,80,54,0.3)]" /> },
              { name: 'OpenAI', icon: <OpenAILogo className="w-10 h-10 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]" /> },
              { name: 'Vercel AI SDK', icon: <VercelLogo className="w-10 h-10 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]" /> },
              { name: 'Zod', icon: <ZodLogo className="w-10 h-10 text-[#3E67B1] drop-shadow-[0_0_15px_rgba(62,103,177,0.3)]" /> },
              { name: 'Playwright', icon: <PlaywrightLogo className="w-10 h-10 text-[#2EAD33] drop-shadow-[0_0_15px_rgba(46,173,51,0.3)]" /> },
              { name: 'Vitest', icon: <VitestLogo className="w-10 h-10 text-[#FCC72B] drop-shadow-[0_0_15px_rgba(252,199,43,0.3)]" /> },
              { name: 'Node.js', icon: <NodejsLogo className="w-10 h-10 text-[#5FA04E] drop-shadow-[0_0_15px_rgba(95,160,78,0.3)]" /> },
            ].map((tech, i) => (
              <Reveal key={tech.name} delay={i * 50}>
                <HoverGlowCard className="landing-glass rounded-2xl h-full border border-white/5 shadow-lg bg-[#111] overflow-hidden">
                  <div className="flex flex-col items-center justify-center p-8 gap-6 h-full w-full relative z-10 transition-transform duration-500 group-hover:scale-[1.02]">
                    <div className="shrink-0 flex items-center justify-center h-16 w-16 rounded-2xl bg-white/[0.03] border border-white/[0.05] transition-all duration-500 group-hover:bg-white/[0.07] group-hover:border-white/[0.1] group-hover:scale-110 shadow-xl">
                      {tech.icon}
                    </div>
                    <span className="text-base font-bold text-white tracking-wide text-center">
                      {tech.name}
                    </span>
                  </div>
                </HoverGlowCard>
              </Reveal>
            ))}
          </div>
        </div>
        <ScrollArrow targetId="stats" />
      </section>

      {/* ──── STATS ──── */}
      <section id="stats" className="relative min-h-screen flex flex-col justify-center py-20 px-6">
        <div className="max-w-4xl mx-auto w-full">
          <Reveal>
            <h2 className="text-center text-3xl md:text-4xl font-bold mb-16">
              DUV in <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-500">Numbers</span>
            </h2>
          </Reveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-16">
            <StatItem label="Code Lines Analyzed" target={54000} suffix="+" />
            <StatItem label="Concepts Challenged" target={1200} suffix="+" />
            <StatItem label="Active Developers" target={450} suffix="+" />
            <StatItem label="Dev Hours Saved" target={8500} suffix="+" />
            <StatItem label="Languages Supported" target={12} suffix="+" />
            <StatItem label="Questions / Session" target={5} suffix="+" />
            <StatItem label="Difficulty Tiers" target={3} />
            <StatItem label="Analysis Accuracy" target={99} suffix="%" />
          </div>
        </div>
        <ScrollArrow targetId="cta" />
      </section>

      {/* ──── CENTRAL AI CTA MODULE ──── */}
      <section id="cta" className="relative min-h-screen flex flex-col justify-center py-20 px-6">
        <Reveal>
          <HoverGlowCard className="max-w-3xl mx-auto w-full landing-glass rounded-3xl p-12 md:p-16 text-center transform-gpu">
            <div className="relative z-10">
              <div className="inline-flex mb-6">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/duvlogo.png" alt="" className="w-16 h-16 rounded-full animate-float drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 drop-shadow-md">
                Ready to Prove Your Understanding?
              </h2>
              <p className="text-neutral-400 mb-8 max-w-lg mx-auto">
                Start a conversation with our AI validator. Submit your code, answer insightful questions, and discover how deeply you truly understand what you&apos;ve written.
              </p>
              <Link
                href="/login"
                id="cta-main"
                className="inline-flex items-center gap-2 px-10 py-4 text-lg font-bold rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 transition-all duration-300 shadow-xl shadow-purple-900/40 animate-glow-pulse"
              >
                Start Your First Analysis
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </HoverGlowCard>
        </Reveal>
        <ScrollArrow targetId="hero" direction="up" />
      </section>

      {/* ──── FOOTER ──── */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Branding */}
            <div className="flex flex-col items-center md:items-start gap-3">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/duvlogo.png" alt="DUV Logo" className="w-7 h-7 rounded-full" />
                <span className="font-semibold text-sm text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">
                  Deep Understanding Validator
                </span>
              </div>
              <p className="text-neutral-600 text-xs max-w-xs text-center md:text-left">
                AI-powered code comprehension analysis. Challenge your understanding, grow your expertise.
              </p>
            </div>

            {/* Links */}
            <div className="flex items-center gap-6">
              <a
                href="https://github.com/Tpchck/Deep-Understanding-Validator"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-neutral-500 hover:text-purple-400 transition-colors duration-300 text-sm"
              >
                <IconGitHub />
                <span>GitHub</span>
              </a>
              <Link
                href="/login"
                className="text-neutral-500 hover:text-purple-400 transition-colors duration-300 text-sm"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="text-neutral-500 hover:text-purple-400 transition-colors duration-300 text-sm"
              >
                Register
              </Link>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/5 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-neutral-700 text-xs">
              © {new Date().getFullYear()} Deep Understanding Validator. All rights reserved.
            </p>
            <p className="text-neutral-700 text-xs">
              Built with Next.js, Supabase & AI
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ──── Stat item sub-component ──── */
function StatItem({ label, target, suffix = '' }: { label: string; target: number; suffix?: string }) {
  const { value, ref } = useCountUp(target);
  return (
    <Reveal>
      <div ref={ref} className="text-center">
        <p className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-500">
          {value}{suffix}
        </p>
        <p className="text-neutral-500 text-sm mt-2">{label}</p>
      </div>
    </Reveal>
  );
}