import { z } from 'zod';

/**
 * Tool-calling stepper: a scripted walk through one tool-use loop, in the
 * Messages API's real message shapes (tool_use and tool_result blocks).
 * The model's turns are authored; the argument validation is real code.
 */

export type Scenario = 'available' | 'taken' | 'bad-args';
export interface LoopOptions {
  scenario: Scenario;
  requireApproval: boolean;
}

export interface Step {
  actor: 'lead' | 'app' | 'model' | 'tool' | 'person';
  title: string;
  explain: string;
  payload?: unknown;
}

export const checkArgs = z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD'), time: z.string().regex(/^\d{2}:\d{2}$/, 'time must be HH:MM (24-hour)') }).strict();
export const bookArgs = checkArgs.extend({ email: z.string().email() }).strict();

export const TOOLS = [
  { name: 'check_availability', description: 'Check whether a 30-minute slot is free. Returns available and up to two alternatives.', input_schema: { type: 'object', properties: { date: { type: 'string', description: 'YYYY-MM-DD' }, time: { type: 'string', description: 'HH:MM, 24-hour' } }, required: ['date', 'time'] } },
  { name: 'book_meeting', description: 'Book a slot that check_availability said is free.', input_schema: { type: 'object', properties: { date: { type: 'string' }, time: { type: 'string' }, email: { type: 'string' } }, required: ['date', 'time', 'email'] } },
  { name: 'handoff_to_human', description: 'Send the conversation to a person when you cannot help from approved knowledge.', input_schema: { type: 'object', properties: { reason: { type: 'string' } }, required: ['reason'] } },
];

/** Synthetic calendar. */
const BUSY = new Set(['2026-10-22T14:00']);
function calendar(date: string, time: string) {
  const available = !BUSY.has(`${date}T${time}`);
  return available ? { available: true } : { available: false, alternatives: ['15:00', '16:30'] };
}

export const MAX_TOOL_CALLS = 5;

export function buildSteps(o: LoopOptions): Step[] {
  const steps: Step[] = [];
  const email = 'sam@example.com';
  const time = o.scenario === 'taken' ? '14:00' : '11:00';
  const ask = o.scenario === 'taken' ? 'Can we talk Thursday 22 October at 2pm?' : 'Can we talk Thursday 22 October at 11am?';
  steps.push({ actor: 'lead', title: 'A lead writes in', explain: 'A synthetic lead asks for a meeting.', payload: { from: email, message: ask } });
  steps.push({ actor: 'app', title: 'Your app calls the model, offering tools', explain: 'The request lists the tools the model may ask for. The model can\'t run anything itself: it can only ask.', payload: { model: 'claude-opus-5-5', max_tokens: 1024, tools: TOOLS.map((t) => t.name), messages: [{ role: 'user', content: `<lead_message>${ask}</lead_message>` }] } });

  let id = 1;
  if (o.scenario === 'bad-args') {
    const bad = { date: 'Thursday', time: '11am' };
    steps.push({ actor: 'model', title: 'The model asks to check availability', explain: 'stop_reason is "tool_use". The arguments don\'t match the format the tool needs.', payload: { stop_reason: 'tool_use', content: [{ type: 'tool_use', id: `toolu_0${id}`, name: 'check_availability', input: bad }] } });
    const v = checkArgs.safeParse(bad);
    const msg = v.success ? '' : v.error.issues.map((i) => i.message).join('; ');
    steps.push({ actor: 'app', title: 'Your code validates the arguments: rejected', explain: 'Never pass model output straight to a real system. The error goes back to the model so it can correct itself.', payload: { role: 'user', content: [{ type: 'tool_result', tool_use_id: `toolu_0${id}`, is_error: true, content: msg }] } });
    id++;
  }

  const args = { date: '2026-10-22', time };
  steps.push({ actor: 'model', title: o.scenario === 'bad-args' ? 'The model tries again, correctly' : 'The model asks to check availability', explain: 'stop_reason is "tool_use": the model wants your code to run a tool and send back the result.', payload: { stop_reason: 'tool_use', content: [{ type: 'tool_use', id: `toolu_0${id}`, name: 'check_availability', input: args }] } });
  const valid = checkArgs.safeParse(args).success;
  const result = calendar(args.date, args.time);
  steps.push({ actor: 'tool', title: `Your code checks the arguments${valid ? ' (valid)' : ''} and runs the tool`, explain: 'This is real calendar code, so the fact is reliable. The model only sees the result.', payload: { check_availability: args, result } });
  steps.push({ actor: 'app', title: 'Your app sends the result back', explain: 'The tool result goes in a user message, linked by tool_use_id. Then the model continues.', payload: { role: 'user', content: [{ type: 'tool_result', tool_use_id: `toolu_0${id}`, content: JSON.stringify(result) }] } });
  id++;

  if (!result.available) {
    const reply = 'Hi Sam, Thursday at 2pm is taken, but 3pm or 4:30pm are free. Would either work?';
    steps.push({ actor: 'model', title: 'The model replies with real alternatives', explain: 'stop_reason is "end_turn": no more tools needed. The times come from the tool result, not from the model\'s imagination.', payload: { stop_reason: 'end_turn', content: [{ type: 'text', text: reply }] } });
    steps.push({ actor: 'app', title: 'Your code verifies, logs and sends', explain: 'Check that every time in the reply appears in the tool result before sending. Nothing was booked.', payload: { verified: ['15:00', '16:30'].every((t) => reply.includes(t === '15:00' ? '3pm' : '4:30pm')), log: ['check_availability 2026-10-22 14:00 → taken', 'reply sent with 2 alternatives'] } });
    return steps;
  }

  const book = { ...args, email };
  steps.push({ actor: 'model', title: 'The model asks to book the meeting', explain: 'A booking changes the real world, so it deserves more care than a lookup.', payload: { stop_reason: 'tool_use', content: [{ type: 'tool_use', id: `toolu_0${id}`, name: 'book_meeting', input: book }] } });
  if (o.requireApproval) {
    steps.push({ actor: 'person', title: 'A person approves the booking', explain: 'Your code paused the loop and showed the request to a person, who approved it. Without approval, it would hand off instead.', payload: { approval: { action: 'book_meeting', ...book, approved: true, by: 'operator' } } });
  }
  const booking = { booked: true, id: 'MTG-1042', ...args };
  steps.push({ actor: 'tool', title: 'Your code books it', explain: o.requireApproval ? 'Arguments validated and approved, so the booking runs.' : 'No approval step: the model\'s request runs immediately. Fine for a demo; risky with real calendars and money.', payload: { book_meeting: book, result: booking } });
  steps.push({ actor: 'app', title: 'Your app sends the result back', explain: 'The model needs the confirmed booking to write an accurate reply.', payload: { role: 'user', content: [{ type: 'tool_result', tool_use_id: `toolu_0${id}`, content: JSON.stringify(booking) }] } });
  const reply = 'Hi Sam, you\'re booked for Thursday 22 October at 11am (reference MTG-1042). Talk then!';
  steps.push({ actor: 'model', title: 'The model writes the confirmation', explain: 'stop_reason is "end_turn". The loop ends because the model needs nothing else. Your code also caps the loop at five tool calls in case it never does.', payload: { stop_reason: 'end_turn', content: [{ type: 'text', text: reply }] } });
  steps.push({ actor: 'app', title: 'Your code verifies, logs and sends', explain: 'The reference in the reply must match a booking that really exists. Every step is logged.', payload: { verified: reply.includes(booking.id), log: [`check_availability ${args.date} ${args.time} → free`, o.requireApproval ? 'book_meeting approved by operator' : 'book_meeting ran without approval', `booked ${booking.id}`, 'confirmation sent'] } });
  return steps;
}
