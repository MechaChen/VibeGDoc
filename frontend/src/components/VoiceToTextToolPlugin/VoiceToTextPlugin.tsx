import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useState } from 'react';
import { useRef } from 'react';
import { $getSelection, $isRangeSelection } from 'lexical';

import mic from '../../assets/mic.svg';
import micFill from '../../assets/mic-fill.svg';
import xCircle from '../../assets/x-circle.svg';
import bouncingCircles from '../../assets/bouncing-circles.svg';
import { tool_hover_style, tool_layout, tool_tooltip_style } from '../ToolbarPlugin/styles';

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