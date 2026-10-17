import { FileCode2, Eye, SquareTerminal, Lock } from 'lucide-react';
import { PageHeader, Panel, Planned, ButtonLink } from '@/design/components';

const PARTS = [
  { icon: FileCode2, title: 'Files and tabs', text: 'A file explorer and editor tabs for HTML, CSS and JavaScript, with syntax highlighting.' },
  { icon: Eye, title: 'Live preview', text: 'Run your code and see the result immediately. Reset to the starting files at any time.' },
  { icon: SquareTerminal, title: 'Console and errors', text: 'See console output and errors explained in plain language, with the line they came from.' },
  { icon: Lock, title: 'Isolated execution', text: 'Your code runs in a sealed frame that can\'t read the app, your saved data or any secrets.' },
];

export function CodeLabPage() {
  return (
    <>
      <PageHeader
        eyebrow="Code Lab"
        title="Write, run and debug code"
        description="A real development workspace, built in Phase 3. Until then this page shows what it will include rather than an imitation editor."
      />
      <Planned phase={3}>The working editor, preview, console and challenges. Your editor font and size from Settings are already applied below.</Planned>

      <div className="lab-parts">
        {PARTS.map((p) => (
          <Panel key={p.title} as="div" className="lab-part">
            <p.icon size={20} className="subtle" aria-hidden="true" />
            <h2 className="panel__title">{p.title}</h2>
            <p className="muted">{p.text}</p>
          </Panel>
        ))}
      </div>

      <section className="section" aria-labelledby="font-preview">
        <div className="section__head">
          <h2 id="font-preview">Editor font preview</h2>
          <p className="muted">Change this in Settings → Appearance.</p>
        </div>
        <pre className="code-sample" tabIndex={0}><code>
<span className="tok-c">{'// Add up the amounts in a list of transactions'}</span>{'\n'}
<span className="tok-k">function</span>{' total(transactions) {\n  '}
<span className="tok-k">return</span>{' transactions.reduce((sum, t) => sum + t.amount, '}<span className="tok-n">0</span>{');\n}\n\n'}
{'console.log(total([{ amount: '}<span className="tok-n">12.5</span>{' }, { amount: '}<span className="tok-n">30</span>{' }])); '}<span className="tok-c">{'// 42.5'}</span>
        </code></pre>
        <div style={{ marginTop: 'var(--space-3)' }}>
          <ButtonLink to="/settings#appearance">Change editor font</ButtonLink>
        </div>
      </section>
    </>
  );
}
