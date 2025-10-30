import React, { useState, useRef, useEffect } from 'react';
import { VOICE_OPTIONS } from '../constants';
import { type LiveSession, type Product, type VoiceOption } from '../types';
import Button from './ui/Button';
import Select from './ui/Select';
import ProductCard from './ProductCard';
import AddProductModal from './AddProductModal';
import ProductDetailsPanel from './ProductDetailsPanel';
import { generateSpeech } from '../services/geminiService';
import { decode, decodeAudioData } from '../utils/audioUtils';

interface LiveSetupProps {
  products: Product[];
  onStartLive: (session: LiveSession) => void;
  onAddProduct: (product: Product) => void;
}

const LiveSetup = ({ products, onStartLive, onAddProduct }: LiveSetupProps) => {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(products[0]?.id || null);
  const [voiceOptions, setVoiceOptions] = useState<VoiceOption[]>(VOICE_OPTIONS);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>(voiceOptions[0].id);
  const [backgroundImageUrl, setBackgroundImageUrl] = useState('https://picsum.photos/seed/bg/1280/720'); // Not in UI, but needed for session
  const [title, setTitle] = useState('Minha Super Live de Vendas!'); // Not in UI, but needed for session
  const [isLoading, setIsLoading] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const activeAudioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    // Cleanup audio context on component unmount
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(console.error);
      }
    };
  }, []);
  
  const selectedProduct = products.find(p => p.id === selectedProductId);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) {
      alert('Por favor, selecione um produto para iniciar a live.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const selectedVoice = voiceOptions.find(v => v.id === selectedVoiceId) || voiceOptions[0];
      onStartLive({
        title,
        product: selectedProduct,
        voice: selectedVoice,
        backgroundImageUrl,
      });
      setIsLoading(false);
    }, 1500);
  };

  const handleAddProduct = (newProduct: Product) => {
    onAddProduct(newProduct);
    setSelectedProductId(newProduct.id);
    setIsProductModalOpen(false);
  }

  const handlePreviewVoice = async () => {
    if (isPreviewing) return;

    if (activeAudioSourceRef.current) {
      activeAudioSourceRef.current.stop();
      activeAudioSourceRef.current = null;
    }

    setIsPreviewing(true);

    try {
      const selectedVoice = voiceOptions.find(v => v.id === selectedVoiceId);
      if (!selectedVoice) throw new Error("Voz selecionada não encontrada.");
      
      const sampleText = "Olá! Bem-vindo à nossa live de vendas. Este é um teste da minha voz.";
      
      const base64Audio = await generateSpeech(sampleText, selectedVoice.id);
      if (!base64Audio) throw new Error("Falha ao gerar o áudio da prévia.");

      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContext({ sampleRate: 24000 });
      } else if (audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume();
      }

      const audioBytes = decode(base64Audio);
      const audioBuffer = await decodeAudioData(audioBytes, audioContextRef.current, 24000, 1);

      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.onended = () => {
        setIsPreviewing(false);
        activeAudioSourceRef.current = null;
      };
      source.start();
      activeAudioSourceRef.current = source;

    } catch (error) {
      console.error("Erro ao pré-visualizar a voz:", error);
      alert("Não foi possível carregar a prévia da voz. Tente novamente.");
      setIsPreviewing(false);
    }
  };


  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Panel: Configuration */}
        <div className="lg:col-span-1 space-y-6">
          {selectedProduct ? (
            <ProductDetailsPanel product={selectedProduct} />
          ) : (
             <div className="bg-secondary rounded-xl border border-border-color p-8 text-center text-text-dark flex flex-col justify-center h-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-border-color" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                <h3 className="mt-4 text-lg font-semibold text-text-light">Nenhum produto selecionado</h3>
                <p className="mt-1 text-sm">Por favor, adicione ou selecione um produto para configurar a sua live.</p>
            </div>
          )}
          
          <div className="bg-secondary rounded-xl border border-border-color p-4 space-y-4">
              <h3 className="text-lg font-semibold text-text-light px-2">Configurações de Voz</h3>
              <div className="flex items-center space-x-2">
                <Select id="voice" value={selectedVoiceId} onChange={(e) => setSelectedVoiceId(e.target.value)} className="flex-grow">
                    {voiceOptions.map(voice => (
                       <option key={voice.id} value={voice.id}>{voice.name} - {voice.style}</option>
                    ))}
                </Select>
                 <button 
                    type="button" 
                    onClick={handlePreviewVoice}
                    disabled={isPreviewing}
                    className="flex-shrink-0 p-3 bg-primary hover:bg-accent disabled:opacity-50 disabled:cursor-wait rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
                    aria-label="Ouvir prévia da voz"
                >
                    {isPreviewing ? (
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-text-light" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                    )}
                </button>
              </div>
          </div>

          <Button type="submit" className="w-full !py-4 text-lg" disabled={isLoading || !selectedProduct} onClick={handleSubmit}>
              {isLoading ? 'Gerando...' : 'Go Live'}
          </Button>
        </div>

        {/* Right Panel: Product Selection */}
        <div className="lg:col-span-2">
           <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-text-light">Selecione um Produto</h2>
              <button 
                type="button" 
                onClick={() => setIsProductModalOpen(true)}
                className="text-sm text-accent hover:text-accent-hover font-semibold"
              >
                + Adicionar Novo Produto
              </button>
            </div>
            {products.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {products.map(product => (
                    <ProductCard 
                    key={product.id}
                    product={product}
                    isSelected={selectedProductId === product.id}
                    onSelect={() => setSelectedProductId(product.id)}
                    />
                ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-96 bg-secondary rounded-xl border-2 border-dashed border-border-color">
                    <p className="text-text-dark">Nenhum produto cadastrado.</p>
                    <p className="text-sm text-text-dark">Clique em "Adicionar Novo Produto" para começar.</p>
                </div>
            )}
        </div>
      </div>
      
      {isProductModalOpen && (
        <AddProductModal 
          onClose={() => setIsProductModalOpen(false)}
          onAddProduct={handleAddProduct}
        />
      )}
    </>
  );
};

export default LiveSetup;