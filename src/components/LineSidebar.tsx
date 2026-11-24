import {FormEvent, MouseEvent, useRef, useState} from 'react';
import {DEFAULT_TAG_SIDEBAR_CONFIG} from '../data/books';
import {TagSidebarConfig} from '../types/book';

interface LineSidebarProps {
  activeTags: string[];
  displayCount: number;
  tagConfig: TagSidebarConfig;
  onChangeTagConfig: (next: TagSidebarConfig) => void;
  onRenameTag: (oldTag: string, newTag: string) => void;
  onToggleTag: (tag: string) => void;
  onResetSelectedTags: () => void;
  onOpenWallEditor: () => void;
}

export function LineSidebar({
  activeTags,
  displayCount,
  tagConfig,
  onChangeTagConfig,
  onRenameTag,
  onToggleTag,
  onResetSelectedTags,
  onOpenWallEditor,
}: LineSidebarProps) {
  const [isEditingTags, setIsEditingTags] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');
  const navRef = useRef<HTMLElement | null>(null);

  const handleMouseMove = (e: MouseEvent<HTMLElement>) => {
    if (isEditingTags) return;
    const nav = navRef.current;
    if (!nav) return;
    nav.querySelectorAll<HTMLButtonElement>('.line-sidebar-item').forEach((item) => {
      const rect = item.getBoundingClientRect();
      const dist = Math.abs(e.clientY - (rect.top + rect.height / 2));
      const t = dist < 100 ? 0.5 * (1 + Math.cos(Math.PI * (dist / 100))) : 0;
      item.style.transform = `translateX(${(t * 30).toFixed(1)}px)`;
      const tick = item.querySelector<HTMLElement>('.line-sidebar-tick');
      if (tick && !item.classList.contains('is-active')) {
        tick.style.transform = `scaleX(${(0.5 + t * 0.5).toFixed(2)})`;
      }
    });
  };

  const handleMouseLeave = () => {
    const nav = navRef.current;
    if (!nav) return;
    nav.querySelectorAll<HTMLButtonElement>('.line-sidebar-item').forEach((item) => {
      item.style.transform = 'translateX(0px)';
      const tick = item.querySelector<HTMLElement>('.line-sidebar-tick');
      if (tick && !item.classList.contains('is-active')) {
        tick.style.transform = 'scaleX(0.5)';
      }
    });
  };

  const handleUpdateTagAt = (index: number, value: string) => {
    const oldTag = tagConfig.tags[index];
    const nextTags = tagConfig.tags.map((t, i) => (i === index ? value : t));
    onChangeTagConfig({...tagConfig, tags: nextTags});
    if (oldTag && value.trim() && oldTag !== value) {
      onRenameTag(oldTag, value.trim());
    }
  };

  const handleDeleteTagAt = (index: number) => {
    if (index === 0 || tagConfig.tags.length <= 2) return;
    const removed = tagConfig.tags[index];
    const nextTags = tagConfig.tags.filter((_, i) => i !== index);
    onChangeTagConfig({...tagConfig, tags: nextTags});
    if (activeTags.includes(removed)) {
      onToggleTag(removed);
    }
  };

  const handleAddNewTag = (e: FormEvent) => {
    e.preventDefault();
    const cleaned = newTagInput.trim();
    if (!cleaned) return;
    if (!tagConfig.tags.some((t) => t.toLowerCase() === cleaned.toLowerCase())) {
      onChangeTagConfig({...tagConfig, tags: [...tagConfig.tags, cleaned]});
    }
    setNewTagInput('');
  };

  return (
    <aside
      id="line-sidebar-aside"
      aria-label="Chọn tag truyện"
      className="absolute top-0 left-0 w-60 sm:w-64 md:w-72 max-h-full bg-dark-surface/85 bg-gradient-to-br from-dark-surface/95 via-dark-surface/85 to-dark-surface/70 backdrop-blur-md border-r border-b border-dark-outline-variant/60 rounded-br-2xl p-gutter-md md:p-gutter-lg flex flex-col gap-gutter-md z-30 overflow-y-auto shadow-2xl"
    >
      <div className="flex flex-col gap-gutter-xs">
        <div className="flex items-center justify-between gap-2">
          {isEditingTags ? (
            <input
              type="text"
              aria-label="Sửa nhãn phụ tag"
              value={tagConfig.kicker}
              onChange={(e) => onChangeTagConfig({...tagConfig, kicker: e.target.value})}
              className="w-full rounded bg-dark-surface-container border border-dark-outline-variant px-2 py-1 font-mono text-mono-sm text-kale-olive focus:border-kale-pink focus:outline-none"
            />
          ) : (
            <span className="font-mono text-mono-sm uppercase tracking-wider text-kale-olive">
              {tagConfig.kicker}
            </span>
          )}

          <button
            id="toggle-edit-tags-btn"
            type="button"
            onClick={() => setIsEditingTags((prev) => !prev)}
            data-cursor-label="Sửa tag"
            className={`cursor-target inline-flex items-center gap-1 px-2.5 py-1 rounded-full border font-label text-[11px] transition-colors cursor-pointer flex-shrink-0 ${
              isEditingTags
                ? 'bg-kale-pink text-light-primary border-kale-pink'
                : 'bg-dark-surface-container/90 text-dark-on-surface border-dark-outline-variant hover:border-kale-pink'
            }`}
          >
            <span className="material-symbols-outlined text-[13px]" aria-hidden="true">
              {isEditingTags ? 'check' : 'edit'}
            </span>
            <span>{isEditingTags ? 'Xong' : 'Sửa tag'}</span>
          </button>
        </div>

        {isEditingTags ? (
          <input
            type="text"
            aria-label="Sửa tiêu đề tag"
            value={tagConfig.title}
            onChange={(e) => onChangeTagConfig({...tagConfig, title: e.target.value})}
            className="w-full rounded bg-dark-surface-container border border-dark-outline-variant px-2.5 py-1.5 font-headline text-title-lg text-light-surface-bright focus:border-kale-pink focus:outline-none mt-1"
          />
        ) : (
          <div className="flex flex-col gap-0.5">
            <h2 className="font-headline text-headline-md text-light-surface-bright">
              {tagConfig.title}
            </h2>
            <span className="font-mono text-[10px] text-dark-on-surface-variant">
              Chọn 1 hoặc nhiều tag cùng lúc
            </span>
          </div>
        )}
      </div>

      {isEditingTags ? (
        <div className="flex flex-col gap-2 my-auto py-1">
          {tagConfig.tags.map((label, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              <span className="font-mono text-[11px] text-kale-olive w-5 flex-shrink-0">
                {String(idx + 1).padStart(2, '0')}
              </span>
              <input
                type="text"
                aria-label={`Sửa tên tag ${idx + 1}`}
                value={label}
                onChange={(e) => handleUpdateTagAt(idx, e.target.value)}
                className="flex-1 min-w-0 rounded-md bg-dark-surface-container border border-dark-outline-variant px-2.5 py-1.5 text-body-sm text-light-surface-bright focus:border-kale-pink focus:outline-none"
              />
              {idx > 0 && tagConfig.tags.length > 2 && (
                <button
                  type="button"
                  onClick={() => handleDeleteTagAt(idx)}
                  aria-label={`Xoá tag ${label}`}
                  className="w-7 h-7 rounded-md bg-dark-surface-container border border-dark-outline-variant text-dark-on-surface-variant hover:text-kale-pink hover:border-kale-pink flex items-center justify-center cursor-pointer flex-shrink-0"
                >
                  <span className="material-symbols-outlined text-[15px]">close</span>
                </button>
              )}
            </div>
          ))}

          <form onSubmit={handleAddNewTag} className="flex items-center gap-1.5 pt-1">
            <input
              type="text"
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              placeholder="Thêm tag mới..."
              className="flex-1 min-w-0 rounded-md bg-dark-surface-container border border-dark-outline-variant px-2.5 py-1.5 text-body-sm text-light-surface-bright placeholder:text-dark-outline focus:border-kale-pink focus:outline-none"
            />
            <button
              type="submit"
              aria-label="Thêm tag"
              className="px-2.5 py-1.5 rounded-md bg-kale-pink text-light-primary font-label text-label-sm hover:opacity-90 cursor-pointer flex-shrink-0"
            >
              Thêm
            </button>
          </form>

          <button
            type="button"
            onClick={() => {
              onChangeTagConfig(DEFAULT_TAG_SIDEBAR_CONFIG);
              onResetSelectedTags();
            }}
            className="self-start text-[11px] font-label text-dark-on-surface-variant hover:text-kale-pink underline cursor-pointer pt-1"
          >
            Khôi phục danh sách tag mặc định
          </button>
        </div>
      ) : (
        <nav
          ref={navRef}
          id="line-sidebar-nav"
          className="line-sidebar-list"
          aria-label="Danh sách tag truyện"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {tagConfig.tags.map((label, idx) => {
            const isActive = activeTags.includes(label);
            return (
              <button
                key={`${idx}-${label}`}
                type="button"
                aria-pressed={isActive}
                onClick={() => onToggleTag(label)}
                data-cursor-label={idx === 0 ? 'Tất cả' : isActive ? 'Bỏ chọn tag' : 'Thêm lọc tag'}
                className={`cursor-target line-sidebar-item ${isActive ? 'is-active' : ''}`}
              >
                <span className="line-sidebar-tick" aria-hidden="true" />
                <span className="line-sidebar-index">{String(idx + 1).padStart(2, '0')}</span>
                <span className="line-sidebar-label">{label}</span>
              </button>
            );
          })}
        </nav>
      )}

      <div className="pt-gutter-sm border-t border-dark-outline-variant/60 flex flex-col gap-gutter-sm">
        <div className="flex items-center justify-between gap-gutter-sm">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-label text-label-sm text-dark-on-surface-variant">Đang hiển thị</span>
            {activeTags.length > 1 && (
              <button
                type="button"
                onClick={onResetSelectedTags}
                className="font-mono text-[10px] text-kale-pink hover:underline cursor-pointer"
              >
                ({activeTags.length} tag · Xoá lọc)
              </button>
            )}
          </div>
          <span
            id="active-tag-count"
            className="font-mono text-mono-sm px-2.5 py-0.5 rounded-full bg-dark-surface-container text-kale-pink tabular-nums flex-shrink-0"
          >
            {displayCount} cuốn
          </span>
        </div>

        <button
          id="sidebar-edit-wall-btn"
          type="button"
          onClick={onOpenWallEditor}
          data-cursor-label="Tuỳ chỉnh"
          className="cursor-target w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-dark-surface-container/90 border border-dark-outline-variant text-dark-on-surface font-label text-label-sm hover:border-kale-pink hover:text-kale-pink transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
            photo_library
          </span>
          <span>Sửa ảnh &amp; văn bản chạy</span>
        </button>
      </div>
    </aside>
  );
}
