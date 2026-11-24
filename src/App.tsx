import {useCallback, useEffect, useMemo, useState} from 'react';
import {AddBookModal} from './components/AddBookModal';
import {AuthorGalleryScreen} from './components/AuthorGalleryScreen';
import {BookDetailModal} from './components/BookDetailModal';
import {ClickSpark} from './components/ClickSpark';
import {DriftWallEditorModal} from './components/DriftWallEditorModal';
import {HeroScreen} from './components/HeroScreen';
import {LibraryScreen} from './components/LibraryScreen';
import {SettingsModal} from './components/SettingsModal';
import TargetCursor from './components/TargetCursor';
import {
  AUTHOR_PROFILES_STORAGE_KEY,
  AUTHOR_SECTION_TITLE_STORAGE_KEY,
  DEFAULT_AUTHOR_PROFILES,
  DEFAULT_BOOKS,
  DEFAULT_DRIFTWALL_COPY,
  DEFAULT_TAG_SIDEBAR_CONFIG,
  DRIFTWALL_COPY_STORAGE_KEY,
  getBookTags,
  SPEED_STORAGE_KEY,
  STORAGE_KEY,
  TAG_SIDEBAR_STORAGE_KEY,
  THEME_STORAGE_KEY,
} from './data/books';
import {AuthorProfile, Book, DriftWallCopy, TagSidebarConfig, ThemePreset} from './types/book';

function loadSavedBooks(): Book[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // Fallback to default dataset
  }
  return DEFAULT_BOOKS;
}

function loadSavedTheme(): ThemePreset {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    if (raw === 'kale' || raw === 'plum') return raw;
  } catch {
    // Fallback
  }
  return 'kale';
}

function loadSavedSpeed(): number {
  try {
    const raw = localStorage.getItem(SPEED_STORAGE_KEY);
    if (raw !== null) {
      const num = parseInt(raw, 10);
      if (!Number.isNaN(num)) return num;
    }
  } catch {
    // Fallback
  }
  return 60;
}

function loadSavedWallCopy(): DriftWallCopy {
  try {
    const raw = localStorage.getItem(DRIFTWALL_COPY_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return {...DEFAULT_DRIFTWALL_COPY, ...parsed};
      }
    }
  } catch {
    // Fallback
  }
  return DEFAULT_DRIFTWALL_COPY;
}

function loadSavedTagConfig(): TagSidebarConfig {
  try {
    const raw = localStorage.getItem(TAG_SIDEBAR_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && Array.isArray(parsed.tags) && parsed.tags.length > 0) {
        return {...DEFAULT_TAG_SIDEBAR_CONFIG, ...parsed};
      }
    }
  } catch {
    // Fallback
  }
  return DEFAULT_TAG_SIDEBAR_CONFIG;
}

function loadSavedAuthorProfiles(): AuthorProfile[] {
  try {
    const raw = localStorage.getItem(AUTHOR_PROFILES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // Fallback
  }
  return DEFAULT_AUTHOR_PROFILES;
}

function loadSavedAuthorSectionTitle(): string {
  try {
    const raw = localStorage.getItem(AUTHOR_SECTION_TITLE_STORAGE_KEY);
    if (raw !== null) return raw;
  } catch {
    // Fallback
  }
  return 'Chọn tác giả';
}

export default function App() {
  const [books, setBooks] = useState<Book[]>(loadSavedBooks);
  const [activeStage, setActiveStage] = useState<'t1' | 't2' | 't3'>('t1');
  const [tagConfig, setTagConfig] = useState<TagSidebarConfig>(loadSavedTagConfig);
  const [activeTags, setActiveTags] = useState<string[]>(() => [loadSavedTagConfig().tags[0] || 'Tất cả']);
  const [authorProfiles, setAuthorProfiles] = useState<AuthorProfile[]>(loadSavedAuthorProfiles);
  const [authorSectionTitle, setAuthorSectionTitle] = useState<string>(loadSavedAuthorSectionTitle);
  const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null);
  const [themePreset, setThemePreset] = useState<ThemePreset>(loadSavedTheme);
  const [driftSpeed, setDriftSpeed] = useState<number>(loadSavedSpeed);
  const [wallCopy, setWallCopy] = useState<DriftWallCopy>(loadSavedWallCopy);

  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAddBookOpen, setIsAddBookOpen] = useState(false);
  const [isWallEditorOpen, setIsWallEditorOpen] = useState(false);

  const selectedBook = books.find((b) => b.id === selectedBookId) ?? null;

  const genreOptions = useMemo(() => tagConfig.tags.slice(1).filter(Boolean), [tagConfig.tags]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
    } catch {
      // Ignore storage quota errors
    }
  }, [books]);

  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, themePreset);
    } catch {
      // Ignore storage errors
    }
  }, [themePreset]);

  useEffect(() => {
    try {
      localStorage.setItem(SPEED_STORAGE_KEY, String(driftSpeed));
    } catch {
      // Ignore storage errors
    }
  }, [driftSpeed]);

  useEffect(() => {
    try {
      localStorage.setItem(AUTHOR_PROFILES_STORAGE_KEY, JSON.stringify(authorProfiles));
    } catch {
      // Ignore storage errors
    }
  }, [authorProfiles]);

  useEffect(() => {
    try {
      localStorage.setItem(AUTHOR_SECTION_TITLE_STORAGE_KEY, authorSectionTitle);
    } catch {
      // Ignore storage errors
    }
  }, [authorSectionTitle]);

  useEffect(() => {
    try {
      localStorage.setItem(DRIFTWALL_COPY_STORAGE_KEY, JSON.stringify(wallCopy));
    } catch {
      // Ignore storage errors
    }
  }, [wallCopy]);

  useEffect(() => {
    try {
      localStorage.setItem(TAG_SIDEBAR_STORAGE_KEY, JSON.stringify(tagConfig));
    } catch {
      // Ignore storage errors
    }
  }, [tagConfig]);

  const goToTemplate2 = useCallback(() => {
    setActiveStage('t2');
    window.scrollTo({top: 0, behavior: 'smooth'});
  }, []);

  const goToTemplate1 = useCallback(() => {
    setActiveStage('t1');
    window.scrollTo({top: 0, behavior: 'smooth'});
  }, []);

  const goToAuthorTemplate = useCallback((author: string) => {
    setSelectedAuthor(author);
    setActiveStage('t3');
    window.scrollTo({top: 0, behavior: 'smooth'});
  }, []);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (activeStage === 't1' && e.deltaY > 36) {
        goToTemplate2();
      }
    };
    window.addEventListener('wheel', handleWheel, {passive: true});
    return () => window.removeEventListener('wheel', handleWheel);
  }, [activeStage, goToTemplate2]);

  const handleSaveBook = (updated: Book) => {
    setBooks((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
  };

  const handleAddBook = (newBook: Book) => {
    setBooks((prev) => [newBook, ...prev]);
  };

  const handleDeleteBook = (bookId: string) => {
    setBooks((prev) => (prev.length > 1 ? prev.filter((b) => b.id !== bookId) : prev));
  };

  const handleToggleTag = useCallback(
    (tag: string) => {
      const allTagLabel = tagConfig.tags[0] || 'Tất cả';
      if (tag === allTagLabel) {
        setActiveTags([allTagLabel]);
        return;
      }
      setActiveTags((prev) => {
        const withoutAll = prev.filter((t) => t !== allTagLabel);
        const exists = withoutAll.includes(tag);
        const next = exists ? withoutAll.filter((t) => t !== tag) : [...withoutAll, tag];
        return next.length > 0 ? next : [allTagLabel];
      });
    },
    [tagConfig.tags],
  );

  const handleResetSelectedTags = useCallback(() => {
    setActiveTags([tagConfig.tags[0] || 'Tất cả']);
  }, [tagConfig.tags]);

  const handleRenameTag = (oldTag: string, newTag: string) => {
    setBooks((prev) =>
      prev.map((b) => {
        const currentTags = getBookTags(b);
        if (!currentTags.includes(oldTag) && b.genre !== oldTag) return b;
        const nextTags = Array.from(new Set(currentTags.map((t) => (t === oldTag ? newTag : t))));
        return {
          ...b,
          genre: nextTags[0] || (b.genre === oldTag ? newTag : b.genre),
          genres: nextTags,
        };
      }),
    );
    setActiveTags((prev) => prev.map((t) => (t === oldTag ? newTag : t)));
  };

  const handleAddAuthorProfile = (profile: AuthorProfile) => {
    setAuthorProfiles((prev) => [...prev, profile]);
  };

  const handleUpdateAuthorProfile = (updated: AuthorProfile, previousName?: string) => {
    setAuthorProfiles((prev) => {
      const exists = prev.some((p) => p.id === updated.id);
      return exists ? prev.map((p) => (p.id === updated.id ? updated : p)) : [...prev, updated];
    });
    if (previousName && updated.name.trim() && previousName !== updated.name) {
      setBooks((prev) =>
        prev.map((b) =>
          b.author.toLowerCase() === previousName.toLowerCase() ? {...b, author: updated.name} : b,
        ),
      );
      if (selectedAuthor && selectedAuthor.toLowerCase() === previousName.toLowerCase()) {
        setSelectedAuthor(updated.name);
      }
    }
  };

  const handleDeleteAuthorProfile = (profileId: string) => {
    setAuthorProfiles((prev) => (prev.length > 1 ? prev.filter((p) => p.id !== profileId) : prev));
  };

  const handleResetAuthorProfiles = () => {
    setAuthorProfiles(DEFAULT_AUTHOR_PROFILES);
    setAuthorSectionTitle('Chọn tác giả');
  };

  const stageClass =
    activeStage === 't1' ? 'stage-t1' : activeStage === 't2' ? 'stage-t2' : 'stage-t3';

  return (
    <>
      <TargetCursor spinDuration={2} hideDefaultCursor parallaxOn />
      <ClickSpark />

      <div id="morph-stage" className={`morph-stage ${stageClass} min-h-screen w-full flex flex-col`}>
        <HeroScreen onEnterBurrow={goToTemplate2} />

        <LibraryScreen
          books={books}
          activeTags={activeTags}
          tagConfig={tagConfig}
          authorProfiles={authorProfiles}
          authorSectionTitle={authorSectionTitle}
          themePreset={themePreset}
          driftSpeed={driftSpeed}
          wallCopy={wallCopy}
          onChangeTagConfig={setTagConfig}
          onRenameTag={handleRenameTag}
          onChangeAuthorSectionTitle={setAuthorSectionTitle}
          onAddAuthorProfile={handleAddAuthorProfile}
          onUpdateAuthorProfile={handleUpdateAuthorProfile}
          onDeleteAuthorProfile={handleDeleteAuthorProfile}
          onResetAuthorProfiles={handleResetAuthorProfiles}
          onBackToHero={goToTemplate1}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenAddBook={() => setIsAddBookOpen(true)}
          onOpenWallEditor={() => setIsWallEditorOpen(true)}
          onToggleTag={handleToggleTag}
          onResetSelectedTags={handleResetSelectedTags}
          onSelectAuthor={goToAuthorTemplate}
          onSelectBook={(bookId) => setSelectedBookId(bookId)}
        />

        <AuthorGalleryScreen
          author={selectedAuthor}
          books={books}
          onBackToLibrary={goToTemplate2}
          onSelectBook={(bookId) => setSelectedBookId(bookId)}
          onUpdateBook={handleSaveBook}
        />
      </div>

      <BookDetailModal
        book={selectedBook}
        canDelete={books.length > 1}
        genreOptions={genreOptions}
        onClose={() => setSelectedBookId(null)}
        onSave={handleSaveBook}
        onDelete={handleDeleteBook}
      />

      <DriftWallEditorModal
        isOpen={isWallEditorOpen}
        books={books}
        genreOptions={genreOptions}
        wallCopy={wallCopy}
        onChangeWallCopy={setWallCopy}
        onUpdateBook={handleSaveBook}
        onDeleteBook={handleDeleteBook}
        onResetDefaults={() => setBooks(DEFAULT_BOOKS)}
        onOpenAddBook={() => setIsAddBookOpen(true)}
        onClose={() => setIsWallEditorOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        themePreset={themePreset}
        driftSpeed={driftSpeed}
        onChangeTheme={setThemePreset}
        onChangeDriftSpeed={setDriftSpeed}
        onClose={() => setIsSettingsOpen(false)}
      />

      <AddBookModal
        isOpen={isAddBookOpen}
        existingCount={books.length}
        genreOptions={genreOptions}
        onClose={() => setIsAddBookOpen(false)}
        onAddBook={handleAddBook}
      />
    </>
  );
}
