
import React, { useState } from 'react';
import { Product, CartItem, ProductVariant } from '../types';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity?: number, variant?: ProductVariant) => void;
  cart: CartItem[];
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, isOpen, onClose, onAddToCart, cart }) => {
  const [quantity, setQuantity] = useState(1);

  if (!isOpen || !product) return null;

  return (
    <div className="absolute inset-0 z-[60] flex flex-col bg-ocean-950 animate-slide-in-up text-white overflow-hidden">
      {/* 沉浸式顶部图 */}
      <div className="relative h-[60vh] w-full shrink-0">
        <img src={product.image} className="w-full h-full object-cover opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-ocean-950 via-transparent to-transparent"></div>
        <button 
            onClick={onClose}
            className="absolute top-safe-top left-6 p-3 bg-black/40 backdrop-blur-md border border-white/10 text-white hover:bg-gold-500 transition-colors"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
        </button>
      </div>

      {/* 内容区 */}
      <div className="flex-1 overflow-y-auto px-8 pt-6 pb-32 no-scrollbar relative z-10 -mt-20">
        <div className="flex justify-between items-end mb-6">
            <div className="space-y-1">
                <span className="text-[10px] font-bold text-gold-500 uppercase tracking-[0.4em] block">Wei Lai Selection</span>
                <h1 className="text-3xl font-serif font-bold tracking-tight italic">{product.name}</h1>
            </div>
            <div className="text-3xl font-serif font-bold text-gold-500">¥{product.price}</div>
        </div>

        <div className="flex gap-4 mb-8">
            {product.tags.map(tag => (
                <span key={tag} className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40 border border-white/10 px-3 py-1">{tag}</span>
            ))}
        </div>

        <div className="space-y-10">
            <section>
                <h3 className="text-xs font-bold text-gold-500 uppercase tracking-widest border-b border-gold-500/10 pb-2 mb-4 italic">The Story · 商品故事</h3>
                <p className="text-sm text-white/60 leading-relaxed font-light">{product.description}</p>
            </section>

            <section>
                <h3 className="text-xs font-bold text-gold-500 uppercase tracking-widest border-b border-gold-500/10 pb-2 mb-4 italic">Chef's Mode · 主厨手记</h3>
                <p className="text-sm text-white/60 leading-relaxed font-light">
                    产地：{product.origin || '深海直通'}<br/>
                    烹饪：建议{product.cookingMethod || '清蒸以保留极致鲜味'}<br/>
                    营养：{product.nutrition || '高蛋白低脂肪，富含微量元素'}
                </p>
            </section>
        </div>
      </div>

      {/* 底部购买条 */}
      <div className="absolute bottom-0 left-0 w-full p-6 pb-safe-bottom bg-ocean-950/80 backdrop-blur-xl border-t border-white/5 flex items-center justify-between z-20">
        <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 bg-white/5 px-4 py-2 border border-white/10">
                <button onClick={() => setQuantity(Math.max(1, quantity-1))} className="text-gray-500 hover:text-white">-</button>
                <span className="text-sm font-bold w-4 text-center">{quantity}</span>
                <button onClick={() => setQuantity(quantity+1)} className="text-gray-500 hover:text-white">+</button>
            </div>
        </div>
        <button 
            onClick={() => onAddToCart(product, quantity)}
            className="bg-gold-500 text-ocean-950 px-12 py-4 font-bold text-xs uppercase tracking-[0.5em] hover:bg-gold-400 active:scale-95 transition-all shadow-[0_20px_40px_rgba(197,160,89,0.2)]"
        >
            加入购物袋
        </button>
      </div>
    </div>
  );
};

export default ProductDetailModal;
