import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { markdown } from '@codemirror/lang-markdown';
import {
  bracketMatching,
  HighlightStyle,
  indentOnInput,
  syntaxHighlighting,
} from '@codemirror/language';
import { EditorState } from '@codemirror/state';
import {
  drawSelection,
  EditorView,
  highlightActiveLine,
  keymap,
  lineNumbers,
} from '@codemirror/view';
import { tags } from '@lezer/highlight';

import { applyMarkdownFormat } from '../public/js/markdownEditor.js';

const operatorTheme = EditorView.theme({
  '&': { backgroundColor: '#0d0e0f', color: '#c8c8c8' },
  '.cm-scroller': { fontFamily: '"JetBrains Mono", ui-monospace, monospace' },
  '.cm-content': { caretColor: '#f8f2c6', padding: '14px' },
  '.cm-gutters': { backgroundColor: '#08090a', color: '#5a5d60', border: 'none', borderRight: '1px solid #1f2021' },
  '.cm-activeLineGutter': { backgroundColor: 'rgba(135, 215, 95, 0.06)', color: '#87d75f' },
  '.cm-activeLine': { backgroundColor: 'rgba(135, 215, 95, 0.04)' },
  '.cm-cursor, .cm-dropCursor': { borderLeftColor: '#f8f2c6', borderLeftWidth: '2px' },
  '.cm-selectionBackground, .cm-content ::selection': { backgroundColor: 'rgba(135, 215, 95, 0.22) !important' },
  '.cm-focused': { outline: 'none' },
}, { dark: true });

const operatorHighlight = HighlightStyle.define([
  { tag: tags.heading,         color: '#87d75f', fontWeight: '700' },
  { tag: tags.strong,          color: '#d7af5f', fontWeight: '700' },
  { tag: tags.emphasis,        color: '#c8c8c8', fontStyle: 'italic' },
  { tag: tags.link,            color: '#87afff', textDecoration: 'underline' },
  { tag: tags.monospace,       color: '#d7af5f', backgroundColor: '#08090a' },
  { tag: tags.quote,           color: '#87afff' },
  { tag: tags.keyword,         color: '#87d75f' },
  { tag: tags.comment,         color: '#5a5d60', fontStyle: 'italic' },
]);

function saveKeymap(onSave) {
  return keymap.of([
    {
      key: 'Mod-s',
      run() {
        onSave?.();
        return true;
      },
    },
  ]);
}

export function mountCodeMirrorEditor({
  host,
  value = '',
  onChange,
  onSave,
} = {}) {
  if (!host) return null;

  const view = new EditorView({
    parent: host,
    state: EditorState.create({
      doc: String(value ?? ''),
      extensions: [
        lineNumbers(),
        history(),
        drawSelection(),
        indentOnInput(),
        bracketMatching(),
        markdown(),
        syntaxHighlighting(operatorHighlight, { fallback: true }),
        highlightActiveLine(),
        EditorView.lineWrapping,
        EditorView.updateListener.of((update) => {
          if (!update.docChanged) return;
          onChange?.(update.state.doc.toString());
        }),
        operatorTheme,
        keymap.of([...defaultKeymap, ...historyKeymap]),
        ...(onSave ? [saveKeymap(onSave)] : []),
      ],
    }),
  });

  return {
    getValue() {
      return view.state.doc.toString();
    },
    focus() {
      view.focus();
    },
    applyFormat(action) {
      const currentValue = view.state.doc.toString();
      const selection = view.state.selection.main;
      const result = applyMarkdownFormat(currentValue, selection.from, selection.to, action);

      view.dispatch({
        changes: { from: 0, to: currentValue.length, insert: result.value },
        selection: { anchor: result.selectionStart, head: result.selectionEnd },
        scrollIntoView: true,
      });
      view.focus();
    },
    destroy() {
      view.destroy();
    },
  };
}
