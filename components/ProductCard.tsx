
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
    ? "w-64 flex-shrink-0 snap-center"
    : "w-full h-full";

  const hasVariants = product.variants && product.variants.length > 0;
  const displayPrice = hasVariants
      ? Math.min(...product.variants!.map(v => v.price))
      : product.price;

  const totalStock = hasVariants
      ? product.variants!.reduce((acc, v) => acc + v.stock, 0)
      : product.stock;

  const isOutOfStock = totalStock <= 0;
  const isLowStock = totalStock > 0 && totalStock < 10;

  const scarcityPercent = Math.min(100, (totalStock / 20) * 100);

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
    <div className={`bg-ocean-800/80 backdrop-blur-md rounded-2xl overflow-hidden shadow-lg border flex flex-col transition-all duration-500 hover:shadow-gold-500/20 hover:border-gold-500/40 group/card relative ${product.isLive ? 'border-red-500/40' : 'border-ocean-700/50'} ${containerClasses}`}>

      {/* Image Section */}
      <div
        className={`${variant === 'chat' ? 'h-40' : 'aspect-square'} w-full overflow-hidden relative cursor-pointer bg-ocean-900`}
        onClick={() => onClick && onClick(product)}
      >
        {/* Skeleton */}
        <div className={`absolute inset-0 bg-ocean-800 animate-pulse transition-opacity duration-700 ${isImageLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} />

        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          onLoad={() => setIsImageLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-700 ease-out group-hover/card:scale-110 ${isOutOfStock ? 'grayscale opacity-50 blur-[1px]' : ''} ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-ocean-900/80 via-transparent to-transparent opacity-40" />

        {/* Top Badges */}
        {onToggleFavorite && (
            <button
                onClick={handleFavoriteClick}
                className="absolute top-2 right-2 z-20 bg-black/20 backdrop-blur-md p-1.5 rounded-full text-white/70 hover:bg-red-500/20 hover:text-red-500 transition-colors opacity-0 group-hover/card:opacity-100 transform translate-y-[-10px] group-hover/card:translate-y-0 duration-300 border border-white/5 active:scale-125"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
            </button>
        )}

        {product.isLive && !isOutOfStock && (
             <div className="absolute top-2 left-2 z-10 flex items-center gap-1 bg-red-600/90 text-white text-[9px] px-2 py-0.5 rounded-full shadow-lg backdrop-blur-md border border-red-400/30">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
                  </span>
                  <span className="font-bold tracking-wide">Live</span>
             </div>
        )}

        {isOutOfStock && (
             <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center z-20">
                 <div className="border border-white/20 bg-white/10 px-3 py-1 text-white text-xs font-black tracking-widest uppercase -rotate-6 shadow-xl backdrop-blur-md">
                     已售罄
                 </div>
             </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-3 flex flex-col flex-1 relative" onClick={() => onClick && onClick(product)}>

        {/* Stock Bar if Low */}
        {isLowStock && !isOutOfStock && (
            <div className="absolute top-0 left-0 w-full h-[2px] bg-ocean-900/50 overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-red-500 to-orange-500 shadow-[0_0_5px_rgba(239,68,68,0.5)] animate-pulse"
                    style={{ width: `${scarcityPercent}%` }}
                ></div>
            </div>
        )}

        <div className="mb-2">
            <h3 className="font-serif text-sm text-gray-100 font-medium leading-tight line-clamp-2 h-[2.5em] group-hover/card:text-gold-400 transition-colors">
                {product.name}
            </h3>
            {/* Tags - Smaller */}
            <div className="flex flex-wrap gap-1 mt-1.5 h-4 overflow-hidden">
                {product.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="text-[8px] text-gray-400 border border-white/5 bg-white/5 px-1 rounded-[3px] leading-none py-0.5">
                        {tag}
                    </span>
                ))}
            </div>
        </div>

        {/* Price & Action Row */}
        <div className="mt-auto flex items-end justify-between relative">
            <div className="flex flex-col">
                {/* Stock Text - Increased Visibility */}
                {!isOutOfStock && (
                    <span className={`text-[9px] font-medium mb-0.5 ${isLowStock ? 'text-red-400' : 'text-green-400/80'}`}>
                        {isLowStock ? `仅剩 ${totalStock} 件` : '现货充足'}
                    </span>
                )}
                {isOutOfStock && <span className="text-[9px] text-gray-500 mb-0.5">补货中...</span>}

                <div className="flex items-baseline gap-0.5 text-gold-500">
                    <span className="text-xs font-bold font-serif">¥</span>
                    <span className="text-lg font-bold font-serif leading-none tracking-tight">{displayPrice}</span>
                    {hasVariants && <span className="text-[9px] text-gray-500 ml-0.5">起</span>}
                </div>
            </div>

            {/* Quick Add Button - Prominent */}
            {isOutOfStock ? (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        if (onNotifyMe) onNotifyMe(product);
                    }}
                    className="w-8 h-8 rounded-full bg-ocean-700 flex items-center justify-center text-gray-400 hover:text-white hover:bg-ocean-600 transition-all active:scale-95 border border-white/5"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                </button>
            ) : (
                <button
                    onClick={handleAddToCartClick}
                    className="w-8 h-8 rounded-full bg-gradient-to-tr from-gold-600 to-gold-400 flex items-center justify-center text-ocean-900 shadow-lg shadow-gold-500/20 active:scale-90 hover:scale-105 transition-all group/btn relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 rounded-full"></div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>

                    {/* Cart Quantity Badge */}
                    {cartQuantity > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] h-3.5 min-w-[14px] px-0.5 flex items-center justify-center rounded-full border border-ocean-800 shadow-sm font-bold animate-scale-in">
                            {cartQuantity}
                        </span>
                    )}
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
