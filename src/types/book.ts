export type BookStatus = 'want' | 'reading' | 'done';

export type ThemePreset = 'kale' | 'plum';

export interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  genres?: string[];
  rating: number;
  synopsis: string;
  backContent?: string;
  notes: string;
  image: string;
  status: BookStatus;
}

export interface CurvedLoopConfig {
  mode: 'authors' | 'custom';
  customText: string;
  speed: number;
  color: string;
}

export interface DriftWallCopy {
  badgePrefix: string;
  headline: string;
  subHeadline: string;
  showBadge: boolean;
  showSubHeadline: boolean;
  headlineSize: 'md' | 'lg';
  headlineColor: string;
}

export interface TagSidebarConfig {
  kicker: string;
  title: string;
  tags: string[];
}

export interface AuthorProfile {
  id: string;
  name: string;
  avatar: string;
}
