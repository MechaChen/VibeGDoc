import * as Y from 'yjs'
import { useCallback, useEffect, useState } from 'react';
import { ParagraphNode } from 'lexical';
import { HeadingNode } from '@lexical/rich-text';
import { ListNode, ListItemNode } from '@lexical/list';
import { Provider } from '@lexical/yjs';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';

import { WebsocketProvider } from 'y-websocket'
import { CollaborationPlugin } from '@lexical/react/LexicalCollaborationPlugin';

import ToolbarPlugin from './components/ToolbarPlugin';
import { VibeBannerNode, VibeBannerPlugin } from './components/VibeBannerPlugin/VibeBannerPlugin';
import GhostTextPlugin from './components/GhostTextPlugin';
import VersionPlugin from './components/VersionPlugin';
import VibeGDocLogo from '/VibeGDoc.png';

import './App.css'

type TUserProfile = {
  name: string;
  color: string;
}

type TActiveUserProfile = TUserProfile & {
  userId: number;
}

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
  vibeBanner: 'py-2 px-4 text-black rounded-xl vibe-shadow',
  // ... 其他樣式
}

const userRandomNames: [string, string][] = [
  ['⚡ Pikachu', '#FFD700'],      // Yellow
  ['🔥 Charizard', '#FF4500'],    // Orange-Red
  ['🌱 Bulbasaur', '#228B22'],    // Forest Green
  ['💧 Squirtle', '#1E90FF'],     // Dodger Blue
  ['🔮 Mewtwo', '#800080'],       // Purple
  ['🎤 Jigglypuff', '#FFB6C1'],   // Light Pink
  ['👻 Gengar', '#4B0082'],       // Indigo
  ['🌊 Gyarados', '#0000CD'],     // Medium Blue
  ['💤 Snorlax', '#2F4F4F'],      // Dark Slate Gray
  ['🐉 Dragonite', '#DAA520'],    // Golden Rod
  ['🦊 Eevee', '#8B4513'],        // Saddle Brown
  ['✨ Mew', '#FF69B4'],          // Hot Pink
  ['🌟 Lugia', '#E6E6FA'],        // Lavender
  ['🐲 Rayquaza', '#006400'],     // Dark Green
  ['🦈 Garchomp', '#483D8B'],     // Dark Slate Blue
  ['🐺 Lucario', '#4169E1'],      // Royal Blue
];

function getRandomUserProfile(): TUserProfile {
  const userRandomName = userRandomNames[Math.floor(Math.random() * userRandomNames.length)];
  return {
    color: userRandomName[1],
    name: userRandomName[0],
  };
}

const randomUserProfile = getRandomUserProfile();

// Catch any errors that occur during Lexical updates and log them
// or throw them as needed. If you don't throw them, Lexical will
// try to recover gracefully without losing user data.
function onError(error: Error): void {
  console.error(error);
}

function pickLeaderBySmallestClientId(clientIds: number[]): number {
  return clientIds.reduce((leader, clientId) => {
    return Math.min(leader, clientId);
  });
}

function getDocFromMap(id: string, yjsDocMap: Map<string, Y.Doc>): Y.Doc {

  let doc = yjsDocMap.get(id);

  if (doc === undefined) {
    doc = new Y.Doc();
    yjsDocMap.set(id, doc);
  } else {
    doc.load();
  }

  return doc;
}

export function createWebsocketProvider(
  id: string,
  yjsDocMap: Map<string, Y.Doc>,
): Provider {
  const doc = getDocFromMap(id, yjsDocMap);

  // const provider = new WebsocketProvider('ws://collab-alb-1299889064.us-east-1.elb.amazonaws.com', id, doc);
  const provider = new WebsocketProvider('ws://localhost:1234', id, doc);
  provider.connect();
  // @ts-expect-error TODO: FIXME
  return provider;
}

function Editor() {
  const initialConfig = {
    editorState: null,
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


  const [yjsProvider, setYjsProvider] = useState<null | Provider>(null);
  const [, setConnected] = useState(false);
  const [, setActiveUsers] = useState<TActiveUserProfile[]>([]);

  const providerFactory = useCallback(
    (id: string, yjsDocMap: Map<string, Y.Doc>) => {
      const provider = createWebsocketProvider(id, yjsDocMap);
      provider.on('status', (event) => {
        // console.log(event);
        setConnected(
          // Websocket provider
          event.status === 'connected'
        );
      });

      // This is a hack to get reference to provider with standard CollaborationPlugin.
      // To be fixed in future versions of Lexical.
      setTimeout(() => setYjsProvider(provider), 0);

      return provider;
    },
    [],
  );

  const handleAwarenessUpdate = useCallback(() => {
    const awareness = yjsProvider!.awareness!;

    const leaderClientId = pickLeaderBySmallestClientId(
      Array.from(awareness.getStates().keys()).map(Number)
    );

    const states = Array.from(awareness.getStates().values());

    setActiveUsers(
      states.map(
        (state) => ({
          color: state.color,
          name: state.name,
          userId: Number(state.userId),
        })
      )
    );
  }, [yjsProvider]);

  useEffect(() => {
    if (yjsProvider == null) {
      return;
    }

    yjsProvider.awareness.on('update', handleAwarenessUpdate);

    return () => yjsProvider.awareness.off('update', handleAwarenessUpdate);
  }, [yjsProvider, handleAwarenessUpdate]);

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <ToolbarPlugin />
      <ListPlugin />
      <VibeBannerPlugin />
      <GhostTextPlugin />
      <CollaborationPlugin
        id="lexical/react-rich-collab"
        providerFactory={providerFactory}
        shouldBootstrap={false}
        username={randomUserProfile.name}
        cursorColor={randomUserProfile.color}
      />
      <RichTextPlugin
        contentEditable={
          <ContentEditable
            className="h-[300px] w-full border-b border-l border-r border-gray-300 p-4 rounded-b-xl"
            aria-placeholder={'Enter some text...'}
            placeholder={<div className="absolute top-12.5 left-0 text-gray-500 p-4">Enter some text...</div>}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
          />
        }
        ErrorBoundary={LexicalErrorBoundary}
      />
      <VersionPlugin />
      <HistoryPlugin />
      <AutoFocusPlugin />
    </LexicalComposer>
  );
}


function App() {
  return (
    <div className="w-[80%] m-auto py-10">
      <h2 className="text-3xl font-bold pb-16">
        <img src={VibeGDocLogo} alt="Vibe Google Doc" className="w-10 mr-4 inline-block" />
        Vibe Google Doc
      </h2>
      <div className="editor-wrapper relative">
        <Editor />
      </div>
    </div>
  )
}

export default App
