import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { tool_hover_style, tool_layout, tool_tooltip_style } from '../ToolbarPlugin/styles';
import clockHistoryIcon from '../../assets/clock-history.svg';
import cloudUploadIcon from '../../assets/cloud-upload.svg';
import cloudDownloadIcon from '../../assets/cloud-download.svg';
import bouncingCirclesIcon from '../../assets/bouncing-circles.svg';
import { serviceDomains } from '../../config/services';

type TVersion = {
  id: string,
  documentId: string,
  s3Key: string,
  version: number,
  createdAt: string,
  updatedAt: string,
}

type TVersionProps = TVersion & {
  applyingVersionId: string | null,
  setApplyingVersionId: (id: string | null) => void,
}


function Version(props: TVersionProps) {
  const { id, documentId, s3Key, version, createdAt, applyingVersionId, setApplyingVersionId } = props;
  const [editor] = useLexicalComposerContext();

  const isApplyingVersion = applyingVersionId !== null;
  const isApplyingCurVersion = applyingVersionId === id;

  const applyVersion = async () => {
    if (isApplyingVersion) return;

    setApplyingVersionId(id);
    const { data } = await axios.get(`${serviceDomains.version}/documents/${documentId}/versions/presigned-url?s3Key=${s3Key}`);
    const { presignedUrl } = data;

    const { data: snapshotData } = await axios.get(presignedUrl);
    
    const editorState = editor.parseEditorState(JSON.stringify(snapshotData));
    editor.setEditorState(editorState);
    setApplyingVersionId(null);
  }

  return (
    <div
      key={id}
      className={`py-2 px-4 mb-2 relative group ${isApplyingVersion ? 'cursor-not-allowed' : 'hover:bg-gray-100 cursor-pointer'}`}
      onClick={applyVersion}
    >
      <h3 className="text-lg font-bold flex items-center gap-2">
        Version {version}
        <img
          src={isApplyingCurVersion ? bouncingCirclesIcon : cloudDownloadIcon}
          className="w-4 h-4"
          alt="Version"
        />
      </h3>
      <p className="text-gray-500 text-sm">
        {new Date(createdAt)
          .toLocaleString('en-US', { 
            month: 'long',
            day: 'numeric', 
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: false
          })
        }
      </p>
      {/* Tooltip */}
      <span className="absolute z-10 left-1/2 -translate-x-1/2 top-2/7 -translate-y-full px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap">
        Insert Version {version}
      </span>
    </div>
  );
}

function VersionDrawer({ open, onClose }: { open: boolean, onClose: () => void }) {
  const [versions, setVersions] = useState<TVersion[]>([]);
  const [applyingVersionId, setApplyingVersionId] = useState<string | null>(null);
  
  useEffect(() => {
    async function getVersions() {
      const { data } = await axios.get(`${serviceDomains.version}/documents/${documentId}/versions`);
      setVersions(() => data);
    }

    getVersions();

    const historyStream = new EventSource(`${serviceDomains.version}/events`);

    historyStream.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'version_saved') {
        getVersions();
      }
    }

    return () => {
      historyStream.close();
    }
  }, [])


  return (
    <aside
      className={`${open ? 'translate-x-0' : 'translate-x-full'} transition-transform fixed top-0 right-0 h-full w-[400px] bg-white z-50 flex flex-col duration-300 transform translate-x-0 rounded-l-xl shadow-lg`}
      style={{ boxShadow: '0 0 32px 0 rgba(0,0,0,0.18)' }}
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-bold">Versions</h2>
        <button
          className="text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none cursor-pointer"
          onClick={onClose}
          aria-label="Close drawer"
        >
          ×
        </button>
      </div>
      <div className="flex-1 overflow-y-auto py-2 px-2">
        {versions.map((version) => (
          <Version
            key={version.id}
            {...version}
            applyingVersionId={applyingVersionId}
            setApplyingVersionId={setApplyingVersionId}
          />
        ))}
      </div>
    </aside>
  );
}

type TVersionPluginProps = {
  isLeader?: boolean,
}

const saveSnapshotInterval = 5000;
const documentId = '4d6e7257-8f78-4a4f-99ea-eb5fe151af8d';

export default function VersionPlugin(props: TVersionPluginProps) {
  const { isLeader } = props;
  const [editor] = useLexicalComposerContext();
  const timerRef = useRef<number>(NaN);
  const isTimerInit = useRef(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // useEffect(() => {
  //   if (!isLeader) return;

  //   function getSnapshot() {
  //     console.log('getSnapshot');
  //     editor.getEditorState().read(() => {
  //       console.log('snapshot ===>', editor.getEditorState().toJSON());
  //     });

  //     timerRef.current = setTimeout(getSnapshot, saveSnapshotInterval);
  //   }

  //   if (!isTimerInit.current) { 
  //     timerRef.current = setTimeout(getSnapshot, saveSnapshotInterval);
  //     isTimerInit.current = true;
  //   }

  //   return () => {
  //     clearTimeout(timerRef.current);
  //     timerRef.current = NaN;
  //   }
  // }, [editor, isLeader]); 

  async function saveSnapshot() {
    editor.getEditorState().read(async () => {
      const snapshot = editor.getEditorState().toJSON();
      
      const { data } = await axios.post(`${serviceDomains.version}/documents/${documentId}/versions/presigned-url`);
      const { presignedUrl, fileName } = data;

      try {
        await axios.put(
          presignedUrl,
          snapshot,
          { 
            headers: { 'Content-Type': 'application/json' }
          },
        );
  
        await axios.post(`${serviceDomains.version}/documents/${documentId}/versions`, {
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
    <>
      <button className={`group ${tool_layout} ${tool_hover_style}`} onClick={saveSnapshot}>
        <img src={cloudUploadIcon} alt="Version" className="w-full" />
        <div className={tool_tooltip_style}>
          Save snapshot
        </div>
      </button>
      <button
        className={`group ${tool_layout} ${tool_hover_style}`}
        onClick={() => setDrawerOpen(!drawerOpen)}
      >
        <img src={clockHistoryIcon} alt="Version" className="w-full" />
        <div className={tool_tooltip_style}>
          {drawerOpen ? 'Hide history' : 'Show history'}
        </div>
      </button>
      {createPortal(
        <VersionDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />,
        document.body,
      )}
    </>
  );
}