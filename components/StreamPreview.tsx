import React, { useRef, useEffect } from 'react';
import { type Product } from '../types';
import FloatingHearts from './FloatingHearts';

interface StreamPreviewProps {
  product: Product;
  currentScriptLine: string;
  stream: MediaStream | null;
}

const StreamPreview = ({ product, currentScriptLine, stream }: StreamPreviewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement && stream) {
      if (videoElement.srcObject !== stream) {
        videoElement.srcObject = stream;
        videoElement.play().catch(error => {
          console.error("Video play failed:", error);
        });
      }
    } else if (videoElement) {
      videoElement.srcObject = null;
    }
  }, [stream]);

  return (
    <div 
        className="relative aspect-video bg-black rounded-xl overflow-hidden border border-border-color shadow-2xl"
    >
      <video 
        ref={videoRef} 
        autoPlay 
        muted 
        playsInline
        className="w-full h-full object-cover"
      ></video>
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none"></div>

      <FloatingHearts />
      
      {/* Product Overlay */}
      <div className="absolute bottom-2 left-2 bg-secondary bg-opacity-80 backdrop-blur-sm p-3 rounded-lg flex items-center space-x-3 max-w-xs border border-border-color z-20">
        <img src={product.imageUrl} alt={product.name} className="w-16 h-16 object-cover rounded-md flex-shrink-0" />
        <div>
          <h3 className="font-bold text-md text-text-light leading-tight">{product.name}</h3>
          {product.salePrice ? (
            <div className="flex items-baseline">
                <p className="text-accent text-xl font-bold">R${product.salePrice.toFixed(2).replace('.', ',')}</p>
                <p className="text-text-dark text-sm line-through ml-2">R${product.regularPrice.toFixed(2).replace('.', ',')}</p>
            </div>
          ) : (
            <p className="text-accent text-xl font-bold">R${product.regularPrice.toFixed(2).replace('.', ',')}</p>
          )}
        </div>
      </div>

      {/* Live Tag */}
       <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-md text-sm font-bold flex items-center space-x-1.5 z-20">
        <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
        <span>LIVE</span>
      </div>

    </div>
  );
};

export default StreamPreview;
