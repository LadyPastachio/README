import { House, BookOpen, FolderKanban, SquareTerminal, FlaskConical, Map, Users, Settings, type LucideIcon } from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  /** Shorter label for the phone bottom bar. */
  short: string;
  path: string;
  icon: LucideIcon;
  description: string;
  /** Shown directly in the phone bottom bar; the rest go under "More". */
  mobilePrimary: boolean;
}

/** The eight primary destinations, in sidebar order. */
export const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', short: 'Home', path: '/', icon: House, description: 'What to work on next, and why', mobilePrimary: true },
  { id: 'learn', label: 'Learn', short: 'Learn', path: '/learn', icon: BookOpen, description: 'Paths, skills and lessons', mobilePrimary: true },
  { id: 'projects', label: 'Projects', short: 'Projects', path: '/projects', icon: FolderKanban, description: 'Your four learning projects', mobilePrimary: true },
  { id: 'lab', label: 'Code Lab', short: 'Lab', path: '/lab', icon: SquareTerminal, description: 'Write, run and debug code', mobilePrimary: true },
  { id: 'ai', label: 'AI Workshop', short: 'AI', path: '/ai', icon: FlaskConical, description: 'Prompts, APIs, tools and agents', mobilePrimary: false },
  { id: 'progress', label: 'My Progress', short: 'Progress', path: '/progress', icon: Map, description: 'What you can actually do', mobilePrimary: false },
  { id: 'circles', label: 'Learning Circles', short: 'Circles', path: '/circles', icon: Users, description: 'Learn alongside friends', mobilePrimary: false },
  { id: 'settings', label: 'Settings', short: 'Settings', path: '/settings', icon: Settings, description: 'Appearance, accessibility and your data', mobilePrimary: false },
];

export const APP_NAME = 'Atelier Academy';
