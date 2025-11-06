import React, { useState, useEffect } from 'react';
import { type Product } from '../types';
import Button from './ui/Button';
import Card from './ui/Card';
import Input from './ui/Input';
import Textarea from './ui/Textarea';

interface ProductFormModalProps {
  onClose: () => void;
  onSave: (product: Product) => Promise<void>;
  productToEdit?: Product | null;
}

const ProductFormModal = ({ onClose, onSave, productToEdit }: ProductFormModalProps) => {
  const isEditing = !!productToEdit;

  const [name, setName] = useState('');
  const [sellerName, setSellerName] = useState('');
  const [description, setDescription] = useState('');
  const [sellingPoints, setSellingPoints] = useState('');
  const [regularPrice, setRegularPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [reviews, setReviews] = useState('');
  const [variations, setVariations] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isEditing && productToEdit) {
        setName(productToEdit.name);
        setSellerName(productToEdit.sellerName);
        setDescription(productToEdit.description);
        setSellingPoints(productToEdit.sellingPoints.join('\n'));
        setRegularPrice(String(productToEdit.regularPrice));
        setSalePrice(productToEdit.salePrice ? String(productToEdit.salePrice) : '');
        setImageUrl(productToEdit.imageUrl);
        setReviews(productToEdit.reviews ? productToEdit.reviews.join('\n') : '');
        setVariations(productToEdit.variations ? productToEdit.variations.join('\n') : '');
    }
  }, [productToEdit, isEditing]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !regularPrice || !imageUrl || !sellerName || !sellingPoints) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setIsLoading(true);

    const productData: Omit<Product, 'createdAt'> = {
      id: isEditing ? productToEdit.id : `prod_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      name,
      description,
      regularPrice: parseFloat(regularPrice),
      salePrice: salePrice ? parseFloat(salePrice) : undefined,
      imageUrl,
      sellerName,
      sellingPoints: sellingPoints.split('\n').filter(point => point.trim() !== ''),
      reviews: reviews.split('\n').filter(review => review.trim() !== ''),
      variations: variations.split('\n').filter(variation => variation.trim() !== ''),
    };

    try {
      // For new products, add a createdAt timestamp. For existing ones, preserve the original.
      const finalProduct: Product = {
        ...productData,
        createdAt: isEditing ? productToEdit.createdAt : new Date().toISOString(),
      };
      await onSave(finalProduct);
    } catch (error) {
      // Error is handled by the App component, so we just log it here
      console.error("Failed to save product:", error);
      // The loading state should be unset even on failure.
      setIsLoading(false);
    }
    // Don't set loading to false in a `finally` block because `onSave` might unmount this component.
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <Card className="w-full max-w-2xl relative my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-dark hover:text-text-light transition-colors"
          aria-label="Close modal"
          disabled={isLoading}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 className="text-2xl font-bold mb-6 text-text-light">{isEditing ? 'Editar Produto' : 'Cadastrar Novo Produto'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="prod-name" className="block text-sm font-medium text-text-dark mb-2">Nome do Produto *</label>
              <Input id="prod-name" type="text" value={name} onChange={(e) => setName(e.target.value)} required disabled={isLoading}/>
            </div>
            <div>
              <label htmlFor="prod-seller" className="block text-sm font-medium text-text-dark mb-2">Nome do Vendedor *</label>
              <Input id="prod-seller" type="text" value={sellerName} onChange={(e) => setSellerName(e.target.value)} required disabled={isLoading}/>
            </div>
          </div>
          <div>
            <label htmlFor="prod-desc" className="block text-sm font-medium text-text-dark mb-2">Descrição Curta *</label>
            <Input id="prod-desc" type="text" value={description} onChange={(e) => setDescription(e.target.value)} required placeholder="Ex: Kit de almofadas macias para o Natal" disabled={isLoading}/>
          </div>
           <div>
            <label htmlFor="prod-image" className="block text-sm font-medium text-text-dark mb-2">URL da Imagem *</label>
            <Input id="prod-image" type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} required disabled={isLoading}/>
          </div>
          <div>
            <label htmlFor="prod-points" className="block text-sm font-medium text-text-dark mb-2">Pontos de Venda (um por linha) *</label>
            <Textarea id="prod-points" value={sellingPoints} onChange={(e) => setSellingPoints(e.target.value)} required disabled={isLoading}/>
          </div>

           <div className="border-t border-border-color pt-4 mt-4">
              <h3 className="text-xl font-bold text-text-light mb-4">Pricing</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="prod-price-regular" className="block text-sm font-medium text-text-dark mb-2">Preço Regular *</label>
                    <Input id="prod-price-regular" type="number" step="0.01" value={regularPrice} onChange={(e) => setRegularPrice(e.target.value)} required placeholder="29.90" disabled={isLoading}/>
                </div>
                <div>
                    <label htmlFor="prod-price-sale" className="block text-sm font-medium text-text-dark mb-2">Preço com Desconto (opcional)</label>
                    <Input id="prod-price-sale" type="number" step="0.01" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} placeholder="19.90" disabled={isLoading}/>
                </div>
              </div>
           </div>

          <div className="border-t border-border-color pt-4 mt-4">
              <div className="flex items-center space-x-2 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0L7.86 5.89c-.33.19-.69.32-1.06.38L4.03 6.68c-1.63.25-2.28 2.23-1.04 3.39l2.1 2.23c.25.26.37.62.3.98l-.63 2.92c-.37 1.7.98 2.98 2.57 2.15l2.43-1.35c.33-.18.72-.18 1.05 0l2.43 1.35c1.6 1.08 2.95-.3 2.57-2.15l-.63-2.92c-.07-.36.05-.72.3-.98l2.1-2.23c1.24-1.16.59-3.14-1.04-3.39l-2.77-.42c-.37-.06-.73-.19-1.06-.38l-.65-2.72z" clipRule="evenodd" />
                </svg>
                <h3 className="text-xl font-bold text-text-light">Advanced Options</h3>
              </div>
              <div>
                  <label htmlFor="prod-reviews" className="block text-sm font-medium text-text-dark mb-2">Avaliações Recentes (opcional, uma por linha)</label>
                  <Textarea id="prod-reviews" value={reviews} onChange={(e) => setReviews(e.target.value)} disabled={isLoading}/>
              </div>
              <div className="mt-4">
                  <label htmlFor="prod-variations" className="block text-sm font-medium text-text-dark mb-2">Variações do Produto & Ofertas (opcional, uma por linha)</label>
                  <Textarea id="prod-variations" value={variations} onChange={(e) => setVariations(e.target.value)} placeholder="Ex: Leve 2 e ganhe frete grátis" disabled={isLoading}/>
              </div>
          </div>
          <div className="pt-4 flex justify-end space-x-3">
             <Button type="button" variant="danger" onClick={onClose} disabled={isLoading}>Cancelar</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : isEditing ? 'Salvar Alterações' : 'Adicionar Produto'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ProductFormModal;