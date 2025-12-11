
import React, { useState, useEffect } from 'react';
import { CartItem, Product } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onRemove: (id: string, variantId?: string) => void;
  onUpdateQuantity: (id: string, variantId: string | undefined, newQty: number) => void; 
  onCheckout: () => void;
  recommendations?: Product[]; // New prop for upsell items
  onAddRecommendation?: (product: Product) => void; // Handler to add recommendation
}

const FREE_SHIPPING_THRESHOLD = 500;

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, cart, onRemove, onUpdateQuantity, onCheckout, recommendations = [], onAddRecommendation }) => {
  const [showUnlockAnim, setShowUnlockAnim] = useState(false);
  const [prevRemaining, setPrevRemaining] = useState(FREE_SHIPPING_THRESHOLD);

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - total);
  const progress = Math.min(100, (total / FREE_SHIPPING_THRESHOLD) * 100);

  // Trigger animation when crossing the threshold
  useEffect(() => {
      if (prevRemaining > 0 && remaining === 0) {
          setShowUnlockAnim(true);
          setTimeout(() => setShowUnlockAnim(false), 3000);
      }
      setPrevRemaining(remaining);
  }, [remaining, prevRemaining]);

  // Filter out items already in cart for recommendations
  const filteredRecommendations = recommendations.filter(rec => !cart.some(c => c.id === rec.id));

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      
      {/* Drawer - Enhanced Glassmorphism */}
      <div className="relative w-[85%] max-w-sm bg-ocean-900/95 backdrop-blur-xl h-full shadow-2xl flex flex-col border-l border-white/5 transform transition-transform animate-slide-in-right">
        {/* Confetti Overlay */}
        {showUnlockAnim && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-50">
                {[...Array(20)].map((_, i) => (
                    <div key={i} className="absolute w-2 h-2 bg-gold-500 rounded-full animate-confetti" style={{
                        left: `${Math.random() * 100}%`,
                        top: `-10px`,
                        animationDelay: `${Math.random() * 0.5}s`,
                        animationDuration: `${1 + Math.random()}s`,
                        backgroundColor: i % 2 === 0 ? '#f59e0b' : '#34d399'
                    }}></div>
                ))}
            </div>
        )}
        <style>{`
            @keyframes confetti {
                0% { transform: translateY(0) rotate(0deg); opacity: 1; }
                100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
            }
            .animate-confetti { animation: confetti linear forwards; }
        `}</style>

        <div className="p-5 border-b border-white/5 flex items-center justify-between pt-safe-top">
            <h2 className="font-serif text-xl text-white">购物袋 <span className="text-sm font-sans text-gray-500">({cart.reduce((a,b)=>a+b.quantity,0)})</span></h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
        </div>

        {/* Free Shipping Progress Bar - Glow Effect */}
        <div className="px-5 pt-4 pb-1 relative">
            <div className="flex justify-between items-center text-xs mb-1.5">
                {remaining > 0 ? (
                    <span className="text-gray-400">再买 <span className="text-gold-500 font-bold">¥{remaining.toFixed(0)}</span> 享顺丰冷链包邮</span>
                ) : (
                    <span className="text-green-400 font-bold flex items-center gap-1 animate-scale-in">
                        <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-ocean-900">
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        </div>
                        已享顺丰冷链包邮
                    </span>
                )}
                <span className="text-gray-500">满¥500免运费</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 relative shadow-inner">
                <div 
                    className={`h-full rounded-full transition-all duration-700 relative overflow-hidden ${remaining === 0 ? 'bg-gradient-to-r from-green-500 to-green-400 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-gradient-to-r from-gold-600 to-gold-400'}`}
                    style={{ width: `${progress}%` }}
                >
                    {/* Shimmer effect inside bar */}
                    <div className="absolute inset-0 bg-white/30 skew-x-12 translate-x-[-100%] animate-shine"></div>
                </div>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4 pb-32">
            {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-3 text-white/20">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/><path d="M12 8v4"/><path d="M10 10h4"/></svg>
                    </div>
                    <p className="text-sm font-medium text-gray-400">您的购物袋是空的</p>
                    <button onClick={onClose} className="mt-4 px-6 py-2 rounded-full border border-gold-500/50 text-gold-500 text-xs font-bold hover:bg-gold-500/10 transition-colors">
                        去挑选海鲜
                    </button>
                </div>
            ) : (
                cart.map((item, idx) => (
                    <div key={`${item.id}-${item.selectedVariantId || 'base'}`} className="flex gap-3 bg-white/5 p-3 rounded-xl border border-white/5 shadow-sm">
                        <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg flex-shrink-0 bg-ocean-900/50 border border-white/5" />
                        <div className="flex-1 flex flex-col justify-between">
                            <div>
                                <h4 className="text-sm text-gray-200 font-medium line-clamp-1">{item.name}</h4>
                                {item.selectedVariantName && (
                                    <div className="text-[10px] text-gray-400 bg-black/20 px-1.5 py-0.5 rounded w-fit mt-1 border border-white/5">
                                        {item.selectedVariantName}
                                    </div>
                                )}
                                <span className="text-gold-500 text-sm font-bold block mt-1 font-serif">¥{item.price}</span>
                            </div>
                            
                            <div className="flex items-center justify-between mt-2">
                                {/* Quantity Control */}
                                <div className="flex items-center bg-black/20 rounded-lg border border-white/5">
                                    <button 
                                        onClick={() => item.quantity > 1 ? onUpdateQuantity(item.id, item.selectedVariantId, item.quantity - 1) : null}
                                        disabled={item.quantity <= 1}
                                        className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
                                    >
                                        -
                                    </button>
                                    <span className="text-xs text-white w-6 text-center font-bold">{item.quantity}</span>
                                    <button 
                                        onClick={() => onUpdateQuantity(item.id, item.selectedVariantId, item.quantity + 1)}
                                        disabled={item.quantity >= item.stock}
                                        className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
                                    >
                                        +
                                    </button>
                                </div>

                                <button onClick={() => onRemove(item.id, item.selectedVariantId)} className="text-gray-500 hover:text-red-400 p-1 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                ))
            )}

            {/* Recommendations / Upsell Section (Filtered) */}
            {filteredRecommendations.length > 0 && (
                <div className="mt-6 pt-4 border-t border-white/5">
                    <h3 className="text-xs font-bold text-gold-500 mb-3 flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0 1.1.2 2.2.5 3Z"/></svg>
                        主厨推荐凑单
                    </h3>
                    <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                        {filteredRecommendations.map(rec => (
                            <div key={rec.id} className="w-28 flex-shrink-0 bg-white/5 rounded-lg overflow-hidden border border-white/5 flex flex-col group">
                                <div className="h-20 w-full relative">
                                    <img src={rec.image} className="w-full h-full object-cover" alt={rec.name} />
                                    {onAddRecommendation && (
                                        <button 
                                            onClick={() => onAddRecommendation(rec)}
                                            className="absolute bottom-1 right-1 bg-gold-500 text-ocean-900 rounded-full w-6 h-6 flex items-center justify-center shadow-md active:scale-90 transition-transform hover:bg-gold-400"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                                        </button>
                                    )}
                                </div>
                                <div className="p-2">
                                    <h4 className="text-[10px] text-gray-200 line-clamp-1 truncate font-medium">{rec.name}</h4>
                                    <span className="text-[10px] font-bold text-gold-500">¥{rec.price}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>

        {/* Floating Bottom Capsule Checkout */}
        <div className="absolute bottom-6 left-4 right-4 z-20">
            <div className="bg-ocean-900/90 backdrop-blur-xl border border-white/10 rounded-full p-2 pl-6 flex items-center justify-between shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
                <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400">合计 (不含运费)</span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-sm font-bold text-gold-500">¥</span>
                        <span className="text-xl font-serif text-gold-500 font-bold">{total.toFixed(2)}</span>
                    </div>
                </div>
                <button 
                    className="bg-gradient-to-r from-gold-600 to-gold-500 text-ocean-900 px-8 py-3 rounded-full font-bold hover:shadow-lg hover:shadow-gold-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 flex items-center gap-2"
                    disabled={cart.length === 0}
                    onClick={onCheckout}
                >
                    <span>去结算</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
