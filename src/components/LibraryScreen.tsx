import {useEffect, useMemo, useRef, useState} from 'react';
import {getBookTags, STATUS_META} from '../data/books';
import {AuthorProfile, Book, DriftWallCopy, TagSidebarConfig, ThemePreset} from '../types/book';
import {AuthorProfileSection} from './AuthorProfileSection';
import {BookCoverImage} from './BookCoverImage';
import {DriftWall} from './DriftWall';
import {LineSidebar} from './LineSidebar';

interface LibraryScreenProps {
  books: Book[];
  activeTags: string[];
  tagConfig: TagSidebarConfig;
  authorProfiles: AuthorProfile[];
  authorSectionTitle: string;
  themePreset: ThemePreset;
  driftSpeed: number;
  wallCopy: DriftWallCopy;
  onChangeTagConfig: (next: TagSidebarConfig) => void;
  onRenameTag: (oldTag: string, newTag: string) => void;
  onChangeAuthorSectionTitle: (next: string) => void;
  onAddAuthorProfile: (profile: AuthorProfile) => void;
  onUpdateAuthorProfile: (updated: AuthorProfile, previousName?: string) => void;
  onDeleteAuthorProfile: (profileId: string) => void;
  onResetAuthorProfiles: () => void;
  onBackToHero: () => void;
  onOpenSettings: () => void;
  onOpenAddBook: () => void;
  onOpenWallEditor: () => void;
  onToggleTag: (tag: string) => void;
  onResetSelectedTags: () => void;
  onSelectAuthor: (author: string) => void;
  onSelectBook: (bookId: string) => void;
}

export function LibraryScreen({
  books,
  activeTags,
  tagConfig,
  authorProfiles,
  authorSectionTitle,
  themePreset,
  driftSpeed,
  wallCopy,
  onChangeTagConfig,
  onRenameTag,
  onChangeAuthorSectionTitle,
  onAddAuthorProfile,
  onUpdateAuthorProfile,
  onDeleteAuthorProfile,
  onResetAuthorProfiles,
  onBackToHero,
  onOpenSettings,
  onOpenAddBook,
  onOpenWallEditor,
  onToggleTag,
  onResetSelectedTags,
  onSelectAuthor,
  onSelectBook,
}: LibraryScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchSectionRef = useRef<HTMLElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: globalThis.MouseEvent) => {
      if (searchSectionRef.current && !searchSectionRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const searchMatches = useMemo(() => {
    const trimmed = searchQuery.trim().toLowerCase();
    if (!trimmed) return [];
    return books.filter(
      (b) => b.title.toLowerCase().includes(trimmed) || b.author.toLowerCase().includes(trimmed),
    );
  }, [books, searchQuery]);

  const {driftPool, badgeLabel, displayCount} = useMemo(() => {
    const prefix = wallCopy.badgePrefix.trim() || 'Dòng sách đang chạy';
    const allTagLabel = tagConfig.tags[0] || 'Tất cả';
    const isAllSelected = activeTags.length === 0 || activeTags.includes(allTagLabel);
    const activeLower = activeTags.map((t) => t.toLowerCase());

    const filtered = isAllSelected
      ? books
      : books.filter((b) =>
          getBookTags(b).some((tag) => activeLower.includes(tag.toLowerCase())),
        );

    const tagSummary = isAllSelected ? allTagLabel : activeTags.join(' + ');

    return {
      driftPool: filtered.length > 0 ? filtered : books,
      badgeLabel: `${prefix} · ${tagSummary}`,
      displayCount: filtered.length,
    };
  }, [books, activeTags, tagConfig.tags, wallCopy.badgePrefix]);

  const isPlumTheme = themePreset === 'plum';

  return (
    <section
      id="template-2"
      className={`template-layer min-h-screen w-full flex flex-col transition-colors duration-300 ${
        isPlumTheme ? 'bg-dark-surface text-dark-on-surface' : 'bg-cream-surface text-light-on-surface'
      }`}
    >
      {/* Top App Bar */}
      <header
        className={`w-full border-b sticky top-0 z-40 backdrop-blur-sm transition-colors duration-300 ${
          isPlumTheme
            ? 'bg-dark-surface/95 border-dark-outline-variant'
            : 'bg-cream-surface/95 border-light-outline-variant'
        }`}
      >
        <div className="max-w-7xl mx-auto px-gutter-md md:px-page-margin py-gutter-sm md:py-gutter-md flex flex-wrap items-center justify-between gap-gutter-md">
          <div className="flex items-center gap-gutter-md">
            <span
              className={`font-headline text-headline-md tracking-tight whitespace-nowrap shrink-0 ${
                isPlumTheme ? 'text-dark-primary' : 'text-forest-hero'
              }`}
            >
              hang chuột chũi.
            </span>
            <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full bg-kale-pink text-light-primary font-label text-label-sm whitespace-nowrap shrink-0">
              Tủ sách tương tác
            </span>
          </div>

          <nav aria-label="Điều hướng chính" className="flex items-center gap-gutter-sm md:gap-gutter-md">
            <button
              id="back-to-hero-btn"
              type="button"
              onClick={onBackToHero}
              data-cursor-label="Cửa hang"
              className={`cursor-target inline-flex items-center gap-1.5 px-gutter-md py-2 rounded-full border font-label text-label-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                isPlumTheme
                  ? 'border-dark-outline-variant bg-dark-surface-container text-dark-on-surface hover:bg-dark-surface-container-high'
                  : 'border-light-outline-variant bg-light-surface-bright text-light-on-surface hover:bg-light-surface-container'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                north_west
              </span>
              <span>Cửa hang</span>
            </button>
            <button
              id="open-settings-btn"
              type="button"
              onClick={onOpenSettings}
              data-cursor-label="Giao diện"
              className={`cursor-target inline-flex items-center gap-1.5 px-gutter-md py-2 rounded-full border font-label text-label-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                isPlumTheme
                  ? 'border-dark-outline-variant bg-dark-surface-container text-dark-on-surface hover:bg-dark-secondary-container'
                  : 'border-light-outline-variant bg-light-surface-bright text-light-on-surface hover:bg-light-secondary-container'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                palette
              </span>
              <span>Giao diện</span>
            </button>

            <button
              id="add-book-open-btn"
              type="button"
              onClick={onOpenAddBook}
              data-cursor-label="Lưu sách"
              className="cursor-target inline-flex items-center justify-center gap-gutter-sm px-gutter-lg py-2.5 rounded-full bg-light-primary text-light-on-primary font-label text-label-lg hover:bg-forest-hero transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                bookmark_add
              </span>
              <span>Lưu sách mới</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Unified Workspace - Running books pulled higher up, LineSidebar overlaid on top */}
      <main className="max-w-7xl w-full mx-auto px-gutter-md md:px-page-margin pt-gutter-md pb-gutter-lg flex-1 flex flex-col gap-gutter-md">
        {/* 1. Compact Search Bar above Running Books */}
        <section ref={searchSectionRef} id="tusach-search-section" className="relative z-30 w-full">
          <div
            data-cursor-label="Tìm kiếm"
            className="cursor-target flex items-center w-full rounded-full bg-light-surface-bright text-light-on-surface shadow-lg border-2 border-kale-pink px-gutter-md py-1.5"
          >
            <span className="material-symbols-outlined text-[22px] text-forest-hero mr-2 flex-shrink-0" aria-hidden="true">
              search
            </span>
            <input
              ref={searchInputRef}
              id="search-books-input"
              type="search"
              value={searchQuery}
              onFocus={() => {
                if (searchQuery.trim()) setIsSearchOpen(true);
              }}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(Boolean(e.target.value.trim()));
              }}
              placeholder="Tìm tên truyện hoặc tên tác giả (ví dụ: Rừng Na Uy, Tô Hoài)..."
              aria-label="Tìm kiếm tên truyện hoặc tác giả"
              className="w-full border-0 bg-transparent text-body-lg text-light-on-surface placeholder:text-light-on-surface-variant focus:outline-none focus:ring-0"
            />
            {searchQuery.trim() && (
              <button
                id="clear-search-btn"
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setIsSearchOpen(false);
                  searchInputRef.current?.focus();
                }}
                className="ml-2 flex-shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-light-surface-container text-light-on-surface-variant font-label text-label-sm hover:bg-light-surface-container-high transition-colors cursor-pointer whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                  close
                </span>
                <span>Xoá</span>
              </button>
            )}
          </div>

          {isSearchOpen && searchQuery.trim() && (
            <div
              id="tusach-search-results"
              className="absolute left-0 right-0 mt-2 rounded-xl bg-light-surface-bright text-light-on-surface border border-light-outline-variant shadow-2xl overflow-hidden text-left z-50"
            >
              {searchMatches.length === 0 ? (
                <div className="px-gutter-md py-4 font-body text-body-md text-light-on-surface-variant">
                  Không tìm thấy truyện hoặc tác giả phù hợp.
                </div>
              ) : (
                searchMatches.slice(0, 6).map((b) => {
                  const meta = STATUS_META[b.status] || STATUS_META.want;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      data-cursor-label="Mở sách"
                      onClick={() => {
                        setIsSearchOpen(false);
                        onSelectBook(b.id);
                      }}
                      className="cursor-target w-full flex items-center justify-between gap-gutter-md px-gutter-md py-3 hover:bg-light-surface-container transition-colors border-b border-light-outline-variant last:border-b-0 text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-gutter-md min-w-0">
                        <div className="w-10 h-14 rounded-md overflow-hidden flex-shrink-0">
                          <BookCoverImage src={b.image} alt={b.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-title text-title-sm text-light-on-surface truncate">
                            {b.title}
                          </div>
                          <div className="font-body text-body-sm text-light-on-surface-variant truncate">
                            {b.author}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`flex-shrink-0 inline-flex items-center px-2.5 py-1 rounded-full font-label text-label-sm ${meta.badgeClass}`}
                      >
                        {meta.label}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </section>

        {/* 2. Full-Width 3D DriftWall with Overlaid LineSidebar on top */}
        <section
          id="driftwall-strip-section"
          className="relative w-full rounded-xl bg-dark-surface border border-dark-outline-variant overflow-hidden flex flex-col"
        >
          <DriftWall
            books={driftPool}
            badgeLabel={badgeLabel}
            wallCopy={wallCopy}
            driftSpeed={driftSpeed}
            onSelectBook={onSelectBook}
            onOpenWallEditor={onOpenWallEditor}
          />

          <LineSidebar
            activeTags={activeTags}
            displayCount={displayCount}
            tagConfig={tagConfig}
            onChangeTagConfig={onChangeTagConfig}
            onRenameTag={onRenameTag}
            onToggleTag={onToggleTag}
            onResetSelectedTags={onResetSelectedTags}
            onOpenWallEditor={onOpenWallEditor}
          />
        </section>

        {/* 3. Circular Author Avatar Selector */}
        <AuthorProfileSection
          books={books}
          authorProfiles={authorProfiles}
          sectionTitle={authorSectionTitle}
          onChangeSectionTitle={onChangeAuthorSectionTitle}
          onAddAuthorProfile={onAddAuthorProfile}
          onUpdateAuthorProfile={onUpdateAuthorProfile}
          onDeleteAuthorProfile={onDeleteAuthorProfile}
          onResetAuthorProfiles={onResetAuthorProfiles}
          onSelectAuthor={onSelectAuthor}
        />
      </main>
    </section>
  );
}
