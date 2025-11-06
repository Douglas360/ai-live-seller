import React, { useState, useRef, useEffect } from 'react';
import { type Product } from '../types';

type ProductCardProps = {
  product: Product;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
};

const ProductCard: React.FC<ProductCardProps> = ({ product, isSelected, onSelect, onEdit, onDelete }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
            setIsMenuOpen(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuRef]);

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(product);
    setIsMenuOpen(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(product.id);
    setIsMenuOpen(false);
  };

  return (
    <div
      onClick={onSelect}
      className={`bg-primary border-2 ${isSelected ? 'border-accent' : 'border-border-color'} rounded-lg p-4 cursor-pointer transition-all duration-200 hover:border-accent hover:shadow-lg relative flex flex-col`}
    >
      {isSelected && (
        <div className="absolute top-2 left-2 bg-accent text-white rounded-full h-6 w-6 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}
       <div className="absolute top-2 right-2" ref={menuRef}>
          <button 
            onClick={(e) => { e.stopPropagation(); setIsMenuOpen(prev => !prev); }} 
            className="p-1 rounded-full text-text-dark hover:bg-secondary hover:text-text-light transition-colors"
            aria-label="Product options"
          >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
          </button>
          {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-32 bg-secondary rounded-md shadow-xl z-10 border border-border-color text-sm py-1">
                  <button onClick={handleEdit} className="w-full text-left px-3 py-1.5 text-text-light hover:bg-primary">Editar</button>
                  <button onClick={handleDelete} className="w-full text-left px-3 py-1.5 text-red-400 hover:bg-primary">Deletar</button>
              </div>
          )}
      </div>

      <img src={product.imageUrl} alt={product.name} className="w-full h-40 object-cover rounded-md mb-4 mt-8" />
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
