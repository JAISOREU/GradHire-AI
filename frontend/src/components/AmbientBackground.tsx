import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

export interface AmbientBackgroundHandle {
  setProgress: (progress: number) => void;
  setScene: (id: string, direction?: 'forward' | 'backward') => void;
}

type Vec3 = [number, number, number];

interface Orb {
  x: number;
  y: number;
  size: number;
  hue: number;
  alpha: number;
  depth: number;
  vx: number;
  vy: number;
  phase: number;
}

interface Mote {
  x: number;
  y: number;
  size: number;
  hue: number;
  alpha: number;
  depth: number;
  vx: number;
  vy: number;
  phase: number;
  speed: number;
}

/** Per-slide mood. cyanBias shifts the whole particle distribution toward cyan.
 *  flow drives a gentle directional bias; alphaMul/drift scale brightness + idle speed. */
interface AmbientScene {
  cyanBias: number;
  alphaMul: number;
  drift: number;
  density: number;
  flowX: number;
  flowY: number;
}

const CYAN: Vec3 = [0, 217, 255];
const FALLBACK_PRIMARY: Vec3 = [139, 131, 255];
const TAU = Math.PI * 2;

const SCENE_ORDER = ['hero', 'ai-matching', 'resume-intelligence', 'job-hub', 'talent', 'employers', 'ai-intelligence', 'applications', 'security', 'journey', 'how-it-works', 'cta'];

const SCENES: Record<string, AmbientScene> = {
  hero: { cyanBias: 0.02, alphaMul: 1.0, drift: 1.0, density: 1, flowX: 0, flowY: 0 },
  'ai-matching': { cyanBias: -0.18, alphaMul: 1.0, drift: 1.05, density: 1, flowX: 0, flowY: 0 },
  'resume-intelligence': { cyanBias: 0.05, alphaMul: 0.95, drift: 1.1, density: 1, flowX: 0, flowY: 0 },
  'job-hub': { cyanBias: 0.3, alphaMul: 1.0, drift: 1.15, density: 1.05, flowX: 0.4, flowY: 0.1 },
  talent: { cyanBias: 0.1, alphaMul: 1.0, drift: 1.1, density: 1.05, flowX: 0.9, flowY: 0.05 },
  employers: { cyanBias: -0.25, alphaMul: 0.95, drift: 1.0, density: 1.15, flowX: 0, flowY: 0 },
  'ai-intelligence': { cyanBias: 0.12, alphaMul: 0.98, drift: 1.0, density: 1.1, flowX: 0, flowY: 0 },
  applications: { cyanBias: -0.05, alphaMul: 0.92, drift: 0.9, density: 1, flowX: 0.15, flowY: 0 },
  security: { cyanBias: -0.05, alphaMul: 0.78, drift: 0.7, density: 0.85, flowX: 0, flowY: 0 },
  journey: { cyanBias: 0.12, alphaMul: 1.0, drift: 1.0, density: 1, flowX: 0, flowY: 0 },
  'how-it-works': { cyanBias: -0.15, alphaMul: 1.0, drift: 1.0, density: 1, flowX: 0, flowY: 0 },
  cta: { cyanBias: 0.15, alphaMul: 1.05, drift: 1.0, density: 1.05, flowX: 0, flowY: 0 },
  auth: { cyanBias: 0, alphaMul: 0.92, drift: 0.9, density: 0.9, flowX: 0, flowY: 0 },
};

const DEFAULT_SCENE: AmbientScene = SCENES.hero;

const ORB_MIN = 9;
const ORB_MAX = 17;
const ORBS_PER_PX = 96000;
const MOTE_MIN = 44;
const MOTE_MAX = 110;
const MOTES_PER_PX = 15500;
const LINK_DIST = 150;

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));
const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

const morphScene = (a: AmbientScene, b: AmbientScene, t: number): AmbientScene => ({
  cyanBias: lerp(a.cyanBias, b.cyanBias, t),
  alphaMul: lerp(a.alphaMul, b.alphaMul, t),
  drift: lerp(a.drift, b.drift, t),
  density: lerp(a.density, b.density, t),
  flowX: lerp(a.flowX, b.flowX, t),
  flowY: lerp(a.flowY, b.flowY, t),
});

const mix = (a: Vec3, b: Vec3, t: number): Vec3 => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];

const rgb = (color: Vec3, alpha: number): string => `rgba(${color[0]},${color[1]},${color[2]},${alpha})`;

interface AmbientBackgroundProps {
  /** Lock to a fixed scene (e.g. "auth") instead of following slide progress. */
  scene?: string;
}

export const AmbientBackground = forwardRef<AmbientBackgroundHandle, AmbientBackgroundProps>(
  function AmbientBackground({ scene }: AmbientBackgroundProps, ref) {
    const wrapRef = useRef<HTMLDivElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const orbs = useRef<Orb[]>([]);
    const motes = useRef<Mote[]>([]);
    const pointer = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
    const target = useRef(0);
    const current = useRef(0);
    const surge = useRef({ energy: 0, sign: 1 });
    const themePulse = useRef(0);
    const lockedScene = useRef(scene ?? null);
    const palette = useRef<{ primary: Vec3; dark: boolean }>({ primary: FALLBACK_PRIMARY, dark: true });
    const rafId = useRef<number | null>(null);
    const reducedRef = useRef(false);
    const disposedRef = useRef(false);

    useImperativeHandle(
      ref,
      () => ({
        setProgress: (progress: number) => {
          target.current = progress;
        },
        setScene: (_id: string, direction?: 'forward' | 'backward') => {
          if (direction) {
            surge.current = { energy: 1, sign: direction === 'forward' ? 1 : -1 };
          }
        },
      }),
      []
    );

    useEffect(() => {
      const canvas = canvasRef.current;
      const wrap = wrapRef.current;
      if (!canvas || !wrap) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let width = 0;
      let height = 0;
      let last = performance.now();
      disposedRef.current = false;

      const readTheme = () => {
        const cs = getComputedStyle(document.documentElement);
        const prim = cs.getPropertyValue('--color-primary-rgb').trim();
        const surf = cs.getPropertyValue('--color-surface-rgb').trim();
        const primary: Vec3 =
          prim && prim.split(',').length === 3
            ? (prim.split(',').map((part) => Number(part.trim())) as Vec3)
            : FALLBACK_PRIMARY;
        const dark = surf
          ? surf.split(',').reduce((sum, part) => sum + Number(part.trim()), 0) / 3 < 128
          : true;
        palette.current = { primary, dark };
      };

      const activeScene = (): AmbientScene => {
        if (lockedScene.current) {
          return SCENES[lockedScene.current] ?? DEFAULT_SCENE;
        }
        const progress = clamp(current.current, 0, SCENE_ORDER.length - 1);
        const floor = Math.min(SCENE_ORDER.length - 1, Math.max(0, Math.floor(progress)));
        const ceil = Math.min(SCENE_ORDER.length - 1, floor + 1);
        const frac = clamp(progress - floor, 0, 1);
        if (floor === ceil) return SCENES[SCENE_ORDER[floor]] ?? DEFAULT_SCENE;
        return morphScene(
          SCENES[SCENE_ORDER[floor]] ?? DEFAULT_SCENE,
          SCENES[SCENE_ORDER[ceil]] ?? DEFAULT_SCENE,
          frac
        );
      };

      const resize = () => {
        const rect = wrap.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        width = rect.width;
        height = rect.height;
        canvas.width = Math.max(1, Math.round(width * dpr));
        canvas.height = Math.max(1, Math.round(height * dpr));
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        build();
        if (reducedRef.current) {
          draw(0, 0);
        }
      };

      const build = () => {
        const area = Math.max(1, width * height);
        const scene = activeScene();
        const density = scene.density;
        const { dark } = palette.current;

        const orbCount = clamp(Math.round((area / ORBS_PER_PX) * density), ORB_MIN, ORB_MAX);
        orbs.current = Array.from({ length: orbCount }, () => ({
          x: Math.random(),
          y: Math.random(),
          size: 0.07 + Math.random() * 0.15,
          hue: Math.random(),
          alpha: dark ? 0.05 + Math.random() * 0.075 : 0.06 + Math.random() * 0.055,
          depth: 0.25 + Math.random() * 0.75,
          vx: (Math.random() - 0.5) * 0.012,
          vy: (Math.random() - 0.5) * 0.012,
          phase: Math.random() * TAU,
        }));

        const moteCount = clamp(Math.round((area / MOTES_PER_PX) * density), MOTE_MIN, MOTE_MAX);
        motes.current = Array.from({ length: moteCount }, () => ({
          x: Math.random(),
          y: Math.random(),
          size: 0.7 + Math.random() * 1.7,
          hue: Math.random(),
          alpha: dark ? 0.5 + Math.random() * 0.4 : 0.34 + Math.random() * 0.28,
          depth: 0.35 + Math.random() * 0.85,
          vx: (Math.random() - 0.5) * 0.02,
          vy: (Math.random() - 0.5) * 0.02,
          phase: Math.random() * TAU,
          speed: 0.4 + Math.random() * 1.2,
        }));
      };

      const draw = (dt: number, time: number) => {
        const scene = activeScene();
        const { primary, dark } = palette.current;
        const progress = current.current;
        const px = pointer.current.x;
        const py = pointer.current.y;
        const surgeEnergy = surge.current.energy;
        const surgeDX = surgeEnergy * surge.current.sign * 10;
        const surgeDY = surgeEnergy * surge.current.sign * 26;
        const pulse = themePulse.current;
        const alphaBoost = scene.alphaMul * (1 + pulse * 0.35);
        const minDim = Math.min(width, height) || 1;

        ctx.clearRect(0, 0, width, height);

        // Whole-canvas micro tilt on pointer for a living, tactile surface.
        ctx.save();
        ctx.translate(width / 2, height / 2);
        ctx.rotate(px * 0.0016 + py * 0.001);
        ctx.translate(-width / 2, -height / 2);

        for (const orb of orbs.current) {
          orb.x += (orb.vx * scene.drift + scene.flowX * 0.004) * dt;
          orb.y += (orb.vy * scene.drift + scene.flowY * 0.004) * dt;
          if (orb.x < -0.06) orb.x = 1.06;
          else if (orb.x > 1.06) orb.x = -0.06;
          if (orb.y < -0.06) orb.y = 1.06;
          else if (orb.y > 1.06) orb.y = -0.06;

          const breath = 1 + 0.05 * Math.sin(time * 0.6 + orb.phase);
          const cx = orb.x * width + px * orb.depth * 0.045 * width + surgeDX * orb.depth;
          const cy = orb.y * height + py * orb.depth * 0.045 * height - progress * orb.depth * 4 + surgeDY * orb.depth;
          const radius = orb.size * breath * minDim;
          const color = mix(primary, CYAN, clamp(orb.hue + scene.cyanBias * 0.5, 0, 1));
          const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
          gradient.addColorStop(0, rgb(color, orb.alpha * alphaBoost));
          gradient.addColorStop(1, rgb(color, 0));
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(cx, cy, radius, 0, TAU);
          ctx.fill();
        }

        const linkBase = dark ? 0.12 : 0.09;
        const moteOffset = (x: number, y: number, depth: number) => ({
          x: x * width + px * depth * 0.07 * width + surgeDX * depth * 0.5,
          y: y * height + py * depth * 0.07 * height - progress * depth * 2.5 + surgeDY * depth * 0.6,
        });

        for (let i = 0; i < motes.current.length; i++) {
          const a = motes.current[i];
          const pa = moteOffset(a.x, a.y, a.depth);
          for (let j = i + 1; j < motes.current.length; j++) {
            const b = motes.current[j];
            const pb = moteOffset(b.x, b.y, b.depth);
            const dx = pa.x - pb.x;
            const dy = pa.y - pb.y;
            const distSq = dx * dx + dy * dy;
            if (distSq > LINK_DIST * LINK_DIST) continue;
            const fade = 1 - Math.sqrt(distSq) / LINK_DIST;
            ctx.strokeStyle = rgb(mix(primary, CYAN, 0.5), fade * linkBase * 0.6 * alphaBoost);
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(pa.x, pa.y);
            ctx.lineTo(pb.x, pb.y);
            ctx.stroke();
          }
        }

        ctx.globalCompositeOperation = 'lighter';
        for (const mote of motes.current) {
          mote.x += (mote.vx * scene.drift + scene.flowX * 0.006) * dt;
          mote.y += (mote.vy * scene.drift + scene.flowY * 0.006) * dt;
          if (mote.x < -0.04) mote.x = 1.04;
          else if (mote.x > 1.04) mote.x = -0.04;
          if (mote.y < -0.04) mote.y = 1.04;
          else if (mote.y > 1.04) mote.y = -0.04;

          const twinkle = 0.35 + 0.65 * Math.abs(Math.sin(time * mote.speed + mote.phase));
          const p = moteOffset(mote.x, mote.y, mote.depth);
          const color = mix(primary, CYAN, clamp(mote.hue + scene.cyanBias, 0, 1));
          ctx.fillStyle = rgb(color, mote.alpha * alphaBoost * twinkle);
          ctx.beginPath();
          ctx.arc(p.x, p.y, mote.size, 0, TAU);
          ctx.fill();
        }
        ctx.globalCompositeOperation = 'source-over';
        ctx.restore();
      };

      const tick = (now: number) => {
        if (disposedRef.current) return;
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;

        const p = pointer.current;
        const ease = 1 - Math.exp(-6 * dt);
        p.x += (p.tx - p.x) * ease;
        p.y += (p.ty - p.y) * ease;

        const progressEase = 1 - Math.exp(-3 * dt);
        current.current += (target.current - current.current) * progressEase;

        surge.current.energy *= Math.exp(-2.5 * dt);
        if (surge.current.energy < 0.01) surge.current.energy = 0;
        themePulse.current *= Math.exp(-2.2 * dt);
        if (themePulse.current < 0.01) themePulse.current = 0;

        if (lockedScene.current) target.current = current.current;

        draw(dt, now / 1000);
        rafId.current = window.requestAnimationFrame(tick);
      };

      const start = () => {
        if (reducedRef.current) return;
        if (rafId.current !== null) return;
        last = performance.now();
        rafId.current = window.requestAnimationFrame(tick);
      };

      const stop = () => {
        if (rafId.current !== null) {
          window.cancelAnimationFrame(rafId.current);
          rafId.current = null;
        }
      };

      const onPointerMove = (event: PointerEvent) => {
        const rect = wrap.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        pointer.current.tx = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
        pointer.current.ty = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      };

      const onVisibility = () => {
        if (document.hidden) stop();
        else start();
      };

      const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      const onReducedChange = () => {
        reducedRef.current = reducedQuery.matches;
        if (reducedRef.current) {
          stop();
          draw(0, 0);
        } else {
          start();
        }
      };

      readTheme();
      resize();

      const resizeObserver = new ResizeObserver(() => resize());
      resizeObserver.observe(wrap);

      const themeObserver = new MutationObserver(() => {
        readTheme();
        themePulse.current = 1;
        if (reducedRef.current) draw(0, 0);
      });
      themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme'],
      });

      const intersection = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) start();
          else stop();
        });
      });
      intersection.observe(wrap);

      window.addEventListener('pointermove', onPointerMove, { passive: true });
      document.addEventListener('visibilitychange', onVisibility);
      reducedQuery.addEventListener('change', onReducedChange);

      reducedRef.current = reducedQuery.matches;
      if (!reducedRef.current) start();

      return () => {
        disposedRef.current = true;
        stop();
        resizeObserver.disconnect();
        themeObserver.disconnect();
        intersection.disconnect();
        window.removeEventListener('pointermove', onPointerMove);
        document.removeEventListener('visibilitychange', onVisibility);
        reducedQuery.removeEventListener('change', onReducedChange);
      };
    }, []);

    return (
      <div className="ambient-background" aria-hidden="true" ref={wrapRef}>
        <canvas ref={canvasRef} />
      </div>
    );
  }
);