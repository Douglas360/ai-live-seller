import React, { useState, useEffect, useCallback, useRef } from 'react';
import { type LiveSession, type Comment, type SpeechSegment, type SegmentStatus, type SegmentType } from '../types';
import StreamPreview from './StreamPreview';
import ControlPanel from './control_panel/ControlPanel';
import { generateNarrationBlock, generateSpeech, type SalesTactic } from '../services/geminiService';
import { decode, decodeAudioData } from '../utils/audioUtils';
import Button from './ui/Button';

interface LiveDashboardProps {
  session: LiveSession;
  onEndLive: () => void;
  onError: (message: string) => void;
}

const SCRIPT_QUEUE_SIZE = 3;
const SALES_TACTICS: SalesTactic[] = ['focus_quality', 'create_urgency', 'social_proof', 'highlight_promo'];
const FRAME_CAPTURE_INTERVAL_MS = 10000;
const MAX_PROCESSED_COMMENTS_HISTORY = 50; // Keep track of the last 50 responded comments to avoid duplicates.

// This regex helps remove emojis and common markdown characters that can cause TTS to fail.
const SANITIZATION_REGEX = /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]|\*|_|~|`)/g;

const LiveDashboard = ({ session, onEndLive, onError }: LiveDashboardProps) => {
  const [currentNarrationLine, setCurrentNarrationLine] = useState('Gerando narração inicial...');
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isCommentAnalysisActive, setIsCommentAnalysisActive] = useState(false);
  const [script, setScript] = useState<SpeechSegment[]>([]);
  const [isScreenShared, setIsScreenShared] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [processedCommentKeys, setProcessedCommentKeys] = useState<string[]>([]);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeLoopsRef = useRef({ generation: false, playback: false });
  const videoRefForCapture = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'));
  const currentFrameRef = useRef<string | null>(null);

  const handleShareScreen = async () => {
    try {
      // Create and resume AudioContext on user interaction to prevent it from starting in a suspended state.
      if (!audioContextRef.current) {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        const contextOptions: AudioContextOptions = {};
        if (session.voice.provider === 'google') {
          contextOptions.sampleRate = 24000;
        }
        audioContextRef.current = new AudioContext(contextOptions);
      }
      
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      setMediaStream(stream);
      setIsScreenShared(true);
    } catch (error) {
      console.error("Error accessing screen share:", error);
      onError("Failed to start screen sharing. Please check browser permissions.");
    }
  };

  const handleToggleCommentAnalysis = () => {
    setIsCommentAnalysisActive(prev => !prev);
  };

  useEffect(() => {
    if (!mediaStream) {
        return;
    }

    const videoTrack = mediaStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.onended = () => {
        setIsScreenShared(false);
        setMediaStream(null);
      };
    }

    return () => {
      mediaStream.getTracks().forEach(track => track.stop());
    }
  }, [mediaStream]);


  useEffect(() => {
    const frameCaptureInterval = setInterval(() => {
      if (mediaStream && !videoRefForCapture.current) {
         videoRefForCapture.current = document.createElement('video');
         videoRefForCapture.current.autoplay = true;
         videoRefForCapture.current.muted = true;
         videoRefForCapture.current.srcObject = mediaStream;
         videoRefForCapture.current.play().catch(()=>{});
      }

      if (videoRefForCapture.current && videoRefForCapture.current.readyState >= 2) {
          const video = videoRefForCapture.current;
          const canvas = canvasRef.current;
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          if (ctx) {
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              currentFrameRef.current = canvas.toDataURL('image/jpeg', 0.5);
          }
      }
    }, FRAME_CAPTURE_INTERVAL_MS);

    return () => {
        clearInterval(frameCaptureInterval);
        if (videoRefForCapture.current) {
            videoRefForCapture.current.srcObject = null;
        }
        videoRefForCapture.current = null;
    }
  }, [mediaStream]);

  const playAudio = useCallback(async (base64Audio: string) => {
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      return Promise.reject(new Error("AudioContext is not available."));
    }
    
    // Automatically resume the AudioContext if it was suspended by the browser.
    if (audioContextRef.current.state === 'suspended') {
      try {
        await audioContextRef.current.resume();
      } catch (e) {
        console.error("Error resuming AudioContext:", e);
        onError("O áudio foi bloqueado. Clique na página para reativá-lo.");
        return Promise.reject(e);
      }
    }

    return new Promise<void>(async (resolve, reject) => {
        try {
            const audioBytes = decode(base64Audio);
            const audioBuffer = await decodeAudioData(audioBytes, audioContextRef.current!, session.voice.provider);
            
            if (!activeLoopsRef.current.playback || !audioContextRef.current || audioContextRef.current.state === 'closed') {
                return reject(new Error("Playback stopped post-decode"));
            }
            
            const source = audioContextRef.current.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContextRef.current.destination);
            source.onended = () => resolve();
            source.start();
        } catch (error) {
            console.error("Failed to play audio:", error);
            reject(error);
        }
    });
  }, [onError, session.voice.provider]);

  const updateSegmentStatus = (segmentId: string, status: SegmentStatus) => {
    setScript(prev => prev.map(s => s.id === segmentId ? { ...s, status } : s));
  };
  
  const handleDeleteSegment = useCallback((segmentId: string) => {
    setScript(prev => prev.filter(s => s.id !== segmentId));
  }, []);

  const handleEditSegment = useCallback(async (segmentId: string, newText: string) => {
    const segmentToEdit = script.find(s => s.id === segmentId);
    if (!segmentToEdit || segmentToEdit.status !== 'queued') {
        console.warn("Can only edit queued segments.");
        return;
    }

    const originalTextLines = newText.split('\n').filter(line => line.trim() !== '');
    const sanitizedTextLines = originalTextLines
        .map(line => line.replace(SANITIZATION_REGEX, '').trim())
        .filter(line => line.length > 0);

    if (sanitizedTextLines.length === 0) return;

    try {
        const audioPromises = sanitizedTextLines.map(line => generateSpeech(line, session.voice.id, session.voice.provider));
        const newAudioData = await Promise.all(audioPromises);

        setScript(prev => prev.map(s => 
            s.id === segmentId 
            ? {
                ...s,
                textLines: sanitizedTextLines,
                audioData: newAudioData,
                estimatedDuration: Math.round(sanitizedTextLines.join(' ').length / 15),
            } 
            : s
        ));
    } catch (error) {
        console.error("Failed to process edited segment:", error);
        if (error instanceof Error) {
            onError(`Error updating script: ${error.message}`);
        } else {
            onError("An unknown error occurred while updating the script.");
        }
    }
  }, [script, session.voice.id, session.voice.provider, onError]);

  const handleAddSegment = useCallback(async (text: string) => {
    const originalTextLines = text.split('\n').filter(line => line.trim() !== '');
    const sanitizedTextLines = originalTextLines
        .map(line => line.replace(SANITIZATION_REGEX, '').trim())
        .filter(line => line.length > 0);
        
    if (sanitizedTextLines.length === 0) return;

    try {
        const audioPromises = sanitizedTextLines.map(line => generateSpeech(line, session.voice.id, session.voice.provider));
        const audioData = await Promise.all(audioPromises);
        
        const newSegment: SpeechSegment = {
            id: `seg_manual_${Date.now()}`,
            type: 'pitch',
            status: 'queued',
            textLines: sanitizedTextLines,
            audioData: audioData,
            estimatedDuration: Math.round(sanitizedTextLines.join(' ').length / 15),
        };

        setScript(prev => [...prev, newSegment]);

    } catch (error) {
        console.error("Failed to add manual script:", error);
        if (error instanceof Error) {
            onError(`Error adding script: ${error.message}`);
        } else {
            onError("An unknown error occurred while adding the script.");
        }
    }
  }, [session.voice.id, session.voice.provider, onError]);

  const handleReorderScript = useCallback((startIndex: number, endIndex: number) => {
    setScript(prevScript => {
        const result = Array.from(prevScript);
        
        if (startIndex < 0 || startIndex >= result.length || endIndex < 0 || endIndex >= result.length) {
            return prevScript;
        }

        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);

        return result;
    });
  }, []);


  useEffect(() => {
    if (!isScreenShared) {
      return;
    }
    
    activeLoopsRef.current = { generation: true, playback: true };

    // --- SCRIPT GENERATION LOOP ---
    const generationLoop = async () => {
      while (activeLoopsRef.current.generation) {
        let shouldGenerate = false;
        setScript(prevScript => {
          const queuedCount = prevScript.filter(s => s.status === 'queued' || s.status === 'speaking').length;
          if (queuedCount < SCRIPT_QUEUE_SIZE) {
            shouldGenerate = true;
          }
          return prevScript;
        });

        if (shouldGenerate) {
            try {
                let recentHistory: string[] = [];
                setScript(prevScript => {
                    const historySegments = prevScript.slice(-4);
                    recentHistory = historySegments.flatMap(s => s.textLines);
                    return prevScript;
                });
                
                const salesTactic = SALES_TACTICS[Math.floor(Math.random() * SALES_TACTICS.length)];
                
                const frameForAnalysis = isCommentAnalysisActive ? currentFrameRef.current : null;
                currentFrameRef.current = null; // Consume the frame

                const { script: textLines, comments: newlyRespondedComments } = await generateNarrationBlock(session.product, recentHistory, salesTactic, frameForAnalysis, processedCommentKeys);
                if (!activeLoopsRef.current.generation) break;
                
                if (isLoading) {
                    setIsLoading(false);
                }

                if (newlyRespondedComments.length > 0) {
                    setComments(prev => [...newlyRespondedComments, ...prev.slice(0, 49 - newlyRespondedComments.length)]);
                    
                    const getCommentKey = (c: Comment) => `${c.username.trim()}:${c.text.trim()}`;
                    const newKeys = newlyRespondedComments.map(getCommentKey);

                    setProcessedCommentKeys(prevKeys => {
                        const combined = [...prevKeys, ...newKeys.filter(k => !prevKeys.includes(k))];
                        if (combined.length > MAX_PROCESSED_COMMENTS_HISTORY) {
                            return combined.slice(combined.length - MAX_PROCESSED_COMMENTS_HISTORY);
                        }
                        return combined;
                    });
                }
                
                const sanitizedTextLines = textLines
                    .map(line => line.replace(SANITIZATION_REGEX, '').trim())
                    .filter(line => line.length > 0);

                if (sanitizedTextLines.length > 0) {
                    const audioPromises = sanitizedTextLines.map(line => generateSpeech(line, session.voice.id, session.voice.provider));
                    const audioData = await Promise.all(audioPromises);
                    if (!activeLoopsRef.current.generation) break;

                    const segmentType: SegmentType = newlyRespondedComments.length > 0 ? 'response' : 'pitch';

                    const newSegment: SpeechSegment = {
                        id: `seg_${Date.now()}`,
                        type: segmentType,
                        status: 'queued',
                        textLines: sanitizedTextLines,
                        audioData: audioData,
                        estimatedDuration: Math.round(sanitizedTextLines.join(' ').length / 15),
                        sourceComments: newlyRespondedComments.length > 0 ? newlyRespondedComments : undefined,
                        commentCount: newlyRespondedComments.length > 0 ? newlyRespondedComments.length : undefined,
                    };
                    
                    setScript(prev => [...prev, newSegment]);
                    
                    // Add a delay after generating a new script to allow narration to catch up.
                    await new Promise(r => setTimeout(r, 5000));


                } else {
                    console.warn("Generated script contained no valid text lines after sanitization. Skipping segment.");
                }

            } catch (error) {
                console.error("Error in generation loop:", error);
                if (error instanceof Error) {
                    let message = error.message;
                    if (message.includes('API key not valid')) {
                        message = 'The provided API key is not valid. Please check your configuration.';
                    } else if (message.toLowerCase().includes('quota')) {
                        message = 'You have exceeded your API quota. Please check your billing or try again later.';
                    }
                    onError(message);
                } else {
                    onError('An unknown error occurred while generating the script.');
                }

                if (isLoading) {
                    setIsLoading(false);
                }
                await new Promise(r => setTimeout(r, 10000));
            }
        } else {
          await new Promise(r => setTimeout(r, 3000));
        }
      }
    };
    
    // --- SCRIPT PLAYBACK LOOP ---
    const playbackLoop = async () => {
        while(activeLoopsRef.current.playback) {
            if (isPaused) {
                await new Promise(r => setTimeout(r, 200));
                continue;
            }

            let nextSegment: SpeechSegment | undefined;
            setScript(currentScript => {
                const isSpeaking = currentScript.some(s => s.status === 'speaking');
                if (isSpeaking) {
                    return currentScript;
                }
                const queuedSegments = currentScript.filter(s => s.status === 'queued');
                if (queuedSegments.length > 0) {
                    nextSegment = queuedSegments[0];
                }
                return currentScript;
            });

            if (nextSegment) {
                setIsSpeaking(true);
                const segment = nextSegment;
                updateSegmentStatus(segment.id, 'speaking');

                for (const [lineIndex, line] of segment.textLines.entries()) {
                    if (!activeLoopsRef.current.playback || isPaused) break;
                    setCurrentNarrationLine(line);
                    const audioData = segment.audioData[lineIndex];
                    if (audioData) {
                        try {
                            await playAudio(audioData);
                        } catch (e) {
                            console.error("Playback failed, stopping loop.", e);
                            break; 
                        }
                    }
                }
                
                setIsSpeaking(false);
                setCurrentNarrationLine('Aguardando próximo bloco de narração...');
                updateSegmentStatus(segment.id, 'completed');

            } else {
                await new Promise(r => setTimeout(r, 200));
            }
        }
    };
    
    generationLoop();
    playbackLoop();

    return () => {
      activeLoopsRef.current = { generation: false, playback: false };
    };
  }, [isScreenShared, isPaused, playAudio, session.product, session.voice.id, session.voice.provider, processedCommentKeys, isLoading, onError, isCommentAnalysisActive]);

  // This effect handles the lifecycle of the AudioContext, ensuring it's closed on unmount.
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(console.error);
        audioContextRef.current = null;
      }
    };
  }, []);


  if (!isScreenShared) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center bg-secondary rounded-xl border border-border-color p-8">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-accent mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          <h2 className="text-2xl font-bold text-text-light mb-2">Share your screen to begin</h2>
          <p className="text-text-dark mb-6 max-w-md">For the AI to see comments and interact with the audience, you need to share your TikTok live stream screen.</p>
          <Button onClick={handleShareScreen}>
            Share Screen
          </Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
      <div className="lg:col-span-2 flex flex-col space-y-4">
        <StreamPreview 
          product={session.product} 
          currentScriptLine={currentNarrationLine}
          stream={mediaStream}
        />
        <div className="relative bg-secondary rounded-xl border border-border-color p-4 flex-grow">
            <div className="absolute inset-0 bg-black/30 rounded-xl flex items-center justify-center opacity-0 transition-opacity pointer-events-none" style={{ opacity: isLoading ? 1 : 0 }}>
                <div className="flex flex-col items-center text-center p-4">
                    <svg className="animate-spin h-8 w-8 text-white mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-text-light font-semibold text-lg">AI is warming up...</p>
                    <p className="text-text-dark text-sm">Generating initial script, please wait.</p>
                </div>
            </div>
            
            <div className="flex flex-col h-full">
              <h3 className="text-lg font-bold text-text-light mb-2">Live Status</h3>
              <div className="flex items-center space-x-4 mb-4 text-sm flex-wrap gap-y-2">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-text-dark">Status:</span>
                  <span className={`font-bold ${isSpeaking ? 'text-accent' : 'text-green-400'}`}>{isSpeaking ? 'Speaking' : 'Listening'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-text-dark">Voice:</span>
                  <span className="text-text-light">{session.voice.name}</span>
                </div>
                 <div className="flex items-center space-x-2">
                  <span className="font-semibold text-text-dark">AI Paused:</span>
                  <span className={`font-bold ${isPaused ? 'text-yellow-400' : 'text-text-light'}`}>{isPaused ? 'Yes' : 'No'}</span>
                </div>
                 <div className="flex items-center space-x-2">
                  <span className="font-semibold text-text-dark">AI Vision:</span>
                  <span className={`font-bold ${isCommentAnalysisActive ? 'text-blue-400' : 'text-text-light'}`}>{isCommentAnalysisActive ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
              <div className="bg-primary p-4 rounded-lg flex-grow">
                 <p className="text-sm text-text-dark">Current Line:</p>
                 <p className="text-lg font-semibold text-text-light min-h-[50px] flex items-center">
                    {currentNarrationLine}
                    {isSpeaking && <span className="inline-block w-2 h-2 bg-accent rounded-full ml-2 animate-pulse"></span>}
                 </p>
              </div>
            </div>
        </div>
      </div>

      <div className="lg:col-span-1 flex flex-col min-h-0">
        <ControlPanel 
          script={script}
          comments={comments}
          isPaused={isPaused}
          isCommentAnalysisActive={isCommentAnalysisActive}
          onToggleCommentAnalysis={handleToggleCommentAnalysis}
          onPauseToggle={() => setIsPaused(p => !p)}
          onStop={onEndLive}
          onEditSegment={handleEditSegment}
          onDeleteSegment={handleDeleteSegment}
          onAddSegment={handleAddSegment}
          onReorderScript={handleReorderScript}
        />
      </div>
    </div>
  );
};

export default LiveDashboard;