interface HeroScreenProps {
  onEnterBurrow: () => void;
}

export function HeroScreen({onEnterBurrow}: HeroScreenProps) {
  return (
    <section
      id="template-1"
      className="template-layer min-h-screen w-full bg-light-surface-bright flex flex-col justify-between px-gutter-md md:px-page-margin py-gutter-lg"
    >
      <header className="max-w-7xl w-full mx-auto flex items-center justify-between gap-gutter-md">
        <span className="font-headline text-title-lg text-light-on-surface tracking-tight whitespace-nowrap shrink-0">
          BajLyu._
        </span>
        <span className="font-body text-body-md text-light-on-surface-variant text-right">
          Góc lưu trữ &amp; đọc sách cá nhân
        </span>
      </header>

      <main className="max-w-7xl w-full mx-auto flex flex-col items-center justify-center text-center gap-gutter-lg py-gutter-xl">
        <p className="font-body text-body-md text-light-on-surface-variant tracking-wide">
          CAM ON VI DA DEN
        </p>

        <h1 className="hero-wordmark font-display text-display-lg-mobile md:text-display-lg lg:text-[92px] lg:leading-none font-normal uppercase tracking-tight text-forest-hero text-balance">
          HANG CHUỘT CHŨI
        </h1>

        <p className="font-body text-body-lg text-light-on-surface-variant max-w-prose text-pretty">
          CHUC BAN THANH CONG
        </p>

        <button
          id="enter-burrow-btn"
          type="button"
          onClick={onEnterBurrow}
          data-cursor-label="Vào hang"
          className="cursor-target inline-flex items-center justify-center gap-gutter-sm px-gutter-xl py-3.5 rounded-full bg-light-primary text-light-on-primary font-label text-label-lg transition-transform duration-150 ease-out hover:bg-forest-hero active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-light-primary focus-visible:ring-offset-2 whitespace-nowrap shrink-0 cursor-pointer"
        >
          <span>Bước vào hang</span>
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
            south_east
          </span>
        </button>
      </main>

      <footer className="max-w-7xl w-full mx-auto flex items-center justify-center pb-gutter-sm">
        <button
          id="scroll-morph-cue"
          type="button"
          onClick={onEnterBurrow}
          data-cursor-label="Khám phá"
          className="cursor-target inline-flex items-center gap-gutter-xs font-label text-label-sm text-light-on-surface-variant hover:text-forest-hero transition-colors duration-150 cursor-pointer"
        >
          <span>Cuộn hoặc nhấn để khám phá tủ sách</span>
          <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
            arrow_downward
          </span>
        </button>
      </footer>
    </section>
  );
}
