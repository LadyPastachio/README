import { createHashRouter, type RouteObject } from 'react-router-dom';
import { AppShell } from './AppShell';
import { HomePage } from '@/features/home/HomePage';
import { LearnPage } from '@/features/learn/LearnPage';
import { PathPage } from '@/features/learn/PathPage';
import { LessonPage } from '@/features/learn/LessonPage';
import { GlossaryPage } from '@/features/learn/GlossaryPage';
import { ReviewPage } from '@/features/learn/ReviewPage';
import { ProjectsPage } from '@/features/projects/ProjectsPage';
import { NotFoundPage } from './NotFoundPage';

/**
 * Heavier screens (Code Lab with its editor and SQL engine, AI Workshop, Progress, Circles, Settings)
 * load on first visit, so the first page appears sooner.
 */
export const routes: RouteObject[] = [
  {
    element: <AppShell />,
    // Shown only while the first screen's code loads on a direct visit to a lazily loaded page.
    hydrateFallbackElement: <p className="muted" role="status" style={{ padding: 24 }}>Loading…</p>,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/learn', element: <LearnPage /> },
      { path: '/learn/path/:pathId', element: <PathPage /> },
      { path: '/learn/lesson/:lessonId', element: <LessonPage /> },
      { path: '/learn/glossary', element: <GlossaryPage /> },
      { path: '/review', element: <ReviewPage /> },
      { path: '/projects', element: <ProjectsPage /> },
      { path: '/lab', lazy: () => import('@/features/codelab/CodeLabPage').then((m) => ({ Component: m.CodeLabPage })) },
      { path: '/lab/experiment/:experimentId', lazy: () => import('@/features/experiments/ExperimentPage').then((m) => ({ Component: m.ExperimentPage })) },
      { path: '/lab/:exerciseId', lazy: () => import('@/features/codelab/CodeLabPage').then((m) => ({ Component: m.CodeLabPage })) },
      { path: '/ai', lazy: () => import('@/features/ai-workshop/AIWorkshopPage').then((m) => ({ Component: m.AIWorkshopPage })) },
      { path: '/ai/:tool', lazy: () => import('@/features/ai-workshop/AIWorkshopPage').then((m) => ({ Component: m.AIWorkshopPage })) },
      { path: '/progress', lazy: () => import('@/features/progress/ProgressPage').then((m) => ({ Component: m.ProgressPage })) },
      { path: '/progress/certifications', lazy: () => import('@/features/certifications/CertificationsPage').then((m) => ({ Component: m.CertificationsPage })) },
      { path: '/circles', lazy: () => import('@/features/circles/CirclesPage').then((m) => ({ Component: m.CirclesPage })) },
      { path: '/circles/:circleId', lazy: () => import('@/features/circles/CirclePage').then((m) => ({ Component: m.CirclePage })) },
      { path: '/settings', lazy: () => import('@/features/settings/SettingsPage').then((m) => ({ Component: m.SettingsPage })) },
      { path: '/welcome', lazy: () => import('@/features/welcome/WelcomePage').then((m) => ({ Component: m.WelcomePage })) },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];

// Hash URLs (#/learn) work on any static host with no server setup (DECISIONS.md, D3).
export const createAppRouter = () => createHashRouter(routes);
