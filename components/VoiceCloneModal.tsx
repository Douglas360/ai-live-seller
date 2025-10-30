import React, { useState, useRef, useEffect } from 'react';
import Button from './ui/Button';
import Card from './ui/Card';

interface VoiceCloneModalProps {
  onClose: () => void;
  onVoiceCreated: () => void;
}

type RecordingStatus = 'idle' | 'recording' | 'recorded' | 'processing';

const PHRASES_TO_RECORD = [
    "Olá, bem-vindo à minha live de vendas. Hoje temos um produto incrível para você.",
    "Não perca esta oportunidade única, clique no link da bio para comprar agora!",
    "Este produto vai transformar a sua rotina e trazer muito mais praticidade."
];

const VoiceCloneModal = ({ onClose, onVoiceCreated }: VoiceCloneModalProps) => {
  const [status, setStatus] = useState<RecordingStatus>('idle');
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [recordedBlobs, setRecordedBlobs] = useState<Blob[]>([]);
  const [currentAudioURL, setCurrentAudioURL] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const cleanupRecorder = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    mediaRecorderRef.current = null;
    audioChunksRef.current = [];
    if (currentAudioURL) {
        URL.revokeObjectURL(currentAudioURL);
        setCurrentAudioURL(null);
    }
  };
  
  useEffect(() => {
    return cleanupRecorder;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const handleStartRecording = async () => {
    cleanupRecorder();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = event => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setRecordedBlobs(prev => {
            const newBlobs = [...prev];
            newBlobs[currentPhraseIndex] = audioBlob;
            return newBlobs;
        });
        setCurrentAudioURL(url);
        setStatus('recorded');
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setStatus('recording');
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Não foi possível acessar o microfone. Por favor, verifique suas permissões.");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && status === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const handleNext = () => {
      if (currentPhraseIndex < PHRASES_TO_RECORD.length - 1) {
          setCurrentPhraseIndex(prev => prev + 1);
          setStatus('idle');
          cleanupRecorder();
      } else {
          // All phrases recorded, start processing
          handleProcessVoice();
      }
  }

  const handleProcessVoice = () => {
    setStatus('processing');
    cleanupRecorder();
    // Simulate a network request and model training
    setTimeout(() => {
      onVoiceCreated();
    }, 3000);
  };
  
  const isCurrentPhraseRecorded = !!recordedBlobs[currentPhraseIndex];

  const renderContent = () => {
    if (status === 'processing') {
         return (
           <div className="flex flex-col items-center justify-center space-y-4 my-8">
               <svg className="animate-spin h-10 w-10 text-accent" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-text-light font-semibold">Processando sua voz...</p>
              <p className="text-text-dark text-sm">Isso pode levar alguns segundos.</p>
           </div>
        );
    }

    return (
        <>
            <div className="mb-4">
                <p className="text-sm text-accent font-semibold">Frase {currentPhraseIndex + 1} de {PHRASES_TO_RECORD.length}</p>
                <div className="w-full bg-primary h-2 rounded-full mt-1">
                    <div className="bg-accent h-2 rounded-full" style={{ width: `${((currentPhraseIndex + 1) / PHRASES_TO_RECORD.length) * 100}%` }}></div>
                </div>
            </div>

            <p className="text-center font-semibold text-text-light p-4 bg-primary rounded-lg mb-6 min-h-[100px] flex items-center justify-center">
                "{PHRASES_TO_RECORD[currentPhraseIndex]}"
            </p>

            {status === 'recording' && (
                 <div className="flex flex-col items-center justify-center mb-6">
                    <div className="w-12 h-12 bg-red-500 rounded-full animate-pulse flex items-center justify-center mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                    </div>
                    <p className="text-text-light font-semibold">Gravando...</p>
                 </div>
            )}

            {status === 'recorded' && currentAudioURL && (
                <div className="mb-4">
                     <audio src={currentAudioURL} controls className="w-full"></audio>
                </div>
            )}

            <div className="flex items-center space-x-3">
                {status === 'idle' && <Button onClick={handleStartRecording} className="w-full">Gravar</Button>}
                {status === 'recording' && <Button onClick={handleStopRecording} className="w-full" variant="danger">Parar</Button>}
                {status === 'recorded' && <Button onClick={handleStartRecording} className="w-full">Gravar Novamente</Button>}
                 
                <Button onClick={handleNext} className="w-full" disabled={!isCurrentPhraseRecorded}>
                     {currentPhraseIndex < PHRASES_TO_RECORD.length - 1 ? 'Próxima Frase' : 'Criar Voz'}
                </Button>
            </div>
        </>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-dark hover:text-text-light transition-colors"
          aria-label="Close modal"
          disabled={status === 'processing'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 className="text-2xl font-bold mb-2 text-text-light">Use Sua Voz</h2>
        <p className="text-text-dark mb-6">Grave algumas frases para que possamos criar um modelo de voz personalizado para você.</p>
        
        {renderContent()}
      </Card>
    </div>
  );
};

export default VoiceCloneModal;
