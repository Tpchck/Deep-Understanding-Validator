'use client';

import dynamic from 'next/dynamic';

const ParticleBackground = dynamic(
  () => import('@/components/ui/ParticleBackground'),
  { ssr: false }
);

export default function ClientParticleBackground() {
  return <ParticleBackground />;
}
