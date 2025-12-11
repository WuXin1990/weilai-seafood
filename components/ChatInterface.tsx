
import React, { useRef, useEffect, useState } from 'react';
import { Message, MessageRole, Product, User, CartItem, BanquetMenu } from '../types';
import ProductCard from './ProductCard';

interface ChatInterfaceProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (text: string, image?: string) => void;
  onAddToCart: (product: Product) => void;
  productCatalog: Product[]; 
  onOpenProfile: () => void;
  user: User | null;
  onProductClick: (product: Product) => void;
  cart: CartItem[]; 
  onAddMenuToCart?: (menu: BanquetMenu) => void; 
  onClearChat?: () => void; 
  onBack?: () => void;
  onOpenCart?: () => void;
}

// Themed Chef Loading Animation
const ChefLoading = () => (
    <div className="flex items-center gap-2 p-3 bg-ocean-800/50 rounded-2xl rounded-tl-none border border-ocean-700/50 w-fit backdrop-blur-sm">
        <div className="relative w-5 h-5 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gold-500 w-full h-full animate-bounce"><path d="M2 12h20"/><path d="M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8"/><path d="m4 8 16-4"/><path d="m8.86 6.78-.45-1.81a2 2 0 0 1 1.45-2.43l1.94-.48a2 2 0 0 1 2.43 1.46l.45 1.8"/></svg>
        </div>
        <span className="text-xs text-gold-500/80 font-medium tracking-wide animate-pulse">主厨正在为您构思...</span>
    </div>
);

const VoiceWaveform = () => (
    <div className="flex items-center justify-center gap-1 h-8 animate-fade-in-up">
        {[...Array(5)].map((_, i) => (
            <div key={i} className="w-1 bg-gold-500 rounded-full animate-waveform" style={{
                height: '20%',
                animationDelay: `${i * 0.1}s`,
                animationDuration: '0.8s'
            }}></div>
        ))}
        <style>{`
            @keyframes waveform {
                0%, 100% { height: 20%; }
                50% { height: 100%; }
            }
            .animate-waveform { animation: waveform ease-in-out infinite; }
        `}</style>
    </div>
);

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, isLoading, onSendMessage, onAddToCart, productCatalog, onOpenProfile, user, onProductClick, cart, onAddMenuToCart, onClearChat, onBack, onOpenCart }) => {
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showTools, setShowTools] = useState(false);
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  
  // TTS State
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  
  // Menu Form State
  const [menuPeople, setMenuPeople] = useState(4);
  const [menuBudget, setMenuBudget] = useState(1000);
  const [menuPreference, setMenuPreference] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cartCount = cart.reduce((a, b) => a + b.quantity, 0);

  // Get active product context from the first message if available
  const activeProductContext = messages.length > 0 && messages[0].productContext ? messages[0].productContext : null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, selectedImage]);

  useEffect(() => {
      // Clean up speech synthesis when component unmounts
      return () => {
          window.speechSynthesis.cancel();
      };
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
      // Show button if user is scrolled up more than 200px from bottom
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 200;
      setShowScrollBottom(!isNearBottom);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !selectedImage) || isLoading) return;
    onSendMessage(input, selectedImage || undefined);
    setInput('');
    setSelectedImage(null);
    setShowTools(false);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setSelectedImage(reader.result as string);
              setShowTools(false);
          };
          reader.readAsDataURL(file);
      }
  };

  const handleMicClick = () => {
      setIsListening(true);
      // Simulate listening
      setTimeout(() => {
          setIsListening(false);
          const mockVoiceInputs = ["帮我配一桌海鲜宴", "这个螃蟹怎么吃？", "有没有适合老人的鱼？", "查一下我的订单"];
          const randomInput = mockVoiceInputs[Math.floor(Math.random() * mockVoiceInputs.length)];
          setInput(randomInput);
          inputRef.current?.focus();
      }, 2000);
  };

  const handleTTS = (text: string, msgId: string) => {
      if (speakingMsgId === msgId) {
          window.speechSynthesis.cancel();
          setSpeakingMsgId(null);
          return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = 1.1; // Slightly faster
      utterance.pitch = 1.1; // Friendly tone
      
      utterance.onend = () => setSpeakingMsgId(null);
      utterance.onerror = () => setSpeakingMsgId(null);
      
      setSpeakingMsgId(msgId);
      window.speechSynthesis.speak(utterance);
  };

  const handleMenuSubmit = async () => {
      setIsMenuModalOpen(false);
      setShowTools(false);
      onSendMessage(`帮我配一桌菜：${menuPeople}人，预算¥${menuBudget}，偏好：${menuPreference || '无'}`, undefined);
  };

  // Determine which chips to show based on the last message context
  const getLastMessageContext = () => {
      if (messages.length === 0) return 'default';
      const lastMsg = messages[messages.length - 1];
      
      // If the last message was from the model and recommended products, offer product-specific queries
      if (lastMsg.role === MessageRole.MODEL && lastMsg.recommendedProducts && lastMsg.recommendedProducts.length > 0) {
          return 'product_focus';
      }
      return 'default';
  };

  const DEFAULT_CHIPS = [
      { emoji: '🎁', text: '适合送礼' },
      { emoji: '👨‍👩‍👧', text: '家宴硬菜' },
      { emoji: '👶', text: '宝宝辅食' },
      { emoji: '📉', text: '今日特价' },
      { emoji: '🚚', text: '查快递' },
  ];

  const PRODUCT_CONTEXT_CHIPS = [
      { emoji: '🍳', text: '这就去下单，教我做法！' },
      { emoji: '💪', text: '这有什么营养价值？' },
      { emoji: '❄️', text: '收到后怎么保存？' },
      { emoji: '📦', text: '发货要多久？' },
  ];

  const currentChips = getLastMessageContext() === 'product_focus' ? PRODUCT_CONTEXT_CHIPS : DEFAULT_CHIPS;

  const handleChipClick = (text: string) => {
      onSendMessage(text, undefined);
  };

  // Helper to format timestamp difference
  const renderTimeDivider = (currentMsg: Message, prevMsg: Message | null) => {
      if (!prevMsg) return <div className="text-[10px] text-gray-500 my-6 text-center bg-white/5 rounded-full px-2 py-0.5 w-fit mx-auto backdrop-blur-sm shadow-sm">刚刚</div>;
      
      const currentTime = parseInt(currentMsg.id); // Assuming ID is timestamp
      const prevTime = parseInt(prevMsg.id);
      
      // If valid timestamp and diff > 5 mins
      if (!isNaN(currentTime) && !isNaN(prevTime) && (currentTime - prevTime > 5 * 60 * 1000)) {
          return (
              <div className="text-[10px] text-gray-500 my-6 text-center bg-white/5 rounded-full px-2 py-0.5 w-fit mx-auto backdrop-blur-sm shadow-sm">
                  {new Date(currentTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </div>
          );
      }
      return null;
  };

  return (
    <div className="flex flex-col h-full bg-ocean-900 relative w-full overflow-hidden">
      {/* Header - Fixed at Top */}
      <div className="absolute top-0 left-0 w-full z-20 bg-ocean-900/95 backdrop-blur-xl border-b border-ocean-800 pt-[calc(env(safe-area-inset-top)+10px)] pb-3 px-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3 overflow-hidden">
             {onBack && (
                <button onClick={onBack} className="p-2 -ml-2 text-white/80 hover:text-gold-500 transition-colors bg-ocean-800 rounded-full border border-white/5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </button>
             )}
             {activeProductContext ? (
                 <div className="flex items-center gap-2 overflow-hidden bg-ocean-800 rounded-full pr-4 border border-white/5 py-0.5">
                     <div className="w-8 h-8 rounded-full overflow-hidden border border-gold-500/30 flex-shrink-0 ml-0.5">
                         <img src={activeProductContext.image} className="w-full h-full object-cover" />
                     </div>
                     <div className="min-w-0">
                         <p className="text-[9px] text-gold-500 font-medium leading-none">正在咨询</p>
                         <h2 className="text-white font-serif text-xs tracking-wide truncate mt-0.5">{activeProductContext.name}</h2>
                     </div>
                 </div>
             ) : (
                 <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-gradient-to-br from-ocean-800 to-black border border-gold-500/30 flex items-center justify-center shadow-lg relative">
                         <div className="absolute inset-0 bg-gold-500/10 rounded-full animate-pulse"></div>
                         <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.47-3.46 6-7 6s-7.06-2.53-8.5-6Z"/><path d="M18 12v.5"/><path d="M16 17.93a9.77 9.77 0 0 1 0-11.86"/><path d="M7 10.67C7 8 5.58 5.97 2.73 5.5c-1 1.5-1 5 .23 6.5-1.24 1.5-1.24 5-.23 6.5C5.58 18.03 7 16 7 13.33v-2.66Z"/></svg>
                     </div>
                     <div>
                        <h2 className="text-white font-serif text-base tracking-widest font-bold">魏来海鲜</h2>
                        <div className="flex items-center gap-1.5 opacity-80">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.8)]"></span>
                            <p className="text-gray-300 text-[10px] uppercase tracking-wider font-light">AI Private Concierge</p>
                        </div>
                     </div>
                 </div>
             )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
            {onClearChat && (
                <button onClick={onClearChat} className="w-9 h-9 rounded-full bg-ocean-800 border border-white/5 flex items-center justify-center hover:bg-white/10 text-gray-400 transition-colors">
                     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                </button>
            )}
            {onOpenCart && (
                <button onClick={onOpenCart} className="w-9 h-9 rounded-full bg-ocean-800 border border-white/5 flex items-center justify-center hover:bg-white/10 text-gold-500 relative transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/><path d="M12 8v4"/><path d="M10 10h4"/></svg>
                    {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-bold shadow-sm scale-75 border border-ocean-900">
                            {cartCount}
                        </span>
                    )}
                </button>
            )}
        </div>
      </div>

      {/* Messages Area - Flexible Height */}
      <div 
        className="flex-1 overflow-y-auto space-y-6 no-scrollbar bg-gradient-to-b from-ocean-900 to-[#0a0f1e] pt-24 pb-4 px-4 overscroll-contain"
        ref={scrollContainerRef}
        onScroll={handleScroll}
      >
        {/* Welcome Empty State */}
        {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-[50vh] animate-fade-in-up">
                <div className="bg-ocean-800/50 backdrop-blur-md border border-gold-500/20 rounded-2xl p-6 max-w-xs text-center shadow-2xl relative">
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-gradient-to-br from-gold-500 to-amber-600 rounded-full flex items-center justify-center shadow-lg border-2 border-ocean-900">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
                    </div>
                    <h3 className="text-gold-500 font-serif font-bold text-lg mt-4">尊贵的{user?.name || '贵宾'}</h3>
                    <p className="text-gray-400 text-xs mt-2 leading-relaxed">我是您的 1v1 私人海鲜管家。<br/>无论您是需要 <span className="text-white">宴席搭配</span>、<span className="text-white">烹饪指导</span> 还是 <span className="text-white">礼品选购</span>，随时吩咐。</p>
                    
                    <div className="mt-6 space-y-2">
                        {["帮我配一桌 ¥2000 的家宴", "帝王蟹怎么做才好吃？", "最近有什么适合送礼的？"].map((q, i) => (
                            <button key={i} onClick={() => onSendMessage(q)} className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg py-2.5 px-3 text-xs text-gray-300 text-left transition-colors flex items-center justify-between group">
                                {q}
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-0 group-hover:opacity-100 transition-opacity text-gold-500"><path d="m9 18 6-6-6-6"/></svg>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {messages.map((msg, index) => (
          <React.Fragment key={msg.id}>
             {renderTimeDivider(msg, index > 0 ? messages[index - 1] : null)}
             
             <div className={`flex flex-col ${msg.role === MessageRole.USER ? 'items-end' : 'items-start'} animate-fade-in-up`}>
                <div className={`flex max-w-[90%] ${msg.role === MessageRole.USER ? 'flex-row-reverse' : 'flex-row'} gap-3`}>
                {/* Avatar */}
                <div className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center border overflow-hidden ${msg.role === MessageRole.USER ? 'bg-ocean-700 border-ocean-600' : 'bg-gradient-to-br from-gold-600 to-amber-700 border-gold-500/50 shadow-lg'}`}>
                    {msg.role === MessageRole.USER ? (
                        user?.avatar ? (
                            <img src={user.avatar} alt="User" className="w-full h-full object-cover" />
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        )
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
                    )}
                </div>

                {/* Bubble Content */}
                <div className={`rounded-2xl shadow-lg text-sm leading-relaxed overflow-hidden relative group transition-all duration-300 ${
                    msg.role === MessageRole.USER 
                    ? 'bg-ocean-700 text-gray-100 rounded-tr-none border border-ocean-600' 
                    : 'bg-[#1a1f2e] backdrop-blur-md text-gray-200 rounded-tl-none border border-gold-500/20 hover:border-gold-500/40'
                }`}>
                    {msg.image && (
                        <div className="w-full max-w-[200px] p-1">
                            <img src={msg.image} alt="User sent" className="w-full h-auto object-cover rounded-xl" />
                        </div>
                    )}
                    
                    {/* Product Context Bubble (Small Refrence) - VISIBLE FOR BOTH USER AND MODEL */}
                    {msg.productContext && (
                        <div className="bg-ocean-900/50 p-2.5 flex items-center gap-2.5 mb-1 border-b border-white/5 cursor-pointer hover:bg-ocean-900/70 transition-colors" onClick={() => onProductClick(msg.productContext!)}>
                            <img src={msg.productContext.image} className="w-10 h-10 rounded-lg object-cover border border-white/5" alt={msg.productContext.name} />
                            <div className="flex-1 min-w-0 text-left">
                                <p className={`text-[9px] font-bold tracking-wider ${msg.role === MessageRole.USER ? 'text-gray-400' : 'text-gold-500'}`}>{msg.role === MessageRole.USER ? '我在看' : '咨询商品'}</p>
                                <p className="text-xs text-white truncate font-serif">{msg.productContext.name}</p>
                            </div>
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="gray" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                        </div>
                    )}

                    {msg.text && (
                        <div className={`p-4 whitespace-pre-wrap ${msg.role === MessageRole.MODEL ? 'font-serif tracking-wide leading-relaxed' : 'font-sans'}`}>
                            {msg.text}
                            {/* TTS Button */}
                            {msg.role === MessageRole.MODEL && !msg.isStreaming && (
                                <div className="mt-3 flex justify-end">
                                    <button 
                                        onClick={() => handleTTS(msg.text, msg.id)}
                                        className={`p-1.5 rounded-full transition-colors ${speakingMsgId === msg.id ? 'bg-gold-500 text-ocean-900 animate-pulse' : 'text-gray-500 hover:text-gold-500 hover:bg-white/5'}`}
                                    >
                                        {speakingMsgId === msg.id ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                    
                    {/* PREMIUM MENU CARD RENDERER */}
                    {msg.menu && (
                        <div className="bg-[#fffdf5] m-3 rounded-sm border-2 border-gold-600/30 overflow-hidden shadow-2xl relative text-ocean-900 font-serif">
                            {/* Inner Border Design */}
                            <div className="absolute inset-1 border border-gold-600/20 pointer-events-none"></div>
                            
                            <div className="p-5 pb-3 text-center border-b border-gold-600/10">
                                <div className="inline-block border-b-2 border-gold-500 pb-1 mb-2">
                                    <h3 className="text-xl font-black tracking-widest text-ocean-900">{msg.menu.title}</h3>
                                </div>
                                <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em]">Exquisite Seafood Selection</p>
                                <p className="text-xs text-gray-600 mt-3 italic leading-relaxed px-2">"{msg.menu.description}"</p>
                            </div>

                            <div className="p-5 space-y-4 relative">
                                {/* Watermark */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>
                                </div>

                                {msg.menu.items.map((item, idx) => {
                                    const prod = productCatalog.find(p => p.id === item.productId);
                                    if (!prod) return null;
                                    return (
                                        <div key={idx} className="flex justify-between items-baseline relative z-10">
                                            <div className="flex-1 overflow-hidden">
                                                <div className="flex items-baseline">
                                                    <span className="font-bold text-sm text-ocean-900 whitespace-nowrap">{prod.name}</span>
                                                    <span className="text-[10px] text-gray-400 mx-1">x{item.quantity}</span>
                                                    {/* Dots leader */}
                                                    <div className="flex-1 border-b border-dotted border-gray-300 mx-2 mb-1"></div>
                                                </div>
                                            </div>
                                            <span className="text-gold-600 font-bold text-sm">¥{prod.price * item.quantity}</span>
                                        </div>
                                    );
                                })}
                                
                                <div className="flex justify-between items-center pt-4 mt-2 border-t border-gold-600/20">
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Amount</span>
                                    <span className="text-2xl text-ocean-900 font-bold">¥{msg.menu.totalPrice}</span>
                                </div>
                            </div>
                            
                            {onAddMenuToCart && (
                                <button 
                                    onClick={() => onAddMenuToCart(msg.menu!)}
                                    className="w-full bg-ocean-900 hover:bg-ocean-800 text-gold-500 font-bold py-3 text-sm transition-colors uppercase tracking-widest flex items-center justify-center gap-2"
                                >
                                    <span>Add to Cart</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                                </button>
                            )}
                        </div>
                    )}
                </div>
                </div>

                {/* Recommendations Horizontal Scroll */}
                {msg.recommendedProducts && msg.recommendedProducts.length > 0 && (
                    <div className="mt-4 w-full pl-12 animate-fade-in-up">
                        <p className="text-[10px] text-gold-500 mb-3 font-medium tracking-widest uppercase flex items-center gap-2 opacity-80">
                            <span className="w-4 h-[1px] bg-gold-500"></span>
                            为您甄选 · Recommended
                        </p>
                        <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar snap-x pr-4">
                            {msg.recommendedProducts.map(product => {
                                const liveProduct = productCatalog.find(p => p.id === product.id) || product;
                                const cartItem = cart.find(c => c.id === liveProduct.id);
                                const quantity = cartItem ? cartItem.quantity : 0;
                                return (
                                    <ProductCard 
                                        key={liveProduct.id} 
                                        product={liveProduct} 
                                        onAddToCart={onAddToCart} 
                                        onClick={onProductClick}
                                        cartQuantity={quantity}
                                    />
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
          </React.Fragment>
        ))}
        
        {isLoading && (
            <div className="flex items-center gap-3 pl-2 animate-fade-in mt-4">
                 <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold-600 to-amber-700 flex-shrink-0 flex items-center justify-center border border-gold-500/50 shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
                 </div>
                 {/* Typing Bubble */}
                 <div className="bg-[#1a1f2e] backdrop-blur-md rounded-2xl rounded-tl-none border border-gold-500/20 p-3">
                    <ChefLoading />
                 </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Floating Scroll Bottom Button */}
      {showScrollBottom && (
          <button 
            onClick={scrollToBottom}
            className="absolute bottom-[calc(5rem+env(safe-area-inset-bottom))] right-4 z-40 bg-ocean-800/80 backdrop-blur border border-ocean-700 text-gold-500 w-10 h-10 rounded-full flex items-center justify-center shadow-lg animate-fade-in hover:bg-ocean-700 active:scale-90"
          >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </button>
      )}

      {/* Input Area - Flex container to stick to bottom properly */}
      <div className="p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] bg-ocean-900 border-t border-white/5 z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
        
        {/* VOICE OVERLAY ANIMATION */}
        {isListening && (
            <div className="absolute left-4 right-4 bottom-24 bg-ocean-900/95 backdrop-blur-md z-30 flex items-center justify-center gap-4 rounded-2xl border border-gold-500/30 shadow-2xl animate-fade-in h-40 flex-col">
                <div className="w-12 h-12 rounded-full bg-gold-500/20 flex items-center justify-center animate-pulse">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
                </div>
                <VoiceWaveform />
                <span className="text-gold-500 font-bold tracking-widest text-sm">正在聆听...</span>
            </div>
        )}

        {/* Suggestion Chips */}
        {!isLoading && !isListening && !showTools && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar mb-3 justify-center mask-image-fade">
                {currentChips.map(chip => (
                    <button 
                        key={chip.text}
                        onClick={() => handleChipClick(chip.text)}
                        className="flex-shrink-0 bg-ocean-800 border border-white/10 hover:border-gold-500/30 text-gray-200 text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition-all flex items-center gap-1.5 shadow-sm active:scale-95 active:bg-gold-500/10"
                    >
                        <span>{chip.emoji}</span>
                        <span>{chip.text}</span>
                    </button>
                ))}
            </div>
        )}

        {/* Tool Menu - Popup Card */}
        {showTools && (
            <div className="mb-4 bg-ocean-800 border border-ocean-700 rounded-2xl p-6 grid grid-cols-4 gap-6 animate-slide-in-up shadow-2xl relative z-50">
                <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-2 text-gray-300 hover:text-white group">
                    <div className="w-14 h-14 bg-ocean-700 rounded-2xl flex items-center justify-center border border-white/5 group-hover:border-gold-500/30 group-hover:bg-gold-500/10 transition-all shadow-inner">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                    </div>
                    <span className="text-xs font-medium">拍海鲜</span>
                </button>
                <button onClick={() => setIsMenuModalOpen(true)} className="flex flex-col items-center gap-2 text-gray-300 hover:text-white group">
                    <div className="w-14 h-14 bg-ocean-700 rounded-2xl flex items-center justify-center border border-white/5 group-hover:border-gold-500/30 group-hover:bg-gold-500/10 transition-all shadow-inner">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/></svg>
                    </div>
                    <span className="text-xs font-medium">配宴席</span>
                </button>
                {/* Close Tools Button inside */}
                <button onClick={() => setShowTools(false)} className="absolute top-3 right-3 p-2 text-gray-500 hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>
        )}

        {/* Image Preview */}
        {selectedImage && (
            <div className="mb-4 relative w-24 h-24 rounded-xl overflow-hidden border border-gold-500 shadow-lg mx-auto">
                <img src={selectedImage} className="w-full h-full object-cover" />
                <button onClick={() => setSelectedImage(null)} className="absolute top-0 right-0 bg-red-500 text-white rounded-bl-lg p-1.5 hover:bg-red-600"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
            </div>
        )}

        {/* Floating Capsule Input */}
        <form onSubmit={handleSubmit} className="relative flex items-center gap-3 bg-ocean-800 border border-white/10 p-2 rounded-full shadow-inner transition-all focus-within:border-gold-500/30">
           <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleImageSelect} />
           
           <button 
                type="button"
                onClick={() => setShowTools(!showTools)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${showTools ? 'bg-gold-500 text-ocean-900 rotate-90' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}
           >
               <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
           </button>

           <div className="relative flex-1">
               <input
                 ref={inputRef}
                 type="text"
                 value={input}
                 onChange={(e) => setInput(e.target.value)}
                 onFocus={() => setShowTools(false)}
                 placeholder={isListening ? "" : "私域管家为您服务..."}
                 className={`w-full bg-transparent text-white placeholder-gray-500 py-2.5 pl-2 pr-10 focus:outline-none text-sm transition-all ${isListening ? 'opacity-0' : 'opacity-100'}`}
                 disabled={isLoading}
               />
               <button 
                    type="button"
                    onClick={handleMicClick}
                    className={`absolute right-0 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors ${isListening ? 'text-gold-500 scale-110' : 'text-gray-400 hover:text-white'}`}
               >
                   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
               </button>
           </div>

           <button 
             type="submit" 
             disabled={(!input.trim() && !selectedImage) || isLoading}
             className="w-10 h-10 flex-shrink-0 bg-gradient-to-tr from-gold-600 to-gold-500 text-ocean-900 rounded-full flex items-center justify-center hover:shadow-[0_0_15px_rgba(245,158,11,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-90"
           >
             <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
           </button>
        </form>
      </div>

      {/* Customize Menu Modal */}
      {isMenuModalOpen && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-ocean-900 w-full max-w-sm rounded-2xl border border-gold-500/30 shadow-2xl overflow-hidden animate-scale-in">
                  <div className="bg-gold-600 p-6 text-ocean-900 relative overflow-hidden">
                      <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                      <h3 className="font-serif font-bold text-xl relative z-10">AI 宴席定制</h3>
                      <p className="text-xs text-ocean-900/80 mt-1 relative z-10">输入您的需求，让大厨为您搭配</p>
                  </div>
                  <div className="p-6 space-y-5">
                      <div>
                          <label className="text-xs text-gray-400 mb-1.5 block ml-1">用餐人数</label>
                          <input type="number" value={menuPeople} onChange={e => setMenuPeople(Number(e.target.value))} className="w-full bg-ocean-800 border border-ocean-700 rounded-xl p-3 text-white focus:border-gold-500 outline-none transition-colors" />
                      </div>
                      <div>
                          <label className="text-xs text-gray-400 mb-1.5 block ml-1">总预算 (元)</label>
                          <input type="number" value={menuBudget} onChange={e => setMenuBudget(Number(e.target.value))} className="w-full bg-ocean-800 border border-ocean-700 rounded-xl p-3 text-white focus:border-gold-500 outline-none transition-colors" />
                      </div>
                      <div>
                          <label className="text-xs text-gray-400 mb-1.5 block ml-1">口味偏好 / 忌口</label>
                          <input type="text" value={menuPreference} onChange={e => setMenuPreference(e.target.value)} placeholder="例如：清淡、不吃辣、要有龙虾..." className="w-full bg-ocean-800 border border-ocean-700 rounded-xl p-3 text-white focus:border-gold-500 outline-none transition-colors placeholder-gray-600" />
                      </div>
                      <div className="flex gap-4 mt-2">
                          <button onClick={() => setIsMenuModalOpen(false)} className="flex-1 py-3 text-gray-400 text-sm font-medium hover:text-white transition-colors">取消</button>
                          <button onClick={handleMenuSubmit} className="flex-[2] bg-gold-600 text-ocean-900 rounded-full font-bold text-sm hover:bg-gold-500 shadow-lg shadow-gold-600/20 active:scale-95 transition-all">生成菜单</button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default ChatInterface;
