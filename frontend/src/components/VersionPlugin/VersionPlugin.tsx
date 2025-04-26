import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import axios from 'axios';
import { useEffect, useRef } from 'react';

type TVersionPluginProps = {
  isLeader: boolean,
}

const saveSnapshotInterval = 5000;
const documentId = '4d6e7257-8f78-4a4f-99ea-eb5fe151af8d';

export default function VersionPlugin(props: TVersionPluginProps) {
  const { isLeader } = props;
  const [editor] = useLexicalComposerContext();
  const timerRef = useRef<number>(NaN);
  const isTimerInit = useRef(false);

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



  async function getSnapshot() {
    editor.getEditorState().read(async () => {
      const snapshot = editor.getEditorState().toJSON();
      
      const { data } = await axios.post(`http://localhost:3001/documents/${documentId}/versions/presigned-url`);
      const { presignedUrl } = data;

      const response = await axios.put(
        presignedUrl,
        snapshot,
        { 
          headers: { 'Content-Type': 'application/json' }
        },
    );

      console.log('response ===>', response);
    });
  }

  return (
    <button onClick={getSnapshot}>
      Version Plugin
    </button>
  );
}