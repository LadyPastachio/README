import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { routes } from './router';
import { SettingsProvider } from '@/core/settings/SettingsContext';
import { createMemoryAdapter, type StorageAdapter } from '@/core/persistence/storage';
import { SETTINGS_KEY } from '@/core/settings/store';
import { ToastProvider } from './Toast';
import { LearningProvider } from '@/core/learning/LearningContext';
import { RECORDS_KEY, loadRecords } from '@/core/learning/records';
import { NAV_ITEMS } from './navigation';

function renderApp(path = '/', storage: StorageAdapter = createMemoryAdapter()) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(
    <SettingsProvider storage={storage}>
      <LearningProvider storage={storage}>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </LearningProvider>
    </SettingsProvider>,
  );
  return { router, storage };
}

describe('app shell', () => {
  it('shows all eight destinations in the sidebar', () => {
    renderApp();
    const nav = screen.getAllByRole('complementary', { name: 'Primary' })[0]!;
    for (const item of NAV_ITEMS) expect(within(nav).getByRole('link', { name: item.label })).toBeInTheDocument();
  });

  it('navigates between pages', async () => {
    const user = userEvent.setup();
    const { router } = renderApp();
    const nav = screen.getAllByRole('complementary', { name: 'Primary' })[0]!;
    await user.click(within(nav).getByRole('link', { name: 'My Progress' }));
    expect(router.state.location.pathname).toBe('/progress');
    expect(screen.getByRole('heading', { level: 1, name: 'What you can actually do' })).toBeInTheDocument();
  });

  it('renders every destination without crashing', () => {
    for (const item of NAV_ITEMS) {
      renderApp(item.path);
      expect(screen.getAllByRole('heading', { level: 1 }).length).toBeGreaterThan(0);
      document.body.innerHTML = '';
    }
  });

  it('shows a helpful page for unknown addresses', () => {
    renderApp('/nope');
    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument();
  });
});

describe('settings', () => {
  it('applies and saves the theme and accent immediately', async () => {
    const user = userEvent.setup();
    const { storage } = renderApp('/settings');
    await user.click(screen.getByRole('radio', { name: 'Dark' }));
    await user.click(screen.getByRole('radio', { name: 'Plum' }));
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(document.documentElement.dataset.accent).toBe('plum');
    const saved = JSON.parse(storage.read(SETTINGS_KEY)!);
    expect(saved.appearance).toMatchObject({ theme: 'dark', accent: 'plum' });
  });

  it('turns on high contrast and reduced motion', async () => {
    const user = userEvent.setup();
    renderApp('/settings');
    await user.click(screen.getByRole('switch', { name: 'High contrast' }));
    await user.click(screen.getByRole('radio', { name: 'Reduce' }));
    expect(document.documentElement.dataset.contrast).toBe('high');
    expect(document.documentElement.dataset.motion).toBe('reduce');
  });

  it('resets to defaults in one step', async () => {
    const user = userEvent.setup();
    const storage = createMemoryAdapter({ [SETTINGS_KEY]: JSON.stringify({ appearance: { theme: 'dark', accent: 'clay' }, accessibility: { highContrast: true } }) });
    renderApp('/settings', storage);
    await user.click(screen.getByRole('button', { name: 'Reset settings to defaults' }));
    const saved = JSON.parse(storage.read(SETTINGS_KEY)!);
    expect(saved.appearance.theme).toBe('system');
    expect(saved.accessibility.highContrast).toBe(false);
  });

  it('warns when the browser refuses to save', async () => {
    const user = userEvent.setup();
    const broken: StorageAdapter = { ...createMemoryAdapter(), write: () => false };
    renderApp('/settings', broken);
    await user.click(screen.getByRole('radio', { name: 'Dark' }));
    expect(screen.getByText(/Not saved/)).toBeInTheDocument();
  });
});

describe('lessons record evidence', () => {
  const L = '/learn/lesson/how-a-page-reaches-you';

  it('saves a wrong answer with its misconception and confidence', async () => {
    const user = userEvent.setup();
    const { storage } = renderApp(L);
    const card = screen.getByRole('article', { name: 'Activity 2 of 3' });
    await user.click(within(card).getByRole('radio', { name: 'Certain' }));
    await user.click(within(card).getByRole('radio', { name: 'The internet connection dropped.' }));
    await user.click(within(card).getByRole('button', { name: 'Check answer' }));
    expect(screen.getByText(/there would be no response at all/)).toBeInTheDocument();
    const [e] = loadRecords(storage);
    expect(e).toMatchObject({ activityId: 'status-404', correct: false, confidence: 'sure', misconception: 'Thinks an error status means the connection failed', context: 'lesson' });
  });

  it('records hints shown at the time of an answer', async () => {
    const user = userEvent.setup();
    const { storage } = renderApp(L);
    await user.click(screen.getByRole('button', { name: 'Show a hint' }));
    expect(screen.getByText('1 of 3 used')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Check order' }));
    expect(loadRecords(storage)[0]).toMatchObject({ activityId: 'order-steps', hintsShown: 1, correct: false });
  });

  it('offers "Show solution" only after two misses by default, and records it', async () => {
    const user = userEvent.setup();
    const { storage } = renderApp(L);
    const check = screen.getByRole('button', { name: 'Check order' });
    await user.click(check);
    expect(screen.queryByRole('button', { name: 'Show solution' })).not.toBeInTheDocument();
    await user.click(check);
    await user.click(screen.getByRole('button', { name: 'Show solution' }));
    expect(screen.getByText('Solution shown.')).toBeInTheDocument();
    expect(loadRecords(storage).at(-1)).toMatchObject({ type: 'reveal', activityId: 'order-steps' });
    expect(screen.getAllByText('Needs another challenge').length).toBeGreaterThan(0);
  });

  it('never offers the solution when that setting is off', async () => {
    const user = userEvent.setup();
    const storage = createMemoryAdapter({ [SETTINGS_KEY]: JSON.stringify({ learning: { solutionReveal: 'never' } }) });
    renderApp(L, storage);
    const check = screen.getByRole('button', { name: 'Check order' });
    for (let i = 0; i < 4; i++) await user.click(check);
    expect(screen.queryByRole('button', { name: 'Show solution' })).not.toBeInTheDocument();
  });

  it('locks hints until the first try when that setting is on', async () => {
    const user = userEvent.setup();
    const storage = createMemoryAdapter({ [SETTINGS_KEY]: JSON.stringify({ learning: { hintTiming: 'after-attempt' } }) });
    renderApp(L, storage);
    expect(screen.getByRole('button', { name: /Available after your first try/ })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Check order' }));
    expect(screen.getByRole('button', { name: 'Show a hint' })).toBeEnabled();
  });

  it('checks fill-the-gap answers and explains common wrong ones', async () => {
    const user = userEvent.setup();
    const { storage } = renderApp('/learn/lesson/values-and-variables');
    const gap = screen.getByLabelText('Missing code');
    await user.type(gap, 'const');
    await user.click(screen.getByRole('button', { name: 'Check' }));
    expect(screen.getByText(/can't be reassigned/)).toBeInTheDocument();
    await user.clear(gap);
    await user.type(gap, ' let ');
    await user.click(screen.getByRole('button', { name: 'Check' }));
    expect(screen.getByText(/let creates a variable you can change later/)).toBeInTheDocument();
    expect(loadRecords(storage).map((e) => e.correct)).toEqual([false, true]);
  });

  it('puts a question first when "try first" is chosen', () => {
    const storage = createMemoryAdapter({ [SETTINGS_KEY]: JSON.stringify({ learning: { lessonOrder: 'try-first' } }) });
    renderApp(L, storage);
    const warm = screen.getByRole('heading', { name: 'Try this first' });
    const firstSection = screen.getByRole('heading', { name: 'Two programs having a conversation' });
    expect(warm.compareDocumentPosition(firstSection) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('shows the lesson summary with evidence export after an answer', async () => {
    const user = userEvent.setup();
    renderApp(L);
    expect(screen.queryByRole('heading', { name: 'Your evidence so far' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: 'The server was reached, but it has nothing at that address.' }));
    await user.click(screen.getByRole('button', { name: 'Check answer' }));
    expect(screen.getByRole('heading', { name: 'Your evidence so far' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Copy prompt/ })).toBeInTheDocument();
  });

  it('updates Home after progress is recorded', async () => {
    const storage = createMemoryAdapter();
    renderApp('/', storage);
    expect(screen.getByRole('heading', { level: 1, name: /Welcome/ })).toBeInTheDocument();
    document.body.innerHTML = '';
    storage.write(RECORDS_KEY, JSON.stringify({ version: 1, events: [{ id: 'x', at: new Date().toISOString(), type: 'answer', context: 'lesson', sessionId: 's', lessonId: 'how-a-page-reaches-you', activityId: 'order-steps', kind: 'order', correct: true, answer: 'a', hintsShown: 0, confidence: null, misconception: null, lessonOrder: 'explain-first', selfCheck: null }] }));
    renderApp('/', storage);
    expect(screen.getByRole('heading', { level: 1, name: 'Today’s plan' })).toBeInTheDocument();
    expect(screen.getAllByText('Continue').length).toBeGreaterThan(0);
  });
});

describe('learning settings', () => {
  it('changes the daily load shown on Home', async () => {
    const user = userEvent.setup();
    const { storage } = renderApp('/settings');
    await user.click(screen.getByRole('radio', { name: '3' }));
    expect(JSON.parse(storage.read(SETTINGS_KEY)!).learning.dailyLoad).toBe(3);
  });

  it('saves stated preferences in the learning profile', async () => {
    const user = userEvent.setup();
    const { storage } = renderApp('/settings');
    await user.click(within(screen.getByRole('group', { name: 'Explanations I find helpful' })).getByLabelText('Diagrams'));
    await user.type(screen.getByLabelText('Topics I find confusing'), 'return');
    const p = JSON.parse(storage.read(SETTINGS_KEY)!).profile;
    expect(p.preferredFormats).toEqual(['diagrams']);
    expect(p.confusingTopics).toBe('return');
  });
});

describe('review page', () => {
  it('explains when nothing is due', () => {
    renderApp('/review');
    expect(screen.getByRole('heading', { level: 1, name: 'Nothing due right now' })).toBeInTheDocument();
  });
});

describe('settings updates', () => {
  it('two updates in a row both survive (no stale overwrite)', async () => {
    const { useSettings } = await import('@/core/settings/SettingsContext');
    const storage = createMemoryAdapter();
    let api: ReturnType<typeof useSettings> | null = null;
    function Grab() { api = useSettings(); return null; }
    render(<SettingsProvider storage={storage}><Grab /></SettingsProvider>);
    const { act } = await import('@testing-library/react');
    act(() => {
      api!.updateProfile({ onboarded: true, detailLevel: 'brief' });
      api!.updateLearning({ currentPath: 'chess', weeklyHours: 9 });
    });
    const saved = JSON.parse(storage.read(SETTINGS_KEY)!);
    expect(saved.profile).toMatchObject({ onboarded: true, detailLevel: 'brief' });
    expect(saved.learning).toMatchObject({ currentPath: 'chess', weeklyHours: 9 });
  });
});

describe('adaptive lessons', () => {
  const L = '/learn/lesson/conditions';

  it('opens another explanation from the lesson controls and records it', async () => {
    const user = userEvent.setup();
    const { storage } = renderApp(L);
    await user.click(screen.getByRole('button', { name: 'Analogy' }));
    expect(screen.getByText(/bouncer with a list of rules/)).toBeInTheDocument();
    expect(loadRecords(storage).at(-1)).toMatchObject({ type: 'help', activityId: 'help:analogy' });
  });

  it('walks through steps one at a time', async () => {
    const user = userEvent.setup();
    renderApp(L);
    await user.click(screen.getByRole('button', { name: 'Step by step' }));
    expect(screen.getByText('score is 75.')).toBeInTheDocument();
    expect(screen.queryByText(/Skip that block/)).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Next step/ }));
    expect(screen.getByText(/Skip that block/)).toBeInTheDocument();
  });

  it('opens your stated preference automatically and says why', () => {
    const storage = createMemoryAdapter({ [SETTINGS_KEY]: JSON.stringify({ profile: { preferredFormats: ['analogies'] } }) });
    renderApp(L, storage);
    expect(screen.getByText(/bouncer with a list of rules/)).toBeInTheDocument();
    expect(screen.getByText(/Opened for you because of what you said/)).toBeInTheDocument();
  });

  it('offers a different explanation after two misses', async () => {
    const user = userEvent.setup();
    renderApp(L);
    const card = screen.getByRole('article', { name: 'Activity 1 of 4' });
    await user.click(within(card).getByRole('radio', { name: 'A' }));
    await user.click(within(card).getByRole('button', { name: 'Check answer' }));
    expect(within(card).queryByText(/Stuck\?/)).not.toBeInTheDocument();
    await user.click(within(card).getByRole('radio', { name: 'C' }));
    await user.click(within(card).getByRole('button', { name: 'Check answer' }));
    expect(within(card).getByText(/Stuck\?/)).toBeInTheDocument();
    await user.click(within(card).getByRole('button', { name: 'Explain it more simply' }));
    expect(within(screen.getByRole('region', { name: 'See it another way' })).getByText(/runs only the first one that/)).toBeInTheDocument();
  });

  it('saves a transfer challenge as evidence', async () => {
    const user = userEvent.setup();
    const { storage } = renderApp(L);
    await user.click(screen.getByRole('button', { name: 'Challenge me' }));
    await user.type(screen.getByRole('textbox', { name: /mark a lead/ }), 'Check urgent first in an else-if chain because it matters most.');
    await user.click(within(screen.getByRole('region', { name: 'See it another way' })).getByRole('button', { name: 'Save and compare' }));
    expect(loadRecords(storage).at(-1)).toMatchObject({ activityId: 'transfer', kind: 'explain' });
  });

  it('tucks away background text in brief mode', () => {
    const storage = createMemoryAdapter({ [SETTINGS_KEY]: JSON.stringify({ profile: { detailLevel: 'brief' } }) });
    renderApp(L, storage);
    expect(screen.getByText('Why this matters for your projects').closest('details')).not.toBeNull();
  });
});

describe('welcome check-in', () => {
  it('saves answers and marks the check-in done', async () => {
    const user = userEvent.setup();
    const { storage } = renderApp('/welcome');
    await user.click(within(screen.getAllByRole('group')[0]!).getByRole('checkbox', { name: 'Diagrams' }));
    await user.click(screen.getByRole('button', { name: /Next/ }));
    await user.click(screen.getByRole('radio', { name: 'Try first, then read' }));
    await user.click(screen.getByRole('radio', { name: 'Brief' }));
    await user.click(screen.getByRole('button', { name: /Next/ }));
    await user.click(screen.getByRole('button', { name: /Next/ }));
    await user.click(screen.getByRole('radio', { name: /Chess game/ }));
    await user.click(screen.getByRole('button', { name: /Finish/ }));
    const saved = JSON.parse(storage.read(SETTINGS_KEY)!);
    expect(saved.profile).toMatchObject({ onboarded: true, preferredFormats: ['diagrams'], detailLevel: 'brief' });
    expect(saved.learning).toMatchObject({ lessonOrder: 'try-first', currentPath: 'chess' });
  });

  it('can be skipped', async () => {
    const user = userEvent.setup();
    const { storage } = renderApp('/welcome');
    await user.click(screen.getByRole('button', { name: 'Skip for now' }));
    expect(JSON.parse(storage.read(SETTINGS_KEY)!).profile.onboarded).toBe(true);
  });
});
