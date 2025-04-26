import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect, useRef } from 'react';

type TVersionPluginProps = {
  isLeader: boolean,
}

const saveSnapshotInterval = 5000;

export default function VersionPlugin(props: TVersionPluginProps) {
  const { isLeader } = props;
  const [editor] = useLexicalComposerContext();

  const isTimerInit = useRef(false);
  const timerRef = useRef<number>(NaN);

  useEffect(() => {
    if (!isLeader) return;

    function getSnapshot() {
        console.log('getSnapshot');
        editor.getEditorState().read(() => {
          console.log('snapshot ===>', editor.getEditorState().toJSON());
        });

        timerRef.current = setTimeout(getSnapshot, saveSnapshotInterval);
    }

    if (!isTimerInit.current) { 
      timerRef.current = setTimeout(getSnapshot, saveSnapshotInterval);
      isTimerInit.current = true;
    }

    return () => {
      clearTimeout(timerRef.current);
      timerRef.current = NaN;
    }
  }, [editor, isLeader]);

  return (
    // <button onClick={getSnapshot}>Version Plugin</button>
  );
}