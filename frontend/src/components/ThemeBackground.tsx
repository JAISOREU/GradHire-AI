import { useEffect, useRef } from 'react';

type Theme = 'light' | 'dark';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
}

const LIGHT_PALETTE = [
  'rgba(79, 70, 229, 0.22)',
  'rgba(37, 99, 235, 0.18)',
  'rgba(5, 150, 105, 0.14)',
  'rgba(217, 119, 6, 0.10)',
];

const DARK_PALETTE = [
  'rgba(129, 140, 248, 0.30)',
  'rgba(96, 165, 250, 0.25)',
  'rgba(52, 211, 153, 0.18)',
  'rgba(251, 191, 36, 0.12)',
];

export const ThemeBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const frameRef = useRef<number>(0);
  const themeRef = useRef<Theme>('light');

  const getTheme = (): Theme => {
    if (typeof document === 'undefined') return 'light';
    return (document.documentElement.getAttribute('data-theme') as Theme) || 'light';
  };

  const initParticles = (width: number, height: number, theme: Theme) => {
    const palette = theme === 'dark' ? DARK_PALETTE : LIGHT_PALETTE;
    const count = Math.min(50, Math.floor((width * height) / 20000));
    const particles: Particle[] = [];

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: Math.random() * 2 + 0.8,
        color: palette[Math.floor(Math.random() * palette.length)],
        alpha: Math.random() * 0.4 + 0.25,
      });
    }
    particlesRef.current = particles;
  };

  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    const theme = themeRef.current;
    const lineColor = theme === 'dark' ? '129, 140, 248' : '79, 70, 229';

    particlesRef.current.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;
      if (p.y < -10) p.y = height + 10;
      if (p.y > height + 10) p.y = -10;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fill();
    });

    ctx.globalAlpha = 1;
    const maxDist = 90;
    for (let i = 0; i < particlesRef.current.length; i++) {
      for (let j = i + 1; j < particlesRef.current.length; j++) {
        const dx = particlesRef.current[i].x - particlesRef.current[j].x;
        const dy = particlesRef.current[i].y - particlesRef.current[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDist) {
          const opacity = (1 - dist / maxDist) * 0.12;
          ctx.beginPath();
          ctx.moveTo(particlesRef.current[i].x, particlesRef.current[i].y);
          ctx.lineTo(particlesRef.current[j].x, particlesRef.current[j].y);
          ctx.strokeStyle = `rgba(${lineColor}, ${opacity})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    frameRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
      initParticles(canvas.width, canvas.height, themeRef.current);
    };

    resize();
    frameRef.current = requestAnimationFrame(animate);

    const handleThemeChange = () => {
      themeRef.current = getTheme();
      const c = canvasRef.current;
      if (c) initParticles(c.width, c.height, themeRef.current);
    };

    const observer = new MutationObserver(handleThemeChange);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', resize);
      observer.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="theme-background"
      aria-hidden="true"
    />
  );
};
