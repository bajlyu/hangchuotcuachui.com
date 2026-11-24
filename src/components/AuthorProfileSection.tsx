import {Plus} from 'lucide-react';
import {ChangeEvent, FormEvent, useMemo, useState} from 'react';
import {COVER_IMAGES, DEFAULT_AUTHOR_PROFILES} from '../data/books';
import {AuthorProfile, Book} from '../types/book';
import {readImageFileAsDataUrl} from '../utils/imageUpload';
import {Profile, ProfileIcon, ProfileSelector} from './ui/profile-selector';

interface AuthorProfileSectionProps {
  books: Book[];
  authorProfiles: AuthorProfile[];
  sectionTitle: string;
  onChangeSectionTitle: (next: string) => void;
  onAddAuthorProfile: (profile: AuthorProfile) => void;
  onUpdateAuthorProfile: (updated: AuthorProfile, previousName?: string) => void;
  onDeleteAuthorProfile: (profileId: string) => void;
  onResetAuthorProfiles: () => void;
  onSelectAuthor: (authorName: string) => void;
}

export function AuthorProfileSection({
  books,
  authorProfiles,
  sectionTitle,
  onChangeSectionTitle,
  onAddAuthorProfile,
  onUpdateAuthorProfile,
  onDeleteAuthorProfile,
  onResetAuthorProfiles,
  onSelectAuthor,
}: AuthorProfileSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAvatar, setNewAvatar] = useState(COVER_IMAGES[0]);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Merge explicitly stored authorProfiles with any authors found in books
  const mergedProfiles = useMemo(() => {
    const result: AuthorProfile[] = [...authorProfiles];
    const seen = new Set(result.map((p) => p.name.trim().toLowerCase()));

    books.forEach((book, idx) => {
      const cleanName = book.author?.trim();
      if (!cleanName) return;
      const key = cleanName.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        result.push({
          id: `book_author_${idx}_${key}`,
          name: cleanName,
          avatar: book.image || COVER_IMAGES[idx % COVER_IMAGES.length],
        });
      }
    });

    return result;
  }, [authorProfiles, books]);

  const selectorProfiles: Profile[] = useMemo(() => {
    const items: Profile[] = mergedProfiles.map((author) => ({
      id: author.id,
      label: author.name,
      icon: author.avatar,
    }));

    items.push({
      id: 'add',
      label: 'Thêm',
      icon: (
        <ProfileIcon className="bg-dark-surface-container-high text-dark-on-surface-variant group-hover:text-kale-pink">
          <Plus className="h-10 w-10 md:h-12 md:w-12" />
        </ProfileIcon>
      ),
    });

    return items;
  }, [mergedProfiles]);

  const handleProfileSelect = (id: string) => {
    if (id === 'add') {
      setNewName('');
      setNewAvatar(COVER_IMAGES[mergedProfiles.length % COVER_IMAGES.length]);
      setUploadError(null);
      setIsAddModalOpen(true);
      return;
    }

    const found = mergedProfiles.find((p) => p.id === id);
    if (found) {
      if (isEditing) {
        return;
      }
      onSelectAuthor(found.name);
    }
  };

  const handleUploadNewAvatar = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    try {
      const dataUrl = await readImageFileAsDataUrl(file, 480);
      setNewAvatar(dataUrl);
    } catch {
      setUploadError('Không thể tải ảnh lên. Vui lòng thử lại.');
    }
    e.target.value = '';
  };

  const handleUploadExistingAvatar = async (
    profile: AuthorProfile,
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    try {
      const dataUrl = await readImageFileAsDataUrl(file, 480);
      onUpdateAuthorProfile({...profile, avatar: dataUrl});
    } catch {
      setUploadError('Không thể tải ảnh lên. Vui lòng thử lại.');
    }
    e.target.value = '';
  };

  const handleCreateAuthor = (e: FormEvent) => {
    e.preventDefault();
    const clean = newName.trim();
    if (!clean) return;
    const existing = mergedProfiles.find((p) => p.name.toLowerCase() === clean.toLowerCase());
    if (existing) {
      onUpdateAuthorProfile({...existing, avatar: newAvatar.trim() || existing.avatar});
    } else {
      onAddAuthorProfile({
        id: `author_${Date.now()}`,
        name: clean,
        avatar: newAvatar.trim() || COVER_IMAGES[0],
      });
    }
    setIsAddModalOpen(false);
  };

  return (
    <section
      id="curved-author-section"
      className="relative w-full rounded-xl bg-dark-surface border border-dark-outline-variant overflow-hidden py-gutter-lg"
    >
      <div className="px-gutter-lg flex flex-wrap items-center justify-between gap-gutter-sm mb-2">
        <span className="font-mono text-mono-sm uppercase tracking-wider text-kale-olive">
          Tác giả · Bấm vào ảnh tác giả để mở phòng trưng bày truyện
        </span>

        <div className="flex items-center gap-2">
          <button
            id="quick-add-author-btn"
            type="button"
            onClick={() => {
              setNewName('');
              setNewAvatar(COVER_IMAGES[mergedProfiles.length % COVER_IMAGES.length]);
              setUploadError(null);
              setIsAddModalOpen(true);
            }}
            data-cursor-label="Thêm tác giả"
            className="cursor-target inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-dark-outline-variant bg-dark-surface-container text-dark-on-surface font-label text-label-sm hover:border-kale-pink hover:text-kale-pink transition-colors cursor-pointer whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-[15px]" aria-hidden="true">
              person_add
            </span>
            <span>Thêm tác giả</span>
          </button>

          <button
            id="toggle-curved-edit-btn"
            type="button"
            onClick={() => setIsEditing((prev) => !prev)}
            data-cursor-label="Sửa tác giả"
            className={`cursor-target inline-flex items-center gap-1.5 px-3 py-1 rounded-full border font-label text-label-sm transition-colors cursor-pointer whitespace-nowrap ${
              isEditing
                ? 'bg-kale-pink text-light-primary border-kale-pink'
                : 'bg-dark-surface-container text-dark-on-surface border-dark-outline-variant hover:border-kale-pink'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]" aria-hidden="true">
              {isEditing ? 'check' : 'edit'}
            </span>
            <span>{isEditing ? 'Xong' : 'Chỉnh sửa tác giả'}</span>
          </button>
        </div>
      </div>

      {isEditing && (
        <div className="mx-gutter-lg my-gutter-md p-gutter-md rounded-xl bg-dark-surface-container border border-dark-outline-variant flex flex-col gap-gutter-md">
          <div className="flex flex-wrap items-end justify-between gap-gutter-md">
            <label className="flex-1 min-w-[220px] flex flex-col gap-1">
              <span className="font-label text-label-sm text-dark-on-surface-variant">
                Tiêu đề hiển thị trên hàng tác giả
              </span>
              <input
                type="text"
                value={sectionTitle}
                onChange={(e) => onChangeSectionTitle(e.target.value)}
                placeholder="Chọn tác giả"
                className="rounded-lg border border-dark-outline-variant bg-dark-surface text-body-md text-light-surface-bright px-3 py-2 focus:border-kale-pink focus:outline-none"
              />
            </label>

            <button
              type="button"
              onClick={onResetAuthorProfiles}
              className="px-3 py-2 rounded-lg border border-dark-outline-variant text-dark-on-surface-variant hover:text-kale-pink hover:border-kale-pink font-label text-label-sm cursor-pointer"
            >
              Khôi phục mặc định ({DEFAULT_AUTHOR_PROFILES.length})
            </button>
          </div>

          {uploadError && (
            <div className="px-3 py-2 rounded-lg bg-dark-error-container text-dark-on-error-container font-body text-body-sm">
              {uploadError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter-sm max-h-96 overflow-y-auto pr-1">
            {mergedProfiles.map((profile) => (
              <div
                key={profile.id}
                className="p-3 rounded-lg bg-dark-surface border border-dark-outline-variant flex items-center gap-3"
              >
                <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 border border-dark-outline-variant bg-dark-surface-container">
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                  <input
                    type="text"
                    aria-label={`Tên tác giả ${profile.name}`}
                    value={profile.name}
                    onChange={(e) => onUpdateAuthorProfile({...profile, name: e.target.value}, profile.name)}
                    className="w-full rounded-md border border-dark-outline-variant bg-dark-surface-container px-2.5 py-1 text-body-sm text-light-surface-bright focus:border-kale-pink focus:outline-none"
                  />
                  <div className="flex items-center gap-1.5">
                    <input
                      type="url"
                      aria-label={`URL ảnh của ${profile.name}`}
                      value={profile.avatar}
                      onChange={(e) => onUpdateAuthorProfile({...profile, avatar: e.target.value})}
                      placeholder="https://..."
                      className="flex-1 min-w-0 rounded-md border border-dark-outline-variant bg-dark-surface-container px-2.5 py-1 text-[12px] text-dark-on-surface focus:border-kale-pink focus:outline-none"
                    />
                    <label className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-dark-surface-container border border-dark-outline-variant text-[11px] font-label text-dark-on-surface hover:border-kale-pink hover:text-kale-pink cursor-pointer flex-shrink-0">
                      <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                        upload
                      </span>
                      <span>Tải ảnh</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleUploadExistingAvatar(profile, e)}
                        className="hidden"
                      />
                    </label>
                    {mergedProfiles.length > 1 && (
                      <button
                        type="button"
                        aria-label={`Xoá tác giả ${profile.name}`}
                        onClick={() => onDeleteAuthorProfile(profile.id)}
                        className="w-7 h-7 rounded-md bg-dark-error-container text-dark-on-error-container flex items-center justify-center hover:opacity-90 cursor-pointer flex-shrink-0"
                      >
                        <span className="material-symbols-outlined text-[15px]">delete</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div id="curved-loop-wrapper" className="w-full">
        <div id="curved-loop-svg" className="w-full">
          <ProfileSelector
            title={sectionTitle || 'Chọn tác giả'}
            profiles={selectorProfiles}
            onProfileSelect={handleProfileSelect}
            className="min-h-0 bg-transparent py-4 md:py-6"
          />
        </div>
      </div>

      {/* Add New Author Modal */}
      {isAddModalOpen && (
        <div
          id="add-author-modal"
          className="fixed inset-0 z-50 bg-light-on-surface/65 flex items-center justify-center p-gutter-md overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-author-modal-title"
          onClick={() => setIsAddModalOpen(false)}
        >
          <form
            onSubmit={handleCreateAuthor}
            onClick={(e) => e.stopPropagation()}
            className="bg-light-surface-bright text-light-on-surface rounded-xl max-w-md w-full p-gutter-lg border border-light-outline-variant shadow-2xl flex flex-col gap-gutter-md my-auto"
          >
            <div className="flex items-center justify-between">
              <h3 id="add-author-modal-title" className="font-headline text-headline-md text-light-on-surface">
                Thêm tác giả mới
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                aria-label="Đóng"
                className="w-9 h-9 rounded-full bg-light-surface-container flex items-center justify-center text-light-on-surface hover:bg-light-surface-container-high cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="flex justify-center">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-kale-pink bg-dark-surface shadow-md">
                <img
                  src={newAvatar}
                  alt={newName || 'Ảnh tác giả mới'}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <label className="flex flex-col gap-1">
              <span className="font-label text-label-sm text-light-on-surface">Tên tác giả</span>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ví dụ: Nam Cao"
                className="rounded-lg border border-light-outline-variant bg-light-surface text-body-md text-light-on-surface px-3 py-2 focus:border-light-primary focus:outline-none"
              />
            </label>

            <div className="flex flex-col gap-1.5">
              <span className="font-label text-label-sm text-light-on-surface">
                Ảnh tác giả (Dán URL hoặc tải ảnh từ máy)
              </span>
              <div className="flex items-center gap-gutter-sm">
                <input
                  type="url"
                  value={newAvatar}
                  onChange={(e) => setNewAvatar(e.target.value)}
                  placeholder="https://..."
                  className="flex-1 rounded-lg border border-light-outline-variant bg-light-surface text-body-sm text-light-on-surface px-3 py-2 focus:border-light-primary focus:outline-none"
                />
                <label className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-light-surface-container text-light-on-surface font-label text-label-sm hover:bg-light-secondary-container transition-colors cursor-pointer whitespace-nowrap">
                  <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                    upload
                  </span>
                  <span>Tải ảnh</span>
                  <input type="file" accept="image/*" onChange={handleUploadNewAvatar} className="hidden" />
                </label>
              </div>

              <div className="grid grid-cols-6 gap-2 pt-1">
                {COVER_IMAGES.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setNewAvatar(url)}
                    aria-label={`Chọn ảnh mẫu ${idx + 1}`}
                    className={`aspect-square rounded-full overflow-hidden border-2 transition-transform cursor-pointer ${
                      newAvatar === url ? 'border-light-primary scale-105' : 'border-transparent opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt={`Mẫu ${idx + 1}`} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {uploadError && (
              <p className="font-body text-body-sm text-light-error">{uploadError}</p>
            )}

            <div className="flex items-center justify-end gap-gutter-sm pt-gutter-xs">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-gutter-md py-2 rounded-full border border-light-outline-variant text-light-on-surface font-label text-label-sm hover:bg-light-surface-container cursor-pointer"
              >
                Huỷ
              </button>
              <button
                type="submit"
                className="px-gutter-lg py-2 rounded-full bg-light-primary text-light-on-primary font-label text-label-sm hover:bg-forest-hero cursor-pointer"
              >
                Thêm tác giả
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
