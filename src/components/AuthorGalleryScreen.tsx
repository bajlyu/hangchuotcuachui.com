import {useEffect, useMemo, useState} from 'react';
import {getBookTags} from '../data/books';
import {Book} from '../types/book';
import CircularGallery, {CircularGalleryItem} from './CircularGallery';
import PixelSnow from './PixelSnow';

interface AuthorGalleryScreenProps {
  author: string | null;
  books: Book[];
  onBackToLibrary: () => void;
  onSelectBook: (bookId: string) => void;
  onUpdateBook: (updated: Book) => void;
}

export function AuthorGalleryScreen({
  author,
  books,
  onBackToLibrary,
  onSelectBook,
  onUpdateBook,
}: AuthorGalleryScreenProps) {
  const authorBooks = useMemo(() => {
    if (!author) return [];
    return books.filter((b) => b.author.toLowerCase() === author.toLowerCase());
  }, [author, books]);

  const [flippedIds, setFlippedIds] = useState<Record<string, boolean>>({});
  const [isEditingBack, setIsEditingBack] = useState(false);
  const [editingBookId, setEditingBookId] = useState<string>('');

  useEffect(() => {
    setFlippedIds({});
    setIsEditingBack(false);
    setEditingBookId(authorBooks[0]?.id || '');
  }, [author]);

  useEffect(() => {
    if (authorBooks.length > 0 && !authorBooks.some((b) => b.id === editingBookId)) {
      setEditingBookId(authorBooks[0].id);
    }
  }, [authorBooks, editingBookId]);

  const activeEditingBook = authorBooks.find((b) => b.id === editingBookId) ?? authorBooks[0] ?? null;

  const galleryItems: CircularGalleryItem[] = useMemo(
    () =>
      authorBooks.map((book) => ({
        image: book.image,
        text: book.title,
        subtitle: getBookTags(book).join(' · '),
        backContent: book.backContent,
        bookId: book.id,
      })),
    [authorBooks],
  );

  const handleToggleFlip = (item: CircularGalleryItem) => {
    if (!item.bookId) return;
    setFlippedIds((prev) => ({...prev, [item.bookId!]: !prev[item.bookId!]}));
  };

  const handleToggleAllBack = () => {
    const anyUnflipped = authorBooks.some((b) => !flippedIds[b.id]);
    const next: Record<string, boolean> = {};
    authorBooks.forEach((b) => {
      next[b.id] = anyUnflipped;
    });
    setFlippedIds(next);
  };

  return (
    <section
      id="template-3"
      className="template-layer min-h-screen w-full bg-dark-surface text-dark-on-surface flex flex-col justify-between"
    >
      <header className="w-full border-b border-dark-outline-variant/70 px-gutter-md md:px-page-margin py-gutter-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-gutter-md">
          <button
            id="back-from-author-gallery-btn"
            type="button"
            onClick={onBackToLibrary}
            data-cursor-label="Quay lại"
            className="cursor-target inline-flex items-center gap-2 px-gutter-md py-2 rounded-full border border-dark-outline-variant bg-dark-surface-container text-light-surface-bright font-label text-label-sm hover:border-kale-pink hover:text-kale-pink transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
              arrow_back
            </span>
            <span>Quay lại tủ sách</span>
          </button>

          <div className="text-center min-w-0">
            <h1 className="font-headline text-headline-md md:text-headline-lg text-light-surface-bright truncate">
              {author || 'Tác giả'}
            </h1>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              id="author-flip-all-btn"
              type="button"
              data-cursor-label="Lật mặt sau"
              onClick={handleToggleAllBack}
              className="cursor-target inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-dark-outline-variant bg-dark-surface-container text-dark-on-surface font-label text-label-sm hover:border-kale-pink hover:text-kale-pink transition-colors cursor-pointer whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[15px]" aria-hidden="true">
                360
              </span>
              <span>Lật mặt sau</span>
            </button>

            <button
              id="author-edit-back-btn"
              type="button"
              data-cursor-label="Đổi mặt sau"
              onClick={() => {
                setIsEditingBack((prev) => {
                  const next = !prev;
                  if (next && activeEditingBook) {
                    setFlippedIds((f) => ({...f, [activeEditingBook.id]: true}));
                  }
                  return next;
                });
              }}
              className={`cursor-target inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border font-label text-label-sm transition-colors cursor-pointer whitespace-nowrap ${
                isEditingBack
                  ? 'bg-kale-pink text-light-primary border-kale-pink'
                  : 'border-dark-outline-variant bg-dark-surface-container text-dark-on-surface hover:border-kale-pink'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]" aria-hidden="true">
                edit_note
              </span>
              <span>{isEditingBack ? 'Xong mặt sau' : 'Đổi nội dung sau sách'}</span>
            </button>

            <span className="font-mono text-mono-sm px-3 py-1 rounded-full bg-dark-surface-container text-kale-pink tabular-nums whitespace-nowrap shrink-0">
              {authorBooks.length} tác phẩm
            </span>
          </div>
        </div>
      </header>

      {isEditingBack && activeEditingBook && (
        <div className="max-w-4xl w-full mx-auto px-gutter-md pt-gutter-md">
          <div className="rounded-xl bg-dark-surface-container border border-kale-pink/40 p-gutter-md flex flex-col gap-gutter-sm shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-label text-label-sm text-kale-pink">
                Đổi nội dung mặt sau sách (không liên quan đến văn án)
              </span>
              {authorBooks.length > 1 && (
                <select
                  aria-label="Chọn sách của tác giả để sửa mặt sau"
                  value={activeEditingBook.id}
                  onChange={(e) => {
                    const nextId = e.target.value;
                    setEditingBookId(nextId);
                    setFlippedIds((f) => ({...f, [nextId]: true}));
                  }}
                  className="rounded-lg border border-dark-outline-variant bg-dark-surface text-dark-on-surface font-label text-label-sm px-2.5 py-1 focus:border-kale-pink focus:outline-none"
                >
                  {authorBooks.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.title}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <textarea
              id="author-back-content-textarea"
              rows={2}
              value={activeEditingBook.backContent || ''}
              onChange={(e) =>
                onUpdateBook({
                  ...activeEditingBook,
                  backContent: e.target.value,
                })
              }
              placeholder={`Nhập nội dung mặt sau cho "${activeEditingBook.title}"...`}
              className="w-full rounded-lg border border-dark-outline-variant bg-dark-surface text-body-md text-light-surface-bright placeholder:text-dark-outline px-3 py-2 focus:border-kale-pink focus:outline-none"
            />
          </div>
        </div>
      )}

      <main className="flex-1 flex flex-col justify-center w-full overflow-hidden">
        <div style={{width: '100%', height: '600px', position: 'relative'}}>
          <div className="absolute inset-0 z-0 pointer-events-none">
            <PixelSnow
              color="#f7c7de"
              variant="snowflake"
              density={0.65}
              speed={1}
              wind={0.25}
              flakeSize={1.05}
              pixelSize={5}
              glow={0.8}
              mouseInteraction={true}
              sway={0.45}
              twinkle={0.45}
              accumulate
              depth={0.55}
              fade={0.1}
              opacity={0.85}
            />
          </div>
          <div className="relative z-10 w-full h-full">
            <CircularGallery
              items={galleryItems}
              bend={3}
              textColor="#ffffff"
              borderRadius={0.05}
              scrollEase={0.05}
              flippedIds={flippedIds}
              onToggleFlip={handleToggleFlip}
              onItemClick={(item) => {
                if (item.bookId) {
                  onSelectBook(item.bookId);
                }
              }}
            />
          </div>
        </div>
      </main>

      <footer className="px-gutter-md md:px-page-margin py-gutter-md text-center border-t border-dark-outline-variant/50">
        <p className="font-label text-label-sm text-dark-on-surface-variant">
          Kéo ngang hoặc cuộn chuột để xoay · Bấm "Mặt sau" để lật hoặc bấm vào sách để sửa chi tiết
        </p>
      </footer>
    </section>
  );
}
