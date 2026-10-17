import { useEffect, useRef } from 'react';
import { EditorState, Compartment } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter, drawSelection } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { syntaxHighlighting, HighlightStyle, indentOnInput, bracketMatching } from '@codemirror/language';
import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { javascript } from '@codemirror/lang-javascript';
import { tags as t } from '@lezer/highlight';

export type FileKind = 'html' | 'css' | 'js';

/** Colors come from the app's code tokens, so the editor follows light/dark themes. */
const highlight = HighlightStyle.define([
  { tag: [t.keyword, t.controlKeyword, t.moduleKeyword, t.operatorKeyword], color: 'var(--code-keyword)' },
  { tag: [t.string, t.special(t.string), t.regexp], color: 'var(--code-string)' },
  { tag: [t.number, t.bool, t.null, t.atom], color: 'var(--code-number)' },
  { tag: [t.comment, t.lineComment, t.blockComment], color: 'var(--code-comment)', fontStyle: 'italic' },
  { tag: [t.function(t.variableName), t.function(t.propertyName)], color: 'var(--accent)' },
  { tag: [t.tagName, t.angleBracket], color: 'var(--code-keyword)' },
  { tag: [t.attributeName, t.propertyName], color: 'var(--code-number)' },
  { tag: [t.className, t.labelName], color: 'var(--accent)' },
  { tag: t.invalid, color: 'var(--danger)' },
]);

const theme = EditorView.theme({
  '&': { height: '100%', backgroundColor: 'var(--code-bg)', color: 'var(--code-ink)', fontSize: 'var(--editor-font-size)' },
  '.cm-scroller': { fontFamily: 'var(--editor-font)', lineHeight: '1.65' },
  '.cm-content': { caretColor: 'var(--accent)', padding: '10px 0' },
  '.cm-gutters': { backgroundColor: 'var(--code-bg)', color: 'var(--ink-3)', border: 'none', paddingLeft: '6px' },
  '.cm-activeLine': { backgroundColor: 'color-mix(in srgb, var(--accent-soft) 45%, transparent)' },
  '.cm-activeLineGutter': { backgroundColor: 'transparent', color: 'var(--ink)' },
  '.cm-cursor': { borderLeftColor: 'var(--accent)', borderLeftWidth: '2px' },
  '&.cm-focused': { outline: 'none' },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection': { backgroundColor: 'var(--accent-soft) !important' },
  '.cm-matchingBracket': { backgroundColor: 'var(--accent-soft)', outline: '1px solid var(--accent)' },
  '.cm-line.cm-error-line': { backgroundColor: 'var(--danger-soft)' },
});

const LANGS: Record<FileKind, () => ReturnType<typeof html>> = { html: () => html(), css: () => css(), js: () => javascript() };

export interface CodeEditorHandle {
  goToLine: (line: number) => void;
}

/**
 * A CodeMirror editor. Keeps one editor per file so undo history survives
 * switching tabs. Ctrl/Cmd+Enter runs the code.
 */
export function CodeEditor({
  file, value, onChange, onRun, label, handleRef,
}: {
  file: FileKind;
  value: string;
  onChange: (v: string) => void;
  onRun: () => void;
  label: string;
  handleRef?: React.MutableRefObject<CodeEditorHandle | null>;
}) {
  const host = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const onRunRef = useRef(onRun);
  onChangeRef.current = onChange;
  onRunRef.current = onRun;
  const lang = useRef(new Compartment());

  useEffect(() => {
    if (!host.current) return;
    const v = new EditorView({
      parent: host.current,
      state: EditorState.create({
        doc: value,
        extensions: [
          lineNumbers(),
          highlightActiveLineGutter(),
          history(),
          drawSelection(),
          indentOnInput(),
          bracketMatching(),
          closeBrackets(),
          highlightActiveLine(),
          syntaxHighlighting(highlight),
          lang.current.of(LANGS[file]()),
          keymap.of([
            { key: 'Mod-Enter', run: () => { onRunRef.current(); return true; } },
            ...closeBracketsKeymap,
            ...defaultKeymap,
            ...historyKeymap,
            indentWithTab,
          ]),
          EditorView.updateListener.of((u) => { if (u.docChanged) onChangeRef.current(u.state.doc.toString()); }),
          EditorView.contentAttributes.of({ 'aria-label': label, autocapitalize: 'off', autocorrect: 'off', spellcheck: 'false' }),
          theme,
        ],
      }),
    });
    view.current = v;
    if (handleRef) {
      handleRef.current = {
        goToLine: (line: number) => {
          const doc = v.state.doc;
          const l = doc.line(Math.min(Math.max(1, line), doc.lines));
          v.dispatch({ selection: { anchor: l.from, head: l.to }, scrollIntoView: true });
          v.focus();
        },
      };
    }
    return () => v.destroy();
    // The editor is created once per file; value changes from outside are synced below.
  }, [file]);

  // Replace the document when the value changes from outside (reset, load solution).
  useEffect(() => {
    const v = view.current;
    if (v && v.state.doc.toString() !== value) v.dispatch({ changes: { from: 0, to: v.state.doc.length, insert: value } });
  }, [value]);

  return <div ref={host} className="editor" />;
}
