
import React, { useState } from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, e?: React.MouseEvent) => void;
  onClick?: (product: Product) => void;
  variant?: 'chat' | 'store';
  cartQuantity?: number;
  onTagClick?: (tag: string) => void;
  onNotifyMe?: (product: Product) => void;
  onToggleFavorite?: (productId: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onClick, variant = 'chat', cartQuantity = 0, onTagClick, onNotifyMe, onToggleFavorite }) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const containerClasses = variant === 'chat'
    ? "w-48 flex-shrink-0 snap-center" // Chat variant is narrower
    : "w-full h-full"; // Store variant fills grid

  const hasVariants = product.variants && product.variants.length > 0;
  const displayPrice = hasVariants
      ? Math.min(...product.variants!.map(v => v.price))
      : product.price;

  const totalStock = hasVariants
      ? product.variants!.reduce((acc, v) => acc + v.stock, 0)
      : product.stock;

  const isOutOfStock = totalStock <= 0;
  const isLowStock = totalStock > 0 && totalStock < 10;

  const handleAddToCartClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (navigator.vibrate) navigator.vibrate(10);
      onAddToCart(product, e);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onToggleFavorite) {
          onToggleFavorite(product.id);
          if(navigator.vibrate) navigator.vibrate(20);
      }
  };

  return (
    <div 
        className={`bg-ocean-800/40 backdrop-blur-sm rounded-xl overflow-hidden flex flex-col group/card relative transition-all duration-300 ${containerClasses}`}
        style={{ boxShadow: '0 4px 20px -5px rgba(0,0,0,0.3)' }}
    >
      {/* Border subtle glow */}
      <div className="absolute inset-0 rounded-xl border border-white/5 group-hover/card:border-gold-500/30 transition-colors pointer-events-none z-10"></div>

      {/* Image Section */}
      <div
        className={`${variant === 'chat' ? 'h-32' : 'aspect-[4/5]'} w-full overflow-hidden relative cursor-pointer bg-ocean-900`}
        onClick={() => onClick && onClick(product)}
      >
        {/* Skeleton */}
        <div className={`absolute inset-0 bg-ocean-800 animate-pulse transition-opacity duration-700 ${isImageLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} />

        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          onLoad={() => setIsImageLoaded(true)}
          className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover/card:scale-105 ${isOutOfStock ? 'grayscale opacity-60' : ''} ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
        />

        {/* Gradient Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-ocean-900/90 via-transparent to-transparent opacity-60" />

        {/* Badges */}
        {product.isLive && !isOutOfStock && (
             <div className="absolute top-2 left-2 z-20 flex items-center gap-1 bg-red-600/90 text-white text-[9px] px-1.5 py-0.5 rounded-[4px] shadow-sm backdrop-blur-md">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
                  </span>
                  <span className="font-bold tracking-wide font-sans">LIVE</span>
             </div>
        )}

        {/* Favorite Button (Top Right) */}
        {onToggleFavorite && (
            <button
                onClick={handleFavoriteClick}
                className="absolute top-2 right-2 z-20 w-7 h-7 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white/80 hover:bg-red-500/80 hover:text-white transition-all active:scale-90 opacity-0 group-hover/card:opacity-100 translate-y-2 group-hover/card:translate-y-0 duration-300"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
            </button>
        )}

        {isOutOfStock && (
             <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center z-20">
                 <div className="border border-white/20 bg-black/40 px-3 py-1 text-white text-xs font-serif tracking-widest">
                     SOLD OUT
                 </div>
             </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-3 flex flex-col flex-1 relative z-20 -mt-10" onClick={() => onClick && onClick(product)}>
        
        {/* Floating Tags over Image Bottom */}
        <div className="flex flex-wrap gap-1 mb-2 h-4 overflow-hidden relative z-20">
            {product.tags.slice(0, 2).map(tag => (
                <span key={tag} className="text-[9px] text-white/90 bg-white/10 backdrop-blur-md px-1.5 rounded-[3px] py-0.5 shadow-sm border border-white/5">
                    {tag}
                </span>
            ))}
        </div>

        <div className="mt-auto">
            <h3 className="font-serif text-sm text-gray-100 font-medium leading-snug line-clamp-2 h-[2.6em] mb-1.5 group-hover/card:text-gold-400 transition-colors">
                {product.name}
            </h3>

            {/* Price & Action Row */}
            <div className="flex items-end justify-between">
                <div className="flex flex-col">
                    <div className="flex items-baseline gap-0.5 text-gold-500">
                        <span className="text-xs font-serif">¥</span>
                        <span className="text-lg font-serif font-bold leading-none">{displayPrice}</span>
                        {hasVariants && <span className="text-[9px] text-gray-500 ml-0.5 font-sans">起</span>}
                    </div>
                    {isLowStock && !isOutOfStock && (
                        <span className="text-[9px] text-red-400 scale-90 origin-left mt-0.5">仅剩{totalStock}件</span>
                    )}
                </div>

                {/* Quick Add Button */}
                {isOutOfStock ? (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (onNotifyMe) onNotifyMe(product);
                        }}
                        className="w-7 h-7 rounded-full bg-ocean-700/50 flex items-center justify-center text-gray-400 border border-white/10"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                    </button>
                ) : (
                    <button
                        onClick={handleAddToCartClick}
                        className="w-7 h-7 rounded-full bg-gradient-to-br from-gold-600 to-gold-500 flex items-center justify-center text-ocean-900 shadow-lg shadow-gold-500/20 active:scale-90 hover:scale-110 transition-all relative overflow-hidden"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>

                        {/* Cart Quantity Badge */}
                        {cartQuantity > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] h-3 min-w-[12px] px-0.5 flex items-center justify-center rounded-full border border-ocean-800 shadow-sm font-bold animate-scale-in">
                                {cartQuantity}
                            </span>
                        )}
                    </button>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
