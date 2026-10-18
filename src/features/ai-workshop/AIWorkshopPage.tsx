import { Link, useParams } from 'react-router-dom';
import { ArrowRight, Braces, Gauge, MessagesSquare, ShieldAlert, Sparkles, Wrench } from 'lucide-react';
import { useAI } from '@/core/ai/useAI';
import { PageHeader, Panel } from '@/design/components';
import { NotFoundPage } from '@/app/NotFoundPage';
import { StatusBanner } from './shared';
import { MentorTool } from './MentorTool';
import { CoachTool } from './CoachTool';
import { RequestTool } from './RequestTool';
import { StructuredTool } from './StructuredTool';
import { ToolLoopTool } from './ToolLoopTool';
import { InjectionTool } from './InjectionTool';
import './workshop.css';

export const TOOLS = [
  { id: 'mentor', title: 'Mentor', stage: 2, icon: MessagesSquare, text: 'Five ways to get help: guide me, explain, review code, debug with me, quiz me.', element: <MentorTool /> },
  { id: 'coach', title: 'Prompt coach', stage: 2, icon: Sparkles, text: 'Check a prompt for the parts of a good specification as you type, then try it.', element: <CoachTool /> },
  { id: 'request', title: 'Requests, tokens and cost', stage: 3, icon: Gauge, text: 'See the request your code sends, estimate tokens and cost, and watch temperature change the odds.', element: <RequestTool /> },
  { id: 'structured', title: 'Structured outputs', stage: 4, icon: Braces, text: 'Make messy model output safe: parse, validate, retry, fall back. With an evaluation table.', element: <StructuredTool /> },
  { id: 'tools', title: 'Tool calling, step by step', stage: 4, icon: Wrench, text: 'Walk through a booking: the model asks, your code checks, runs and verifies.', element: <ToolLoopTool /> },
  { id: 'injection', title: 'Prompt injection lab', stage: 4, icon: ShieldAlert, text: 'Synthetic attack messages against layered defenses. See what prompts can and can\'t stop.', element: <InjectionTool /> },
] as const;

const STAGES = [
  { n: 1, title: 'AI literacy', text: 'What models do, why they make mistakes, and how they differ from ordinary code.', lesson: 'what-a-model-does' },
  { n: 2, title: 'Prompting and communication', text: 'Instructions, constraints, examples and acceptance criteria.', lesson: 'prompts-as-specs' },
  { n: 3, title: 'APIs and model integration', text: 'Requests, tokens, context, errors, latency and cost.', lesson: 'calling-a-model-api' },
  { n: 4, title: 'AI application engineering', text: 'Structured outputs, tool calling, prompt injection, retries and fallbacks.', lesson: 'structured-outputs' },
  { n: 5, title: 'Agent engineering', text: 'Controlled loops, permissions, stopping conditions and human approval.', lesson: 'tool-calling-loop' },
  { n: 6, title: 'Production AI systems', text: 'Evaluation, regression tests, monitoring, cost control and data retention.', lesson: 'evaluating-ai' },
];

export function AIWorkshopPage() {
  const { tool } = useParams();
  const ai = useAI();
  const active = TOOLS.find((t) => t.id === tool);
  if (tool && !active) return <NotFoundPage />;

  if (active) {
    return (
      <>
        <PageHeader eyebrow={`Stage ${active.stage}`} title={active.title} breadcrumbs={[{ to: '/ai', label: 'AI Workshop' }]} />
        <StatusBanner mode={ai.mode} status={ai.status} checking={ai.checking} onRefresh={() => void ai.refresh()} />
        {active.element}
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="AI Workshop"
        title="Prompts, APIs, tools and agents"
        description="Hands-on AI engineering, from what a model is to running one safely. A workbench, not a chat box: every tool shows what's happening underneath."
      />
      <StatusBanner mode={ai.mode} status={ai.status} checking={ai.checking} onRefresh={() => void ai.refresh()} />

      <h2 className="section-title">Tools</h2>
      <div className="ai-tool-grid">
        {TOOLS.map((t) => (
          <Link key={t.id} to={`/ai/${t.id}`} className="ai-tool-card">
            <span className="ai-tool-card__icon" aria-hidden="true"><t.icon size={20} /></span>
            <span className="ai-tool-card__body">
              <span className="ai-tool-card__title">{t.title}</span>
              <span className="muted">{t.text}</span>
              <span className="subtle">Stage {t.stage}</span>
            </span>
            <ArrowRight size={16} className="ai-tool-card__arrow" aria-hidden="true" />
          </Link>
        ))}
      </div>

      <h2 className="section-title">Six stages</h2>
      <ol className="stage-list">
        {STAGES.map((s) => (
          <li key={s.n}>
            <Panel as="div" className="stage">
              <span className="stage__n tabular" aria-hidden="true">{s.n}</span>
              <div className="stage__text">
                <h3 className="panel__title"><span className="visually-hidden">Stage {s.n}: </span>{s.title}</h3>
                <p className="muted">{s.text}</p>
              </div>
              <Link className="chip stage__chip" to={`/learn/lesson/${s.lesson}`}>Lesson</Link>
            </Panel>
          </li>
        ))}
      </ol>
      <p className="subtle ai-fine">Every tool works without a paid API. Connecting a real model is optional: see Settings → AI.</p>
    </>
  );
}
