
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

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, isLoading, onSendMessage, onAddToCart, productCatalog, onOpenProfile, user, onProductClick, cart, onAddMenuToCart, onClearChat, onBack, onOpenCart }) => {
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const cartCount = cart.reduce((a, b) => a + b.quantity, 0);

  // Get active product context
  const activeProductContext = messages.length > 0 && messages[0].productContext ? messages[0].productContext : null;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !selectedImage) || isLoading) return;
    onSendMessage(input, selectedImage || undefined);
    setInput('');
    setSelectedImage(null);
  };

  return (
    <div className="flex flex-col h-full bg-ocean-900 relative w-full overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 w-full z-20 bg-ocean-900/90 backdrop-blur-xl border-b border-ocean-800 pt-[calc(env(safe-area-inset-top)+10px)] pb-3 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
             {onBack && (
                <button onClick={onBack} className="p-2 -ml-2 text-white/80 hover:text-gold-500 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </button>
             )}
             <div className="flex items-center gap-2">
                 <div className="w-8 h-8 rounded-full bg-gradient-to-br from-ocean-700 to-black border border-gold-500/30 flex items-center justify-center shadow-lg">
                     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.47-3.46 6-7 6s-7.06-2.53-8.5-6Z"/><path d="M18 12v.5"/><path d="M16 17.93a9.77 9.77 0 0 1 0-11.86"/></svg>
                 </div>
                 <div>
                    <h2 className="text-white font-serif text-sm tracking-widest font-bold">魏来海鲜</h2>
                    <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.8)]"></span>
                        <p className="text-gray-400 text-[9px] uppercase tracking-wider">AI Concierge</p>
                    </div>
                 </div>
             </div>
        </div>
        <div className="flex gap-3">
            {onClearChat && <button onClick={onClearChat} className="text-gray-500 hover:text-white"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg></button>}
            {onOpenCart && <button onClick={onOpenCart} className="text-gold-500 relative"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/><path d="M12 8v4"/><path d="M10 10h4"/></svg>{cartCount > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-[8px] text-white px-1 rounded-full">{cartCount}</span>}</button>}
        </div>
      </div>

      {/* Messages */}
      <div 
        className="flex-1 overflow-y-auto space-y-6 bg-ocean-900 pt-24 pb-4 px-4 scroll-smooth"
        ref={scrollContainerRef}
      >
        {messages.length === 0 && (
            <div className="h-[60vh] flex flex-col items-center justify-center text-center opacity-0 animate-fade-in-up" style={{animationDelay: '0.2s', animationFillMode: 'forwards'}}>
                <div className="w-16 h-16 bg-ocean-800 rounded-full flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(0,0,0,0.3)]">
                    <span className="text-2xl">👋</span>
                </div>
                <p className="text-white font-serif text-lg mb-2">欢迎光临，{user?.name || '贵宾'}</p>
                <p className="text-gray-400 text-xs max-w-xs leading-relaxed">我是您的私人海鲜管家。<br/>今天想吃点什么？或者需要我为您推荐礼盒吗？</p>
                
                <div className="mt-8 flex flex-wrap justify-center gap-2 max-w-xs">
                    {["推荐适合送礼的礼盒", "帝王蟹怎么做才好吃", "帮我配一桌海鲜宴", "查一下我的快递"].map(q => (
                        <button key={q} onClick={() => onSendMessage(q)} className="bg-ocean-800 border border-white/5 px-4 py-2 rounded-full text-xs text-gray-300 hover:text-white hover:border-gold-500/30 transition-colors">
                            {q}
                        </button>
                    ))}
                </div>
            </div>
        )}

        {messages.map((msg) => (
          <React.Fragment key={msg.id}>
             <div className={`flex flex-col ${msg.role === MessageRole.USER ? 'items-end' : 'items-start'} animate-fade-in-up`}>
                <div className={`flex max-w-[85%] ${msg.role === MessageRole.USER ? 'flex-row-reverse' : 'flex-row'} gap-3`}>
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center border overflow-hidden ${msg.role === MessageRole.USER ? 'bg-ocean-800 border-white/5' : 'bg-gradient-to-br from-gold-600 to-amber-700 border-gold-500/50 shadow-md'}`}>
                        {msg.role === MessageRole.USER ? (
                            <img src={user?.avatar || "https://api.iconify.design/lucide:user.svg?color=gray"} className="w-full h-full object-cover" />
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
                        )}
                    </div>

                    {/* Bubble */}
                    <div className={`px-4 py-3 shadow-sm text-sm leading-relaxed ${
                        msg.role === MessageRole.USER 
                        ? 'bg-ocean-700 text-white rounded-2xl rounded-tr-sm' 
                        : 'bg-[#1e2330] text-gray-200 rounded-2xl rounded-tl-sm border border-white/5'
                    }`}>
                        {msg.productContext && (
                            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/5 opacity-80" onClick={() => onProductClick(msg.productContext!)}>
                                <img src={msg.productContext.image} className="w-8 h-8 rounded object-cover" />
                                <span className="text-xs truncate max-w-[150px]">{msg.productContext.name}</span>
                            </div>
                        )}
                        <div className="whitespace-pre-wrap">{msg.text}</div>
                    </div>
                </div>

                {/* Recommendations */}
                {msg.recommendedProducts && msg.recommendedProducts.length > 0 && (
                    <div className="mt-4 w-full pl-11 overflow-x-auto no-scrollbar flex gap-3 pb-2 snap-x">
                        {msg.recommendedProducts.map(p => {
                            const liveP = productCatalog.find(prod => prod.id === p.id) || p;
                            return (
                                <ProductCard 
                                    key={liveP.id} 
                                    product={liveP} 
                                    onAddToCart={onAddToCart} 
                                    onClick={onProductClick}
                                    variant="chat"
                                />
                            );
                        })}
                    </div>
                )}
             </div>
          </React.Fragment>
        ))}
        
        {isLoading && (
            <div className="flex items-center gap-3 pl-2 animate-fade-in mt-4">
                 <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-600 to-amber-700 flex-shrink-0 flex items-center justify-center border border-gold-500/50">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
                 </div>
                 <div className="bg-[#1e2330] rounded-2xl rounded-tl-none border border-white/5 p-3 px-4">
                    <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-100"></span>
                        <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-200"></span>
                    </div>
                 </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] bg-ocean-900 border-t border-white/5 z-50">
        <form onSubmit={handleSubmit} className="flex items-center gap-3 bg-ocean-800 border border-white/10 p-1.5 pl-4 rounded-full shadow-inner transition-all focus-within:border-gold-500/30 focus-within:bg-ocean-800/80">
           <input
             ref={inputRef}
             type="text"
             value={input}
             onChange={(e) => setInput(e.target.value)}
             placeholder="询问任何海鲜问题..."
             className="flex-1 bg-transparent text-white placeholder-gray-500 text-sm focus:outline-none"
             disabled={isLoading}
           />
           <button 
             type="submit" 
             disabled={(!input.trim() && !selectedImage) || isLoading}
             className="w-9 h-9 flex-shrink-0 bg-gold-600 text-ocean-900 rounded-full flex items-center justify-center disabled:opacity-50 disabled:bg-gray-700 transition-all hover:bg-gold-500 active:scale-90"
           >
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
           </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
