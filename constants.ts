import { type VoiceOption } from './types';

export const VOICE_OPTIONS: VoiceOption[] = [
    { id: 'nova', name: 'Nova', style: 'Voz calma e expressiva (Feminino)', provider: 'openai' },
    { id: 'shimmer', name: 'Shimmer', style: 'Voz clara e energética (Feminino)', provider: 'openai' },
    { id: 'alloy', name: 'Alloy', style: 'Voz profissional e confiável (Masculino)', provider: 'openai' },
    { id: 'onyx', name: 'Onyx', style: 'Voz profunda e carismática (Masculino)', provider: 'openai' },
    { id: 'echo', name: 'Echo', style: 'Voz amigável e casual (Masculino)', provider: 'openai' },
    { id: 'fable', name: 'Fable', style: 'Voz de narrador, ideal para histórias (Masculino)', provider: 'openai' },
    
    // Google voices
    { id: 'Kore', name: 'Kore (Google)', style: 'Voz clara e profissional (Feminino)', provider: 'google' },
    { id: 'Puck', name: 'Puck (Google)', style: 'Voz enérgica e jovem (Masculino)', provider: 'google' },
    { id: 'Charon', name: 'Charon (Google)', style: 'Voz grave e misteriosa (Masculino)', provider: 'google' },
    { id: 'Zephyr', name: 'Zephyr (Google)', style: 'Voz suave e amigável (Feminino)', provider: 'google' },
    { id: 'Fenrir', name: 'Fenrir (Google)', style: 'Voz forte e épica (Masculino)', provider: 'google' },
];