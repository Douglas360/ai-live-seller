import React, { useState } from 'react';
import { Product } from '../types';

interface ProductDetailsPanelProps {
  product: Product;
}

const ProductDetailsPanel = ({ product }: ProductDetailsPanelProps) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="bg-secondary rounded-xl border border-border-color">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-4"
        aria-expanded={isOpen}
      >
        <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            </div>
            <h3 className="text-lg font-semibold text-text-light">Product Details</h3>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-text-dark transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
      </button>

      {isOpen && (
        <div className="px-4 pb-4 space-y-4">
            {/* Product Description */}
            <div className="bg-primary p-3 rounded-lg">
                <p className="text-xs text-text-dark mb-1">Product Description</p>
                <p className="font-semibold text-text-light">{product.name}</p>
                <p className="text-sm text-text-dark">sold by {product.sellerName}</p>
            </div>
            
            {/* Pricing */}
            <div className="bg-primary p-3 rounded-lg">
                <p className="text-xs text-text-dark mb-1">Pricing</p>
                {product.salePrice ? (
                    <div className="flex items-baseline">
                        <p className="font-semibold text-text-light text-lg">R${product.salePrice.toFixed(2).replace('.', ',')}</p>
                        <p className="text-text-dark text-sm line-through ml-2">R${product.regularPrice.toFixed(2).replace('.', ',')}</p>
                    </div>
                ) : (
                    <p className="font-semibold text-text-light text-lg">R${product.regularPrice.toFixed(2).replace('.', ',')}</p>
                )}
            </div>

            {/* Selling Points */}
            <div className="bg-primary p-3 rounded-lg">
                <p className="text-xs text-text-dark mb-2">Selling Points</p>
                <ul className="space-y-1.5 text-sm text-text-light">
                    {product.sellingPoints.map((point, index) => (
                         <li key={index} className="flex items-start">
                            <span className="mr-2 text-accent">-</span>
                            <span>{point}</span>
                        </li>
                    ))}
                </ul>
            </div>
            
            {/* Reviews */}
            {product.reviews && product.reviews.length > 0 && (
                <div className="bg-primary p-3 rounded-lg">
                    <p className="text-xs text-text-dark mb-2">Recent Reviews</p>
                    <ul className="space-y-1.5 text-sm text-text-light">
                        {product.reviews.map((review, index) => (
                            <li key={index} className="flex items-start">
                                <span className="mr-2 text-accent opacity-70">"</span>
                                <span className="italic">{review}</span>
                                <span className="ml-1 text-accent opacity-70">"</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Variations */}
             {product.variations && product.variations.length > 0 && (
                <div className="bg-primary p-3 rounded-lg">
                    <p className="text-xs text-text-dark mb-2">Variations & Offers</p>
                    <ul className="space-y-1.5 text-sm text-text-light">
                        {product.variations.map((variation, index) => (
                            <li key={index} className="flex items-start">
                                <span className="mr-2 text-accent">✨</span>
                                <span>{variation}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            
            <div className="bg-green-800 bg-opacity-50 border border-green-500 text-green-300 text-sm font-semibold p-3 rounded-lg flex items-center space-x-2">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                <span>Product configured</span>
            </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailsPanel;
