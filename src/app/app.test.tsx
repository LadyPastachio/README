import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { routes } from './router';
import { SettingsProvider } from '@/core/settings/SettingsContext';
import { createMemoryAdapter, type StorageAdapter } from '@/core/persistence/storage';
import { SETTINGS_KEY } from '@/core/settings/store';
import { ToastProvider } from './Toast';
import { NAV_ITEMS } from './navigation';

function renderApp(path = '/', storage: StorageAdapter = createMemoryAdapter()) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(
    <SettingsProvider storage={storage}>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
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

describe('sample lesson', () => {
  it('checks the ordering activity and gives specific feedback', async () => {
    const user = userEvent.setup();
    renderApp('/learn/lesson/how-a-page-reaches-you');
    await user.click(screen.getByRole('button', { name: 'Check order' }));
    expect(screen.getByText(/are in the right place/)).toBeInTheDocument();
    expect(screen.getByText('Attempts: 1')).toBeInTheDocument();
  });

  it('explains why a multiple-choice answer is wrong', async () => {
    const user = userEvent.setup();
    renderApp('/learn/lesson/how-a-page-reaches-you');
    await user.click(screen.getByLabelText('The internet connection dropped.'));
    await user.click(screen.getByRole('button', { name: 'Check answer' }));
    expect(screen.getByText(/there would be no response at all/)).toBeInTheDocument();
  });

  it('reveals hints one at a time', async () => {
    const user = userEvent.setup();
    renderApp('/learn/lesson/how-a-page-reaches-you');
    await user.click(screen.getByRole('button', { name: /Show a hint/ }));
    expect(screen.getByRole('button', { name: /Show another hint \(1\/3\)/ })).toBeInTheDocument();
  });
});
