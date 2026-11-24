import {useEffect} from 'react';
import {ThemePreset} from '../types/book';

interface SettingsModalProps {
  isOpen: boolean;
  themePreset: ThemePreset;
  driftSpeed: number;
  onChangeTheme: (preset: ThemePreset) => void;
  onChangeDriftSpeed: (speed: number) => void;
  onClose: () => void;
}

export function SettingsModal({
  isOpen,
  themePreset,
  driftSpeed,
  onChangeTheme,
  onChangeDriftSpeed,
  onClose,
}: SettingsModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      id="settings-modal"
      className="fixed inset-0 z-50 bg-light-on-surface/55 flex items-center justify-center p-gutter-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
      onClick={onClose}
    >
      <div
        className="bg-light-surface-bright text-light-on-surface rounded-xl max-w-lg w-full p-gutter-lg border border-light-outline-variant shadow-xl flex flex-col gap-gutter-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 id="settings-modal-title" className="font-headline text-headline-md text-light-on-surface">
            Cài đặt giao diện &amp; màu sắc
          </h2>
          <button
            id="close-settings-btn"
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="w-9 h-9 rounded-full bg-light-surface-container flex items-center justify-center text-light-on-surface hover:bg-light-surface-container-high cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="flex flex-col gap-gutter-sm">
          <span className="font-label text-label-sm text-light-on-surface-variant">
            Bảng màu không gian đọc
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-gutter-sm">
            <button
              type="button"
              onClick={() => onChangeTheme('kale')}
              className={`p-gutter-md rounded-lg bg-cream-surface text-left flex items-center gap-gutter-sm cursor-pointer transition-all ${
                themePreset === 'kale'
                  ? 'border-2 border-light-primary'
                  : 'border border-light-outline-variant hover:border-light-outline'
              }`}
            >
              <span className="w-6 h-6 rounded-full bg-kale-pink border border-light-outline-variant flex-shrink-0" />
              <div>
                <p className="font-label text-label-sm text-light-on-surface">Hồng Kale &amp; Kem</p>
                <p className="font-body text-[11px] text-light-on-surface-variant">Mặc định tươi vui</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onChangeTheme('plum')}
              className={`p-gutter-md rounded-lg bg-dark-surface text-left flex items-center gap-gutter-sm cursor-pointer transition-all ${
                themePreset === 'plum'
                  ? 'border-2 border-kale-pink'
                  : 'border border-dark-outline-variant hover:border-dark-outline'
              }`}
            >
              <span className="w-6 h-6 rounded-full bg-plum-overlay border border-dark-outline-variant flex-shrink-0" />
              <div>
                <p className="font-label text-label-sm text-dark-on-surface">Đêm Mận Chín</p>
                <p className="font-body text-[11px] text-dark-on-surface-variant">Chế độ đọc ban đêm</p>
              </div>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-gutter-md pt-gutter-sm border-t border-light-outline-variant">
          <div>
            <p className="font-label text-label-lg text-light-on-surface">
              Tốc độ dòng sách chạy (DriftWall)
            </p>
            <p className="font-body text-body-md text-light-on-surface-variant">
              Điều chỉnh nhịp trôi của các quyển truyện
            </p>
          </div>
          <select
            id="setting-drift-speed"
            value={driftSpeed}
            onChange={(e) => onChangeDriftSpeed(parseInt(e.target.value, 10))}
            className="rounded-full border border-light-outline-variant bg-light-surface text-label-sm text-light-on-surface px-3 py-1.5 focus:border-light-primary focus:outline-none focus:ring-1 focus:ring-light-primary cursor-pointer"
          >
            <option value={30}>Chậm rãi</option>
            <option value={60}>Tiêu chuẩn (60)</option>
            <option value={110}>Nhanh</option>
            <option value={0}>Tạm dừng</option>
          </select>
        </div>

        <div className="flex justify-end pt-gutter-sm">
          <button
            id="done-settings-btn"
            type="button"
            onClick={onClose}
            className="px-gutter-lg py-2.5 rounded-full bg-light-primary text-light-on-primary font-label text-label-lg hover:bg-forest-hero transition-colors cursor-pointer"
          >
            Áp dụng
          </button>
        </div>
      </div>
    </div>
  );
}
