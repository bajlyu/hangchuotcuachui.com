import {ChangeEvent, useEffect, useState} from 'react';
import {DEFAULT_BOOKS, DEFAULT_DRIFTWALL_COPY, GENRE_OPTIONS, getBookTags} from '../data/books';
import {Book, DriftWallCopy} from '../types/book';
import {readImageFileAsDataUrl} from '../utils/imageUpload';
import {BookCoverImage} from './BookCoverImage';

interface DriftWallEditorModalProps {
  isOpen: boolean;
  books: Book[];
  genreOptions: string[];
  wallCopy: DriftWallCopy;
  onChangeWallCopy: (next: DriftWallCopy) => void;
  onUpdateBook: (updated: Book) => void;
  onDeleteBook: (bookId: string) => void;
  onResetDefaults: () => void;
  onOpenAddBook: () => void;
  onClose: () => void;
}

const HEADLINE_COLORS = [
  {label: 'Trắng sáng', value: '#FFFFFF'},
  {label: 'Hồng Kale', value: '#F49AC1'},
  {label: 'Xanh Olive', value: '#AED361'},
  {label: 'Kem dịu', value: '#f0ffd5'},
];

const COPY_PRESETS: Array<{label: string; copy: Partial<DriftWallCopy>}> = [
  {
    label: 'Mặc định',
    copy: {
      badgePrefix: DEFAULT_DRIFTWALL_COPY.badgePrefix,
      headline: DEFAULT_DRIFTWALL_COPY.headline,
      subHeadline: DEFAULT_DRIFTWALL_COPY.subHeadline,
    },
  },
  {
    label: 'Đọc đêm khuya',
    copy: {
      badgePrefix: 'Giờ đọc yên tĩnh',
      headline: 'Những trang sách dành riêng cho đêm muộn',
      subHeadline: 'Chọn một cuốn truyện đang trôi để lưu ghi chú và trích dẫn yêu thích.',
    },
  },
  {
    label: 'Tủ sách chọn lọc',
    copy: {
      badgePrefix: 'Bộ sưu tập cá nhân',
      headline: 'Hang Chuột Chũi — Nơi lưu giữ thế giới chữ nghĩa',
      subHeadline: 'Khám phá theo thể loại hoặc lật thẻ FlipCard 3D để xem nhanh văn án.',
    },
  },
];

export function DriftWallEditorModal({
  isOpen,
  books,
  genreOptions,
  wallCopy,
  onChangeWallCopy,
  onUpdateBook,
  onDeleteBook,
  onResetDefaults,
  onOpenAddBook,
  onClose,
}: DriftWallEditorModalProps) {
  const availableGenres = genreOptions.length > 0 ? genreOptions : GENRE_OPTIONS;
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleFileUpload = async (book: Book, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    try {
      const dataUrl = await readImageFileAsDataUrl(file);
      onUpdateBook({...book, image: dataUrl});
    } catch {
      setUploadError('Không thể tải ảnh lên. Vui lòng thử ảnh khác.');
    }
    e.target.value = '';
  };

  return (
    <div
      id="driftwall-editor-modal"
      className="fixed inset-0 z-50 bg-light-on-surface/65 flex items-center justify-center p-gutter-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wall-editor-title"
      onClick={onClose}
    >
      <div
        className="bg-light-surface-bright text-light-on-surface rounded-xl max-w-4xl w-full p-gutter-lg md:p-gutter-xl border border-light-outline-variant shadow-2xl flex flex-col gap-gutter-lg my-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-gutter-md">
          <div>
            <h2 id="wall-editor-title" className="font-headline text-headline-md text-light-on-surface">
              Sửa ảnh &amp; văn bản trên DriftWall
            </h2>
            <p className="font-body text-body-md text-light-on-surface-variant">
              Điều chỉnh trực tiếp tiêu đề chính, phụ đề và danh sách bìa sách chạy trên DriftWall.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="w-9 h-9 rounded-full bg-light-surface-container flex items-center justify-center text-light-on-surface hover:bg-light-surface-container-high cursor-pointer flex-shrink-0"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="overflow-y-auto flex-1 pr-1 flex flex-col gap-gutter-lg">
          {/* Interactive Headline & Sub-Headline Control Panel */}
          <section
            id="driftwall-headline-control-panel"
            aria-label="Bảng điều khiển tiêu đề chính và phụ đề DriftWall"
            className="rounded-xl bg-cream-surface border border-light-outline-variant p-gutter-md md:p-gutter-lg flex flex-col gap-gutter-md"
          >
            <div className="flex flex-wrap items-center justify-between gap-gutter-sm">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-forest-hero" aria-hidden="true">
                  title
                </span>
                <h3 className="font-title text-title-md text-light-on-surface">
                  Bảng điều khiển Tiêu đề chính &amp; Phụ đề
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {COPY_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => onChangeWallCopy({...wallCopy, ...preset.copy})}
                    className="px-2.5 py-1 rounded-full bg-light-surface-bright border border-light-outline-variant text-light-on-surface font-label text-label-sm hover:border-forest-hero hover:text-forest-hero transition-colors cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
                <button
                  id="reset-wall-copy-btn"
                  type="button"
                  onClick={() => onChangeWallCopy(DEFAULT_DRIFTWALL_COPY)}
                  className="px-2.5 py-1 rounded-full bg-light-surface-container text-light-on-surface-variant font-label text-label-sm hover:bg-light-surface-container-high transition-colors cursor-pointer"
                >
                  Đặt lại
                </button>
              </div>
            </div>

            {/* Live Preview Strip */}
            <div className="rounded-lg bg-dark-surface border border-dark-outline-variant p-gutter-md flex flex-col gap-gutter-xs">
              <span className="font-mono text-[11px] uppercase tracking-wider text-kale-olive">
                Xem trước trực tiếp trên DriftWall
              </span>
              {wallCopy.showBadge && (
                <span className="self-start inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-kale-pink text-light-primary font-label text-label-sm">
                  <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                    motion_play
                  </span>
                  <span>{(wallCopy.badgePrefix.trim() || 'Dòng sách đang chạy') + ' · Tất cả'}</span>
                </span>
              )}
              <p
                className={`font-headline text-balance ${
                  wallCopy.headlineSize === 'lg' ? 'text-headline-lg-mobile md:text-headline-lg' : 'text-headline-md'
                }`}
                style={{color: wallCopy.headlineColor || '#FFFFFF'}}
              >
                {wallCopy.headline.trim() || '(Tiêu đề chính đang trống)'}
              </p>
              {wallCopy.showSubHeadline && (
                <p className="font-body text-body-md text-light-surface-bright/80">
                  {wallCopy.subHeadline.trim() || '(Phụ đề đang trống)'}
                </p>
              )}
            </div>

            {/* Editable Inputs for Main Headline, Sub-Headline & Badge */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter-md">
              <label className="md:col-span-12 flex flex-col gap-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-label text-label-sm text-light-on-surface">
                    Tiêu đề chính (Main Headline)
                  </span>
                  <span className="font-mono text-[11px] text-light-on-surface-variant tabular-nums">
                    {wallCopy.headline.length} ký tự
                  </span>
                </div>
                <input
                  id="wall-main-headline-input"
                  type="text"
                  value={wallCopy.headline}
                  onChange={(e) => onChangeWallCopy({...wallCopy, headline: e.target.value})}
                  placeholder={DEFAULT_DRIFTWALL_COPY.headline}
                  className="rounded-lg border border-light-outline-variant bg-light-surface-bright text-body-md text-light-on-surface px-3 py-2 focus:border-light-primary focus:outline-none focus:ring-1 focus:ring-light-primary"
                />
              </label>

              <label className="md:col-span-8 flex flex-col gap-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-label text-label-sm text-light-on-surface">
                    Phụ đề (Sub-headline)
                  </span>
                  <span className="font-mono text-[11px] text-light-on-surface-variant tabular-nums">
                    {wallCopy.subHeadline.length} ký tự
                  </span>
                </div>
                <textarea
                  id="wall-sub-headline-input"
                  rows={2}
                  value={wallCopy.subHeadline}
                  onChange={(e) => onChangeWallCopy({...wallCopy, subHeadline: e.target.value})}
                  placeholder={DEFAULT_DRIFTWALL_COPY.subHeadline}
                  className="rounded-lg border border-light-outline-variant bg-light-surface-bright text-body-md text-light-on-surface px-3 py-2 focus:border-light-primary focus:outline-none focus:ring-1 focus:ring-light-primary"
                />
              </label>

              <label className="md:col-span-4 flex flex-col gap-1">
                <span className="font-label text-label-sm text-light-on-surface">Nhãn phía trên (Badge)</span>
                <input
                  id="wall-badge-prefix-input"
                  type="text"
                  value={wallCopy.badgePrefix}
                  onChange={(e) => onChangeWallCopy({...wallCopy, badgePrefix: e.target.value})}
                  placeholder={DEFAULT_DRIFTWALL_COPY.badgePrefix}
                  className="rounded-lg border border-light-outline-variant bg-light-surface-bright text-body-md text-light-on-surface px-3 py-2 focus:border-light-primary focus:outline-none focus:ring-1 focus:ring-light-primary"
                />
              </label>
            </div>

            {/* Interactive Style & Visibility Controls */}
            <div className="flex flex-wrap items-center justify-between gap-gutter-md pt-gutter-sm border-t border-light-outline-variant">
              <div className="flex flex-wrap items-center gap-gutter-md">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={wallCopy.showBadge}
                    onChange={(e) => onChangeWallCopy({...wallCopy, showBadge: e.target.checked})}
                    className="rounded border-light-outline text-light-primary focus:ring-light-primary"
                  />
                  <span className="font-label text-label-sm text-light-on-surface">Hiện nhãn</span>
                </label>

                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={wallCopy.showSubHeadline}
                    onChange={(e) => onChangeWallCopy({...wallCopy, showSubHeadline: e.target.checked})}
                    className="rounded border-light-outline text-light-primary focus:ring-light-primary"
                  />
                  <span className="font-label text-label-sm text-light-on-surface">Hiện phụ đề</span>
                </label>

                <div className="inline-flex items-center gap-1 p-0.5 rounded-lg bg-light-surface-container border border-light-outline-variant">
                  <button
                    type="button"
                    onClick={() => onChangeWallCopy({...wallCopy, headlineSize: 'md'})}
                    className={`px-2.5 py-1 rounded-md font-label text-label-sm transition-colors cursor-pointer ${
                      wallCopy.headlineSize === 'md'
                        ? 'bg-light-surface-bright text-light-on-surface shadow-xs'
                        : 'text-light-on-surface-variant hover:text-light-on-surface'
                    }`}
                  >
                    Cỡ vừa
                  </button>
                  <button
                    type="button"
                    onClick={() => onChangeWallCopy({...wallCopy, headlineSize: 'lg'})}
                    className={`px-2.5 py-1 rounded-md font-label text-label-sm transition-colors cursor-pointer ${
                      wallCopy.headlineSize === 'lg'
                        ? 'bg-light-surface-bright text-light-on-surface shadow-xs'
                        : 'text-light-on-surface-variant hover:text-light-on-surface'
                    }`}
                  >
                    Cỡ lớn
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-label text-label-sm text-light-on-surface-variant">Màu tiêu đề:</span>
                {HEADLINE_COLORS.map((swatch) => (
                  <button
                    key={swatch.value}
                    type="button"
                    aria-label={swatch.label}
                    onClick={() => onChangeWallCopy({...wallCopy, headlineColor: swatch.value})}
                    className={`w-6 h-6 rounded-full border-2 cursor-pointer transition-transform ${
                      wallCopy.headlineColor === swatch.value
                        ? 'border-light-primary scale-110'
                        : 'border-light-outline-variant'
                    }`}
                    style={{backgroundColor: swatch.value}}
                  />
                ))}
              </div>
            </div>
          </section>

          {uploadError && (
            <div className="px-3 py-2 rounded-lg bg-light-error-container text-light-on-error-container font-body text-body-sm">
              {uploadError}
            </div>
          )}

          {/* Running Images List */}
          <div className="flex flex-wrap items-center justify-between gap-gutter-sm">
            <span className="font-label text-label-lg text-light-on-surface">
              Danh sách ảnh &amp; sách đang chạy ({books.length})
            </span>
            <div className="flex items-center gap-gutter-sm">
              <button
                type="button"
                onClick={() => {
                  onChangeWallCopy(DEFAULT_DRIFTWALL_COPY);
                  onResetDefaults();
                }}
                className="px-3 py-1.5 rounded-full border border-light-outline-variant text-light-on-surface-variant font-label text-label-sm hover:bg-light-surface-container cursor-pointer"
              >
                Khôi phục mặc định ({DEFAULT_BOOKS.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAddBook();
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-light-primary text-light-on-primary font-label text-label-sm hover:bg-forest-hero cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px]" aria-hidden="true">
                  add
                </span>
                <span>Thêm ảnh/sách mới</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-gutter-sm">
            {books.map((book) => (
              <div
                key={book.id}
                className="p-gutter-md rounded-lg border border-light-outline-variant bg-light-surface flex flex-col md:flex-row gap-gutter-md items-start md:items-center"
              >
                <div className="w-16 h-24 rounded-md overflow-hidden flex-shrink-0 border border-light-outline-variant bg-dark-surface">
                  <BookCoverImage src={book.image} alt={book.title} className="w-full h-full object-cover" />
                </div>

                <div className="flex-1 min-w-0 w-full grid grid-cols-1 md:grid-cols-12 gap-gutter-sm">
                  <label className="md:col-span-6 flex flex-col gap-1">
                    <span className="font-label text-[11px] text-light-on-surface-variant">Tên truyện / sách</span>
                    <input
                      type="text"
                      value={book.title}
                      onChange={(e) => onUpdateBook({...book, title: e.target.value})}
                      className="rounded-md border border-light-outline-variant bg-light-surface-bright text-body-md text-light-on-surface px-2.5 py-1.5 focus:border-light-primary focus:outline-none"
                    />
                  </label>

                  <label className="md:col-span-6 flex flex-col gap-1">
                    <span className="font-label text-[11px] text-light-on-surface-variant">Tác giả</span>
                    <input
                      type="text"
                      value={book.author}
                      onChange={(e) => onUpdateBook({...book, author: e.target.value})}
                      className="rounded-md border border-light-outline-variant bg-light-surface-bright text-body-md text-light-on-surface px-2.5 py-1.5 focus:border-light-primary focus:outline-none"
                    />
                  </label>

                  <div className="md:col-span-12 flex flex-col gap-1">
                    <span className="font-label text-[11px] text-light-on-surface-variant">
                      Thể loại (Chọn 1 hoặc nhiều tag)
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {Array.from(new Set([...availableGenres, ...getBookTags(book)])).map((g) => {
                        const bookTags = getBookTags(book);
                        const active = bookTags.includes(g);
                        return (
                          <button
                            key={g}
                            type="button"
                            aria-pressed={active}
                            onClick={() => {
                              const nextTags = active
                                ? bookTags.length > 1
                                  ? bookTags.filter((t) => t !== g)
                                  : bookTags
                                : [...bookTags, g];
                              onUpdateBook({
                                ...book,
                                genre: nextTags[0] || availableGenres[0],
                                genres: nextTags,
                              });
                            }}
                            className={`px-2.5 py-1 rounded-full border font-label text-[11px] transition-colors cursor-pointer ${
                              active
                                ? 'bg-light-primary text-light-on-primary border-light-primary'
                                : 'bg-light-surface-bright text-light-on-surface-variant border-light-outline-variant hover:border-light-primary'
                            }`}
                          >
                            {g}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <label className="md:col-span-12 flex flex-col gap-1">
                    <span className="font-label text-[11px] text-light-on-surface-variant">
                      Nội dung mặt sau sách (riêng với văn án)
                    </span>
                    <input
                      type="text"
                      value={book.backContent || ''}
                      onChange={(e) => onUpdateBook({...book, backContent: e.target.value})}
                      placeholder="Nhập trích dẫn hoặc ghi chú mặt sau cho quyển sách này..."
                      className="rounded-md border border-light-outline-variant bg-light-surface-bright text-body-sm text-light-on-surface px-2.5 py-1.5 focus:border-light-primary focus:outline-none"
                    />
                  </label>

                  <div className="md:col-span-12 flex flex-wrap items-center gap-gutter-sm">
                    <input
                      type="url"
                      aria-label={`URL ảnh của ${book.title}`}
                      value={book.image}
                      onChange={(e) => onUpdateBook({...book, image: e.target.value})}
                      placeholder="Dán link ảnh (https://...) hoặc bấm Tải ảnh lên"
                      className="flex-1 min-w-[200px] rounded-md border border-light-outline-variant bg-light-surface-bright text-body-sm text-light-on-surface px-2.5 py-1.5 focus:border-light-primary focus:outline-none"
                    />

                    <label className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-light-surface-container text-light-on-surface font-label text-label-sm hover:bg-light-secondary-container transition-colors cursor-pointer whitespace-nowrap">
                      <span className="material-symbols-outlined text-[15px]" aria-hidden="true">
                        upload
                      </span>
                      <span>Tải ảnh lên</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(book, e)}
                        className="hidden"
                      />
                    </label>

                    {books.length > 1 && (
                      <button
                        type="button"
                        onClick={() => onDeleteBook(book.id)}
                        aria-label={`Xoá ${book.title}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-light-error-container text-light-on-error-container font-label text-label-sm hover:opacity-90 cursor-pointer whitespace-nowrap"
                      >
                        <span className="material-symbols-outlined text-[15px]" aria-hidden="true">
                          delete
                        </span>
                        <span>Xoá</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-gutter-sm border-t border-light-outline-variant">
          <button
            type="button"
            onClick={onClose}
            className="px-gutter-lg py-2.5 rounded-full bg-light-primary text-light-on-primary font-label text-label-lg hover:bg-forest-hero cursor-pointer"
          >
            Hoàn tất
          </button>
        </div>
      </div>
    </div>
  );
}
