import React from 'react';
import { type Product } from '../types';

type ProductCardProps = {
  product: Product;
  isSelected: boolean;
  onSelect: () => void;
};

// FIX: Changed component definition to use React.FC to correctly type the component props.
const ProductCard: React.FC<ProductCardProps> = ({ product, isSelected, onSelect }) => {
  return (
    <div
      onClick={onSelect}
      className={`bg-primary border-2 ${isSelected ? 'border-accent' : 'border-border-color'} rounded-lg p-4 cursor-pointer transition-all duration-200 hover:border-accent hover:shadow-lg relative flex flex-col`}
    >
      {isSelected && (
        <div className="absolute top-2 right-2 bg-accent text-white rounded-full h-6 w-6 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}
      <img src={product.imageUrl} alt={product.name} className="w-full h-40 object-cover rounded-md mb-4" />
      <div className="flex-grow">
        <h3 className="font-bold text-text-light truncate">{product.name}</h3>
        <p className="text-sm text-text-dark truncate">by {product.sellerName}</p>
      </div>
      <div className="flex items-baseline mt-2">
        {product.salePrice ? (
          <>
            <p className="text-accent font-semibold text-lg">R${product.salePrice.toFixed(2).replace('.', ',')}</p>
            <p className="text-text-dark text-sm line-through ml-2">R${product.regularPrice.toFixed(2).replace('.', ',')}</p>
          </>
        ) : (
          <p className="text-accent font-semibold text-lg">R${product.regularPrice.toFixed(2).replace('.', ',')}</p>
        )}
      </div>
    </div>
  );
};

export default ProductCard;