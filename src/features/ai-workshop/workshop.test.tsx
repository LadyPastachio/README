import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { routes } from '@/app/router';
import { SettingsProvider } from '@/core/settings/SettingsContext';
import { createMemoryAdapter, type StorageAdapter } from '@/core/persistence/storage';
import { SETTINGS_KEY } from '@/core/settings/store';
import { ToastProvider } from '@/app/Toast';
import { LearningProvider } from '@/core/learning/LearningContext';

function renderApp(path: string, storage: StorageAdapter = createMemoryAdapter()) {
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

afterEach(() => vi.unstubAllGlobals());

describe('AI Workshop', () => {
  it('lists the six tools and says it is simulated, without touching the network', () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    renderApp('/ai');
    for (const name of ['Mentor', 'Prompt coach', 'Requests, tokens and cost', 'Structured outputs', 'Tool calling, step by step', 'Prompt injection lab']) {
      expect(screen.getByRole('link', { name: new RegExp(name.replace(/[(),]/g, '.')) })).toBeInTheDocument();
    }
    expect(screen.getByRole('status', { name: 'AI connection' })).toHaveTextContent('Simulated mode');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('shows not found for an unknown tool', () => {
    renderApp('/ai/nope');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/not found|can't find|doesn't exist/i);
  });

  it('mentor answers in Guide me mode with a labeled simulated response', async () => {
    const user = userEvent.setup();
    renderApp('/ai/mentor');
    await user.type(screen.getByLabelText('Your message'), 'my loop never stops');
    await user.click(screen.getByRole('button', { name: 'Ask' }));
    const card = await screen.findByText(/Let's work it out together/);
    expect(card.closest('.ai-response')).toHaveTextContent('Simulated');
  });

  it('mentor quiz reveals feedback after one answer, and remembers the chosen mode', async () => {
    const user = userEvent.setup();
    const { storage } = renderApp('/ai/mentor');
    await user.click(screen.getByRole('radio', { name: 'Quiz me' }));
    expect(JSON.parse(storage.read(SETTINGS_KEY)!).ai.mentorMode).toBe('quiz');
    await user.type(screen.getByLabelText('Your message'), 'json');
    await user.click(screen.getByRole('button', { name: 'Ask' }));
    const group = await screen.findByRole('group', { name: 'Answers' });
    await user.click(within(group).getAllByRole('button')[0]!);
    expect(screen.getByText(/^(Correct|Not quite)\./)).toBeInTheDocument();
    expect(within(group).getAllByRole('button').every((b) => (b as HTMLButtonElement).disabled)).toBe(true);
  });

  it('prompt coach updates its checklist as you type', async () => {
    const user = userEvent.setup();
    renderApp('/ai/coach');
    const box = screen.getByLabelText('Your prompt');
    expect(screen.getByLabelText('Prompt checklist')).toHaveTextContent(/1 of 8 parts|0 of 8 parts|2 of 8 parts/);
    await user.clear(box);
    await user.type(box, 'Summarize the message for a busy manager in 3 bullet points. Use only the text below; if it is not there, say so. For example: - wants a quote. A good answer includes any deadline. Never add advice.');
    expect(screen.getByLabelText('Prompt checklist')).toHaveTextContent('8 of 8 parts');
  });

  it('structured-output toggles change the evaluation', async () => {
    const user = userEvent.setup();
    renderApp('/ai/structured');
    const results = screen.getByRole('status', { name: 'Evaluation results' });
    expect(within(results).getByText('crashed').previousSibling).not.toHaveTextContent('0');
    for (const name of ['Remove code fences', 'Extract the JSON', 'Validate against the schema', 'Reject unknown fields', 'Retry once with the error', 'Fall back to a person']) {
      await user.click(screen.getByRole('switch', { name }));
    }
    expect(within(results).getByText('crashed').previousSibling).toHaveTextContent('0');
    expect(within(results).getByText('wrong data').previousSibling).toHaveTextContent('0');
  });

  it('tool-calling stepper moves through the steps and shows the approval step', async () => {
    const user = userEvent.setup();
    renderApp('/ai/tools');
    expect(screen.getByText(/Step 1 of/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /A person approves/ }));
    expect(screen.getByRole('heading', { name: 'A person approves the booking' })).toBeInTheDocument();
    await user.click(screen.getByRole('switch', { name: 'Require a person to approve bookings' }));
    expect(screen.queryByRole('button', { name: /A person approves/ })).not.toBeInTheDocument();
  });

  it('injection lab: code-enforced defenses stop every attack', async () => {
    const user = userEvent.setup();
    renderApp('/ai/injection');
    expect(screen.getByText(/0 of 5/)).toBeInTheDocument();
    for (const name of ['Allow only listed actions', 'Check the reply before sending', 'A person approves risky actions']) await user.click(screen.getByRole('switch', { name }));
    expect(screen.getByText(/5 of 5/)).toBeInTheDocument();
  });
});

describe('AI settings', () => {
  it('switching to Local server checks status and falls back honestly when the server is missing', async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.fn(() => Promise.reject(new TypeError('Failed to fetch')));
    vi.stubGlobal('fetch', fetchSpy);
    const { storage } = renderApp('/settings');
    const panel = document.getElementById('ai')!;
    await user.click(within(panel).getByRole('radio', { name: 'Local server' }));
    expect(JSON.parse(storage.read(SETTINGS_KEY)!).ai.mode).toBe('local-server');
    expect(await within(panel).findByText(/isn't running/)).toBeInTheDocument();
    expect(fetchSpy).toHaveBeenCalledWith('api/ai/status', expect.anything());
  });

  it('shows live status when the server reports a key', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(new Response(JSON.stringify({ live: true, model: 'claude-opus-5-5', remainingToday: 49, dailyLimit: 50 }), { status: 200 }))));
    const storage = createMemoryAdapter();
    storage.write(SETTINGS_KEY, JSON.stringify({ ai: { mode: 'local-server' } }));
    renderApp('/ai', storage);
    expect(await screen.findByText('Live: claude-opus-5-5')).toBeInTheDocument();
    expect(screen.getByRole('status', { name: 'AI connection' })).toHaveTextContent('49 of 50 requests left today');
  });
});
