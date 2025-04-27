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

  useEffect(() => {
    async function getVersions() {
      const { data } = await axios.get(`http://localhost:3001/documents/${documentId}/versions`);
      console.log('versions ===>', data);
    }

    getVersions();
  }, [])



  async function saveSnapshot() {
    editor.getEditorState().read(async () => {
      const snapshot = editor.getEditorState().toJSON();
      
      const { data } = await axios.post(`http://localhost:3001/documents/${documentId}/versions/presigned-url`);
      const { presignedUrl, fileName } = data;

      try {
        await axios.put(
          presignedUrl,
          snapshot,
          { 
            headers: { 'Content-Type': 'application/json' }
          },
        );
  
        await axios.post(`http://localhost:3001/documents/${documentId}/versions`, {
          s3Key: fileName,
        });
        alert('Snapshot saved');
      } catch (error) {
        console.error('Error saving snapshot:', error);
        alert('Error saving snapshot');
      }
    });
  }

  return (
    <button
      className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md cursor-pointer"
      onClick={saveSnapshot}
    >
      Save this version
    </button>
  );
}