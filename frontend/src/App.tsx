import './App.css'
import {$getRoot, $getSelection, EditorState} from 'lexical';
import {useEffect} from 'react';

import {LexicalComposer} from '@lexical/react/LexicalComposer';
import {RichTextPlugin} from '@lexical/react/LexicalRichTextPlugin';
import {ContentEditable} from '@lexical/react/LexicalContentEditable';
import {HistoryPlugin} from '@lexical/react/LexicalHistoryPlugin';
import {LexicalErrorBoundary} from '@lexical/react/LexicalErrorBoundary';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

const theme = {
  // Theme styling goes here
  //...
}

// Catch any errors that occur during Lexical updates and log them
// or throw them as needed. If you don't throw them, Lexical will
// try to recover gracefully without losing user data.
function onError(error: Error): void {
  console.error(error);
}

function MyOnChangePlugin(props: { onChange: (editorState: EditorState) => void }) {
  const [editor] = useLexicalComposerContext();
  const { onChange } = props;

  useEffect(() => {
    return editor.registerUpdateListener(({editorState}) => {
      onChange(editorState);
    });
  }, [editor, onChange]);
}

function Editor() {
  const initialConfig = {
    namespace: 'MyEditor',
    theme,
    onError,
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <RichTextPlugin
        contentEditable={
          <ContentEditable
            className="h-[300px] w-full rounded-xl border-gray-300 border p-2"
            aria-placeholder={'Enter some text...'}
            placeholder={<div className="absolute top-0 left-0 text-gray-500 p-2">Enter some text...</div>}
          />
        }
        ErrorBoundary={LexicalErrorBoundary}
      />
      <HistoryPlugin />
      <MyOnChangePlugin onChange={(editorState: EditorState) => {
        console.log(editorState);
      }}/>
    </LexicalComposer>
  );
}

function App() {
  return (
    <div className="w-[80%] m-auto py-10">
      <h2 className="text-2xl font-bold pb-4">Vibe Google Doc</h2>
      <div className="relative">
        <Editor />
      </div>
    </div>
  )
}

export default App
