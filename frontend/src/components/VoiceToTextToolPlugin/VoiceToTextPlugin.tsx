import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useCallback, useMemo, useState } from 'react';
import { useRef } from 'react';
import { $getSelection, $isRangeSelection } from 'lexical';

import mic from '../../assets/mic.svg';
import micFill from '../../assets/mic-fill.svg';
import xCircle from '../../assets/x-circle.svg';
import bouncingCircles from '../../assets/bouncing-circles.svg';
import { tool_hover_style, tool_layout, tool_tooltip_style } from '../ToolbarPlugin/styles';

const soundBarWidth = 2;
const soundBarGap = 1;
const soundBarColor = "#666";
const maxVoiceAmplitude = 255;

async function sendToBackend(file: File) {
    const formData = new FormData();
    formData.append('audio', file);
  
    const res = await fetch('http://localhost:3000/voice-to-text', {
      method: 'POST',
      body: formData,
    });
  
    return res.json();
}


export default function VoiceToTextToolPlugin() {
    const [editor] = useLexicalComposerContext();
  
    const [isListening, setIsListening] = useState(false);
    const [isTranslating, setIsTranslating] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<BlobPart[]>([]);
    const userStreamRef = useRef<MediaStream | null>(null);
  
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animationRef = useRef<number | null>(null);
    const allFramesAvgAmplitude = useRef<number[]>([]);

    const getCurFrameAvgAmplitude = (dataArray: Uint8Array) => (
      dataArray.reduce((a, b) => a + b, 0) / dataArray.length
    );

    const clearCanvasContent = () => {
      const canvas = canvasRef.current;
      const canvasCtx = canvas?.getContext("2d");

      if (!canvas || !canvasCtx) return;

      canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
    }

    const drawSoundBar = (avgAmplitude: number, i: number) => {
      if (!canvasRef.current || !analyserRef.current) return;

      const canvas = canvasRef.current;
      const canvasCtx = canvas?.getContext("2d");

      const rightMostX = canvas?.width;
      const allRightBarsWidth = i * (soundBarWidth + soundBarGap);
      const startX = rightMostX - allRightBarsWidth;
      
      const heightFromAmplitude = (avgAmplitude / maxVoiceAmplitude) * canvas.height;
      const restEmptyHeight = canvas.height - heightFromAmplitude;
      const startY = restEmptyHeight / 2;

      canvasCtx!.fillStyle = soundBarColor;
      canvasCtx!.fillRect(startX, startY, soundBarWidth, heightFromAmplitude);
    }

    const drawSoundWaveCanvas = useCallback(() => {
      if (!canvasRef.current || !analyserRef.current) return;
      const canvas = canvasRef.current;
      const analyser = analyserRef.current;
      
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const drawStartToCurVoiceFrame = () => {
        animationRef.current = requestAnimationFrame(drawStartToCurVoiceFrame);
        analyser.getByteFrequencyData(dataArray);
  
        const curFrameAvgAmplitude = getCurFrameAvgAmplitude(dataArray);
        allFramesAvgAmplitude.current.push(curFrameAvgAmplitude);
  
        clearCanvasContent();
  
        const barCapacity = Math.floor(canvas.width / (soundBarWidth + soundBarGap));
        const visibleOldToNewAmplitudes = allFramesAvgAmplitude.current.slice(-barCapacity).reverse();
        visibleOldToNewAmplitudes.forEach(drawSoundBar);
  
        if (allFramesAvgAmplitude.current.length > barCapacity) {
          allFramesAvgAmplitude.current = allFramesAvgAmplitude.current.slice(-barCapacity);
        }
      };
  
      drawStartToCurVoiceFrame();
    }, []);
  
    const startRecording = useCallback(async () => {
      try {
        const userStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        userStreamRef.current = userStream;

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
        
        // the sound wave ui analyzer
        const audioContext = new AudioContext();
        const analyser = audioContext.createAnalyser();

        analyserRef.current = analyser;
        analyser.fftSize = 128;
        const source = audioContext.createMediaStreamSource(userStream);
        source.connect(analyser);

        allFramesAvgAmplitude.current = [];
        drawSoundWaveCanvas();
      } catch (err) {
        console.error('麥克風權限取得失敗:', err);
        setIsListening(false);
      }
    }, [drawSoundWaveCanvas, editor]);
  
    const stopRecording = useCallback(() => {
      mediaRecorderRef.current?.stop();
      setIsListening(false);
    }, []);

    const toggleRecording = useCallback(() => {
      if (isListening) {
        stopRecording();
      } else {
        startRecording();
      }
    }, [isListening, startRecording, stopRecording]);
  
    const VoiceToTextButton = useMemo(() => {
      return isTranslating ? (
        <div className={`group ${tool_layout} flex items-center`}>
          <img src={bouncingCircles} alt="Translating" className="w-full" />
        </div>
      ) : (
        <button className={`group ${tool_layout} ${tool_hover_style}`} onClick={toggleRecording}>
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
        </button>
      )
    }, [isListening, isTranslating, toggleRecording]);

  const cancelRecording = useCallback(() => {
    if (!isListening) return;

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
  
    setIsListening(false);
  }, [isListening]);

  const RemoveVoiceButton = useMemo(() => {
    return (
      <button 
        className={`group ${tool_layout} ${!isListening ? 'opacity-20 cursor-not-allowed' : tool_hover_style}`} 
        onClick={cancelRecording}
        disabled={!isListening}
      >
        <img src={xCircle} alt="Cancel" className="w-full" />
        <div className={tool_tooltip_style}>
          Cancel
        </div>
      </button>
    )
  }, [isListening, cancelRecording]);
  
    
  return (
    <>
      {VoiceToTextButton}
      {RemoveVoiceButton}
    </>
  )
}