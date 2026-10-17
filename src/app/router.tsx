import { createHashRouter, type RouteObject } from 'react-router-dom';
import { AppShell } from './AppShell';
import { HomePage } from '@/features/home/HomePage';
import { LearnPage } from '@/features/learn/LearnPage';
import { PathPage } from '@/features/learn/PathPage';
import { LessonPage } from '@/features/learn/LessonPage';
import { GlossaryPage } from '@/features/learn/GlossaryPage';
import { ReviewPage } from '@/features/learn/ReviewPage';
import { ProjectsPage } from '@/features/projects/ProjectsPage';
import { CodeLabPage } from '@/features/codelab/CodeLabPage';
import { AIWorkshopPage } from '@/features/ai-workshop/AIWorkshopPage';
import { ProgressPage } from '@/features/progress/ProgressPage';
import { CirclesPage } from '@/features/circles/CirclesPage';
import { SettingsPage } from '@/features/settings/SettingsPage';
import { NotFoundPage } from './NotFoundPage';
import { CertificationsPage } from '@/features/certifications/CertificationsPage';

export const routes: RouteObject[] = [
  {
    element: <AppShell />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/learn', element: <LearnPage /> },
      { path: '/learn/path/:pathId', element: <PathPage /> },
      { path: '/learn/lesson/:lessonId', element: <LessonPage /> },
      { path: '/learn/glossary', element: <GlossaryPage /> },
      { path: '/review', element: <ReviewPage /> },
      { path: '/projects', element: <ProjectsPage /> },
      { path: '/lab', element: <CodeLabPage /> },
      { path: '/lab/:exerciseId', element: <CodeLabPage /> },
      { path: '/ai', element: <AIWorkshopPage /> },
      { path: '/progress', element: <ProgressPage /> },
      { path: '/progress/certifications', element: <CertificationsPage /> },
      { path: '/circles', element: <CirclesPage /> },
      { path: '/settings', element: <SettingsPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];

// Hash URLs (#/learn) work on any static host with no server setup (DECISIONS.md, D3).
export const createAppRouter = () => createHashRouter(routes);
