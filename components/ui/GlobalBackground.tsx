'use client';

import { useEffect, useRef } from 'react';

export default function GlobalBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    const particles: { x: number; y: number; r: number; vx: number; vy: number; alpha: number; colorOffset: number }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const init = () => {
      particles.length = 0;
      // Slightly more particles for "alive" feel, but within performance limits
      const count = canvas.width < 768 ? 40 : 70;
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: Math.random() * 2.5 + 0.5,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          alpha: Math.random() * 0.4 + 0.1,
          colorOffset: Math.random() * Math.PI * 2, // for color shifting
        });
      }
    };

    resize();
    init();

    let time = 0;
    const draw = () => {
      time += 0.01;
      // Fade out previous frame instead of clearRect for a slight trail
      ctx.fillStyle = 'rgba(10, 10, 10, 0.3)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        
        // Gentle drift upward/diagonal
        p.x += p.vx + Math.sin(time + p.colorOffset) * 0.2;
        p.y += p.vy - 0.1;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // Shift color between purple (168, 85, 247) and fuchsia (217, 70, 239)
        const mix = (Math.sin(time * 2 + p.colorOffset) + 1) / 2;
        const r = Math.floor(168 + (217 - 168) * mix);
        const g = Math.floor(85 + (70 - 85) * mix);
        const b = Math.floor(247 + (239 - 247) * mix);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.alpha})`;
        ctx.fill();

        // Connect nearby
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${(1 - dist / 150) * 0.15})`;
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

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: -10 }} aria-hidden="true" />;
}
