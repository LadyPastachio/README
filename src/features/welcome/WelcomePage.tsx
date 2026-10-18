import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Button, Segmented, Range } from '@/design/components';
import { PathArt } from '@/design/illustrations/PathArt';
import { PATHS } from '@/content/paths';
import { useSettings } from '@/core/settings/SettingsContext';
import { EXPLANATION_FORMATS, FORMAT_LABELS, type Profile, type LearningPrefs } from '@/core/settings/schema';
import { useToast } from '@/app/Toast';

type Format = (typeof EXPLANATION_FORMATS)[number];
const STEPS = ['Explanations', 'Order and detail', 'What gets in the way', 'Your project'] as const;

/**
 * A short, skippable check-in about how you like to learn. Answers are
 * stated preferences: the app keeps them separate from what your activity
 * shows, and never treats them as a fixed "learning style".
 */
export function WelcomePage() {
  const { settings, updateProfile, updateLearning } = useSettings();
  const navigate = useNavigate();
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<Profile>(settings.profile);
  const [learning, setLearning] = useState<LearningPrefs>(settings.learning);

  const toggle = (key: 'preferredFormats' | 'frustratingFormats', f: Format) =>
    setProfile((p) => {
      const other = key === 'preferredFormats' ? 'frustratingFormats' : 'preferredFormats';
      const on = p[key].includes(f);
      return { ...p, [key]: on ? p[key].filter((x) => x !== f) : [...p[key], f], [other]: p[other].filter((x) => x !== f) };
    });

  const finish = (skipped = false) => {
    updateProfile({ ...profile, onboarded: true });
    if (!skipped) updateLearning(learning);
    toast(skipped ? 'Skipped. You can do this any time from Settings.' : 'Thanks. Lessons will start from what you told us, and adjust as you go.');
    navigate('/');
  };

  return (
    <div className="welcome">
      <div className="welcome__top">
        <span className="eyebrow">How do you learn best? · {step + 1} of {STEPS.length}</span>
        <div className="welcome__dots" aria-hidden="true">{STEPS.map((s, i) => <span key={s} data-on={i <= step || undefined} />)}</div>
      </div>

      {step === 0 && (
        <section className="welcome__step" aria-labelledby="w0">
          <h1 id="w0">Which kinds of explanation usually help you?</h1>
          <p className="muted">Pick any. There's no right answer, and enjoying a format isn't always the same as learning best from it, so the app will also watch what actually works.</p>
          <fieldset className="welcome__choices">
            <legend className="visually-hidden">Helpful formats</legend>
            {EXPLANATION_FORMATS.map((f) => (
              <button key={f} type="button" role="checkbox" aria-checked={profile.preferredFormats.includes(f)} className="welcome__choice" onClick={() => toggle('preferredFormats', f)}>
                {profile.preferredFormats.includes(f) && <Check size={14} aria-hidden="true" />}{FORMAT_LABELS[f]}
              </button>
            ))}
          </fieldset>
          <h2 className="welcome__sub">Any that frustrate you?</h2>
          <fieldset className="welcome__choices welcome__choices--neg">
            <legend className="visually-hidden">Frustrating formats</legend>
            {EXPLANATION_FORMATS.map((f) => (
              <button key={f} type="button" role="checkbox" aria-checked={profile.frustratingFormats.includes(f)} className="welcome__choice" onClick={() => toggle('frustratingFormats', f)}>
                {profile.frustratingFormats.includes(f) && <Check size={14} aria-hidden="true" />}{FORMAT_LABELS[f]}
              </button>
            ))}
          </fieldset>
        </section>
      )}

      {step === 1 && (
        <section className="welcome__step" aria-labelledby="w1">
          <h1 id="w1">Before trying an exercise, would you rather…</h1>
          <Segmented label="Lesson order" value={learning.lessonOrder} onChange={(lessonOrder) => setLearning((l) => ({ ...l, lessonOrder }))}
            options={[{ value: 'explain-first', label: 'See it explained first' }, { value: 'try-first', label: 'Try first, then read' }]} />
          <p className="subtle small">Trying first often feels harder but can help ideas stick. You can switch any time, and the app compares how both go for you.</p>
          <h2 className="welcome__sub">How much detail do you like?</h2>
          <Segmented label="Detail level" value={profile.detailLevel} onChange={(detailLevel) => setProfile((p) => ({ ...p, detailLevel }))}
            options={[{ value: 'brief', label: 'Brief' }, { value: 'standard', label: 'Standard' }, { value: 'detailed', label: 'Detailed' }]} />
          <p className="subtle small">Brief tucks away background text; detailed opens step-by-step walkthroughs automatically.</p>
        </section>
      )}

      {step === 2 && (
        <section className="welcome__step" aria-labelledby="w2">
          <h1 id="w2">What has made learning to code hard before?</h1>
          <div className="field">
            <label htmlFor="w-notes" className="field__label">In your own words (optional)</label>
            <textarea id="w-notes" className="input textarea" maxLength={1000} value={profile.notes} onChange={(e) => setProfile((p) => ({ ...p, notes: e.target.value }))} placeholder="e.g. Videos moved too fast, and I forgot things a week later" />
          </div>
          <div className="field">
            <label htmlFor="w-conf" className="field__label">Topics you already find confusing (optional)</label>
            <textarea id="w-conf" className="input textarea textarea--sm" maxLength={1000} value={profile.confusingTopics} onChange={(e) => setProfile((p) => ({ ...p, confusingTopics: e.target.value }))} placeholder="e.g. functions, APIs" />
          </div>
          <p className="subtle small">These go into your learning profile and Learning Evidence, so you (or an AI tutor you paste them into) can tailor explanations.</p>
        </section>
      )}

      {step === 3 && (
        <section className="welcome__step" aria-labelledby="w3">
          <h1 id="w3">Which project would you like to build first?</h1>
          <div className="welcome__paths" role="radiogroup" aria-label="First project">
            {PATHS.map((p) => (
              <button key={p.id} type="button" role="radio" aria-checked={learning.currentPath === p.id} className="welcome__path" onClick={() => setLearning((l) => ({ ...l, currentPath: p.id }))}>
                <PathArt path={p.id} className="welcome__path-art" />
                <span><strong>{p.name}</strong><span className="subtle small">{p.project}</span></span>
              </button>
            ))}
          </div>
          <div className="field">
            <span className="field__label">Hours a week you expect to study</span>
            <Range id="w-hours" label="Hours a week" min={1} max={20} value={learning.weeklyHours} unit=" h" onChange={(weeklyHours) => setLearning((l) => ({ ...l, weeklyHours }))} />
            <span className="field__hint">Only used for time estimates. Changing it never lowers what counts as mastery.</span>
          </div>
        </section>
      )}

      <div className="welcome__nav">
        <Button variant="ghost" onClick={() => (step === 0 ? finish(true) : setStep((s) => s - 1))}>
          {step === 0 ? 'Skip for now' : <><ArrowLeft size={15} aria-hidden="true" /> Back</>}
        </Button>
        <div className="btn-row">
          {step < STEPS.length - 1 && <Button variant="ghost" onClick={() => setStep((s) => s + 1)}>Skip this question</Button>}
          {step < STEPS.length - 1 ? (
            <Button variant="primary" onClick={() => setStep((s) => s + 1)}>Next <ArrowRight size={15} aria-hidden="true" /></Button>
          ) : (
            <Button variant="primary" onClick={() => finish()}>Finish <Check size={15} aria-hidden="true" /></Button>
          )}
        </div>
      </div>
    </div>
  );
}
