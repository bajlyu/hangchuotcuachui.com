import {ChangeEvent, FormEvent, useEffect, useState} from 'react';
import {COVER_IMAGES, GENRE_OPTIONS} from '../data/books';
import {Book, BookStatus} from '../types/book';
import {readImageFileAsDataUrl} from '../utils/imageUpload';
import {BookCoverImage} from './BookCoverImage';

interface AddBookModalProps {
  isOpen: boolean;
  existingCount: number;
  genreOptions: string[];
  onClose: () => void;
  onAddBook: (book: Book) => void;
}

export function AddBookModal({isOpen, existingCount, genreOptions, onClose, onAddBook}: AddBookModalProps) {
  const availableGenres = genreOptions.length > 0 ? genreOptions : GENRE_OPTIONS;
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([availableGenres[0]]);
  const [status, setStatus] = useState<BookStatus>('want');
  const [synopsis, setSynopsis] = useState('');
  const [imageUrl, setImageUrl] = useState(COVER_IMAGES[0]);

  useEffect(() => {
    if (isOpen) {
      setImageUrl(COVER_IMAGES[existingCount % COVER_IMAGES.length]);
      setSelectedGenres((prev) => {
        const valid = prev.filter((g) => availableGenres.includes(g));
        return valid.length > 0 ? valid : [availableGenres[0]];
      });
    }
  }, [isOpen, existingCount, availableGenres]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await readImageFileAsDataUrl(file);
      setImageUrl(dataUrl);
    } catch {
      // Ignore upload failure
    }
    e.target.value = '';
  };

  const handleToggleGenre = (tag: string) => {
    setSelectedGenres((prev) => {
      if (prev.includes(tag)) {
        return prev.length > 1 ? prev.filter((g) => g !== tag) : prev;
      }
      return [...prev, tag];
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    const cleanAuthor = author.trim();
    if (!cleanTitle || !cleanAuthor) return;

    const finalTags = selectedGenres.length > 0 ? selectedGenres : [availableGenres[0]];

    onAddBook({
      id: `b_${Date.now()}`,
      title: cleanTitle,
      author: cleanAuthor,
      genre: finalTags[0],
      genres: finalTags,
      rating: 5,
      synopsis: synopsis.trim() || 'Cuốn sách mới được lưu vào Hang Chuột Chũi.',
      notes: '',
      image: imageUrl.trim() || COVER_IMAGES[0],
      status,
    });

    setTitle('');
    setAuthor('');
    setSelectedGenres([availableGenres[0]]);
    setStatus('want');
    setSynopsis('');
    onClose();
  };

  return (
    <div
      id="add-book-modal"
      className="fixed inset-0 z-50 bg-light-on-surface/50 flex items-center justify-center p-gutter-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-modal-title"
      onClick={onClose}
    >
      <form
        id="add-book-form"
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="bg-light-surface-bright text-light-on-surface rounded-xl max-w-md w-full p-gutter-lg border border-light-outline-variant shadow-xl flex flex-col gap-gutter-md my-auto"
      >
        <div className="flex items-center justify-between">
          <h2 id="add-modal-title" className="font-headline text-headline-md text-light-on-surface">
            Lưu sách mới
          </h2>
          <button
            id="close-add-modal-btn"
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="w-9 h-9 rounded-full bg-light-surface-container flex items-center justify-center text-light-on-surface hover:bg-light-surface-container-high cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <label className="flex flex-col gap-1">
          <span className="font-label text-label-sm text-light-on-surface">Tên sách</span>
          <input
            id="new-title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ví dụ: Tuổi Thơ Dữ Dội"
            className="rounded-lg border border-light-outline-variant bg-light-surface text-body-md text-light-on-surface px-3 py-2 focus:border-light-primary focus:outline-none focus:ring-1 focus:ring-light-primary"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="font-label text-label-sm text-light-on-surface">Tác giả</span>
          <input
            id="new-author"
            type="text"
            required
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Ví dụ: Phùng Quán"
            className="rounded-lg border border-light-outline-variant bg-light-surface text-body-md text-light-on-surface px-3 py-2 focus:border-light-primary focus:outline-none focus:ring-1 focus:ring-light-primary"
          />
        </label>

        <div className="flex flex-col gap-gutter-sm">
          <div className="flex flex-col gap-1.5">
            <span className="font-label text-label-sm text-light-on-surface">
              Thể loại (Chọn 1 hoặc nhiều tag)
            </span>
            <div className="flex flex-wrap gap-1.5">
              {availableGenres.map((g) => {
                const active = selectedGenres.includes(g);
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

          <label className="flex flex-col gap-1">
            <span className="font-label text-label-sm text-light-on-surface">Kệ đọc</span>
            <select
              id="new-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as BookStatus)}
              className="rounded-lg border border-light-outline-variant bg-light-surface text-body-md text-light-on-surface px-3 py-2 focus:border-light-primary focus:outline-none focus:ring-1 focus:ring-light-primary"
            >
              <option value="want">Muốn đọc</option>
              <option value="reading">Đang đọc</option>
              <option value="done">Đã xong</option>
            </select>
          </label>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="font-label text-label-sm text-light-on-surface">Ảnh bìa (Dán link, tải ảnh hoặc chọn mẫu)</span>
          <div className="flex items-center gap-gutter-sm">
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
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
          <div className="grid grid-cols-6 gap-2 pt-1">
            {COVER_IMAGES.map((url, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setImageUrl(url)}
                aria-label={`Chọn bìa ${idx + 1}`}
                className={`aspect-[2/3] rounded-md overflow-hidden border-2 transition-transform cursor-pointer ${
                  imageUrl === url
                    ? 'border-light-primary scale-105'
                    : 'border-transparent opacity-75 hover:opacity-100'
                }`}
              >
                <BookCoverImage src={url} alt={`Bìa ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <label className="flex flex-col gap-1">
          <span className="font-label text-label-sm text-light-on-surface">Văn án ngắn</span>
          <textarea
            id="new-synopsis"
            rows={2}
            value={synopsis}
            onChange={(e) => setSynopsis(e.target.value)}
            placeholder="Tóm tắt nội dung cuốn sách..."
            className="rounded-lg border border-light-outline-variant bg-light-surface text-body-md text-light-on-surface px-3 py-2 focus:border-light-primary focus:outline-none focus:ring-1 focus:ring-light-primary"
          />
        </label>

        <div className="flex items-center justify-end gap-gutter-sm pt-gutter-sm">
          <button
            id="cancel-add-btn"
            type="button"
            onClick={onClose}
            className="px-gutter-md py-2.5 rounded-full border border-light-outline-variant text-light-on-surface font-label text-label-lg hover:bg-light-surface-container cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="px-gutter-lg py-2.5 rounded-full bg-light-primary text-light-on-primary font-label text-label-lg hover:bg-forest-hero cursor-pointer"
          >
            Lưu vào tủ
          </button>
        </div>
      </form>
    </div>
  );
}
