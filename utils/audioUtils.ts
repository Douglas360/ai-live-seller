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

// Decodes standard audio format data (like MP3 from ElevenLabs) into an AudioBuffer.
export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
): Promise<AudioBuffer> {
  // The browser's native decoder can handle standard audio formats like MP3
  // directly from an ArrayBuffer. This is much simpler than handling raw PCM data.
  return await ctx.decodeAudioData(data.buffer);
}