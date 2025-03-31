import { HeadingNode } from '@lexical/rich-text';
import { ListNode, ListItemNode } from '@lexical/list';
import { ParagraphNode } from 'lexical';

import {LexicalComposer} from '@lexical/react/LexicalComposer';
import {RichTextPlugin} from '@lexical/react/LexicalRichTextPlugin';
import {ContentEditable} from '@lexical/react/LexicalContentEditable';
import {HistoryPlugin} from '@lexical/react/LexicalHistoryPlugin';
import {LexicalErrorBoundary} from '@lexical/react/LexicalErrorBoundary';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';

import ToolbarPlugin from './components/ToolbarPlugin';
import { VibeBannerNode, VibeBannerPlugin } from './components/VibeBannerPlugin/VibeBannerPlugin';
import VibeGDocLogo from '/VibeGDoc.png';

import './App.css'

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
  list: {
    ol: 'list-decimal ml-8',    // 有序列表的樣式
    ul: 'list-disc ml-8',       // 無序列表的樣式
  },
  banner: 'py-2 px-4 text-black rounded-xl vibe-shadow',
  // ... 其他樣式
}

// Catch any errors that occur during Lexical updates and log them
// or throw them as needed. If you don't throw them, Lexical will
// try to recover gracefully without losing user data.
function onError(error: Error): void {
  console.error(error);
}

function Editor() {
  const initialConfig = {
    namespace: 'MyEditor',
    theme,
    onError,
    nodes: [
      HeadingNode,
      ListNode,
      ListItemNode,
      VibeBannerNode,
      ParagraphNode,
    ],
  };


  return (
    <LexicalComposer initialConfig={initialConfig}>
      <ToolbarPlugin />
      <ListPlugin />
      <VibeBannerPlugin />
      <RichTextPlugin
        contentEditable={
          <ContentEditable
            className="h-[300px] w-full border-b border-l border-r border-gray-300 p-4 rounded-b-xl"
            aria-placeholder={'Enter some text...'}
            placeholder={<div className="absolute top-12.5 left-0 text-gray-500 p-4">Enter some text...</div>}
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
