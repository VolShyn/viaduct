import Editor, { type OnMount } from '@monaco-editor/react';
import LoadingSkeleton from '@components/common/LoadingSkeleton';
import { useColorMode } from '@contexts/ColorModeContext';
import { Box } from '@chakra-ui/react';
import type * as Monaco from 'monaco-editor';
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

export type MarkdownEditorHandle = {
  insertAtCursor: (text: string) => void;
  focus: () => void;
  setScrollRatio: (ratio: number) => void;
};

type Props = {
  /** Ignored in Community (no Yjs). */
  yText?: unknown;
  /** Ignored in Community (no Yjs). */
  awareness?: unknown;
  /** Controlled local value. */
  value?: string;
  readOnly?: boolean;
  onMarkdownChange?: (value: string) => void;
  onScrollRatio?: (ratio: number) => void;
};

function applyEditorScrollRatio(editor: Monaco.editor.IStandaloneCodeEditor, ratio: number) {
  const scrollHeight = editor.getScrollHeight();
  const height = editor.getLayoutInfo().height;
  const max = Math.max(0, scrollHeight - height);
  editor.setScrollTop(max * Math.min(1, Math.max(0, ratio)));
}

/** Local-only markdown editor (Community has no live docs collab). */
const CollaborativeMarkdownEditor = forwardRef<MarkdownEditorHandle, Props>(
  function CollaborativeMarkdownEditor(
    { value = '', readOnly, onMarkdownChange, onScrollRatio },
    ref
  ) {
    const { mode } = useColorMode();
    const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
    const monacoRef = useRef<typeof Monaco | null>(null);
    const applyingRef = useRef(false);
    const onMarkdownChangeRef = useRef(onMarkdownChange);
    const onScrollRatioRef = useRef(onScrollRatio);
    onMarkdownChangeRef.current = onMarkdownChange;
    onScrollRatioRef.current = onScrollRatio;
    const themeName = mode === 'dark' ? 'c4-markdown-dark' : 'c4-markdown-light';

    useImperativeHandle(
      ref,
      () => ({
        insertAtCursor(text: string) {
          const editor = editorRef.current;
          const monaco = monacoRef.current;
          if (!editor || !monaco || readOnly) return;

          const model = editor.getModel();
          const selection = editor.getSelection();
          if (!model || !selection) return;

          editor.executeEdits('docs-insert', [
            {
              range: selection,
              text,
              forceMoveMarkers: true,
            },
          ]);

          const startOffset = model.getOffsetAt(selection.getStartPosition());
          const endOffset = startOffset + text.length;
          const endPos = model.getPositionAt(endOffset);
          editor.setSelection(
            new monaco.Selection(
              endPos.lineNumber,
              endPos.column,
              endPos.lineNumber,
              endPos.column
            )
          );
          editor.focus();
        },
        focus() {
          editorRef.current?.focus();
        },
        setScrollRatio(ratio: number) {
          const editor = editorRef.current;
          if (!editor) return;
          applyEditorScrollRatio(editor, ratio);
        },
      }),
      [readOnly]
    );

    useEffect(() => {
      const editor = editorRef.current;
      if (!editor || applyingRef.current) return;
      const model = editor.getModel();
      if (!model) return;
      if (model.getValue() === value) return;
      applyingRef.current = true;
      model.setValue(value);
      applyingRef.current = false;
    }, [value]);

    const handleMount: OnMount = (editor, monaco) => {
      editorRef.current = editor;
      monacoRef.current = monaco;

      editor.onDidChangeModelContent(() => {
        if (applyingRef.current || readOnly) return;
        onMarkdownChangeRef.current?.(editor.getValue());
      });

      editor.onDidScrollChange(() => {
        const scrollHeight = editor.getScrollHeight();
        const height = editor.getLayoutInfo().height;
        const max = Math.max(0, scrollHeight - height);
        const ratio = max === 0 ? 0 : editor.getScrollTop() / max;
        onScrollRatioRef.current?.(ratio);
      });
    };

    return (
      <Box h="100%" minH="200px">
        <Editor
          height="100%"
          defaultLanguage="markdown"
          path="documentation.md"
          theme={themeName}
          value={value}
          loading={<LoadingSkeleton />}
          options={{
            readOnly: Boolean(readOnly),
            minimap: { enabled: false },
            wordWrap: 'on',
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            fontSize: 13,
            padding: { top: 8, bottom: 8 },
          }}
          onMount={handleMount}
        />
      </Box>
    );
  }
);

export default CollaborativeMarkdownEditor;
