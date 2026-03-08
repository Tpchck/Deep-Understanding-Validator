'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

const CONNECTION_DISTANCE = 150;
const CONNECTION_DIST_SQ = CONNECTION_DISTANCE * CONNECTION_DISTANCE;
const MOUSE_RADIUS = 150;
const MOUSE_RADIUS_SQ = MOUSE_RADIUS * MOUSE_RADIUS;
const BASE_SPEED = 0.3;
const RETURN_FORCE = 0.008;
const BOUNDARY_MARGIN = 60;

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const initParticles = () => {
      const count = canvas.width < 768 ? 35 : 60;
      particlesRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * BASE_SPEED * 2,
        vy: (Math.random() - 0.5) * BASE_SPEED * 2,
      }));
    };

    resize();
    initParticles();

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        mouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const onPointerLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onPointerLeave);
    document.addEventListener('mouseleave', onPointerLeave);

    if (prefersReducedMotion) {
      drawFrame(ctx, canvas, particlesRef.current, mouseRef.current);
      return () => {
        window.removeEventListener('resize', resize);
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('touchmove', onTouchMove);
        window.removeEventListener('touchend', onPointerLeave);
        document.removeEventListener('mouseleave', onPointerLeave);
      };
    }

    let paused = false;
    const onVisibilityChange = () => {
      paused = document.hidden;
      if (!paused) rafRef.current = requestAnimationFrame(animate);
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    const animate = () => {
      if (paused) return;
      updateParticles(canvas, particlesRef.current, mouseRef.current);
      drawFrame(ctx, canvas, particlesRef.current, mouseRef.current);
      rafRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onPointerLeave);
      document.removeEventListener('mouseleave', onPointerLeave);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none"
      aria-hidden="true"
    />
  );
}

function updateParticles(
  canvas: HTMLCanvasElement,
  particles: Particle[],
  mouse: { x: number; y: number }
) {
  for (const p of particles) {
    const dx = p.x - mouse.x;
    const dy = p.y - mouse.y;
    const distSq = dx * dx + dy * dy;

    if (distSq < MOUSE_RADIUS_SQ && distSq > 0) {
      const dist = Math.sqrt(distSq);
      const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
      p.vx += (dx / dist) * force * 0.15;
      p.vy += (dy / dist) * force * 0.15;
    }

    p.vx *= 0.98;
    p.vy *= 0.98;

    const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
    if (speed < BASE_SPEED * 0.5) {
      p.vx += (Math.random() - 0.5) * 0.05;
      p.vy += (Math.random() - 0.5) * 0.05;
    }
    if (speed > 1.5) {
      p.vx = (p.vx / speed) * 1.5;
      p.vy = (p.vy / speed) * 1.5;
    }

    p.x += p.vx;
    p.y += p.vy;

    // Soft return force when pushed beyond viewport
    if (p.x < -BOUNDARY_MARGIN) p.vx += RETURN_FORCE * (-BOUNDARY_MARGIN - p.x + 1);
    else if (p.x > canvas.width + BOUNDARY_MARGIN) p.vx -= RETURN_FORCE * (p.x - canvas.width - BOUNDARY_MARGIN + 1);
    if (p.y < -BOUNDARY_MARGIN) p.vy += RETURN_FORCE * (-BOUNDARY_MARGIN - p.y + 1);
    else if (p.y > canvas.height + BOUNDARY_MARGIN) p.vy -= RETURN_FORCE * (p.y - canvas.height - BOUNDARY_MARGIN + 1);
  }
}

function drawFrame(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  particles: Particle[],
  mouse: { x: number; y: number }
) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const distSq = dx * dx + dy * dy;

      if (distSq < CONNECTION_DIST_SQ) {
        const dist = Math.sqrt(distSq);
        const opacity = (1 - dist / CONNECTION_DISTANCE) * 0.12;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(192, 132, 252, ${opacity})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }

  for (const p of particles) {
    const dx = p.x - mouse.x;
    const dy = p.y - mouse.y;
    const distSq = dx * dx + dy * dy;
    const nearMouse = distSq < MOUSE_RADIUS_SQ;

    if (nearMouse) {
      const dist = Math.sqrt(distSq);
      const opacity = (1 - dist / MOUSE_RADIUS) * 0.2;
      ctx.beginPath();
      ctx.moveTo(mouse.x, mouse.y);
      ctx.lineTo(p.x, p.y);
      ctx.strokeStyle = `rgba(147, 130, 255, ${opacity})`;
      ctx.lineWidth = 0.6;
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(p.x, p.y, nearMouse ? 3 : 2, 0, Math.PI * 2);
    ctx.fillStyle = nearMouse
      ? 'rgba(167, 139, 250, 0.6)'
      : 'rgba(192, 132, 252, 0.25)';
    ctx.fill();
  }
}
