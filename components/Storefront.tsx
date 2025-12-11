
import React, { useState, useEffect, useRef } from 'react';
import { Product, User, CartItem, StoreConfig, Coupon } from '../types';
import { CATEGORY_NAMES } from '../constants';
import ProductCard from './ProductCard';
import { geminiService } from '../services/geminiService';

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
  onOpenDiscovery?: () => void;
  storeConfig?: StoreConfig; 
  onToggleFavorite?: (productId: string) => void;
  onClaimCouponBatch?: (ids: string[]) => void;
  coupons?: Coupon[];
}

type SortOption = 'default' | 'price_asc' | 'price_desc' | 'sales_asc' | 'sales_desc';

interface Particle {
    id: number;
    x: number;
    y: number;
}

// --- MOCK BARRAGE DATA ---
const BARRAGE_NAMES = ['张**', '李**', '王**', '赵**', 'Chen**', 'Lisa', 'Mike', '刘**', 'Amanda', 'K.K'];
const BARRAGE_ACTIONS = ['刚刚下单了', '复购了', '抢到了', '加入了购物袋', '正在去结算', '领取了优惠券'];

const NewUserCouponModal: React.FC<{ isOpen: boolean; onClose: () => void; onClaim: () => void }> = ({ isOpen, onClose, onClaim }) => {
    if (!isOpen) return null;
    return (
        <div className="absolute inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in">
            <div className="bg-gradient-to-b from-red-600 to-red-800 w-full max-w-sm rounded-2xl p-6 text-center relative shadow-2xl animate-scale-in border border-red-400/50">
                <button onClick={onClose} className="absolute top-2 right-2 text-white/50 hover:text-white p-2">✕</button>
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg text-3xl">🎁</div>
                <h3 className="text-2xl font-serif font-bold text-white mb-2">新人专享礼包</h3>
                <p className="text-red-200 text-sm mb-6">内含 ¥100 无门槛券 + 98折黑金体验卡</p>
                
                <div className="space-y-3 mb-6">
                    <div className="bg-white/10 rounded-lg p-3 flex justify-between items-center border border-white/20">
                        <div className="text-left text-white">
                            <div className="font-bold text-lg">¥100</div>
                            <div className="text-[10px] opacity-80">全场通用</div>
                        </div>
                        <div className="text-white text-xs border border-white px-2 py-1 rounded">新人券</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3 flex justify-between items-center border border-white/20">
                        <div className="text-left text-white">
                            <div className="font-bold text-lg">9.8折</div>
                            <div className="text-[10px] opacity-80">黑金权益体验</div>
                        </div>
                        <div className="text-white text-xs border border-white px-2 py-1 rounded">折扣券</div>
                    </div>
                </div>

                <button onClick={onClaim} className="w-full bg-gold-500 text-red-900 font-bold py-3.5 rounded-full shadow-lg hover:bg-gold-400 transition-colors animate-pulse">一键领取</button>
            </div>
        </div>
    );
};

const AIPromptModal: React.FC<{ isOpen: boolean; onClose: () => void; onConfirm: () => void }> = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;
    return (
        <div className="absolute inset-0 z-[60] bg-black/70 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in">
            <div className="bg-ocean-900 border border-gold-500/30 w-full max-w-xs rounded-2xl p-6 shadow-2xl animate-scale-in relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/5 blur-2xl rounded-full pointer-events-none"></div>
                <div className="flex flex-col items-center text-center gap-5 relative z-10">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gold-600 to-gold-400 flex items-center justify-center text-ocean-900 shadow-[0_0_20px_rgba(245,158,11,0.4)]">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M9 9h6"/><path d="M9 13h6"/></svg>
                    </div>
                    <div>
                        <h3 className="text-white font-serif font-bold text-lg mb-2 tracking-wide">智能导购建议</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            您是否需要 AI 帮您精准匹配商品？
                        </p>
                    </div>
                    <div className="flex gap-3 w-full mt-2">
                        <button onClick={onClose} className="flex-1 py-2.5 rounded-full border border-ocean-700 text-gray-400 text-sm hover:text-white hover:border-ocean-600 transition-colors bg-ocean-800/50">
                            否
                        </button>
                        <button onClick={onConfirm} className="flex-1 py-2.5 rounded-full bg-gradient-to-r from-gold-600 to-gold-500 text-ocean-900 font-bold text-sm hover:shadow-lg hover:shadow-gold-500/20 transition-all active:scale-95 flex items-center justify-center gap-1">
                            是
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Barrage Component ---
interface BarrageItem {
    id: number;
    text: string;
    top: number; // 0, 1, 2 representing rows
    speed: number;
}

const LiveBarrage: React.FC<{ products: Product[] }> = ({ products }) => {
    const [items, setItems] = useState<BarrageItem[]>([]);
    
    useEffect(() => {
        const addBarrage = () => {
            if (products.length === 0) return;
            const randomProduct = products[Math.floor(Math.random() * products.length)];
            const randomName = BARRAGE_NAMES[Math.floor(Math.random() * BARRAGE_NAMES.length)];
            const randomAction = BARRAGE_ACTIONS[Math.floor(Math.random() * BARRAGE_ACTIONS.length)];
            
            const newItem: BarrageItem = {
                id: Date.now(),
                text: `${randomName} ${randomAction} 【${randomProduct.name.substring(0, 6)}...】`,
                top: Math.floor(Math.random() * 3), // 3 rows
                speed: 8 + Math.random() * 4 // Random speed 8-12s
            };

            setItems(prev => [...prev, newItem]);

            // Cleanup old items
            setTimeout(() => {
                setItems(prev => prev.filter(i => i.id !== newItem.id));
            }, newItem.speed * 1000);
        };

        const interval = setInterval(addBarrage, 2000);
        return () => clearInterval(interval);
    }, [products]);

    return (
        <div className="fixed top-[200px] left-0 w-full h-32 pointer-events-none z-30 overflow-hidden">
            {items.map(item => (
                <div 
                    key={item.id}
                    className="absolute whitespace-nowrap bg-black/40 backdrop-blur-md text-white text-[10px] px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/10 shadow-lg animate-barrage-move"
                    style={{
                        top: `${item.top * 40}px`, // 40px spacing per row
                        animationDuration: `${item.speed}s`,
                    }}
                >
                    <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-gold-500 to-gold-300 flex items-center justify-center text-[8px] text-ocean-900 font-bold">
                        购
                    </div>
                    <span className="font-medium tracking-wide">{item.text}</span>
                </div>
            ))}
            <style>{`
                @keyframes barrage-move {
                    from { transform: translateX(100vw); }
                    to { transform: translateX(-100%); }
                }
                .animate-barrage-move {
                    animation-name: barrage-move;
                    animation-timing-function: linear;
                    animation-fill-mode: forwards;
                    left: 0; 
                }
            `}</style>
        </div>
    );
};

const Storefront: React.FC<StorefrontProps> = ({ products, onAddToCart, onBack, cartCount, onOpenCart, onOpenProfile, user, onProductClick, cart, onOpenDiscovery, storeConfig, onToggleFavorite, onClaimCouponBatch, coupons }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('default');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [headerScrolled, setHeaderScrolled] = useState(false);
  
  // Search Overlay State
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // AI Search States
  const [isAISearching, setIsAISearching] = useState(false);
  const [aiMatchedIds, setAiMatchedIds] = useState<string[] | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [showAIPrompt, setShowAIPrompt] = useState(false);

  // Countdown State
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  // Coupon Popup State
  const [showCouponModal, setShowCouponModal] = useState(false);
  
  // Cart Animation State
  const [isCartAnimating, setIsCartAnimating] = useState(false);
  const prevCartCountRef = useRef(cartCount);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Particle Effects
  const [particles, setParticles] = useState<Particle[]>([]);

  // Load Search History
  useEffect(() => {
      const history = localStorage.getItem('search_history');
      if (history) {
          setSearchHistory(JSON.parse(history));
      }
  }, []);

  const saveSearchHistory = (query: string) => {
      if (!query.trim()) return;
      const newHistory = [query, ...searchHistory.filter(h => h !== query)].slice(0, 8);
      setSearchHistory(newHistory);
      localStorage.setItem('search_history', JSON.stringify(newHistory));
  };

  const clearSearchHistory = () => {
      setSearchHistory([]);
      localStorage.removeItem('search_history');
  };

  // Close search overlay when clicking outside
  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
              setIsSearchFocused(false);
          }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
      if (cartCount > prevCartCountRef.current) {
          setIsCartAnimating(true);
          const timer = setTimeout(() => setIsCartAnimating(false), 300);
          return () => clearTimeout(timer);
      }
      prevCartCountRef.current = cartCount;
  }, [cartCount]);

  useEffect(() => {
    // Show popup if user exists, hasn't claimed coupons, and it hasn't been shown this session
    if (user && (!user.claimedCouponIds || user.claimedCouponIds.length === 0)) {
        if (!sessionStorage.getItem('coupon_shown')) {
            setTimeout(() => setShowCouponModal(true), 1500);
        }
    }
  }, [user]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
      const scrollTop = e.currentTarget.scrollTop;
      setShowScrollTop(scrollTop > 400);
      setHeaderScrolled(scrollTop > 20); // Header background toggle threshold
  };

  const scrollToTop = () => {
      scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClaimAll = () => {
      if (onClaimCouponBatch && coupons) {
          const idsToClaim = coupons.slice(0, 2).map(c => c.id);
          onClaimCouponBatch(idsToClaim);
      }
      setShowCouponModal(false);
      sessionStorage.setItem('coupon_shown', 'true');
  };

  const handleCloseCoupon = () => {
      setShowCouponModal(false);
      sessionStorage.setItem('coupon_shown', 'true');
  }

  useEffect(() => {
    if (!storeConfig) return;
    
    const calculateTimeLeft = () => {
        const diff = new Date(storeConfig.flashSaleEndTime).getTime() - new Date().getTime();
        if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0 };
        return {
            hours: Math.floor(diff / (1000 * 60 * 60)),
            minutes: Math.floor((diff / (1000 * 60)) % 60),
            seconds: Math.floor((diff / 1000) % 60)
        };
    };

    setTimeLeft(calculateTimeLeft()); // Init

    const timer = setInterval(() => {
        setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [storeConfig]);

  const formatTime = (val: number) => val.toString().padStart(2, '0');

  // Filter Logic
  const filteredProducts = products.filter(p => {
      const categoryMatch = activeCategory === 'all' || p.category === activeCategory;
      let searchMatch = true;
      if (searchQuery) {
          if (aiMatchedIds !== null) {
              searchMatch = aiMatchedIds.includes(p.id);
          } else {
              searchMatch = p.name.toLowerCase().includes(searchQuery.toLowerCase())
                  || p.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
          }
      }
      return categoryMatch && searchMatch;
  });

  // Sort Logic
  const sortedProducts = [...filteredProducts].sort((a, b) => {
      if (sortOption === 'default') {
          if (a.isLive && !b.isLive) return -1;
          if (!a.isLive && b.isLive) return 1;
          return 0;
      }
      if (sortOption === 'sales_desc') {
          return (a.stock - b.stock); 
      }
      if (sortOption === 'sales_asc') {
          return (b.stock - a.stock); 
      }
      if (sortOption === 'price_asc') {
          return a.price - b.price;
      }
      if (sortOption === 'price_desc') {
          return b.price - a.price;
      }
      return 0;
  });

  const liveHeroProduct = products.find(p => p.isLive);

  const handleTagClick = (tag: string) => {
      setSearchQuery(tag);
      saveSearchHistory(tag);
      setActiveCategory('all');
      setAiMatchedIds(null);
      setIsSearchFocused(false); // Close overlay
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
      if (e.target.value === '') setAiMatchedIds(null);
  };

  const handleClearSearch = () => {
      setSearchQuery('');
      setAiMatchedIds(null);
      inputRef.current?.focus();
  };

  const handleSearchSubmit = async () => {
      if (!searchQuery.trim()) return;
      setIsSearchFocused(false);
      saveSearchHistory(searchQuery);
      
      const simpleMatches = products.filter(p => 
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
          p.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );

      // Uncertainty Heuristics
      const semanticKeywords = ['推荐', '怎么', '送礼', '做法', '适合', '老人', '孩子', '孕妇', '哪个', '什么', '大餐', '左右', '健康', '补', '好吃', '营养', 'gift', 'how', 'best', 'recipe'];
      const isSemantic = semanticKeywords.some(k => searchQuery.toLowerCase().includes(k));
      const isLongQuery = searchQuery.length > 5;

      if (simpleMatches.length === 0 || isSemantic || isLongQuery) {
          setAiMatchedIds(null); 
          setShowAIPrompt(true);
      } else {
          setAiMatchedIds(null); 
      }
  };

  const handleConfirmAISearch = async () => {
      setShowAIPrompt(false);
      setIsAISearching(true);
      const matchedIds = await geminiService.smartSearchProducts(searchQuery, products);
      setAiMatchedIds(matchedIds);
      setIsAISearching(false);
  };

  const handleCancelAISearch = () => {
      setShowAIPrompt(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleSearchSubmit();
  };

  const handleMicClick = () => {
      setIsListening(true);
      setIsSearchFocused(false);
      setTimeout(() => {
          setIsListening(false);
          // Prioritize complex queries to trigger AI Prompt for demo
          const mockQueries = ["适合送长辈的海鲜礼盒推荐", "今晚做海鲜大餐", "低脂健康的鱼", "两千元左右的礼盒", "适合宝宝吃的无刺鱼"];
          const randomQuery = mockQueries[Math.floor(Math.random() * mockQueries.length)];
          setSearchQuery(randomQuery);
          saveSearchHistory(randomQuery);
          
          // Mimic search logic
          const simpleMatches = products.filter(p => 
              p.name.toLowerCase().includes(randomQuery.toLowerCase()) || 
              p.tags.some(tag => tag.toLowerCase().includes(randomQuery.toLowerCase()))
          );

          const semanticKeywords = ['推荐', '怎么', '送礼', '做法', '适合', '老人', '孩子', '孕妇', '哪个', '什么', '大餐', '左右', '健康', '补', '好吃', '营养', 'gift', 'how', 'best', 'recipe'];
          const isSemantic = semanticKeywords.some(k => randomQuery.toLowerCase().includes(k));
          const isLongQuery = randomQuery.length > 5;

          if (simpleMatches.length === 0 || isSemantic || isLongQuery) {
              setAiMatchedIds(null);
              setShowAIPrompt(true);
          } else {
              setAiMatchedIds(null);
          }
      }, 2000);
  };

  const handlePriceSort = () => {
      if (sortOption === 'price_asc') {
          setSortOption('price_desc');
      } else {
          setSortOption('price_asc');
      }
  };

  const handleSalesSort = () => {
      if (sortOption === 'sales_desc') {
          setSortOption('sales_asc');
      } else {
          setSortOption('sales_desc');
      }
  };

  // Enhanced Add to Cart with Particles
  const handleAddToCartWithEffect = (product: Product, e?: React.MouseEvent) => {
      if (e) {
          const newParticle = { id: Date.now(), x: e.clientX, y: e.clientY };
          setParticles(prev => [...prev, newParticle]);
          setTimeout(() => {
              setParticles(prev => prev.filter(p => p.id !== newParticle.id));
          }, 800);
      }
      onAddToCart(product);
  };

  return (
    <div className="flex flex-col h-full bg-ocean-900 relative">
      
      {/* Floating Particles */}
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

      {/* IMMERSIVE HEADER - Increased Top Padding */}
      <div 
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 px-4 pt-[calc(env(safe-area-inset-top)+16px)] pb-3 ${headerScrolled ? 'bg-ocean-900/90 backdrop-blur-lg shadow-xl' : 'bg-transparent'}`}
      >
        <div className="flex items-center gap-3">
            {/* Back */}
            <button onClick={onBack} className={`p-2 rounded-full backdrop-blur-sm transition-colors ${headerScrolled ? 'text-gray-400 hover:text-white' : 'bg-black/20 text-white border border-white/10'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            
            {/* Search Bar - Integrated */}
            <div className="flex-1 relative group" ref={searchContainerRef}>
                <div className={`flex items-center rounded-full transition-all ${headerScrolled ? 'bg-ocean-800 border border-ocean-700' : 'bg-black/20 backdrop-blur-md border border-white/10'}`}>
                    <svg className="w-4 h-4 text-gray-400 ml-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    <input 
                        ref={inputRef}
                        type="text" 
                        placeholder={isListening ? "正在聆听..." : "搜 '大龙虾' 试试..."}
                        value={searchQuery}
                        onFocus={() => setIsSearchFocused(true)}
                        onChange={handleSearchChange}
                        onKeyDown={handleKeyDown}
                        className="w-full bg-transparent text-white placeholder-gray-400/70 py-2 pl-2 pr-8 text-xs focus:outline-none"
                    />
                    {/* Mic / Clear Button */}
                    <div className="mr-3">
                        {searchQuery ? (
                            <button onClick={handleClearSearch} className="text-gray-400 hover:text-white"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
                        ) : (
                            <button onClick={handleMicClick} className="text-gray-400 hover:text-gold-500">
                                {isListening ? (
                                    <span className="flex gap-0.5 h-3 items-center"><span className="w-0.5 h-2 bg-gold-500 animate-bounce"></span><span className="w-0.5 h-3 bg-gold-500 animate-bounce delay-75"></span><span className="w-0.5 h-2 bg-gold-500 animate-bounce delay-150"></span></span>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* Search Dropdown */}
                {isSearchFocused && !searchQuery && (
                    <div className="absolute top-full left-0 w-full bg-ocean-800/95 backdrop-blur-xl border border-ocean-700 rounded-xl shadow-2xl mt-2 p-4 z-50 animate-fade-in-down">
                        <div className="mb-4">
                            <div className="flex justify-between items-center mb-2"><span className="text-xs text-gray-500 font-bold">历史搜索</span>{searchHistory.length > 0 && (<button onClick={clearSearchHistory} className="text-gray-600 hover:text-gray-400"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg></button>)}</div>
                            <div className="flex flex-wrap gap-2">{searchHistory.length > 0 ? searchHistory.map((t, idx) => (<span key={idx} onClick={() => handleTagClick(t)} className="text-xs bg-ocean-700 text-gray-300 px-2 py-1 rounded cursor-pointer hover:bg-ocean-600 transition-colors">{t}</span>)) : <span className="text-xs text-gray-600">暂无搜索记录</span>}</div>
                        </div>
                        <div><span className="text-xs text-gray-500 font-bold mb-2 block flex items-center gap-1">热门推荐 <span className="text-red-500 text-[10px]">🔥</span></span><div className="flex flex-wrap gap-2">{['佛跳墙', '大龙虾', '刺身拼盘', '生蚝'].map((t, i) => (<span key={t} onClick={() => handleTagClick(t)} className={`text-xs px-2 py-1 rounded cursor-pointer transition-colors ${i < 2 ? 'bg-gold-500/10 text-gold-500 border border-gold-500/20' : 'bg-ocean-700 text-gray-300 hover:bg-ocean-600'}`}>{t}</span>))}</div></div>
                    </div>
                )}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
                {onOpenDiscovery && (
                    <button onClick={onOpenDiscovery} className={`p-2 rounded-full backdrop-blur-sm transition-colors ${headerScrolled ? 'text-gray-400 hover:text-white' : 'bg-black/20 text-white border border-white/10'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
                    </button>
                )}
                <button 
                    onClick={onOpenCart}
                    className={`p-2 rounded-full backdrop-blur-sm relative transition-all ${headerScrolled ? 'text-gray-400 hover:text-white' : 'bg-black/20 text-white border border-white/10'} ${isCartAnimating ? 'scale-110 text-gold-500' : ''}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/><path d="M12 8v4"/><path d="M10 10h4"/></svg>
                    {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] w-3.5 h-3.5 flex items-center justify-center rounded-full font-bold animate-fade-in">{cartCount}</span>}
                </button>
            </div>
        </div>
      </div>

      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto pb-20 no-scrollbar scroll-smooth"
      >
        {/* LIVE BARRAGE COMPONENT */}
        {storeConfig?.isLiveMode && <LiveBarrage products={products} />}

        {/* HERO SECTION (Immersive) */}
        {liveHeroProduct && !searchQuery && activeCategory === 'all' && (
            <div className="relative w-full aspect-[3/4] sm:aspect-[16/9] bg-ocean-900 group cursor-pointer overflow-hidden -mt-safe-top" onClick={() => onProductClick(liveHeroProduct)}>
                <img src={liveHeroProduct.image} className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105" />
                
                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-ocean-900 via-ocean-900/40 to-transparent opacity-90"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-transparent h-32"></div>

                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 w-full p-6 pb-8 z-10 flex flex-col items-start gap-3">
                    {/* Live & Timer Badge */}
                    {storeConfig?.isLiveMode && (
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                            <div className="bg-red-600/90 backdrop-blur text-white text-[10px] px-2.5 py-1 rounded-sm flex items-center gap-1.5 shadow-lg shadow-red-900/30">
                                <span className="relative flex h-1.5 w-1.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
                                </span>
                                <span className="font-bold tracking-wide uppercase">Live Only</span>
                            </div>
                            <div className="bg-black/40 backdrop-blur border border-white/10 px-2 py-1 rounded-sm flex items-center gap-1 text-white font-mono text-[10px]">
                                <span className="text-gold-500 font-bold">Ends in</span>
                                <span>{formatTime(timeLeft.hours)}:{formatTime(timeLeft.minutes)}:{formatTime(timeLeft.seconds)}</span>
                            </div>
                        </div>
                    )}

                    <h2 className="text-3xl font-serif text-white font-bold leading-tight drop-shadow-md max-w-[80%]">
                        {liveHeroProduct.name}
                    </h2>
                    
                    <div className="flex items-center justify-between w-full mt-1 pr-2">
                        <div className="flex items-baseline gap-2">
                            <span className="text-gold-500 font-bold text-3xl font-serif drop-shadow-sm">¥{liveHeroProduct.price}</span>
                            <span className="text-white/60 text-xs line-through decoration-white/40">¥{(liveHeroProduct.price * 1.2).toFixed(0)}</span>
                        </div>
                        <button className="bg-white text-ocean-900 text-xs font-bold px-5 py-2.5 rounded-full shadow-xl hover:bg-gold-500 hover:text-white transition-all active:scale-95">
                            立即抢购
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* MARQUEE (Below Hero if exists, or Top if not) */}
        {storeConfig?.isLiveMode && (
            <div className={`bg-ocean-800/50 border-y border-ocean-700/50 text-gold-500/90 text-[10px] py-2 px-4 overflow-hidden relative ${!liveHeroProduct ? 'mt-[60px]' : ''}`}>
                <div className="whitespace-nowrap animate-marquee font-medium tracking-wide flex items-center gap-4">
                    <span>📢 {storeConfig.liveAnnouncement}</span>
                    <span className="opacity-50">|</span>
                    <span>顺丰冷链急速发货</span>
                    <span className="opacity-50">|</span>
                    <span>坏单包赔</span>
                </div>
            </div>
        )}

        {/* STICKY TOOLBAR (Categories & Sort) - Refined Glass Effect */}
        <div className="sticky top-[calc(env(safe-area-inset-top)+64px)] z-40 bg-ocean-900/80 backdrop-blur-md border-b border-ocean-800/50 shadow-lg">
            <div className="flex items-center justify-between px-2 py-2">
                {/* Categories */}
                <div className="flex-1 overflow-x-auto no-scrollbar">
                     <div className="flex gap-1 pr-4">
                        <button 
                            onClick={() => setActiveCategory('all')}
                            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-all ${activeCategory === 'all' ? 'bg-gold-500 text-ocean-900 shadow-md shadow-gold-500/20' : 'text-gray-400 hover:bg-white/5 border border-transparent hover:border-white/10'}`}
                        >
                            全部
                        </button>
                        {Object.entries(CATEGORY_NAMES).map(([key, name]) => (
                            <button 
                                key={key}
                                onClick={() => setActiveCategory(key)}
                                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-medium transition-all ${activeCategory === key ? 'bg-gold-500 text-ocean-900 shadow-md shadow-gold-500/20' : 'text-gray-400 hover:bg-white/5 border border-transparent hover:border-white/10'}`}
                            >
                                {key === 'fish' ? '🐟 鱼类' : key === 'crab_shrimp' ? '🦀 虾蟹' : '🐚 贝类'}
                            </button>
                        ))}
                     </div>
                </div>
                
                {/* Compact Sort */}
                <div className="flex items-center pl-2 border-l border-white/5 flex-shrink-0">
                    <button onClick={handleSalesSort} className={`p-2 rounded-lg transition-colors ${sortOption.startsWith('sales') ? 'text-gold-500 bg-white/5' : 'text-gray-500 hover:text-white'}`}>
                        <div className="text-[10px] font-bold leading-none mb-0.5">销量</div>
                        <div className="flex justify-center -space-y-0.5"><svg className={`w-2 h-2 ${sortOption === 'sales_asc' ? 'text-gold-500' : 'opacity-30'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="m18 15-6-6-6 6"/></svg><svg className={`w-2 h-2 ${sortOption === 'sales_desc' ? 'text-gold-500' : 'opacity-30'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="m6 9 6 6 6-6"/></svg></div>
                    </button>
                    <button onClick={handlePriceSort} className={`p-2 rounded-lg transition-colors ${sortOption.startsWith('price') ? 'text-gold-500 bg-white/5' : 'text-gray-500 hover:text-white'}`}>
                        <div className="text-[10px] font-bold leading-none mb-0.5">价格</div>
                        <div className="flex justify-center -space-y-0.5"><svg className={`w-2 h-2 ${sortOption === 'price_asc' ? 'text-gold-500' : 'opacity-30'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="m18 15-6-6-6 6"/></svg><svg className={`w-2 h-2 ${sortOption === 'price_desc' ? 'text-gold-500' : 'opacity-30'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="m6 9 6 6 6-6"/></svg></div>
                    </button>
                </div>
            </div>
        </div>

        {/* AI Recommendation Badge */}
        {aiMatchedIds && (
            <div className="px-4 py-2">
                <div className="bg-ocean-800/50 border border-gold-500/20 rounded-lg p-2 flex items-center justify-between animate-fade-in-down">
                    <span className="text-xs text-gold-500 flex items-center gap-1.5 font-bold">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                        AI 为您筛选出 {sortedProducts.length} 款商品
                    </span>
                    <button onClick={handleClearSearch} className="text-[10px] text-gray-400 hover:text-white underline">清除筛选</button>
                </div>
            </div>
        )}

        {/* Product Grid */}
        <div className="p-3 pb-safe-bottom">
            {isAISearching ? (
                <div className="grid grid-cols-2 gap-3">
                    {[1,2,3,4].map(i => (
                        <div key={i} className="bg-ocean-800 rounded-xl overflow-hidden shadow-lg border border-ocean-700 h-64 relative group">
                            {/* Gold Shimmer Skeleton */}
                            <div className="absolute inset-0 bg-gradient-to-r from-ocean-800 via-gold-500/10 to-ocean-800 animate-shimmer" style={{ backgroundSize: '200% 100%' }}></div>
                            <div className="h-40 bg-ocean-700/30 relative z-10"></div>
                            <div className="p-4 space-y-3 relative z-10">
                                <div className="h-4 bg-ocean-700/30 rounded w-3/4"></div>
                                <div className="h-3 bg-ocean-700/30 rounded w-1/2"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-3">
                    {sortedProducts.length === 0 ? (
                        <div className="col-span-2 text-center text-gray-500 py-10 flex flex-col items-center gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                            <p>暂无符合条件的商品</p>
                            {searchQuery && !aiMatchedIds && (
                                <button onClick={handleConfirmAISearch} className="text-xs text-gold-500 border border-gold-500 px-3 py-1 rounded-full">
                                    尝试 AI 智能检索
                                </button>
                            )}
                        </div>
                    ) : (
                        sortedProducts.map(product => {
                            const cartItem = cart.find(c => c.id === product.id);
                            const quantity = cartItem ? cartItem.quantity : 0;
                            return (
                                <ProductCard 
                                    key={product.id} 
                                    product={product} 
                                    onAddToCart={handleAddToCartWithEffect}
                                    onClick={onProductClick}
                                    variant="store"
                                    cartQuantity={quantity}
                                    onTagClick={handleTagClick}
                                    onNotifyMe={(p) => console.log('Notify', p)}
                                    onToggleFavorite={onToggleFavorite}
                                />
                            );
                        })
                    )}
                </div>
            )}
        </div>
      </div>
      
      {/* Scroll to Top Button */}
      {showScrollTop && (
          <button 
            onClick={scrollToTop}
            className="absolute bottom-6 right-6 z-40 w-10 h-10 bg-ocean-800/80 backdrop-blur-md rounded-full border border-gold-500/30 flex items-center justify-center text-gold-500 shadow-lg animate-fade-in hover:bg-ocean-700 active:scale-95"
          >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
          </button>
      )}
      
      {/* New User Coupon Modal */}
      <NewUserCouponModal isOpen={showCouponModal} onClose={handleCloseCoupon} onClaim={handleClaimAll} />
      
      {/* AI Prompt Modal */}
      <AIPromptModal 
          isOpen={showAIPrompt} 
          onClose={handleCancelAISearch} 
          onConfirm={handleConfirmAISearch} 
      />
    </div>
  );
};

export default Storefront;
