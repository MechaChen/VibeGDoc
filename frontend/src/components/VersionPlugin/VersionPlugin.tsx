import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { SerializedEditorState } from 'lexical';
import { SerializedLexicalNode } from 'lexical';
import { useState } from 'react';

export default function VersionPlugin() {
  const [editor] = useLexicalComposerContext();

  const [snapshot, setSnapshot] = useState<SerializedEditorState<SerializedLexicalNode> | null>(null);

  const getSnapshot = () => {
    editor.getEditorState().read(() => {
      console.log('snapshot', editor.getEditorState().toJSON());
      setSnapshot(editor.getEditorState().toJSON());
    });
  }
  
  return <button onClick={getSnapshot}>Get snapshot</button>;
}