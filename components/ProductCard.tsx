
import React, { useState } from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, e?: React.MouseEvent) => void;
  onClick?: (product: Product) => void;
  variant?: 'chat' | 'store';
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onClick, variant = 'chat' }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
        className={`group relative flex flex-col transition-all duration-700 ${variant === 'chat' ? 'w-48' : 'w-full'}`}
        onClick={() => onClick && onClick(product)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-ocean-950 border border-white/5 rounded-3xl">
        <img
          src={product.image}
          alt={product.name}
          className={`w-full h-full object-cover transition-all duration-[2s] group-hover:scale-110 ${isHovered ? 'grayscale-0 opacity-100' : 'grayscale-[0.4] opacity-80'}`}
        />
        
        {/* 水感叠加层 */}
        <div className="absolute inset-0 bg-gradient-to-t from-ocean-950 via-transparent to-transparent opacity-60"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.05),transparent_50%)]"></div>
        
        {product.isLive && (
             <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-red-600 text-white text-[7px] px-2 py-0.5 rounded-full font-black tracking-widest">
                <span className="w-1 h-1 bg-white rounded-full animate-ping"></span>
                LIVE
             </div>
        )}

        <div className="absolute top-3 left-3 bg-ocean-950/40 backdrop-blur-md border border-white/10 text-[7px] text-white/60 px-2 py-0.5 rounded-full tracking-tighter">
            来自: {product.origin || '太平洋'}
        </div>

        <button
            onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
            className="absolute bottom-4 right-4 w-12 h-12 bg-gold-500 text-ocean-950 rounded-full flex items-center justify-center translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 shadow-xl shadow-gold-500/20"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
        </button>
      </div>

      <div className="pt-4 px-2 pb-2">
        <h3 className="text-white/80 text-[11px] font-bold uppercase tracking-wider line-clamp-1 group-hover:text-gold-500 transition-colors">
            {product.name}
        </h3>
        <div className="flex items-center justify-between mt-1.5">
            <div className="flex items-baseline gap-1">
                <span className="text-gold-500 font-serif italic text-[10px]">¥</span>
                <span className="text-gold-500 font-serif font-bold text-lg leading-none tracking-tighter">{product.price.toLocaleString()}</span>
            </div>
            <span className="text-[8px] text-white/10 font-mono tracking-tighter">库存:{product.stock}</span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
