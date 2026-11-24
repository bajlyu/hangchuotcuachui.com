import {MouseEvent, useEffect, useMemo, useRef} from 'react';
import {Book, DriftWallCopy} from '../types/book';
import {BookCoverImage} from './BookCoverImage';

interface DriftWallProps {
  books: Book[];
  badgeLabel: string;
  wallCopy: DriftWallCopy;
  driftSpeed: number;
  onSelectBook: (bookId: string) => void;
  onOpenWallEditor: () => void;
}

interface ColumnState {
  offset: number;
  factor: number;
  loopHeight: number;
  depthZ: number;
}

export function DriftWall({
  books,
  badgeLabel,
  wallCopy,
  driftSpeed,
  onSelectBook,
  onOpenWallEditor,
}: DriftWallProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const planeRef = useRef<HTMLDivElement | null>(null);
  const colRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pausedRef = useRef(false);
  const speedRef = useRef(driftSpeed);

  useEffect(() => {
    speedRef.current = driftSpeed;
  }, [driftSpeed]);

  const columns = useMemo(() => {
    const safePool = books.length > 0 ? books : [];
    if (safePool.length === 0) return [];

    return Array.from({length: 7}, (_, colIdx) => {
      const colBooks: Book[] = [];
      for (let i = 0; i < 6; i++) {
        colBooks.push(safePool[(colIdx * 2 + i) % safePool.length]);
      }
      const doubled = colBooks.concat(colBooks);
      const factor = 1 + (colIdx % 2 === 0 ? 1 : -1) * 0.55 * 0.35 + colIdx * 0.08;
      const loopHeight = colBooks.length * (262 + 28);
      const depthZ = (colIdx - 3) * 22;
      return {
        colIdx,
        items: doubled,
        initialState: {
          offset: (colIdx * 85) % loopHeight,
          factor,
          loopHeight,
          depthZ,
        } satisfies ColumnState,
      };
    });
  }, [books]);

  useEffect(() => {
    if (columns.length === 0) return;
    const states = columns.map((col) => ({...col.initialState}));

    states.forEach((st, idx) => {
      const el = colRefs.current[idx];
      if (el) {
        el.style.transform = `translate3d(0, -${st.offset.toFixed(1)}px, ${st.depthZ}px)`;
      }
    });

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let lastTime = performance.now();
    let rafId = 0;

    const tick = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      const mult = pausedRef.current ? 0.15 : 1;
      for (let i = 0; i < states.length; i++) {
        const st = states[i];
        st.offset = (st.offset + speedRef.current * st.factor * mult * dt) % st.loopHeight;
        const el = colRefs.current[i];
        if (el) {
          el.style.transform = `translate3d(0, -${st.offset.toFixed(1)}px, ${st.depthZ}px)`;
        }
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [columns]);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const viewport = viewportRef.current;
    const plane = planeRef.current;
    if (!viewport || !plane) return;
    const rect = viewport.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    plane.style.transform = `rotateX(${(16 - ny * 5).toFixed(1)}deg) rotateY(${(-28 + nx * 7).toFixed(1)}deg)`;
  };

  const handleMouseLeave = () => {
    pausedRef.current = false;
    if (planeRef.current) {
      planeRef.current.style.transform = 'rotateX(16deg) rotateY(-28deg)';
    }
  };

  return (
    <div className="relative flex-1 min-w-0">
      <div
        ref={viewportRef}
        id="tusach-driftwall-viewport"
        className="driftwall-viewport"
        aria-label="Dòng sách DriftWall đang chạy"
        onMouseEnter={() => {
          pausedRef.current = true;
        }}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
      >
        <div ref={planeRef} id="tusach-driftwall-plane" className="driftwall-plane">
          {columns.map((col) => (
            <div
              key={col.colIdx}
              ref={(el) => {
                colRefs.current[col.colIdx] = el;
              }}
              className="driftwall-col"
            >
              {col.items.map((book, tileIdx) => (
                <button
                  key={`${col.colIdx}-${book.id}-${tileIdx}`}
                  type="button"
                  onClick={() => onSelectBook(book.id)}
                  data-cursor-label="Xem sách"
                  className="cursor-target driftwall-tile text-left border-0 p-0 bg-dark-surface-container"
                  aria-label={`Xem chi tiết ${book.title} - ${book.author}`}
                >
                  <BookCoverImage src={book.image} alt={book.title} className="w-full h-full object-cover" />
                  <div className="tile-overlay" />
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-gutter-md left-gutter-md right-gutter-md sm:bottom-auto sm:top-gutter-lg sm:left-72 md:left-80 sm:right-auto z-30 flex flex-col gap-gutter-xs sm:max-w-lg sm:pr-32">
        {wallCopy.showBadge && (
          <span
            id="driftwall-tag-badge"
            className="self-start inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-kale-pink text-light-primary font-label text-label-sm shadow-md"
          >
            <span className="material-symbols-outlined text-[15px]" aria-hidden="true">
              motion_play
            </span>
            <span>{badgeLabel}</span>
          </span>
        )}
        {wallCopy.headline.trim() && (
          <h2
            id="driftwall-main-headline"
            className={`font-headline text-balance drop-shadow-[0_2px_10px_rgba(0,0,0,0.65)] ${
              wallCopy.headlineSize === 'lg'
                ? 'text-headline-lg-mobile md:text-headline-lg'
                : 'text-headline-md'
            }`}
            style={{color: wallCopy.headlineColor || '#FFFFFF'}}
          >
            {wallCopy.headline}
          </h2>
        )}
        {wallCopy.showSubHeadline && wallCopy.subHeadline.trim() && (
          <p
            id="driftwall-sub-headline"
            className="font-body text-body-md text-light-surface-bright/85 text-pretty drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)] max-w-md"
          >
            {wallCopy.subHeadline}
          </p>
        )}
      </div>

      <button
        id="driftwall-quick-edit-btn"
        type="button"
        onClick={onOpenWallEditor}
        data-cursor-label="Sửa DriftWall"
        className="cursor-target absolute top-gutter-lg right-gutter-lg z-30 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-dark-surface/85 border border-dark-outline-variant text-light-surface-bright font-label text-label-sm hover:border-kale-pink hover:text-kale-pink transition-colors shadow-lg backdrop-blur-sm cursor-pointer"
      >
        <span className="material-symbols-outlined text-[15px]" aria-hidden="true">
          edit
        </span>
        <span>Sửa ảnh chạy</span>
      </button>
    </div>
  );
}
