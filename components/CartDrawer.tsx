
import React from 'react';
import { CartItem, Product } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onRemove: (id: string, variantId?: string) => void;
  onUpdateQuantity: (id: string, variantId: string | undefined, newQty: number) => void; 
  onCheckout: () => void;
  recommendations?: Product[];
  onAddRecommendation?: (product: Product) => void;
}

const FREE_SHIPPING_THRESHOLD = 500;

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, cart, onRemove, onUpdateQuantity, onCheckout }) => {
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - total);
  const progress = Math.min(100, (total / FREE_SHIPPING_THRESHOLD) * 100);

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-[85%] max-w-sm bg-ocean-950 h-full shadow-2xl flex flex-col border-l border-white/5 animate-slide-in-right">
        
        <div className="p-8 border-b border-white/5 flex items-center justify-between pt-safe-top">
            <h2 className="font-serif text-xl font-bold text-white tracking-[0.2em] uppercase">购物袋清单</h2>
            <button onClick={onClose} className="text-white/20 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
        </div>

        <div className="px-8 py-6">
            <div className="flex justify-between items-center text-[10px] mb-2 uppercase tracking-widest font-bold">
                {remaining > 0 ? (
                    <span className="text-white/40">距离顺丰冷链包邮还差 <span className="text-gold-500">¥{remaining}</span></span>
                ) : (
                    <span className="text-gold-500">已解锁顺丰冷链免费配送</span>
                )}
            </div>
            <div className="h-[2px] w-full bg-white/5 overflow-hidden">
                <div 
                    className="h-full bg-gold-500 transition-all duration-1000"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-4 space-y-8 no-scrollbar">
            {cart.length === 0 ? (
                <div className="py-20 text-center space-y-4">
                    <p className="text-white/20 text-xs font-serif italic tracking-widest">Your bag is currently empty.</p>
                </div>
            ) : (
                cart.map((item) => (
                    <div key={`${item.id}-${item.selectedVariantId || 'base'}`} className="flex gap-4 border-b border-white/5 pb-8 group">
                        <div className="w-20 h-24 bg-black overflow-hidden border border-white/5">
                            <img src={item.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                        </div>
                        <div className="flex-1 flex flex-col justify-between py-1">
                            <div>
                                <h4 className="text-xs font-bold text-white tracking-wide uppercase line-clamp-1">{item.name}</h4>
                                <span className="text-gold-500 font-serif text-sm block mt-1 font-bold">¥{item.price}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center border border-white/10 px-2 py-1 gap-4">
                                    <button onClick={() => onUpdateQuantity(item.id, item.selectedVariantId, item.quantity - 1)} className="text-white/40 text-xs">-</button>
                                    <span className="text-xs text-white font-mono">{item.quantity}</span>
                                    <button onClick={() => onUpdateQuantity(item.id, item.selectedVariantId, item.quantity + 1)} className="text-white/40 text-xs">+</button>
                                </div>
                                <button onClick={() => onRemove(item.id, item.selectedVariantId)} className="text-white/10 hover:text-red-500 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>

        <div className="p-8 pb-safe-bottom glass border-t border-white/5">
            <div className="flex justify-between items-end mb-8">
                <span className="text-[10px] text-white/40 font-bold uppercase tracking-[0.4em]">Subtotal</span>
                <span className="text-gold-500 font-serif text-2xl font-bold">¥ {total.toLocaleString()}</span>
            </div>
            <button 
                className="w-full bg-gold-500 text-ocean-950 py-5 font-black text-xs uppercase tracking-[0.5em] disabled:opacity-20 active:scale-95 transition-all shadow-[0_20px_40px_rgba(197,160,89,0.2)]"
                disabled={cart.length === 0}
                onClick={onCheckout}
            >
                结算并预定鲜货
            </button>
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
