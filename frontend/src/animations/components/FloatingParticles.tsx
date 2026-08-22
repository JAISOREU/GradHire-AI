import { useEffect, useRef, useCallback } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';

export interface FloatingParticle {
  id: string;
  x: number;
  y: number;
  radius: number;
  opacity: number;
  speed: number;
  color?: string;
}

export interface FloatingParticlesProps {
  count?: number;
  color?: string;
  minRadius?: number;
  maxRadius?: number;
  speed?: number;
  className?: string;
  onParticleClick?: (id: string) => void;
}

export const FloatingParticles = ({
  count = 20,
  color = 'var(--color-primary)',
  minRadius = 1,
  maxRadius = 3,
  speed = 0.3,
  className = '',
  onParticleClick,
}: FloatingParticlesProps) => {
  const reducedMotion = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<FloatingParticle[]>([]);
  const rafRef = useRef<number>(0);

  const initParticles = useCallback((width: number, height: number) => {
    const particles: FloatingParticle[] = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        id: `particle-${i}`,
        x: Math.random() * width,
        y: Math.random() * height,
        radius: minRadius + Math.random() * (maxRadius - minRadius),
        opacity: 0.1 + Math.random() * 0.4,
        speed: 0.1 + Math.random() * speed,
        color,
      });
    }
    particlesRef.current = particles;
  }, [count, color, minRadius, maxRadius, speed]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || reducedMotion) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect) return;
      canvas.width = rect.width;
      canvas.height = rect.height;
      initParticles(canvas.width, canvas.height);
    };

    resize();
    window.addEventListener('resize', resize);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((p) => {
        p.y -= p.speed;
        if (p.y < -10) {
          p.y = canvas.height + 10;
          p.x = Math.random() * canvas.width;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color || color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();
      });

      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [reducedMotion, initParticles, color]);

  if (reducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      className={`floating-particles ${className}`}
      aria-hidden="true"
      onClick={() => {
        if (onParticleClick && particlesRef.current.length > 0) {
          const random = particlesRef.current[Math.floor(Math.random() * particlesRef.current.length)];
          onParticleClick(random.id);
        }
      }}
    />
  );
};
