import {useEffect, useRef} from 'react';

interface Spark {
  x: number;
  y: number;
  angle: number;
  startTime: number;
}

export function ClickSpark() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const sparks: Spark[] = [];
    let rafId = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const handleClick = (e: MouseEvent) => {
      const now = performance.now();
      for (let i = 0; i < 8; i++) {
        sparks.push({
          x: e.clientX,
          y: e.clientY,
          angle: (2 * Math.PI * i) / 8,
          startTime: now,
        });
      }
    };
    document.addEventListener('click', handleClick);

    const render = (now: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = sparks.length - 1; i >= 0; i--) {
        const sp = sparks[i];
        const elapsed = now - sp.startTime;
        if (elapsed >= 500) {
          sparks.splice(i, 1);
          continue;
        }
        const p = elapsed / 500;
        const eased = p * (2 - p);
        const dist = eased * 30;
        const len = 14 * (1 - eased);
        ctx.strokeStyle = `rgba(255, 255, 255, ${(1 - p).toFixed(2)})`;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(sp.x + dist * Math.cos(sp.angle), sp.y + dist * Math.sin(sp.angle));
        ctx.lineTo(sp.x + (dist + len) * Math.cos(sp.angle), sp.y + (dist + len) * Math.sin(sp.angle));
        ctx.stroke();
      }
      rafId = requestAnimationFrame(render);
    };
    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      document.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="click-spark-canvas"
      className="pointer-events-none fixed inset-0 z-[9999]"
      aria-hidden="true"
    />
  );
}
