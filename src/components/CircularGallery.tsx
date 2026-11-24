import {PointerEvent, useEffect, useMemo, useRef} from 'react';
import {BookCoverImage} from './BookCoverImage';

export interface CircularGalleryItem {
  image: string;
  text: string;
  subtitle?: string;
  backContent?: string;
  bookId?: string;
}

interface CircularGalleryProps {
  items: CircularGalleryItem[];
  bend?: number;
  textColor?: string;
  borderRadius?: number;
  scrollEase?: number;
  flippedIds?: Record<string, boolean>;
  onToggleFlip?: (item: CircularGalleryItem) => void;
  onItemClick?: (item: CircularGalleryItem, index: number) => void;
}

export default function CircularGallery({
  items,
  bend = 3,
  textColor = '#ffffff',
  borderRadius = 0.05,
  scrollEase = 0.05,
  flippedIds = {},
  onToggleFlip,
  onItemClick,
}: CircularGalleryProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const scrollTargetRef = useRef(0);
  const scrollCurrentRef = useRef(0);
  const isDraggingRef = useRef(false);
  const didDragRef = useRef(false);
  const startXRef = useRef(0);
  const startScrollRef = useRef(0);

  // Repeat items so the circular arc stays balanced and continuously scrollable
  const ringItems = useMemo(() => {
    if (!items || items.length === 0) return [];
    const targetMin = 9;
    const repeated: Array<{item: CircularGalleryItem; originalIndex: number}> = [];
    while (repeated.length < targetMin) {
      items.forEach((item, idx) => {
        repeated.push({item, originalIndex: idx});
      });
    }
    return repeated;
  }, [items]);

  useEffect(() => {
    scrollTargetRef.current = 0;
    scrollCurrentRef.current = 0;
  }, [items]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || ringItems.length === 0) return;

    const itemSpacing = 330;
    const totalWidth = ringItems.length * itemSpacing;
    const ease = Math.min(Math.max(scrollEase, 0.01), 0.35);

    let rafId = 0;

    const renderFrame = () => {
      scrollCurrentRef.current += (scrollTargetRef.current - scrollCurrentRef.current) * ease;
      const current = scrollCurrentRef.current;
      const containerWidth = container.clientWidth || 1200;
      const halfWidth = containerWidth / 2;

      for (let i = 0; i < ringItems.length; i++) {
        const el = cardRefs.current[i];
        if (!el) continue;

        let relX = (i * itemSpacing - current) % totalWidth;
        if (relX < -totalWidth / 2) relX += totalWidth;
        if (relX > totalWidth / 2) relX -= totalWidth;

        // Circular arc math driven by `bend`
        const H = Math.max(halfWidth * 1.15, 420);
        const absB = Math.abs(bend);
        let arcY = 0;
        let rotDeg = 0;

        if (absB > 0.001) {
          const R = (H * H + absB * absB * 180) / (2 * absB * 16);
          const clampedX = Math.min(Math.abs(relX), R * 0.96);
          const sagitta = R - Math.sqrt(Math.max(0, R * R - clampedX * clampedX));
          const direction = bend >= 0 ? 1 : -1;
          arcY = direction * sagitta * 0.85;
          rotDeg = direction * Math.asin(clampedX / R) * (180 / Math.PI) * (relX >= 0 ? 1 : -1) * 0.95;
        }

        const normDist = Math.min(Math.abs(relX) / (halfWidth + 200), 1.4);
        const scale = Math.max(0.76, 1 - normDist * 0.14);
        const opacity = Math.abs(relX) > halfWidth + 320 ? 0 : Math.max(0.25, 1 - Math.max(0, normDist - 0.55) * 1.1);

        el.style.transform = `translate3d(${relX.toFixed(1)}px, ${arcY.toFixed(1)}px, 0) rotate(${rotDeg.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
        el.style.opacity = opacity.toFixed(3);
        el.style.zIndex = String(Math.round((1.5 - normDist) * 20));
      }

      rafId = requestAnimationFrame(renderFrame);
    };

    rafId = requestAnimationFrame(renderFrame);

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      scrollTargetRef.current += delta * 1.15;
    };

    container.addEventListener('wheel', handleWheel, {passive: false});
    return () => {
      cancelAnimationFrame(rafId);
      container.removeEventListener('wheel', handleWheel);
    };
  }, [ringItems, bend, scrollEase]);

  useEffect(() => {
    const handlePointerMove = (e: globalThis.PointerEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - startXRef.current;
      if (Math.abs(dx) > 6) {
        didDragRef.current = true;
      }
      scrollTargetRef.current = startScrollRef.current - dx * 1.35;
    };

    const handlePointerUp = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      window.setTimeout(() => {
        didDragRef.current = false;
      }, 40);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, []);

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    didDragRef.current = false;
    startXRef.current = e.clientX;
    startScrollRef.current = scrollTargetRef.current;
  };

  const radiusPx = `${Math.round(borderRadius * 320)}px`;

  if (ringItems.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-dark-on-surface-variant font-body text-body-lg">
        Chưa có truyện nào của tác giả này.
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      className="relative w-full h-full overflow-hidden select-none cursor-grab active:cursor-grabbing flex items-center justify-center"
    >
      {ringItems.map((entry, idx) => {
        const isFlipped = Boolean(entry.item.bookId && flippedIds[entry.item.bookId]);
        return (
          <div
            key={`${entry.item.bookId || entry.item.text}-${idx}`}
            ref={(el) => {
              cardRefs.current[idx] = el;
            }}
            className="absolute top-1/2 left-1/2 -ml-[130px] -mt-[215px] w-[260px] flex flex-col items-center gap-3 group"
            style={{willChange: 'transform, opacity'}}
          >
            <div
              role="button"
              tabIndex={0}
              data-cursor-label={isFlipped ? 'Mặt sau' : 'Xem truyện'}
              onClick={() => {
                if (didDragRef.current) return;
                onItemClick?.(entry.item, entry.originalIndex);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onItemClick?.(entry.item, entry.originalIndex);
                }
              }}
              className="cursor-target relative w-[260px] h-[360px] cursor-pointer focus-visible:outline-none"
              style={{perspective: '1100px'}}
            >
              <div
                className="relative w-full h-full transition-transform duration-500 ease-out"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                }}
              >
                {/* Front Face: Book Cover */}
                <div
                  className="absolute inset-0 overflow-hidden shadow-[0_24px_50px_rgba(0,0,0,0.55)] border border-white/15 bg-dark-surface-container"
                  style={{borderRadius: radiusPx, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden'}}
                >
                  <BookCoverImage
                    src={entry.item.image}
                    alt={entry.item.text}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                {/* Back Face: Custom Back Content (independent of synopsis) */}
                <div
                  className="absolute inset-0 p-5 flex flex-col justify-between bg-dark-surface-container border border-kale-pink/40 shadow-[0_24px_50px_rgba(0,0,0,0.65)] text-left"
                  style={{
                    borderRadius: radiusPx,
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                >
                  <div className="flex flex-col gap-2.5 overflow-hidden">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-plum-overlay text-light-on-primary font-label text-[11px]">
                        {entry.item.subtitle || 'Tác phẩm'}
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-wider text-kale-olive">
                        Mặt sau
                      </span>
                    </div>
                    <h3 className="font-headline text-title-lg text-light-surface-bright leading-snug line-clamp-2">
                      {entry.item.text}
                    </h3>
                    <p className="font-body text-body-md text-light-surface-bright/85 leading-relaxed whitespace-pre-line line-clamp-7">
                      {entry.item.backContent?.trim() ||
                        'Chưa có nội dung mặt sau. Bấm "Đổi nội dung sau sách" để thêm lời tựa hoặc trích dẫn riêng.'}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-dark-outline-variant flex items-center justify-between">
                    <span className="font-label text-[11px] text-dark-on-surface-variant">Bấm để mở chi tiết</span>
                    <span className="font-mono text-[11px] text-kale-pink">Hang Chuột Chũi</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full flex items-center justify-between gap-2 px-1">
              <span
                className="font-headline text-title-lg tracking-tight text-left line-clamp-1 flex-1"
                style={{color: textColor}}
              >
                {entry.item.text}
              </span>
              {onToggleFlip && (
                <button
                  type="button"
                  data-cursor-label={isFlipped ? 'Xem bìa' : 'Lật mặt sau'}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFlip(entry.item);
                  }}
                  className="cursor-target inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-dark-surface-container/90 border border-dark-outline-variant text-[11px] font-label text-kale-pink hover:border-kale-pink transition-colors cursor-pointer flex-shrink-0"
                >
                  <span className="material-symbols-outlined text-[13px]" aria-hidden="true">
                    360
                  </span>
                  <span>{isFlipped ? 'Bìa' : 'Mặt sau'}</span>
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
