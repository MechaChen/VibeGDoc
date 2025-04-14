import { $getSelection, $isRangeSelection, UNDO_COMMAND, REDO_COMMAND } from 'lexical';
import { $setBlocksType } from '@lexical/selection';
import { $createHeadingNode, HeadingTagType } from '@lexical/rich-text';
import { useRef, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND, ListType } from '@lexical/list';

import mic from '../../assets/mic.svg';
import micFill from '../../assets/mic-fill.svg';
import xCircle from '../../assets/x-circle.svg';
import bouncingCircles from '../../assets/bouncing-circles.svg';
import typeH1 from '../../assets/type-h1.svg';
import typeH2 from '../../assets/type-h2.svg';
import typeH3 from '../../assets/type-h3.svg';
import listOl from '../../assets/list-ol.svg';
import listUl from '../../assets/list-ul.svg';
import bold from '../../assets/type-bold.svg';
import italic from '../../assets/type-italic.svg';
import underline from '../../assets/type-underline.svg';
import undo from '../../assets/undo.svg';
import redo from '../../assets/redo.svg';

import vibeBanner from '/favicon.png';
import { INSERT_VIBE_BANNER_COMMAND } from '../VibeBannerPlugin/VibeBannerPlugin';

const tool_layout = 'py-1 px-3 w-10 h-10 relative rounded';
const tool_hover_style = 'hover:bg-[#eee] transition-colors duration-200 cursor-pointer';
const tool_tooltip_style = 'absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap z-10';

const unRedoTags = {
  undo: {
    tag: 'undo',
    icon: undo,
  },
  redo: {
    tag: 'redo',
    icon: redo,
  },
} as const

function UnRedoToolbarPlugin() {
  const [editor] = useLexicalComposerContext();

  const applyUnRedo = (unRedoTag: keyof typeof unRedoTags) => {
    switch (unRedoTag) {
      case unRedoTags.undo.tag:
        editor.dispatchCommand(UNDO_COMMAND, undefined);
        break;
      case unRedoTags.redo.tag:
        editor.dispatchCommand(REDO_COMMAND, undefined);
        break;
    }
  }

  return (
    <>
      {Object.keys(unRedoTags).map((unRedoTag) => (
        <button
          key={unRedoTag}
          className={`group ${tool_layout} ${tool_hover_style}`}
          onClick={() => applyUnRedo(unRedoTag as keyof typeof unRedoTags)}
        >
          <img src={unRedoTags[unRedoTag as keyof typeof unRedoTags].icon} alt={unRedoTag} className="w-full" />
          <div className={tool_tooltip_style}>
            {unRedoTag}
          </div>
        </button>
      ))}
    </>
  );
}

const headingTags = {
  h1: {
    tag: 'h1',
    icon: typeH1,
  },
  h2: {
    tag: 'h2',
    icon: typeH2,
  },
  h3: {
    tag: 'h3',
    icon: typeH3,
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
      {Object.keys(headingTags).map((headingTag) => (
        <button
          key={headingTag}
          className={`group ${tool_layout} ${tool_hover_style}`}
          onClick={() => applyHeading(headingTag as HeadingTagType)}
        >
          <img src={headingTags[headingTag as keyof typeof headingTags].icon} alt={headingTag} className="w-full" />
          <div className={tool_tooltip_style}>
            {`Heading ${headingTag.toUpperCase()}`}
          </div>
        </button>
      ))}
    </>
  );
}

const fontStyleTags = {
  bold: {
    tag: 'bold',
    icon: bold,
  },
  italic: {
    tag: 'italic',
    icon: italic,
  },
  underline: {
    tag: 'underline',
    icon: underline,
  },
} as const

function FontStyleToolbarPlugin() {
  const [editor] = useLexicalComposerContext();

  const applyFontStyle = (fontStyle: keyof typeof fontStyleTags) => {
    editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          selection.formatText(fontStyle);
        }
      });
  };

  return (
    <>
      {Object.keys(fontStyleTags).map((fontStyle) => (
        <button
          key={fontStyle}
          className={`group ${tool_layout} ${tool_hover_style}`}
          onClick={() => applyFontStyle(fontStyle as keyof typeof fontStyleTags)}
        >
          <img src={fontStyleTags[fontStyle as keyof typeof fontStyleTags].icon} alt={fontStyle} className="w-full" />
          <div className={tool_tooltip_style}>
            {fontStyle}
          </div>
        </button>
      ))}
    </>
  );
}

const listTypes = {
  number: {
    tag: 'number',
    icon: listOl,
  },
  bullet: {
    tag: 'bullet',
    icon: listUl,
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
      {Object.keys(listTypes).map((listType) => (
        <button
          key={listType}
          className={`group ${tool_layout} ${tool_hover_style}`}
          onClick={() => applyList(listType as ListType)}
        >
          <img src={listTypes[listType as keyof typeof listTypes].icon} alt={listType} className="w-full" />
          <div className={tool_tooltip_style}>
            {listType === 'number' ? 'Numbered List' : 'Bullet List'}
          </div>
        </button>
      ))}
    </>
  );
}

function VibeBannerToolbarPlugin() {
  const [editor] = useLexicalComposerContext();

  const applyVibeBanner = () => {
    editor.dispatchCommand(INSERT_VIBE_BANNER_COMMAND, undefined);
  }

  return (
    <button className={`group ${tool_layout} ${tool_hover_style}`} onClick={applyVibeBanner}>
      <img src={vibeBanner} alt="Vibe Banner" className="w-full" />
      <div className={tool_tooltip_style}>
        Vibe Banner
      </div>
    </button>
  );
}

async function sendToBackend(file: File) {
  const formData = new FormData();
  formData.append('audio', file);

  const res = await fetch('http://localhost:3000/voice-to-text', {
    method: 'POST',
    body: formData,
  });

  return res.json();
}

function VoiceToTextToolbarPlugin() {
  const [editor] = useLexicalComposerContext();

  const [isListening, setIsListening] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const waveformBarsRef = useRef<number[]>([]);
  const userStreamRef = useRef<MediaStream | null>(null);
  const drawWaveform = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext("2d");
    const analyser = analyserRef.current;
    if (!canvasCtx || !analyser) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      waveformBarsRef.current.push(avg);

      canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = 2;
      const barGap = 1;
      const totalBars = Math.floor(canvas.width / (barWidth + barGap));
      const bars = waveformBarsRef.current.slice(-totalBars).reverse();

      bars.forEach((value, i) => {
        const barHeight = (value / 255) * canvas.height;
        const x = canvas.width - (i + 1) * (barWidth + barGap);
        const y = (canvas.height - barHeight) / 2;
        canvasCtx.fillStyle = "#666";
        canvasCtx.fillRect(x, y, barWidth, barHeight);
      });

      if (waveformBarsRef.current.length > totalBars) {
        waveformBarsRef.current = waveformBarsRef.current.slice(-totalBars);
      }
    };

    draw();
  };

  const startRecording = async () => {
    try {
      const userStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      userStreamRef.current = userStream;
      // the sound wave ui analyzer

      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 128;
      const source = audioContext.createMediaStreamSource(userStream);
      source.connect(analyser);
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      waveformBarsRef.current = [];
      drawWaveform();

      const recorder = new MediaRecorder(userStream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });

        const file = new File([blob], 'voice.webm', { type: 'audio/webm' });
        setIsTranslating(true);
        const { text } = await sendToBackend(file);
        setIsTranslating(false);
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            selection.insertText(text);
          }
        });

        userStream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setIsListening(true);
    } catch (err) {
      console.error('麥克風權限取得失敗:', err);
      setIsListening(false);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsListening(false);
  }

  const cancelRecording = () => {
    // Stop recorder if still running
    if (mediaRecorderRef.current?.state === 'recording') {
      // 移除 onstop 事件處理器
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
    }
  
    // 清空 chunks
    chunksRef.current = [];
  
    // 停止並釋放所有 audio stream
    if (userStreamRef.current) {
      userStreamRef.current.getTracks().forEach(track => track.stop());
      userStreamRef.current = null;
    }
  
    // 清除 MediaRecorder
    mediaRecorderRef.current = null;
  
    // 更新 UI 狀態
    setIsListening(false);
  };

  
  return (
    <>
      {isTranslating ? (
        <div className={`group ${tool_layout} flex items-center`}>
          <img src={bouncingCircles} alt="Translating" className="w-full" />
        </div>
      ) : (
        <button className={`group ${tool_layout} ${tool_hover_style}`} onClick={() => {
            if (isListening) {
              stopRecording();
            } else {
            startRecording();
          }
        }}>
        <img src={isListening ? micFill : mic} alt="Voice to Text" className="w-full" />
        <div className={tool_tooltip_style}>
          {isListening ? 'Stop Listening' : 'Voice to Text'}
        </div>

        <div className={`absolute z-10 left-1/2 -translate-x-1/2 -top-15 px-2 bg-white border border-gray-300 rounded-lg ${!isListening && 'hidden'}`}>
          <canvas
            ref={canvasRef}
            width={160}
            height={40}
          />
        </div>
      </button>)}

      <button 
        className={`group ${tool_layout} ${!isListening ? 'opacity-20 cursor-not-allowed' : tool_hover_style}`} 
        onClick={() => {
          if (isListening) {
            cancelRecording();
          }
        }}
        disabled={!isListening}
      >
        <img src={xCircle} alt="Cancel" className="w-full" />
        <div className={tool_tooltip_style}>
          Cancel
        </div>
      </button>
    </>
  )
}

export default function ToolbarPlugin() {
  return (
    <div className="border border-gray-300 rounded-t-xl flex items-center p-1">
      <VoiceToTextToolbarPlugin />
      <span className="inline-block w-[1px] h-10 bg-gray-300 mx-2"></span>
      <UnRedoToolbarPlugin />
      <span className="inline-block w-[1px] h-10 bg-gray-300 mx-2"></span>
      <HeadingPlugin />
      <span className="inline-block w-[1px] h-10 bg-gray-300 mx-2"></span>
      <FontStyleToolbarPlugin />
      <span className="inline-block w-[1px] h-10 bg-gray-300 mx-2"></span>
      <ListToolbarPlugin />
      <span className="inline-block w-[1px] h-10 bg-gray-300 mx-2"></span>
      <VibeBannerToolbarPlugin />
    </div>
  )
}