import { PageHeader, Panel, Planned } from '@/design/components';

const STAGES = [
  { n: 1, title: 'AI literacy', text: 'What models do, why they make mistakes, and how they differ from ordinary code.', paid: false },
  { n: 2, title: 'Prompting and communication', text: 'Instructions, constraints, examples and acceptance criteria. Why vague prompts give unpredictable results.', paid: false },
  { n: 3, title: 'APIs and model integration', text: 'Requests, JSON, tokens, context windows, structured outputs, errors, latency and cost.', paid: false },
  { n: 4, title: 'AI application engineering', text: 'Retrieval from approved sources, tool calling, schema validation, prompt injection, retries and fallbacks.', paid: true },
  { n: 5, title: 'Agent engineering', text: 'Controlled loops, permissions, stopping conditions, verification, human approval and recovery. When not to use an agent.', paid: true },
  { n: 6, title: 'Production AI systems', text: 'Security, deployment, cost control, evaluation, regression tests, monitoring and data retention.', paid: true },
];

export function AIWorkshopPage() {
  return (
    <>
      <PageHeader
        eyebrow="AI Workshop"
        title="Prompts, APIs, tools and agents"
        description="Hands-on AI engineering in six stages, from what a model is to running one safely in production. This is a workbench, not a chat box."
      />

      <div className="mode-banner" role="status">
        <span className="mode-dot" aria-hidden="true" />
        <div>
          <strong>No AI provider connected.</strong>{' '}
          <span className="muted">Every response in the workshop will be labeled <em>Simulated</em> or <em>Live</em>. Nothing you type is sent anywhere.</span>
        </div>
      </div>

      <ol className="stage-list">
        {STAGES.map((s) => (
          <li key={s.n}>
            <Panel as="div" className="stage">
              <span className="stage__n tabular" aria-hidden="true">{s.n}</span>
              <div className="stage__text">
                <h2 className="panel__title"><span className="visually-hidden">Stage {s.n}: </span>{s.title}</h2>
                <p className="muted">{s.text}</p>
              </div>
              <span className="chip stage__chip">{s.paid ? 'Real model optional' : 'No paid API needed'}</span>
            </Panel>
          </li>
        ))}
      </ol>

      <div style={{ marginTop: 'var(--space-5)' }}>
        <Planned phase={6}>
          The prompt coach, request/response experiments, structured-output and tool-calling exercises, and injection challenges,
          starting with simulated responses. Real model calls go through a small server so API keys never reach the browser.
        </Planned>
      </div>
    </>
  );
}
