import * as React from 'react';
import {cn} from '@/src/lib/utils';

export interface Profile {
  id: string;
  label: string;
  icon: string | React.ReactNode;
}

interface ProfileSelectorProps {
  /** The main title displayed above the profiles */
  title?: string;
  /** An array of profile objects to display */
  profiles: Profile[];
  /** Callback function when a profile is selected */
  onProfileSelect: (id: string) => void;
  /** Optional custom class names */
  className?: string;
}

function ProfileAvatarImage({src, alt}: {src: string; alt: string}) {
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    setHasError(false);
  }, [src]);

  if (hasError || !src) {
    const initials = alt
      .replace(/\s*profile$/i, '')
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() || '')
      .join('');

    return (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-forest-hero via-dark-surface-container to-plum-overlay font-headline text-2xl text-cream-surface">
        {initials || '?'}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className="h-full w-full object-cover"
    />
  );
}

/**
 * A responsive and theme-adaptive component for selecting a profile.
 * Supports both image URLs and React components for profile icons.
 */
export const ProfileSelector = ({
  title = "Who's watching?",
  profiles,
  onProfileSelect,
  className,
}: ProfileSelectorProps) => {
  return (
    <div className={cn('flex w-full flex-col items-center justify-center p-4', className)}>
      <div className="flex flex-col items-center w-full">
        {title && (
          <h2 className="mb-8 text-center font-headline text-2xl font-medium text-light-surface-bright md:text-4xl">
            {title}
          </h2>
        )}
        <div className="flex flex-wrap items-start justify-center gap-6 md:gap-8 max-w-5xl">
          {profiles.map((profile) => (
            <div key={profile.id} className="flex flex-col items-center gap-3 group w-28 md:w-36">
              <button
                type="button"
                onClick={() => onProfileSelect(profile.id)}
                aria-label={`Select profile: ${profile.label}`}
                data-cursor-label={profile.id === 'add' ? 'Thêm tác giả' : profile.label}
                className="cursor-target group relative h-28 w-28 rounded-full transition-transform duration-300 ease-in-out hover:-translate-y-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-kale-pink focus-visible:ring-offset-2 focus-visible:ring-offset-dark-surface md:h-36 md:w-36 cursor-pointer"
              >
                <div className="absolute inset-0 rounded-full bg-dark-surface-container border border-dark-outline-variant/70 transition-all duration-300 group-hover:border-kale-pink group-hover:shadow-lg group-hover:shadow-kale-pink/25" />
                <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full">
                  {typeof profile.icon === 'string' ? (
                    <ProfileAvatarImage src={profile.icon} alt={`${profile.label} profile`} />
                  ) : (
                    profile.icon
                  )}
                </div>
              </button>
              <p className="text-center font-title text-sm md:text-base text-dark-on-surface-variant transition-colors group-hover:text-light-surface-bright line-clamp-2">
                {profile.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const ProfileIcon = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      'flex h-full w-full items-center justify-center text-4xl text-dark-on-surface/80 md:text-5xl',
      className,
    )}
  >
    {children}
  </div>
);
