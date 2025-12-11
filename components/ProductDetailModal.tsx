
import React, { useState, useEffect, useRef } from 'react';
import { Product, CartItem, User, ProductVariant } from '../types';
import ShareModal from './ShareModal';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity?: number, variant?: ProductVariant) => void;
  onConsultAI?: (product: Product) => void;
  onNotifyMe?: (product: Product) => void; 
  cart: CartItem[]; 
  user: User | null;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onToggleFavorite?: (productId: string) => void;
}

type DetailTab = 'details' | 'specs' | 'reviews' | 'shipping';

interface Particle {
    id: number;
    x: number;
    y: number;
}

// --- Live Activity Simulation ---
const LiveActivityTicker: React.FC = () => {
    const [msg, setMsg] = useState('');
    const [show, setShow] = useState(false);
    
    useEffect(() => {
        const actions = ['刚刚下单了', '加入了购物车', '正在咨询', '复购了'];
        const names = ['张**', '王**', 'Lisa', '陈先生', '138****', 'Kevin', '李女士'];
        
        const cycle = () => {
            setShow(false);
            setTimeout(() => {
                const name = names[Math.floor(Math.random() * names.length)];
                const action = actions[Math.floor(Math.random() * actions.length)];
                setMsg(`${name} ${action}`);
                setShow(true);
            }, 500 + Math.random() * 2000); 
        };

        const interval = setInterval(cycle, 6000);
        cycle(); // init
        return () => clearInterval(interval);
    }, []);

    return (
        <div className={`absolute top-24 left-4 z-20 transition-all duration-500 transform ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="bg-black/60 backdrop-blur-md rounded-full px-3 py-1 flex items-center gap-2 border border-white/5 shadow-lg">
                <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-gold-400 to-amber-600 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                </div>
                <span className="text-[10px] text-white font-medium tracking-wide">{msg}</span>
            </div>
        </div>
    );
};

const CookingModeOverlay: React.FC<{ steps: string[]; onClose: () => void; productName: string; onConsult?: () => void }> = ({ steps, onClose, productName, onConsult }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [timerDuration, setTimerDuration] = useState(0); // in seconds
    const [timeLeft, setTimeLeft] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [isTimerFinished, setIsTimerFinished] = useState(false);

    // Extract time from step text (e.g. "8分钟", "30秒")
    const extractTime = (text: string) => {
        const minMatch = text.match(/(\d+)分钟/);
        const secMatch = text.match(/(\d+)秒/);
        let seconds = 0;
        if (minMatch) seconds += parseInt(minMatch[1]) * 60;
        if (secMatch) seconds += parseInt(secMatch[1]);
        return seconds;
    };

    useEffect(() => {
        // Check current step for time
        const duration = extractTime(steps[currentStep]);
        if (duration > 0) {
            setTimerDuration(duration);
            setTimeLeft(duration);
            setIsTimerRunning(false);
            setIsTimerFinished(false);
        } else {
            setTimerDuration(0);
        }
    }, [currentStep, steps]);

    useEffect(() => {
        let interval: any;
        if (isTimerRunning && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isTimerRunning) {
            setIsTimerRunning(false);
            setIsTimerFinished(true);
            if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
        }
        return () => clearInterval(interval);
    }, [isTimerRunning, timeLeft]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black text-white flex flex-col animate-scale-in">
            {/* Header */}
            <div className="flex justify-between items-center p-6 pt-safe-top">
                <button onClick={onClose} className="text-gray-400 hover:text-white flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    退出烹饪
                </button>
                <div className="text-sm font-serif text-gold-500 font-bold">{productName} · 主厨模式</div>
                
                {/* Consult AI Button in Header */}
                <button 
                    onClick={onConsult}
                    className="flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded-full text-xs font-bold hover:bg-white/20 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    问大厨
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col items-center justify-center px-8 relative">
                <div className="absolute top-10 text-9xl font-black text-white/5 select-none">{currentStep + 1}</div>
                
                <div key={currentStep} className="relative z-10 animate-slide-in-right w-full">
                    <h3 className="text-2xl font-bold mb-6 leading-relaxed text-center">
                        {steps[currentStep].replace(/^\d+[.、]\s*/, '')}
                    </h3>

                    {/* Smart Timer */}
                    {timerDuration > 0 && (
                        <div className="mt-8 flex flex-col items-center animate-fade-in-up">
                            <div className="relative w-40 h-40 flex items-center justify-center">
                                {/* Timer Circle Background */}
                                <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                                    <circle cx="80" cy="80" r="70" stroke="#334155" strokeWidth="8" fill="none" />
                                    <circle 
                                        cx="80" cy="80" r="70" stroke="#f59e0b" strokeWidth="8" fill="none" 
                                        strokeDasharray="440"
                                        strokeDashoffset={440 - (440 * timeLeft) / timerDuration}
                                        className="transition-all duration-1000 ease-linear"
                                        strokeLinecap="round"
                                    />
                                </svg>
                                
                                <div className="text-center z-10">
                                    <div className="text-4xl font-mono font-bold text-white">{formatTime(timeLeft)}</div>
                                    <div className="text-[10px] text-gray-400 mt-1">{isTimerFinished ? '时间到' : isTimerRunning ? '计时中' : '建议时长'}</div>
                                </div>
                            </div>

                            <button 
                                onClick={() => isTimerFinished ? setIsTimerFinished(false) : setIsTimerRunning(!isTimerRunning)}
                                className={`mt-6 px-8 py-3 rounded-full font-bold shadow-lg transition-transform active:scale-95 ${isTimerFinished ? 'bg-green-500 text-white animate-bounce' : isTimerRunning ? 'bg-red-500 text-white' : 'bg-gold-500 text-ocean-900'}`}
                            >
                                {isTimerFinished ? '闹铃已响 (点击停止)' : isTimerRunning ? '暂停计时' : '开始计时'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Progress Dots */}
                <div className="flex gap-2 mt-12">
                    {steps.map((_, idx) => (
                        <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentStep ? 'w-8 bg-gold-500' : 'w-1.5 bg-gray-700'}`}></div>
                    ))}
                </div>
            </div>

            {/* Controls */}
            <div className="p-8 pb-safe-bottom flex justify-between items-center bg-gray-900/50 backdrop-blur-sm">
                <button 
                    onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                    disabled={currentStep === 0}
                    className="p-4 rounded-full border border-gray-600 text-gray-400 disabled:opacity-30 disabled:border-gray-800"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </button>

                <div className="text-xs text-gray-500 font-mono">
                    STEP {currentStep + 1} / {steps.length}
                </div>

                <button 
                    onClick={() => {
                        if (currentStep < steps.length - 1) {
                            setCurrentStep(currentStep + 1);
                        } else {
                            onClose();
                        }
                    }}
                    className={`px-8 py-4 rounded-full font-bold text-ocean-900 transition-all active:scale-95 flex items-center gap-2 ${currentStep === steps.length - 1 ? 'bg-green-500' : 'bg-gold-500'}`}
                >
                    {currentStep === steps.length - 1 ? '完成烹饪' : '下一步'}
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                </button>
            </div>
        </div>
    );
};

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, isOpen, onClose, onAddToCart, onConsultAI, onNotifyMe, cart, user, showToast, onToggleFavorite }) => {
  const [activeTab, setActiveTab] = useState<DetailTab>('details');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [hasSubscribed, setHasSubscribed] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isAdding, setIsAdding] = useState(false); 
  const [particles, setParticles] = useState<Particle[]>([]);
  const [headerOpacity, setHeaderOpacity] = useState(0); 
  const [isCookingMode, setIsCookingMode] = useState(false);
  const [viewers, setViewers] = useState(120); // Simulated Viewer Count
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Variant State
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

  // Initialize variant & quantity & viewers
  useEffect(() => {
      if (product && product.variants && product.variants.length > 0) {
          setSelectedVariantId(product.variants[0].id);
      } else {
          setSelectedVariantId(null);
      }
      setQuantity(1);
      setIsZoomed(false);
      setIsAdding(false);
      setHeaderOpacity(0);
      setIsCookingMode(false);
      
      // Reset viewers simulation
      setViewers(100 + Math.floor(Math.random() * 200));
  }, [product, isOpen]);

  // Viewers fluctuation
  useEffect(() => {
      const interval = setInterval(() => {
          setViewers(prev => Math.max(50, prev + Math.floor(Math.random() * 7) - 3));
      }, 3000);
      return () => clearInterval(interval);
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
      const scrollTop = e.currentTarget.scrollTop;
      const opacity = Math.min(1, scrollTop / 150); 
      setHeaderOpacity(opacity);
  };

  if (!isOpen || !product) return null;

  // Determine active item info (either variant or base product)
  const variants = product.variants || [];
  const hasVariants = variants.length > 0;
  const activeVariant = hasVariants ? variants.find(v => v.id === selectedVariantId) : null;

  const currentPrice = activeVariant ? activeVariant.price : product.price;
  const currentStock = activeVariant ? activeVariant.stock : product.stock;
  
  const cartItem = cart.find(c => c.id === product.id && c.selectedVariantId === selectedVariantId);
  const cartQuantity = cartItem ? cartItem.quantity : 0;

  const availableStock = Math.max(0, currentStock - cartQuantity);
  const isOutOfStock = currentStock <= 0;
  
  const images = [product.image, ...Array(2).fill(product.image)]; 

  const handleNotify = () => {
      setHasSubscribed(true);
      if (onNotifyMe) onNotifyMe(product);
  };

  const handleQuantityChange = (delta: number) => {
      const newQty = quantity + delta;
      if (newQty >= 1 && newQty <= availableStock) {
          setQuantity(newQty);
          if (navigator.vibrate) navigator.vibrate(10);
      } else if (newQty > availableStock) {
          showToast(`最大可购买数量为 ${availableStock}`, 'info');
      }
  };

  const addParticle = (e: React.MouseEvent) => {
      const newParticle = { id: Date.now(), x: e.clientX, y: e.clientY };
      setParticles(prev => [...prev, newParticle]);
      setTimeout(() => {
          setParticles(prev => prev.filter(p => p.id !== newParticle.id));
      }, 1000);
  };

  const handleAddToCartClick = (buyNow: boolean = false, e: React.MouseEvent) => {
      if (quantity > availableStock) {
          showToast('库存不足', 'error');
          return;
      }
      
      setIsAdding(true);
      if (navigator.vibrate) navigator.vibrate(50);
      if (!buyNow) addParticle(e);

      setTimeout(() => {
          if (hasVariants && activeVariant) {
              onAddToCart(product, quantity, activeVariant);
          } else {
              onAddToCart(product, quantity);
          }
          
          setIsAdding(false);
          
          if (buyNow) {
              onClose();
          } else {
              showToast('已成功加入购物袋', 'success');
          }
      }, 600);
  };

  // Parsing cooking method for step-by-step mode
  const parseCookingSteps = (text?: string): string[] => {
      if (!text) return [];
      // Split by numbered lists (1. 2.) or newlines if numbers aren't prominent
      const steps = text.split(/(?:\d+[.、]\s*)|(?:\n+)/).filter(s => s.trim().length > 0);
      if (steps.length <= 1 && text.length > 20) {
          // Fallback chunking if no clear delimiters
          return [text];
      }
      return steps;
  };

  const cookingSteps = parseCookingSteps(product.cookingMethod);

  return (
    <>
    {isCookingMode && (
        <CookingModeOverlay 
            steps={cookingSteps} 
            onClose={() => setIsCookingMode(false)} 
            productName={product.name}
            onConsult={() => {
                setIsCookingMode(false);
                if (onConsultAI) onConsultAI(product);
            }}
        />
    )}
    
    <div className="absolute inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm pointer-events-auto transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Lightbox / Zoom View */}
      {isZoomed && (
          <div 
            className="absolute inset-0 z-[60] bg-black flex items-center justify-center pointer-events-auto animate-fade-in"
            onClick={() => setIsZoomed(false)}
          >
              <img 
                  src={images[currentImageIndex]} 
                  className="max-w-full max-h-full object-contain transition-transform duration-300 scale-100" 
                  alt="Zoom"
              />
              <button 
                  className="absolute top-safe-top right-4 p-3 text-white/50 hover:text-white"
                  onClick={() => setIsZoomed(false)}
              >
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
              <div className="absolute bottom-10 left-0 w-full flex justify-center gap-2">
                  {images.map((_, idx) => (
                      <div key={idx} className={`w-2 h-2 rounded-full ${idx === currentImageIndex ? 'bg-white' : 'bg-white/30'}`} />
                  ))}
              </div>
          </div>
      )}

      {/* Floating +1 Particles */}
      {particles.map(p => (
          <div 
            key={p.id}
            className="fixed text-gold-500 font-bold text-xl pointer-events-none z-[100] animate-float-up"
            style={{ left: p.x, top: p.y }}
          >
              +1
          </div>
      ))}
      <style>{`
        @keyframes floatUpFade {
            0% { transform: translateY(0); opacity: 1; }
            100% { transform: translateY(-50px); opacity: 0; }
        }
        .animate-float-up { animation: floatUpFade 0.8s ease-out forwards; }
      `}</style>

      <div className="bg-ocean-900 w-full h-[90%] sm:h-[85%] rounded-t-3xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto transform transition-transform animate-slide-in-up relative border border-gold-500/10">
        
        {/* Dynamic Sticky Header */}
        <div 
            className="absolute top-0 left-0 w-full z-20 flex items-center justify-between px-4 pt-4 pb-2 transition-colors duration-300 pointer-events-none"
            style={{ backgroundColor: `rgba(15, 23, 42, ${headerOpacity * 0.95})`, backdropFilter: `blur(${headerOpacity * 10}px)` }}
        >
            <div className="pointer-events-auto" onClick={onClose}>
                <div className="bg-black/30 backdrop-blur-md p-2 rounded-full text-white/90 hover:text-white transition-colors border border-white/10" style={{backgroundColor: headerOpacity > 0.5 ? 'transparent' : undefined, borderColor: headerOpacity > 0.5 ? 'transparent' : undefined}}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </div>
            </div>
            
            {/* Title Fades In */}
            <div className="text-white font-bold text-sm truncate opacity-0 transition-opacity duration-300 px-4" style={{ opacity: headerOpacity }}>
                {product.name}
            </div>

            <div className="flex items-center gap-3 pointer-events-auto">
                {onToggleFavorite && (
                    <button 
                        onClick={() => {
                            onToggleFavorite(product.id);
                            if(navigator.vibrate) navigator.vibrate(20);
                        }}
                        className="bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-md transition-colors border border-white/10 hover:text-red-500 group"
                        style={{backgroundColor: headerOpacity > 0.5 ? 'transparent' : undefined, borderColor: headerOpacity > 0.5 ? 'transparent' : undefined}}
                    >
                        <svg className="group-active:scale-125 transition-transform" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                    </button>
                )}
                <button 
                    onClick={() => setIsShareModalOpen(true)}
                    className="bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-md transition-colors border border-white/10"
                    style={{backgroundColor: headerOpacity > 0.5 ? 'transparent' : undefined, borderColor: headerOpacity > 0.5 ? 'transparent' : undefined}}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>
                </button>
            </div>
        </div>

        <div 
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto pb-[calc(6rem+env(safe-area-inset-bottom))] no-scrollbar bg-ocean-900"
        >
            
            <div 
                className="h-[450px] w-full relative shrink-0 bg-ocean-800 cursor-zoom-in group"
                onClick={() => setIsZoomed(true)}
            >
                <img 
                    src={images[currentImageIndex]} 
                    alt={product.name} 
                    className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${isOutOfStock ? 'grayscale opacity-70' : ''}`}
                />
                
                {/* Live Stream Viewers Badge - SIMULATED */}
                <div className="absolute top-20 right-4 bg-black/40 backdrop-blur-md text-white text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-white/10 shadow-lg z-20">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_5px_#22c55e]"></div>
                    <span className="font-mono tracking-wider">{viewers} 人正在浏览</span>
                </div>

                {/* Live Purchase Ticker */}
                <LiveActivityTicker />
                
                {/* Zoom Hint */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/30 backdrop-blur rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="M11 8v6"/><path d="M8 11h6"/></svg>
                </div>

                {product.isLive && !isOutOfStock && (
                    <div className="absolute bottom-6 left-6 z-10 flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-red-600 text-white text-xs px-2.5 py-1 rounded-sm shadow-lg backdrop-blur-sm animate-pulse">
                            <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                            <span className="font-bold tracking-wide uppercase">Live Special</span>
                        </div>
                        <div className="bg-black/50 backdrop-blur text-white text-xs px-2 py-1 rounded-sm border border-white/10">
                            限时特惠
                        </div>
                    </div>
                )}
                {isOutOfStock && (
                     <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/40 backdrop-blur-[2px]">
                         <div className="bg-black/80 border border-white/30 px-6 py-3 text-white text-xl font-bold tracking-[0.2em] uppercase -rotate-6 shadow-2xl">
                             {hasVariants ? '该规格缺货' : '暂时缺货'}
                         </div>
                     </div>
                )}

                {/* Enhanced Image Dots */}
                <div className="absolute bottom-6 right-6 flex gap-2 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-sm pointer-events-auto border border-white/5">
                    {images.map((_, idx) => (
                        <div 
                            key={idx} 
                            onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); }}
                            className={`h-1.5 rounded-full transition-all cursor-pointer ${idx === currentImageIndex ? 'bg-gold-500 w-6 shadow-[0_0_5px_#f59e0b]' : 'bg-white/30 w-1.5 hover:bg-white'}`}
                        />
                    ))}
                </div>
            </div>

            <div className="relative px-6 -mt-8 rounded-t-3xl bg-ocean-900 pt-8 pb-6 border-t border-white/5 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
                {/* Premium Price Tag */}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-col">
                        <div className="flex items-baseline gap-1 text-gold-500">
                            <span className="text-lg font-serif font-bold">¥</span>
                            <span className="text-4xl font-serif font-bold tracking-tight">{currentPrice}</span>
                            <span className="text-sm text-gray-400 font-sans ml-1">/ {product.unit}</span>
                        </div>
                        {product.isLive && (
                            <span className="text-[10px] text-red-400 mt-1 line-through decoration-red-400/50">市场价 ¥{(currentPrice * 1.2).toFixed(0)}</span>
                        )}
                    </div>
                    {/* Stock Status Pill */}
                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold border ${availableStock < 10 ? 'bg-red-900/30 text-red-400 border-red-500/30' : 'bg-green-900/30 text-green-400 border-green-500/30'}`}>
                        {availableStock < 10 ? `仅剩 ${availableStock} 件` : '现货充足'}
                    </div>
                </div>

                <h1 className="text-2xl font-serif font-bold text-white leading-snug mb-3">{product.name}</h1>
                
                {/* Tags Row */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {product.tags.map(tag => (
                        <span key={tag} className="text-[10px] text-gray-300 bg-white/5 border border-white/10 px-2.5 py-1 rounded-md tracking-wide">
                            {tag}
                        </span>
                    ))}
                </div>

                {/* Variants Selection (High End) */}
                {hasVariants && (
                    <div className="mb-8">
                        <h3 className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-3">选择规格</h3>
                        <div className="flex flex-wrap gap-3">
                            {variants.map(v => {
                                const isSelected = selectedVariantId === v.id;
                                const isVarOutOfStock = v.stock <= 0;
                                return (
                                    <button
                                        key={v.id}
                                        onClick={() => !isVarOutOfStock && setSelectedVariantId(v.id)}
                                        disabled={isVarOutOfStock}
                                        className={`px-4 py-2.5 rounded-lg text-sm transition-all border relative overflow-hidden ${
                                            isSelected 
                                            ? 'bg-gold-600 text-ocean-900 border-gold-600 font-bold shadow-lg shadow-gold-900/20' 
                                            : isVarOutOfStock 
                                                ? 'bg-ocean-800 text-gray-600 border-ocean-700 cursor-not-allowed opacity-50'
                                                : 'bg-ocean-800 text-gray-300 border-ocean-700 hover:border-gold-500/50'
                                        }`}
                                    >
                                        {v.name}
                                        {isSelected && <div className="absolute top-0 right-0 w-2 h-2 bg-white rounded-bl-md"></div>}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Expandable Description */}
                <div className="bg-ocean-800/50 rounded-2xl p-5 border border-white/5 mb-6">
                    <h3 className="text-sm font-serif font-bold text-gold-500 mb-3 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                        商品故事
                    </h3>
                    <p className="text-sm text-gray-300 leading-relaxed opacity-90">
                        {product.description}
                    </p>
                    {product.origin && (
                        <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2 text-xs text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                            原产地：<span className="text-white">{product.origin}</span>
                        </div>
                    )}
                </div>

                {/* AI & Cooking Actions */}
                <div className="grid grid-cols-2 gap-3 mb-8">
                    <button 
                        onClick={() => { onClose(); if (onConsultAI) onConsultAI(product); }}
                        className="bg-ocean-800/80 hover:bg-ocean-700 border border-gold-500/20 rounded-xl p-3 flex flex-col items-center gap-2 transition-colors group"
                    >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-ocean-700 to-ocean-900 flex items-center justify-center border border-white/5 group-hover:border-gold-500/50 shadow-inner">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gold-500"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                        </div>
                        <span className="text-xs text-gray-300 font-medium">AI 咨询</span>
                    </button>
                    <button 
                        onClick={() => setIsCookingMode(true)}
                        className="bg-ocean-800/80 hover:bg-ocean-700 border border-gold-500/20 rounded-xl p-3 flex flex-col items-center gap-2 transition-colors group"
                    >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-ocean-700 to-ocean-900 flex items-center justify-center border border-white/5 group-hover:border-gold-500/50 shadow-inner">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gold-500"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
                        </div>
                        <span className="text-xs text-gray-300 font-medium">主厨模式</span>
                    </button>
                </div>

                {/* Additional Details (Collapsible Concept) */}
                <div className="space-y-4 text-sm text-gray-400 pb-8">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">更多信息</h3>
                    {product.nutrition && (
                        <div className="flex gap-3">
                            <span className="w-16 flex-shrink-0 text-gray-500">营养价值</span>
                            <span className="text-gray-300">{product.nutrition}</span>
                        </div>
                    )}
                    {product.cookingMethod && (
                        <div className="flex gap-3">
                            <span className="w-16 flex-shrink-0 text-gray-500">推荐做法</span>
                            <span className="text-gray-300 line-clamp-3">{product.cookingMethod}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Floating Bottom Action Capsule */}
        <div className="absolute bottom-4 left-4 right-4 z-30">
            <div className="bg-ocean-900/90 backdrop-blur-xl border border-white/10 rounded-full p-2 pl-4 flex items-center justify-between shadow-[0_20px_40px_rgba(0,0,0,0.6)]">
                
                {/* Quantity Stepper (Compact) */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-ocean-800 rounded-full border border-white/5 h-10 px-1">
                        <button 
                            onClick={() => handleQuantityChange(-1)}
                            disabled={quantity <= 1}
                            className="w-8 h-full flex items-center justify-center text-gray-400 hover:text-white disabled:opacity-30"
                        >
                            -
                        </button>
                        <span className="w-6 text-center text-white font-bold text-sm">{quantity}</span>
                        <button 
                            onClick={() => handleQuantityChange(1)}
                            disabled={quantity >= availableStock}
                            className="w-8 h-full flex items-center justify-center text-gray-400 hover:text-white disabled:opacity-30"
                        >
                            +
                        </button>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                    {isOutOfStock ? (
                        <button 
                            onClick={handleNotify} 
                            disabled={hasSubscribed}
                            className="bg-ocean-800 text-white px-6 py-3 rounded-full font-bold text-sm border border-white/10 disabled:opacity-50"
                        >
                            {hasSubscribed ? '已订阅' : '到货提醒'}
                        </button>
                    ) : (
                        <>
                            <button 
                                onClick={(e) => handleAddToCartClick(false, e)}
                                className={`w-12 h-12 rounded-full border border-gold-500/30 flex items-center justify-center text-gold-500 hover:bg-gold-500/10 transition-colors relative ${isAdding ? 'scale-90' : ''}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/><path d="M12 8v4"/><path d="M10 10h4"/></svg>
                                {cartQuantity > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-bold shadow-sm border border-ocean-900">
                                        {cartQuantity}
                                    </span>
                                )}
                            </button>
                            <button 
                                onClick={(e) => handleAddToCartClick(true, e)}
                                className="bg-gradient-to-r from-gold-600 to-gold-500 text-ocean-900 px-8 py-3 rounded-full font-bold text-sm shadow-lg shadow-gold-500/20 active:scale-95 transition-transform flex items-center gap-1"
                            >
                                立即购买
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>

        {/* Share Modal */}
        <ShareModal 
            isOpen={isShareModalOpen} 
            onClose={() => setIsShareModalOpen(false)}
            type="product"
            data={product}
            user={user}
            onSave={() => showToast('海报已保存到相册', 'success')}
        />
      </div>
    </div>
    </>
  );
};

export default ProductDetailModal;
