import './App.css'
import { $getSelection, $isRangeSelection } from 'lexical';
import { $setBlocksType } from '@lexical/selection';
import { $createHeadingNode, HeadingNode, HeadingTagType } from '@lexical/rich-text';

import {LexicalComposer} from '@lexical/react/LexicalComposer';
import {RichTextPlugin} from '@lexical/react/LexicalRichTextPlugin';
import {ContentEditable} from '@lexical/react/LexicalContentEditable';
import {HistoryPlugin} from '@lexical/react/LexicalHistoryPlugin';
import {LexicalErrorBoundary} from '@lexical/react/LexicalErrorBoundary';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND, ListItemNode, ListNode, ListType } from '@lexical/list';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';

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
  list: {
    ol: 'list-decimal ml-8',    // 有序列表的樣式
    ul: 'list-disc ml-8',       // 無序列表的樣式
  },
  // ... 其他樣式
}

// Catch any errors that occur during Lexical updates and log them
// or throw them as needed. If you don't throw them, Lexical will
// try to recover gracefully without losing user data.
function onError(error: Error): void {
  console.error(error);
}

const headingTags = {
  h1: {
    tag: 'h1',
    title: 'H1',
  },
  h2: {
    tag: 'h2',
    title: 'H2',
  },
  h3: {
    tag: 'h3',
    title: 'H3',
  },
  h4: {
    tag: 'h4',
    title: 'H4',
  },
  h5: {
    tag: 'h5',
    title: 'H5',
  },
} as const

function HeadingPlugin() {
  const [editor] = useLexicalComposerContext();

  const applyHeading = (heading: HeadingTagType) => {
    editor.update(() => {
      const selection = $getSelection();

      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createHeadingNode(heading));
      }
    });
  };


  return (
    <>
      {Object.keys(headingTags).map((headingTag, index) => (
        <button
          key={headingTag}
          className={`
            border border-gray-300 py-2 px-4 cursor-pointer h-10 ${index === 0 ? 'rounded-l-md' : index === Object.keys(headingTags).length - 1 ? 'rounded-r-md' : ''}`
          }
          onClick={() => applyHeading(headingTag as HeadingTagType)}
        >
          {headingTags[headingTag as keyof typeof headingTags].title}
        </button>
      ))}
    </>
  );
}

const listTypes = {
  number: {
    tag: 'number' as ListType,
    title: 'Number List',
  },
  bullet: {
    tag: 'bullet' as ListType,
    title: 'Bullet List',
  },
} as const

function ListToolbarPlugin() {
  const [editor] = useLexicalComposerContext();

  const applyList = (listType: ListType) => {
    if (listType === listTypes.number.tag) {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
      return true;
    } else if (listType === listTypes.bullet.tag) {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
      return true;
    }
  };

  return (
    <>
      {Object.keys(listTypes).map((listType, index) => (
        <button
          key={listType}
          className={`
            border border-gray-300 py-2 px-4 cursor-pointer h-10 ${index === 0 ? 'rounded-l-md' : index === Object.keys(listTypes).length - 1 ? 'rounded-r-md' : ''}`
          }
          onClick={() => applyList(listType as ListType)}
        >
          {listTypes[listType as keyof typeof listTypes].title}
        </button>
      ))}
    </>
  );
}

function ToolbarPlugin() {
  return (
    <div className="mb-2 gap-2">
      <HeadingPlugin />
      <ListToolbarPlugin />
    </div>
  )
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
    ],
  };


  return (
    <LexicalComposer initialConfig={initialConfig}>
      <ToolbarPlugin />
      <ListPlugin />
      <RichTextPlugin
        contentEditable={
          <ContentEditable
            className="h-[300px] w-full rounded-xl border-gray-300 border p-4"
            aria-placeholder={'Enter some text...'}
            placeholder={<div className="absolute top-12 left-0 text-gray-500 p-4">Enter some text...</div>}
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
