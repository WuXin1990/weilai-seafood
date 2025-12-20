
import React, { useState } from 'react';
import { Product, User, CartItem } from '../types';
import { CATEGORY_NAMES } from '../constants';
import ProductCard from './ProductCard';

interface StorefrontProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onBack: () => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenProfile: () => void;
  user: User | null;
  onProductClick: (product: Product) => void;
  cart: CartItem[]; 
}

const Storefront: React.FC<StorefrontProps> = ({ 
    products, onAddToCart, onBack, cartCount, onOpenCart, onProductClick
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filteredProducts = products.filter(p => {
    return activeCategory === 'all' || p.category === activeCategory;
  });

  return (
    <div className="flex flex-col h-full bg-ocean-950 text-white relative">
      {/* 沉浸式顶部装饰 */}
      <div className="fixed top-0 left-0 w-full h-40 bg-gradient-to-b from-ocean-900 to-transparent pointer-events-none z-40"></div>

      {/* 顶部导航 */}
      <div className="fixed top-0 left-0 w-full z-50 px-8 pt-safe-top pb-6 flex items-center justify-between glass-v2 border-b border-white/10 shadow-2xl">
        <button onClick={onBack} className="w-11 h-11 rounded-full flex items-center justify-center text-white/40 glass-v2 transition-all hover:text-gold-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div className="text-center">
            <h1 className="text-gold-500 text-[12px] font-black tracking-[0.6em] uppercase">深海极鲜市</h1>
            <div className="flex items-center justify-center gap-2 mt-1.5">
                <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-[8px] text-white/30 tracking-[0.4em] italic uppercase">58°N Alaskan Cold Water</span>
            </div>
        </div>
        <button onClick={onOpenCart} className="relative w-11 h-11 rounded-full flex items-center justify-center text-white/50 glass-v2 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
            {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gold-500 text-ocean-950 text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-ocean-950 shadow-lg">
                    {cartCount}
                </span>
            )}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pt-36 pb-40 no-scrollbar">
        {/* 直播专供 Banner：增强水产质感 */}
        <div className="px-8 mb-16 relative animate-reveal">
            <div className="aspect-[16/9] relative overflow-hidden bg-black rounded-[2.5rem] border border-white/10 shadow-inner group">
                <img 
                    src="https://images.unsplash.com/photo-1598511726623-d3434190c680?q=80&w=1200" 
                    className="w-full h-full object-cover opacity-70 transition-transform duration-[20s] group-hover:scale-110" 
                    alt="Live Auction"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ocean-950 via-ocean-950/20 to-transparent"></div>
                
                {/* 悬浮标签 */}
                <div className="absolute top-6 right-6 flex items-center gap-2 bg-red-600 px-3 py-1 rounded-md shadow-xl">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
                    <span className="text-[8px] font-black text-white tracking-widest">LIVE 竞拍中</span>
                </div>

                <div className="absolute bottom-10 left-10 right-10">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="bg-gold-500 text-ocean-950 text-[9px] font-black px-3 py-1 rounded-sm tracking-widest">主厨甄选</span>
                        <div className="h-[1px] flex-1 bg-gold-500/30"></div>
                    </div>
                    <h2 className="text-3xl font-serif font-bold italic text-white tracking-tight leading-none mb-4">极地深海 · 海胆至尊</h2>
                    <p className="text-white/50 text-[10px] tracking-widest font-light leading-loose">来自阿拉斯加 500 米深海冷域，每 24 小时空运直达。今日直播间专享 8.5 折。</p>
                </div>
            </div>
        </div>

        {/* 分类切换：海洋波纹动效 */}
        <div className="flex gap-10 px-8 mb-14 overflow-x-auto no-scrollbar border-b border-white/5 pb-4">
            {['all', 'fish', 'crab_shrimp', 'shell'].map(cat => (
                <button 
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`text-[12px] font-black tracking-[0.4em] transition-all relative pb-3 whitespace-nowrap uppercase ${activeCategory === cat ? 'text-gold-500' : 'text-white/20'}`}
                >
                    {cat === 'all' ? '全部' : CATEGORY_NAMES[cat].split(' · ')[1]}
                    {activeCategory === cat && (
                        <div className="absolute bottom-[-1px] left-0 w-full h-[3px] bg-gold-500 rounded-full shadow-[0_0_10px_rgba(197,160,89,0.5)]"></div>
                    )}
                </button>
            ))}
        </div>

        {/* 商品网格 */}
        <div className="px-8 grid grid-cols-2 gap-x-8 gap-y-14">
            {filteredProducts.map(p => (
                <ProductCard 
                    key={p.id} 
                    product={p} 
                    onAddToCart={onAddToCart} 
                    onClick={onProductClick}
                    variant="store" 
                />
            ))}
        </div>
      </div>
    </div>
  );
};

export default Storefront;
