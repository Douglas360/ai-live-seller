import { type AudioProvider } from '../types';

// Decodes a base64 string into a Uint8Array.
export function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Decodes audio data into an AudioBuffer based on the provider.
export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  provider: AudioProvider,
): Promise<AudioBuffer> {
  if (provider === 'openai') {
    // OpenAI TTS returns a standard format (e.g., MP3), so the browser can decode it.
    return await ctx.decodeAudioData(data.buffer);
  } else if (provider === 'google') {
    // Google TTS returns raw 16-bit PCM audio. We need to decode it manually.
    const sampleRate = 24000; // As per Gemini TTS docs
    const numChannels = 1; // As per Gemini TTS docs

    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    const channelData = buffer.getChannelData(0);

    for (let i = 0; i < frameCount; i++) {
        // Normalize the 16-bit signed integer to a float between -1.0 and 1.0
        channelData[i] = dataInt16[i] / 32768.0;
    }
    return buffer;
  }
  
  throw new Error(`Unknown audio provider for decoding: ${provider}`);
}