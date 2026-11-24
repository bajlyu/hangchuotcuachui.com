import {useEffect, useRef, useState} from 'react';

export interface TargetCursorProps {
  targetSelector?: string;
  spinDuration?: number;
  hideDefaultCursor?: boolean;
  parallaxOn?: boolean;
}

const DEFAULT_SELECTOR = '.cursor-target';

export default function TargetCursor({
  targetSelector = DEFAULT_SELECTOR,
  spinDuration = 2,
  hideDefaultCursor = true,
  parallaxOn = true,
}: TargetCursorProps) {
  const [enabled, setEnabled] = useState(false);
  const [label, setLabel] = useState<string>('');
  const [isHovering, setIsHovering] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const cursorRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const dotRef = useRef<HTMLDivElement | null>(null);

  const mouseRef = useRef({x: -200, y: -200});
  const currentRef = useRef({x: -200, y: -200, w: 34, h: 34, angle: 0});
  const activeTargetRef = useRef<HTMLElement | null>(null);
  const isPressedRef = useRef(false);

  useEffect(() => {
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    if (!finePointer) return;
    setEnabled(true);
  }, []);

  useEffect(() => {
    if (!enabled || !hideDefaultCursor) return;

    const styleEl = document.createElement('style');
    styleEl.setAttribute('data-target-cursor-style', 'true');
    styleEl.textContent = `
      html.target-cursor-active,
      html.target-cursor-active * {
        cursor: none !important;
      }
    `;
    document.head.appendChild(styleEl);
    document.documentElement.classList.add('target-cursor-active');

    return () => {
      document.documentElement.classList.remove('target-cursor-active');
      styleEl.remove();
    };
  }, [enabled, hideDefaultCursor]);

  useEffect(() => {
    if (!enabled) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let rafId = 0;
    let lastTime = performance.now();

    const findTarget = (el: EventTarget | null): HTMLElement | null => {
      if (!(el instanceof Element)) return null;
      return el.closest<HTMLElement>(targetSelector);
    };

    const handlePointerMove = (e: PointerEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;

      const found = findTarget(e.target);
      if (found !== activeTargetRef.current) {
        activeTargetRef.current = found;
        if (found) {
          setIsHovering(true);
          setLabel(found.getAttribute('data-cursor-label') || '');
        } else {
          setIsHovering(false);
          setLabel('');
        }
      }
    };

    const handlePointerDown = () => {
      isPressedRef.current = true;
      setIsPressed(true);
    };

    const handlePointerUp = () => {
      isPressedRef.current = false;
      setIsPressed(false);
    };

    const handlePointerLeave = () => {
      activeTargetRef.current = null;
      setIsHovering(false);
      setLabel('');
      mouseRef.current.x = -200;
      mouseRef.current.y = -200;
    };

    const animate = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      const cursorEl = cursorRef.current;
      const ringEl = ringRef.current;
      const dotEl = dotRef.current;

      if (cursorEl && ringEl && dotEl) {
        const target = activeTargetRef.current;
        let goalX = mouseRef.current.x;
        let goalY = mouseRef.current.y;
        let goalW = 34;
        let goalH = 34;

        if (target && document.body.contains(target)) {
          const rect = target.getBoundingClientRect();
          const pad = 8;
          goalW = Math.max(rect.width + pad * 2, 28);
          goalH = Math.max(rect.height + pad * 2, 28);

          let centerX = rect.left + rect.width / 2;
          let centerY = rect.top + rect.height / 2;

          if (parallaxOn) {
            const offsetX = (mouseRef.current.x - centerX) * 0.14;
            const offsetY = (mouseRef.current.y - centerY) * 0.14;
            centerX += offsetX;
            centerY += offsetY;
          }

          goalX = centerX;
          goalY = centerY;
          // Ease angle toward nearest upright 0deg
          currentRef.current.angle += (0 - currentRef.current.angle) * 0.2;
        } else if (!prefersReducedMotion && spinDuration > 0) {
          currentRef.current.angle = (currentRef.current.angle + (360 / spinDuration) * dt) % 360;
        }

        const ease = target ? 0.24 : 0.32;
        currentRef.current.x += (goalX - currentRef.current.x) * ease;
        currentRef.current.y += (goalY - currentRef.current.y) * ease;
        currentRef.current.w += (goalW - currentRef.current.w) * 0.24;
        currentRef.current.h += (goalH - currentRef.current.h) * 0.24;

        const pressScale = isPressedRef.current ? 0.9 : 1;

        cursorEl.style.transform = `translate3d(${currentRef.current.x.toFixed(1)}px, ${currentRef.current.y.toFixed(1)}px, 0)`;
        ringEl.style.width = `${currentRef.current.w.toFixed(1)}px`;
        ringEl.style.height = `${currentRef.current.h.toFixed(1)}px`;
        ringEl.style.transform = `translate(-50%, -50%) rotate(${currentRef.current.angle.toFixed(1)}deg) scale(${pressScale})`;

        const dotOffsetX = mouseRef.current.x - currentRef.current.x;
        const dotOffsetY = mouseRef.current.y - currentRef.current.y;
        dotEl.style.transform = `translate3d(${dotOffsetX.toFixed(1)}px, ${dotOffsetY.toFixed(1)}px, 0) translate(-50%, -50%) scale(${isPressedRef.current ? 1.4 : 1})`;
      }

      rafId = requestAnimationFrame(animate);
    };

    window.addEventListener('pointermove', handlePointerMove, {passive: true});
    window.addEventListener('pointerdown', handlePointerDown, {passive: true});
    window.addEventListener('pointerup', handlePointerUp, {passive: true});
    document.addEventListener('mouseleave', handlePointerLeave);
    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('mouseleave', handlePointerLeave);
    };
  }, [enabled, targetSelector, spinDuration, parallaxOn]);

  if (!enabled) return null;

  return (
    <div
      ref={cursorRef}
      aria-hidden="true"
      className="fixed top-0 left-0 z-[9999] pointer-events-none select-none"
      style={{willChange: 'transform'}}
    >
      {/* 4-Corner Reticle Brackets */}
      <div
        ref={ringRef}
        className="absolute top-0 left-0 transition-opacity duration-150"
        style={{
          width: '34px',
          height: '34px',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <span
          className={`absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 transition-colors duration-150 ${
            isHovering ? 'border-kale-pink' : 'border-forest-hero'
          }`}
        />
        <span
          className={`absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 transition-colors duration-150 ${
            isHovering ? 'border-kale-pink' : 'border-forest-hero'
          }`}
        />
        <span
          className={`absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 transition-colors duration-150 ${
            isHovering ? 'border-kale-pink' : 'border-forest-hero'
          }`}
        />
        <span
          className={`absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 transition-colors duration-150 ${
            isHovering ? 'border-kale-pink' : 'border-forest-hero'
          }`}
        />
      </div>

      {/* Center Pointer Dot */}
      <div
        ref={dotRef}
        className={`absolute top-0 left-0 rounded-full transition-colors duration-150 ${
          isPressed ? 'w-2.5 h-2.5 bg-kale-pink' : 'w-2 h-2 bg-kale-pink ring-2 ring-white/80'
        }`}
        style={{transform: 'translate(-50%, -50%)'}}
      />

      {/* Optional Target Label Pill */}
      {isHovering && label && (
        <div
          className="absolute left-4 top-4 px-2.5 py-0.5 rounded-full bg-dark-surface/95 text-kale-pink border border-kale-pink/50 font-mono text-[11px] tracking-wide whitespace-nowrap shadow-lg"
        >
          {label}
        </div>
      )}
    </div>
  );
}
