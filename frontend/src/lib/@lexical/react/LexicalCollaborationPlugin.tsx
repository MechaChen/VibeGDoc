/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {JSX} from 'react';
import type {Doc} from 'yjs';
import {
  type CollaborationContextType,
  useCollaborationContext,
} from '@lexical/react/LexicalCollaborationContext';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {
  Binding,
  createBinding,
  ExcludedProperties,
  Provider,
} from '@lexical/yjs';
import {LexicalEditor} from 'lexical';
import {useEffect, useRef, useState} from 'react';

import {InitialEditorStateType} from './LexicalComposer.tsx';
import {
  CursorsContainerRef,
  useYjsCollaboration,
  useYjsFocusTracking,
  useYjsHistory,
} from './shared/useYjsCollaboration.tsx';
import CheckCircle from '../../../assets/check-circle.svg';
import CheckCircleFill from '../../../assets/check-circle-fill.svg';

type Props = {
  id: string;
  providerFactory: (
     
    id: string,
    yjsDocMap: Map<string, Doc>,
  ) => Provider;
  shouldBootstrap: boolean;
  username?: string;
  cursorColor?: string;
  cursorsContainerRef?: CursorsContainerRef;
  initialEditorState?: InitialEditorStateType;
  excludedProperties?: ExcludedProperties;
  // `awarenessData` parameter allows arbitrary data to be added to the awareness.
  awarenessData?: object;
};

export function CollaborationPlugin({
  id,
  providerFactory,
  shouldBootstrap,
  username,
  cursorColor,
  cursorsContainerRef,
  initialEditorState,
  excludedProperties,
  awarenessData,
}: Props): JSX.Element {
  const isBindingInitialized = useRef(false);
  const isProviderInitialized = useRef(false);

  const collabContext = useCollaborationContext(username, cursorColor);

  const {yjsDocMap, name, color} = collabContext;

  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    collabContext.isCollabActive = true;

    return () => {
      // Resetting flag only when unmount top level editor collab plugin. Nested
      // editors (e.g. image caption) should unmount without affecting it
      if (editor._parentEditor == null) {
        collabContext.isCollabActive = false;
      }
    };
  }, [collabContext, editor]);

  const [provider, setProvider] = useState<Provider>();

  useEffect(() => {
    if (isProviderInitialized.current) {
      return;
    }

    isProviderInitialized.current = true;

    const newProvider = providerFactory(id, yjsDocMap);
    setProvider(newProvider);

    return () => {
      newProvider.disconnect();
    };
  }, [id, providerFactory, yjsDocMap]);

  const [doc, setDoc] = useState(yjsDocMap.get(id));
  const [binding, setBinding] = useState<Binding>();

  useEffect(() => {
    if (!provider) {
      return;
    }

    if (isBindingInitialized.current) {
      return;
    }

    isBindingInitialized.current = true;

    const newBinding = createBinding(
      editor,
      provider,
      id,
      doc || yjsDocMap.get(id),
      yjsDocMap,
      excludedProperties,
    );
    setBinding(newBinding);

    return () => {
      newBinding.root.destroy(newBinding);
    };
  }, [editor, provider, id, yjsDocMap, doc, excludedProperties]);

  if (!provider || !binding) {
    return <></>;
  }

  return (
    <>
      <YjsCollaborationCursors
        awarenessData={awarenessData}
        binding={binding}
        collabContext={collabContext}
        color={color}
        cursorsContainerRef={cursorsContainerRef}
        editor={editor}
        id={id}
        initialEditorState={initialEditorState}
        name={name}
          provider={provider}
          setDoc={setDoc}
          shouldBootstrap={shouldBootstrap}
          yjsDocMap={yjsDocMap}
      />
    </>
  );
}

function SyncingStatus() {
  const [isSyncing, setIsSyncing] = useState(false);

  const showSyncingStatus = () => {
    setIsSyncing(true);
  }

  const showSyncedStatus = () => {
    setIsSyncing(false);
  }

  useEffect(() => {
    window.addEventListener('editor-updated', showSyncingStatus);
    window.addEventListener('yjs-server-updated', showSyncedStatus);

    return () => {
      window.removeEventListener('editor-updated', showSyncingStatus);
      window.removeEventListener('yjs-server-updated', showSyncedStatus);
    };
  }, []);

  return (
    <div className="absolute -top-8 left-0 flex items-center gap-2">
      {isSyncing ? (
        <>
          <img src={CheckCircle} alt="Syncing" className="w-4" />
          <span>Syncing</span>
        </>
      ) : (
        <>
          <img src={CheckCircleFill} alt="Synced" className="w-4" />
          <span>Synced</span>
        </>
      )}
    </div>
  )
}

function YjsCollaborationCursors({
  editor,
  id,
  provider,
  yjsDocMap,
  name,
  color,
  shouldBootstrap,
  cursorsContainerRef,
  initialEditorState,
  awarenessData,
  collabContext,
  binding,
  setDoc,
}: {
  editor: LexicalEditor;
  id: string;
  provider: Provider;
  yjsDocMap: Map<string, Doc>;
  name: string;
  color: string;
  shouldBootstrap: boolean;
  binding: Binding;
  setDoc: React.Dispatch<React.SetStateAction<Doc | undefined>>;
  cursorsContainerRef?: CursorsContainerRef | undefined;
  initialEditorState?: InitialEditorStateType | undefined;
  awarenessData?: object;
  collabContext: CollaborationContextType;
}) {
  const collabCursorsAndStatus = useYjsCollaboration(
    editor,
    id,
    provider,
    yjsDocMap,
    name,
    color,
    shouldBootstrap,
    binding,
    setDoc,
    cursorsContainerRef,
    initialEditorState,
    awarenessData,
  );

  collabContext.clientID = binding.clientID;

  useYjsHistory(editor, binding);
  useYjsFocusTracking(editor, provider, name, color, awarenessData);


  return (
    <>
      <SyncingStatus />
      {collabCursorsAndStatus.cursorsContainer}
    </>
  );
}