import './App.css'
import { $getSelection, $isRangeSelection } from 'lexical';
import { $setBlocksType } from '@lexical/selection';
import { $createHeadingNode, HeadingNode } from '@lexical/rich-text';

import {LexicalComposer} from '@lexical/react/LexicalComposer';
import {RichTextPlugin} from '@lexical/react/LexicalRichTextPlugin';
import {ContentEditable} from '@lexical/react/LexicalContentEditable';
import {HistoryPlugin} from '@lexical/react/LexicalHistoryPlugin';
import {LexicalErrorBoundary} from '@lexical/react/LexicalErrorBoundary';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

import VibeGDocLogo from '../public/VibeGDoc.png';


const theme = {
  heading: {
    h1: 'text-2xl font-bold',
    h2: 'text-xl font-bold',
    h3: 'text-lg font-bold',
    h4: 'text-base font-bold',
    h5: 'text-sm font-bold',
  },
  text: {
    bold: 'font-bold',
    italic: 'italic',
    underline: 'underline',
  },
  // ... 其他樣式
}

// Catch any errors that occur during Lexical updates and log them
// or throw them as needed. If you don't throw them, Lexical will
// try to recover gracefully without losing user data.
function onError(error: Error): void {
  console.error(error);
}

function HeadingPlugin() {
  const [editor] = useLexicalComposerContext();

  const applyHeading = (e: React.MouseEvent<HTMLButtonElement>) => {
    editor.update(() => {
      const selection = $getSelection();

      if ($isRangeSelection(selection)) {
        const headingNode = $createHeadingNode('h1');
        $setBlocksType(selection, () => headingNode);
      }
    });
  };


  return (
    <button
      className="border border-gray-300 p-2 rounded-md cursor-pointer h-10 mb-1"
      onClick={applyHeading}
    >
      Heading
    </button>
  );
}

function Editor() {
  const initialConfig = {
    namespace: 'MyEditor',
    theme,
    onError,
    nodes: [
      HeadingNode,
    ],
  };


  return (
    <LexicalComposer initialConfig={initialConfig}>
      <HeadingPlugin />
      <RichTextPlugin
        contentEditable={
          <ContentEditable
            className="h-[300px] w-full rounded-xl border-gray-300 border p-4"
            aria-placeholder={'Enter some text...'}
            placeholder={<div className="absolute top-11 left-0 text-gray-500 p-4">Enter some text...</div>}
          />
        }
        ErrorBoundary={LexicalErrorBoundary}
      />
      <HistoryPlugin />
    </LexicalComposer>
  );
}

function App() {
  return (
    <div className="w-[80%] m-auto py-10">
      <h2 className="text-3xl font-bold pb-8">
        <img src={VibeGDocLogo} alt="Vibe Google Doc" className="w-10 mr-4 inline-block" />
        Vibe Google Doc
      </h2>
      <div className="relative">
        <Editor />
      </div>
    </div>
  )
}

export default App
