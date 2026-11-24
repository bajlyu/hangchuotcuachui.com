import {useEffect, useState} from 'react';

interface BookCoverImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function BookCoverImage({src, alt, className = 'w-full h-full object-cover'}: BookCoverImageProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (hasError || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-forest-hero via-dark-surface-container to-plum-overlay text-cream-surface p-3 text-center ${className}`}
        role="img"
        aria-label={alt}
      >
        <span className="material-symbols-outlined text-[28px] text-kale-pink mb-1.5" aria-hidden="true">
          menu_book
        </span>
        <span className="font-headline text-xs leading-snug line-clamp-3">{alt}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
