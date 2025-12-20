
import React, { useRef, useEffect, useState } from 'react';
import { Message, MessageRole, Product, RecommendationCard, DecisionState } from '../types';
import { SCENE_BUTTONS } from '../constants';

interface ChatInterfaceProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (text: string) => void;
  productCatalog: Product[]; 
  onBack: () => void;
  onConfirmOrder: (card: RecommendationCard) => void;
  conversationState: DecisionState;
}

const DecisionCard: React.FC<{ 
    card: RecommendationCard, 
    catalog: Product[],
    onAction: (card: RecommendationCard) => void 
}> = ({ card, catalog, onAction }) => {
    return (
        <div className="mt-8 w-full bg-white/[0.04] border border-gold-500/20 p-8 animate-reveal rounded-[2.5rem] relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/5 rounded-full -translate-x-8 -translate-y-16"></div>
            
            <div className="mb-8">
                <span className="text-[9px] text-gold-500 font-bold tracking-[0.4em] block mb-2 opacity-60 uppercase">AI 私人管家 选定</span>
                <h3 className="text-white font-serif font-bold text-2xl tracking-tight leading-none italic">{card.decision}</h3>
            </div>
            
            <p className="text-white/40 text-[11px] mb-10 leading-relaxed tracking-widest font-light border-l-2 border-gold-500/30 pl-4 italic">
                “ {card.reason} ”
            </p>
            
            <div className="space-y-7 mb-12">
                {card.items.map((item, idx) => {
                    // 反向寻找目录中的图片
                    const productInfo = catalog.find(p => p.name === item.name);
                    return (
                        <div key={idx} className="flex items-center gap-5">
                            <div className="w-16 h-20 bg-black rounded-2xl shrink-0 overflow-hidden border border-white/5 relative">
                                <img src={productInfo?.image || 'https://images.unsplash.com/photo-1551041777-ed07f99b6705?q=80&w=400'} className="w-full h-full object-cover grayscale opacity-80" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                            </div>
                            <div className="flex-1 flex justify-between items-end border-b border-white/5 pb-3">
                                <div className="flex flex-col">
                                    <span className="text-white text-[12px] font-bold tracking-widest">{item.name}</span>
                                    <span className="text-white/20 text-[10px] mt-1.5 tracking-tighter">{item.spec} / ×{item.quantity}</span>
                                </div>
                                <span className="text-gold-500 font-serif font-bold text-lg">¥{(item.price * item.quantity).toLocaleString()}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-white/5">
                <div className="flex flex-col">
                    <span className="text-[10px] text-white/30 tracking-[0.3em] mb-1.5 uppercase">Estimated Total</span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-gold-500 font-serif italic text-sm">¥</span>
                        <span className="text-gold-500 text-4xl font-serif font-bold tracking-tighter">{card.totalPrice.toLocaleString()}</span>
                    </div>
                </div>
                <button 
                    onClick={() => onAction(card)}
                    className="bg-gold-500 text-ocean-950 h-16 px-10 rounded-full text-[12px] font-black tracking-[0.4em] uppercase active:bg-gold-600 transition-all shadow-xl shadow-gold-500/10"
                >
                    {card.ctaText || '确认此清单'}
                </button>
            </div>
        </div>
    );
};

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
    messages, isLoading, onSendMessage, onBack, onConfirmOrder, conversationState, productCatalog
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-ocean-950 relative w-full overflow-hidden">
      {/* 顶部导航 */}
      <div className="fixed top-0 left-0 w-full z-30 pt-safe-top pb-6 px-10 glass-v2 border-b border-white/5">
        <div className="flex items-center justify-between">
            <button onClick={onBack} className="w-11 h-11 rounded-full flex items-center justify-center text-white/30 hover:text-white glass-v2 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <div className="text-center">
                <h2 className="text-gold-500 text-[11px] font-bold tracking-[0.5em] uppercase">私人管家 魏来</h2>
                <div className="flex items-center justify-center gap-1.5 mt-1.5">
                    <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>
                    <span className="text-[8px] text-white/20 tracking-[0.2em] uppercase">Deep Sea Encryption</span>
                </div>
            </div>
            <div className="w-11"></div>
        </div>
      </div>

      {/* 对话区域 */}
      <div className="flex-1 overflow-y-auto pt-32 pb-48 px-10 no-scrollbar">
        <div className="max-w-2xl mx-auto space-y-14">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.role === MessageRole.USER ? 'items-end' : 'items-start'} animate-reveal`}>
                <div className="max-w-[90%] space-y-5">
                    <div className={`text-[13px] leading-relaxed p-7 tracking-widest shadow-xl ${
                        msg.role === MessageRole.USER 
                        ? 'bg-gold-500 text-ocean-950 font-bold rounded-[2rem] rounded-tr-none' 
                        : 'bg-white/[0.04] text-white/80 font-light border border-white/5 rounded-[2rem] rounded-tl-none italic'
                    }`}>
                        {msg.text}
                    </div>
                    {msg.recommendationCard && (
                        <DecisionCard 
                            card={msg.recommendationCard} 
                            catalog={productCatalog}
                            onAction={onConfirmOrder}
                        />
                    )}
                </div>
              </div>
            ))}
            
            {isLoading && (
                <div className="flex items-center gap-2.5 opacity-30 px-8">
                    <div className="w-1.5 h-1.5 bg-gold-500 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-gold-500 rounded-full animate-bounce delay-100"></div>
                    <div className="w-1.5 h-1.5 bg-gold-500 rounded-full animate-bounce delay-200"></div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 输入区 */}
      <div className="absolute bottom-0 left-0 w-full p-10 pb-safe-bottom glass-v2 border-t border-white/5">
        <form onSubmit={handleSubmit} className="flex items-center gap-6 bg-white/[0.04] border border-white/10 rounded-full px-10 py-1.5">
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="告知您的偏好、预算或场景..."
                className="flex-1 bg-transparent text-white placeholder-white/10 text-[12px] py-5 focus:outline-none tracking-widest font-light"
                disabled={isLoading}
            />
            <button type="submit" disabled={!input.trim() || isLoading} className="w-11 h-11 rounded-full flex items-center justify-center text-gold-500 glass-v2 disabled:opacity-20 transition-all active:scale-90">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
            </button>
        </form>
      </div>
    </div>
  );
};
