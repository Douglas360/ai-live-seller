export type AudioProvider = 'openai' | 'google';

export interface Product {
  id: string;
  name: string;
  regularPrice: number;
  salePrice?: number;
  description: string;
  imageUrl: string;
  sellerName: string;
  sellingPoints: string[];
  reviews?: string[];
  variations?: string[];
}

export interface VoiceOption {
  id: string;
  name: string;
  style: string;
  provider: AudioProvider;
}

export interface LiveSession {
  title: string;
  product: Product;
  voice: VoiceOption;
  backgroundImageUrl: string;
}

export interface Metrics {
    viewers: number;
    sales: number;
    conversionRate: number;
}

export interface Comment {
  id: string;
  username: string;
  text: string;
}

export type SegmentType = 'pitch' | 'response';
export type SegmentStatus = 'speaking' | 'queued' | 'completed';

export interface SpeechSegment {
  id: string;
  type: SegmentType;
  status: SegmentStatus;
  textLines: string[];
  audioData: string[];
  estimatedDuration: number;
  commentCount?: number;
  sourceComments?: Comment[];
}