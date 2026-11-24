import {useEffect, useRef} from 'react';

export interface PixelSnowProps {
  color?: string;
  variant?: 'round' | 'square' | 'snowflake';
  density?: number;
  speed?: number;
  wind?: number;
  flakeSize?: number;
  pixelSize?: number;
  glow?: number;
  mouseInteraction?: boolean;
  sway?: number;
  twinkle?: number;
  accumulate?: boolean;
  depth?: number;
  fade?: number;
  opacity?: number;
  className?: string;
}

interface Flake {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  phase: number;
  twinkleSpeed: number;
  sizeMult: number;
}

export default function PixelSnow({
  color = '#f7c7de',
  variant = 'snowflake',
  density = 0.65,
  speed = 1,
  wind = 0.25,
  flakeSize = 1.05,
  pixelSize = 5,
  glow = 0.8,
  mouseInteraction = true,
  sway = 0.45,
  twinkle = 0.45,
  accumulate = true,
  depth = 0.55,
  fade = 0.1,
  opacity = 0.85,
  className = '',
}: PixelSnowProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointerRef = useRef<{x: number; y: number; active: boolean}>({x: -9999, y: -9999, active: false});

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const stepPx = Math.max(1, Math.round(pixelSize));

    let width = 0;
    let height = 0;
    let flakes: Flake[] = [];
    let snowHeap: number[] = [];

    const createFlake = (randomY: boolean): Flake => {
      const z = Math.random();
      return {
        x: Math.random() * Math.max(width, 1),
        y: randomY ? Math.random() * Math.max(height, 1) : -16 - Math.random() * 44,
        z,
        vx: (Math.random() - 0.5) * 14,
        vy: (26 + Math.random() * 34) * (1 - depth * 0.55 + z * depth * 1.15),
        phase: Math.random() * Math.PI * 2,
        twinkleSpeed: 1.3 + Math.random() * 2.5,
        sizeMult: 0.72 + z * 0.65,
      };
    };

    const syncDimensions = () => {
      const parent = canvas.parentElement;
      const nextW = parent?.clientWidth || window.innerWidth;
      const nextH = parent?.clientHeight || 600;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      width = Math.max(1, nextW);
      height = Math.max(1, nextH);

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const targetCount = Math.max(
        18,
        Math.min(360, Math.round(((width * height) / 4200) * Math.max(0.05, density))),
      );

      if (flakes.length < targetCount) {
        while (flakes.length < targetCount) {
          flakes.push(createFlake(true));
        }
      } else if (flakes.length > targetCount) {
        flakes = flakes.slice(0, targetCount);
      }

      const cols = Math.max(1, Math.ceil(width / stepPx));
      if (snowHeap.length !== cols) {
        snowHeap = new Array<number>(cols).fill(0);
      }
    };

    syncDimensions();
    const resizeObserver = new ResizeObserver(syncDimensions);
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    const handlePointerMove = (e: PointerEvent) => {
      if (!mouseInteraction) return;
      const rect = canvas.getBoundingClientRect();
      const inside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;
      pointerRef.current.active = inside;
      pointerRef.current.x = e.clientX - rect.left;
      pointerRef.current.y = e.clientY - rect.top;
    };

    const handlePointerLeave = () => {
      pointerRef.current.active = false;
    };

    if (mouseInteraction) {
      window.addEventListener('pointermove', handlePointerMove, {passive: true});
      document.addEventListener('mouseleave', handlePointerLeave);
    }

    const snap = (v: number) => Math.round(v / stepPx) * stepPx;

    const drawFlake = (sx: number, sy: number, sizeScale: number, alpha: number) => {
      ctx.globalAlpha = Math.max(0.02, Math.min(1, alpha));

      if (variant === 'square') {
        const s = Math.max(stepPx, snap(sizeScale * stepPx));
        ctx.fillRect(sx - s / 2, sy - s / 2, s, s);
        return;
      }

      if (variant === 'snowflake') {
        if (sizeScale < 0.85) {
          ctx.fillRect(sx, sy, stepPx, stepPx);
          return;
        }
        // Crisp 3x3 pixel '+' snowflake cross, expanding to diagonal tips when larger
        ctx.fillRect(sx - stepPx, sy, stepPx * 3, stepPx);
        ctx.fillRect(sx, sy - stepPx, stepPx, stepPx * 3);
        if (sizeScale >= 1.25) {
          ctx.globalAlpha = Math.max(0.02, Math.min(1, alpha * 0.6));
          ctx.fillRect(sx - stepPx, sy - stepPx, stepPx, stepPx);
          ctx.fillRect(sx + stepPx, sy - stepPx, stepPx, stepPx);
          ctx.fillRect(sx - stepPx, sy + stepPx, stepPx, stepPx);
          ctx.fillRect(sx + stepPx, sy + stepPx, stepPx, stepPx);
        }
        return;
      }

      // 'round' pixelated circle
      const gridR = Math.max(1, Math.round(sizeScale));
      if (gridR <= 1) {
        ctx.fillRect(sx, sy, stepPx, stepPx);
        return;
      }
      for (let dy = -gridR; dy <= gridR; dy++) {
        for (let dx = -gridR; dx <= gridR; dx++) {
          if (dx * dx + dy * dy <= gridR * gridR + 0.35) {
            ctx.fillRect(sx + dx * stepPx, sy + dy * stepPx, stepPx, stepPx);
          }
        }
      }
    };

    let rafId = 0;
    let lastTime = performance.now();

    const render = (now: number) => {
      const dt = prefersReducedMotion ? 0 : Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      const tSec = now * 0.001;

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = Math.max(0, glow * 4.5);

      const speedScale = Math.max(0.05, speed) * 2.1;
      const windPx = wind * 58;
      const swayStrength = Math.max(0, sway) * 34;
      const maxHeapHeight = Math.min(32, height * 0.075);
      const fadeZone = Math.max(0.01, Math.min(0.45, fade)) * height;

      for (let i = 0; i < flakes.length; i++) {
        const f = flakes[i];

        if (!prefersReducedMotion) {
          const swayWave = Math.sin(tSec * 1.15 + f.phase) * swayStrength * (0.4 + f.z * 0.6);
          f.x += (windPx * (0.55 + f.z * 0.7) + f.vx + swayWave) * dt;
          f.y += f.vy * speedScale * dt;

          if (mouseInteraction && pointerRef.current.active) {
            const dx = f.x - pointerRef.current.x;
            const dy = f.y - pointerRef.current.y;
            const distSq = dx * dx + dy * dy;
            const radius = 125;
            if (distSq > 1 && distSq < radius * radius) {
              const dist = Math.sqrt(distSq);
              const force = (1 - dist / radius) * 190;
              f.x += (dx / dist) * force * dt;
              f.y += (dy / dist) * force * 0.55 * dt;
            }
          }
        }

        if (f.x < -20) f.x = width + 18;
        if (f.x > width + 20) f.x = -18;

        const colIdx = Math.max(0, Math.min(snowHeap.length - 1, Math.floor(f.x / stepPx)));
        const floorY = height - (accumulate ? snowHeap[colIdx] || 0 : 0);

        if (f.y >= floorY) {
          if (accumulate && snowHeap.length > 0) {
            snowHeap[colIdx] = Math.min(maxHeapHeight, (snowHeap[colIdx] || 0) + stepPx * 0.55);
            if (colIdx > 0) snowHeap[colIdx - 1] = Math.min(maxHeapHeight, snowHeap[colIdx - 1] + stepPx * 0.25);
            if (colIdx < snowHeap.length - 1) {
              snowHeap[colIdx + 1] = Math.min(maxHeapHeight, snowHeap[colIdx + 1] + stepPx * 0.25);
            }
          }
          const respawn = createFlake(false);
          f.x = respawn.x;
          f.y = respawn.y;
        }

        const edgeFade =
          fade > 0
            ? Math.min(1, Math.max(0, f.y / fadeZone)) *
              Math.min(1, Math.max(0.25, (height - f.y) / fadeZone))
            : 1;
        const twinkleWave = 1 - twinkle * 0.55 + Math.sin(tSec * f.twinkleSpeed + f.phase) * twinkle * 0.55;
        const depthAlpha = 1 - depth * 0.5 + f.z * depth * 0.5;
        const alpha = opacity * depthAlpha * twinkleWave * edgeFade;
        const sx = snap(f.x);
        const sy = snap(f.y);
        const sizeScale = flakeSize * f.sizeMult;

        drawFlake(sx, sy, sizeScale, alpha);
      }

      if (accumulate && snowHeap.length > 0) {
        ctx.shadowBlur = Math.max(0, glow * 2.5);
        ctx.globalAlpha = Math.max(0.15, opacity * 0.72);
        for (let c = 0; c < snowHeap.length; c++) {
          const h = snowHeap[c];
          if (h > 0.4) {
            const snappedH = Math.max(stepPx, snap(h));
            ctx.fillRect(c * stepPx, height - snappedH, stepPx, snappedH);
            if (!prefersReducedMotion) {
              snowHeap[c] = Math.max(0, h - dt * 0.55);
            }
          }
        }
      }

      if (!prefersReducedMotion) {
        rafId = requestAnimationFrame(render);
      }
    };

    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      if (mouseInteraction) {
        window.removeEventListener('pointermove', handlePointerMove);
        document.removeEventListener('mouseleave', handlePointerLeave);
      }
    };
  }, [
    color,
    variant,
    density,
    speed,
    wind,
    flakeSize,
    pixelSize,
    glow,
    mouseInteraction,
    sway,
    twinkle,
    accumulate,
    depth,
    fade,
    opacity,
  ]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none block w-full h-full ${className}`}
    />
  );
}
