import { Lock, Users, MessageSquareCode, Share2 } from 'lucide-react';
import { PageHeader, Panel, Planned } from '@/design/components';

const PRINCIPLES = [
  { icon: Lock, title: 'Private by default', text: 'Your progress, notes, code and learning profile stay private unless you choose to share a specific item.' },
  { icon: Users, title: 'Your own pace', text: 'Members follow their own paths and schedules. Nobody waits for, or is rushed by, the group.' },
  { icon: MessageSquareCode, title: 'Review each other\'s code', text: 'Comment on work a friend has shared with the circle, and get feedback on yours.' },
  { icon: Share2, title: 'Share on purpose', text: 'Shared projects and optional challenges, with permissions you can see and change.' },
];

export function CirclesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Learning Circles"
        title="Learn alongside friends"
        description="Small private groups for sharing projects, reviewing code and trying challenges together, each at your own pace."
      />
      <div className="lab-parts">
        {PRINCIPLES.map((p) => (
          <Panel key={p.title} as="div" className="lab-part">
            <p.icon size={20} className="subtle" aria-hidden="true" />
            <h2 className="panel__title">{p.title}</h2>
            <p className="muted">{p.text}</p>
          </Panel>
        ))}
      </div>
      <div style={{ marginTop: 'var(--space-5)' }}>
        <Planned phase={8}>
          Circles need accounts and a server, so they come after the core learning experience. The privacy and permission model is
          designed before any shared data is stored.
        </Planned>
      </div>
    </>
  );
}
