import {ChangeEvent, MouseEvent, useEffect, useState} from 'react';
import {COVER_IMAGES, GENRE_OPTIONS, getBookTags, STATUS_META} from '../data/books';
import {Book, BookStatus} from '../types/book';
import {readImageFileAsDataUrl} from '../utils/imageUpload';
import {BookCoverImage} from './BookCoverImage';

interface BookDetailModalProps {
  book: Book | null;
  canDelete: boolean;
  genreOptions: string[];
  onClose: () => void;
  onSave: (updated: Book) => void;
  onDelete: (bookId: string) => void;
}

export function BookDetailModal({
  book,
  canDelete,
  genreOptions,
  onClose,
  onSave,
  onDelete,
}: BookDetailModalProps) {
  const availableGenres = genreOptions.length > 0 ? genreOptions : GENRE_OPTIONS;
  const [isFlipped, setIsFlipped] = useState(false);
  const [isEditingBack, setIsEditingBack] = useState(false);
  const [isEditingBook, setIsEditingBook] = useState(false);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genres, setGenres] = useState<string[]>([availableGenres[0]]);
  const [synopsis, setSynopsis] = useState('');
  const [backContent, setBackContent] = useState('');
  const [image, setImage] = useState('');
  const [rating, setRating] = useState(5);
  const [status, setStatus] = useState<BookStatus>('want');
  const [notes, setNotes] = useState('');
  const [tiltTransform, setTiltTransform] = useState('scale(1) rotateX(0deg) rotateY(0deg)');
  const [glareBackground, setGlareBackground] = useState(
    'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0) 65%)',
  );

  const bookId = book?.id;

  useEffect(() => {
    if (book) {
      setIsFlipped(false);
      setIsEditingBack(false);
      setIsEditingBook(false);
      setTitle(book.title);
      setAuthor(book.author);
      const loadedTags = getBookTags(book);
      setGenres(loadedTags.length > 0 ? loadedTags : [availableGenres[0]]);
      setSynopsis(book.synopsis || '');
      setBackContent(book.backContent || '');
      setImage(book.image);
      setRating(book.rating || 4);
      setStatus(book.status || 'want');
      setNotes(book.notes || '');
      setTiltTransform('scale(1) rotateX(0deg) rotateY(0deg)');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId]);

  useEffect(() => {
    if (!book) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [book, onClose]);

  if (!book) return null;

  const statusMeta = STATUS_META[status] || STATUS_META.want;

  const handleCardMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    setTiltTransform(
      `scale(1.03) rotateX(${((0.5 - py) * 24).toFixed(1)}deg) rotateY(${((px - 0.5) * 24).toFixed(1)}deg)`,
    );
    setGlareBackground(
      `radial-gradient(circle at ${(px * 100).toFixed(0)}% ${(py * 100).toFixed(0)}%, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 65%)`,
    );
  };

  const handleCardMouseLeave = () => {
    setTiltTransform('scale(1) rotateX(0deg) rotateY(0deg)');
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await readImageFileAsDataUrl(file);
      setImage(dataUrl);
    } catch {
      // Keep existing image on read error
    }
    e.target.value = '';
  };

  const handleToggleGenre = (tag: string) => {
    setGenres((prev) => {
      if (prev.includes(tag)) {
        return prev.length > 1 ? prev.filter((g) => g !== tag) : prev;
      }
      return [...prev, tag];
    });
  };

  const handleSave = () => {
    const finalTags = genres.length > 0 ? genres : [availableGenres[0]];
    onSave({
      ...book,
      title: title.trim() || book.title,
      author: author.trim() || book.author,
      genre: finalTags[0],
      genres: finalTags,
      synopsis,
      backContent,
      image: image.trim() || book.image,
      rating,
      status,
      notes,
    });
    onClose();
  };

  return (
    <div
      id="book-detail-modal"
      className="fixed inset-0 z-50 bg-light-on-surface/65 flex items-center justify-center p-gutter-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="detail-book-title"
      onClick={onClose}
    >
      <div
        className="bg-light-surface-bright text-light-on-surface rounded-xl max-w-3xl w-full p-gutter-lg md:p-gutter-xl border border-light-outline-variant shadow-2xl flex flex-col gap-gutter-lg my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-gutter-md flex-wrap">
          <div className="flex items-center gap-gutter-sm flex-wrap">
            <span
              id="detail-status-badge"
              className={`inline-flex items-center px-3 py-1 rounded-full font-label text-label-sm ${statusMeta.badgeClass}`}
            >
              {statusMeta.label}
            </span>
            {genres.map((g) => (
              <span
                key={g}
                className="inline-flex items-center px-3 py-1 rounded-full bg-light-surface-container text-light-on-surface-variant font-label text-label-sm"
              >
                {g}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-gutter-sm">
            <button
              id="toggle-edit-book-btn"
              type="button"
              onClick={() => setIsEditingBook((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-label text-label-sm transition-colors cursor-pointer ${
                isEditingBook
                  ? 'bg-kale-pink text-light-primary'
                  : 'bg-light-surface-container text-light-on-surface hover:bg-light-secondary-container'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                {isEditingBook ? 'visibility' : 'edit'}
              </span>
              <span>{isEditingBook ? 'Xem thẻ sách' : 'Sửa ảnh & văn bản'}</span>
            </button>

            <button
              id="close-detail-modal-btn"
              type="button"
              onClick={onClose}
              aria-label="Đóng chi tiết sách"
              className="w-9 h-9 rounded-full bg-light-surface-container flex items-center justify-center text-light-on-surface hover:bg-light-surface-container-high cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter-lg items-center">
          {/* Left: 3D FlipCard */}
          <div className="md:col-span-5 flex flex-col items-center gap-gutter-sm">
            <div
              id="modal-flip-scene"
              className={`flip-card-scene hover-flip ${isFlipped ? 'is-flipped' : ''}`}
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
              onClick={() => setIsFlipped((prev) => !prev)}
            >
              <div id="modal-flip-tilt" className="flip-card-tilt" style={{transform: tiltTransform}}>
                <div className="flip-card-inner">
                  <div
                    id="modal-flip-glare"
                    className="flip-card-glare"
                    style={{background: glareBackground}}
                  />
                  <div className="flip-card-face flip-card-front bg-dark-surface">
                    <BookCoverImage
                      src={image}
                      alt={title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flip-card-face flip-card-back p-6 flex flex-col justify-between">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          id="flip-back-genre"
                          className="px-2.5 py-0.5 rounded-full bg-plum-overlay text-light-on-primary font-label text-label-sm truncate max-w-[170px]"
                        >
                          {genres.join(' · ')}
                        </span>
                        <span className="font-mono text-[10px] uppercase tracking-wider text-kale-olive">
                          Mặt sau sách
                        </span>
                      </div>
                      <h3 id="flip-back-title" className="font-headline text-headline-md leading-tight">
                        {title}
                      </h3>
                      <p id="flip-back-author" className="font-body text-body-md text-kale-pink">
                        {author}
                      </p>
                      <p id="flip-back-content" className="font-body text-body-md opacity-90 line-clamp-5 mt-1 whitespace-pre-line">
                        {backContent.trim() ||
                          'Chưa có nội dung mặt sau. Bấm "Đổi nội dung sau" để thêm trích dẫn hoặc ghi chú mặt sau (riêng với văn án).'}
                      </p>
                    </div>
                    <div className="pt-3 border-t border-light-outline/30 flex items-center justify-between">
                      <span className="font-label text-label-sm opacity-80">Di chuột hoặc bấm để lật</span>
                      <span id="flip-back-rating" className="font-mono text-mono-sm text-kale-pink tabular-nums">
                        {rating}/5 ★
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                id="manual-flip-btn"
                type="button"
                data-cursor-label="Lật thẻ"
                onClick={() => setIsFlipped((prev) => !prev)}
                className="cursor-target inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-light-surface-container text-light-primary font-label text-label-sm hover:bg-light-secondary-container transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                  360
                </span>
                <span>{isFlipped ? 'Xem bìa trước' : 'Lật mặt sau sách'}</span>
              </button>

              <button
                id="toggle-edit-back-btn"
                type="button"
                data-cursor-label="Đổi mặt sau"
                onClick={() => {
                  setIsEditingBack((prev) => {
                    const next = !prev;
                    if (next) setIsFlipped(true);
                    return next;
                  });
                }}
                className={`cursor-target inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label text-label-sm transition-colors cursor-pointer ${
                  isEditingBack
                    ? 'bg-kale-pink text-light-primary'
                    : 'bg-light-surface-container text-light-on-surface hover:bg-light-secondary-container'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]" aria-hidden="true">
                  edit_note
                </span>
                <span>{isEditingBack ? 'Xong mặt sau' : 'Đổi nội dung sau'}</span>
              </button>
            </div>

            {isEditingBack && (
              <div className="w-full p-3 rounded-lg bg-cream-surface border border-light-outline-variant flex flex-col gap-1.5">
                <span className="font-label text-[11px] text-light-on-surface">
                  Nội dung mặt sau sách (không liên quan văn án)
                </span>
                <textarea
                  id="inline-back-content-input"
                  rows={3}
                  value={backContent}
                  onChange={(e) => {
                    const nextVal = e.target.value;
                    setBackContent(nextVal);
                    onSave({
                      ...book,
                      title: title.trim() || book.title,
                      author: author.trim() || book.author,
                      genre: genres[0] || availableGenres[0],
                      genres,
                      synopsis,
                      backContent: nextVal,
                      image: image.trim() || book.image,
                      rating,
                      status,
                      notes,
                    });
                  }}
                  placeholder="Nhập trích dẫn, lời tựa, hoặc nội dung riêng cho mặt sau sách..."
                  className="w-full rounded-md border border-light-outline-variant bg-light-surface-bright text-body-sm text-light-on-surface px-2.5 py-1.5 focus:border-light-primary focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Right: View or Edit Mode */}
          {isEditingBook ? (
            <div className="md:col-span-7 flex flex-col gap-gutter-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-gutter-sm">
                <label className="flex flex-col gap-1">
                  <span className="font-label text-label-sm text-light-on-surface">Tên sách</span>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="rounded-lg border border-light-outline-variant bg-light-surface text-body-md text-light-on-surface px-3 py-2 focus:border-light-primary focus:outline-none"
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="font-label text-label-sm text-light-on-surface">Tác giả</span>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="rounded-lg border border-light-outline-variant bg-light-surface text-body-md text-light-on-surface px-3 py-2 focus:border-light-primary focus:outline-none"
                  />
                </label>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="font-label text-label-sm text-light-on-surface">
                  Thể loại (Gắn 1 hoặc nhiều tag)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {Array.from(new Set([...availableGenres, ...genres])).map((g) => {
                    const active = genres.includes(g);
                    return (
                      <button
                        key={g}
                        type="button"
                        aria-pressed={active}
                        onClick={() => handleToggleGenre(g)}
                        className={`px-3 py-1 rounded-full border font-label text-label-sm transition-colors cursor-pointer ${
                          active
                            ? 'bg-light-primary text-light-on-primary border-light-primary'
                            : 'bg-light-surface text-light-on-surface-variant border-light-outline-variant hover:border-light-primary'
                        }`}
                      >
                        {g}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="font-label text-label-sm text-light-on-surface">Ảnh bìa (Dán URL hoặc tải ảnh)</span>
                <div className="flex items-center gap-gutter-sm">
                  <input
                    type="url"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 rounded-lg border border-light-outline-variant bg-light-surface text-body-sm text-light-on-surface px-3 py-2 focus:border-light-primary focus:outline-none"
                  />
                  <label className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-light-surface-container text-light-on-surface font-label text-label-sm hover:bg-light-secondary-container transition-colors cursor-pointer whitespace-nowrap">
                    <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                      upload
                    </span>
                    <span>Tải ảnh</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
                <div className="grid grid-cols-6 gap-1.5 pt-1">
                  {COVER_IMAGES.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setImage(url)}
                      aria-label={`Chọn mẫu bìa ${idx + 1}`}
                      className={`aspect-[2/3] rounded overflow-hidden border-2 cursor-pointer ${
                        image === url ? 'border-light-primary' : 'border-transparent opacity-75 hover:opacity-100'
                      }`}
                    >
                      <BookCoverImage src={url} alt={`Mẫu ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex flex-col gap-1">
                <span className="font-label text-label-sm text-light-on-surface">Văn án</span>
                <textarea
                  rows={2}
                  value={synopsis}
                  onChange={(e) => setSynopsis(e.target.value)}
                  className="rounded-lg border border-light-outline-variant bg-light-surface text-body-md text-light-on-surface px-3 py-2 focus:border-light-primary focus:outline-none"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="font-label text-label-sm text-light-on-surface">
                  Nội dung mặt sau sách (riêng với văn án)
                </span>
                <textarea
                  rows={2}
                  value={backContent}
                  onChange={(e) => setBackContent(e.target.value)}
                  placeholder="Lời tựa, trích dẫn hoặc ghi chú mặt sau..."
                  className="rounded-lg border border-light-outline-variant bg-light-surface text-body-md text-light-on-surface px-3 py-2 focus:border-light-primary focus:outline-none"
                />
              </label>
            </div>
          ) : (
            <div className="md:col-span-7 flex flex-col gap-gutter-md">
              <div>
                <h2
                  id="detail-book-title"
                  className="font-headline text-headline-lg-mobile md:text-headline-lg text-light-on-surface"
                >
                  {title}
                </h2>
                <p id="detail-book-author" className="font-title text-title-md text-light-on-surface-variant mt-1">
                  {author}
                </p>
              </div>

              <div className="flex items-center gap-gutter-sm">
                <span className="font-label text-label-sm text-light-on-surface-variant">Đánh giá:</span>
                <div id="detail-star-row" className="inline-flex items-center gap-1" aria-label="Đánh giá sao">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      aria-label={`Đánh giá ${star} sao`}
                      className="cursor-pointer p-0.5 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-light-primary"
                    >
                      <span
                        className={`material-symbols-outlined text-[22px] ${
                          star <= rating ? 'text-kale-pink' : 'text-light-outline'
                        }`}
                        style={{fontVariationSettings: `'FILL' ${star <= rating ? 1 : 0}`}}
                      >
                        star
                      </span>
                    </button>
                  ))}
                </div>
                <span
                  id="detail-rating-text"
                  className="font-mono text-mono-sm text-light-on-surface-variant tabular-nums"
                >
                  {rating}/5
                </span>
              </div>

              <div className="flex flex-col gap-gutter-xs">
                <span className="font-label text-label-sm text-light-on-surface">Văn án</span>
                <p id="detail-book-synopsis" className="font-body text-body-md text-light-on-surface-variant text-pretty">
                  {synopsis || 'Chưa có văn án.'}
                </p>
              </div>

              <label className="flex flex-col gap-gutter-xs">
                <span className="font-label text-label-sm text-light-on-surface">
                  Ghi chú &amp; cảm nhận cá nhân
                </span>
                <textarea
                  id="detail-book-notes"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Viết vài dòng trích dẫn hoặc cảm nhận của bạn..."
                  className="rounded-lg border border-light-outline-variant bg-light-surface text-body-md px-3 py-2 text-light-on-surface focus:border-light-primary focus:outline-none focus:ring-1 focus:ring-light-primary"
                />
              </label>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-gutter-md pt-gutter-md border-t border-light-outline-variant">
          <div className="flex items-center gap-gutter-xs flex-wrap">
            <span className="font-label text-label-sm text-light-on-surface-variant mr-1">Chuyển kệ:</span>
            {(['want', 'reading', 'done'] as BookStatus[]).map((st) => {
              const active = status === st;
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatus(st)}
                  className={`px-3 py-1.5 rounded-full font-label text-label-sm transition-colors cursor-pointer whitespace-nowrap ${
                    active
                      ? 'bg-light-primary text-light-on-primary'
                      : 'bg-light-surface-container text-light-on-surface hover:bg-light-surface-container-high'
                  }`}
                >
                  {STATUS_META[st].label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-gutter-sm">
            {canDelete && (
              <button
                type="button"
                onClick={() => {
                  onDelete(book.id);
                  onClose();
                }}
                className="px-gutter-md py-2.5 rounded-full bg-light-error-container text-light-on-error-container font-label text-label-sm hover:opacity-90 transition-opacity cursor-pointer whitespace-nowrap"
              >
                Xoá sách
              </button>
            )}
            <button
              id="save-detail-btn"
              type="button"
              onClick={handleSave}
              className="px-gutter-lg py-2.5 rounded-full bg-light-primary text-light-on-primary font-label text-label-lg hover:bg-forest-hero transition-colors cursor-pointer whitespace-nowrap"
            >
              Lưu thay đổi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
