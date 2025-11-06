import React, { useState } from 'react';
import Button from './ui/Button';
import Card from './ui/Card';
import Input from './ui/Input';

interface SupabaseConfigModalProps {
  onSave: () => void;
}

const SupabaseConfigModal = ({ onSave }: SupabaseConfigModalProps) => {
  const [url, setUrl] = useState(localStorage.getItem('supabaseUrl') || '');
  const [anonKey, setAnonKey] = useState(localStorage.getItem('supabaseAnonKey') || '');
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!url.trim() || !anonKey.trim()) {
      setError('Ambos os campos são obrigatórios.');
      return;
    }
    
    // Basic validation
    if (!url.startsWith('http')) {
        setError('A URL do Supabase deve começar com http ou https.');
        return;
    }

    localStorage.setItem('supabaseUrl', url.trim());
    localStorage.setItem('supabaseAnonKey', anonKey.trim());
    setError('');
    onSave();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg relative">
        <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-accent mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4M4 7l8 4.5 8-4.5M12 11.5V21" /></svg>
            <h2 className="text-2xl font-bold mb-2 text-text-light">Configuração do Supabase</h2>
            <p className="text-text-dark mb-6">
                Para salvar e carregar produtos, por favor, insira as credenciais do seu projeto Supabase. Você pode encontrá-las em{' '}
                <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-accent underline">
                    Project Settings &gt; API
                </a>.
            </p>
        </div>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="supabase-url" className="block text-sm font-medium text-text-dark mb-2">Project URL</label>
            <Input 
                id="supabase-url" 
                type="text" 
                value={url} 
                onChange={(e) => setUrl(e.target.value)} 
                placeholder="https://exemplo.supabase.co"
            />
          </div>
          <div>
            <label htmlFor="supabase-key" className="block text-sm font-medium text-text-dark mb-2">Project API Key (anon public)</label>
            <Input 
                id="supabase-key" 
                type="password" 
                value={anonKey} 
                onChange={(e) => setAnonKey(e.target.value)} 
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <Button onClick={handleSave} className="w-full !py-3">Salvar e Conectar</Button>
        </div>
      </Card>
    </div>
  );
};

export default SupabaseConfigModal;
