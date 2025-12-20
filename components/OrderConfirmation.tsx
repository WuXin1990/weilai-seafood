
import React from 'react';
import { RecommendationCard } from '../types';

interface OrderConfirmationProps {
  card: RecommendationCard;
  onBack: () => void;
  onPay: () => void;
}

const OrderConfirmation: React.FC<OrderConfirmationProps> = ({ card, onBack, onPay }) => {
  return (
    <div className="h-full w-full bg-ocean-950 flex flex-col animate-reveal relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[40vh] bg-gradient-to-b from-gold-500/5 to-transparent pointer-events-none"></div>

      <div className="relative z-10 p-6 pt-safe-top flex items-center justify-between border-b border-white/5 bg-ocean-950/40 backdrop-blur-md">
        <button onClick={onBack} className="w-10 h-10 rounded-full flex items-center justify-center text-white/40 hover:text-white glass-v2 transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <h2 className="text-[10px] font-serif font-bold tracking-[0.5em] uppercase text-gold-500">确认下单结算</h2>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 overflow-y-auto px-10 py-10 space-y-12 relative z-10 no-scrollbar">
        <section className="space-y-6">
            <span className="text-[10px] text-white/30 font-bold uppercase tracking-[0.4em] border-b border-white/5 pb-2 block">Delivery Address</span>
            <div className="flex justify-between items-center bg-white/[0.03] p-6 rounded-3xl border border-white/5">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <span className="text-white font-serif font-bold text-lg tracking-widest">魏来贵宾</span>
                        <span className="text-white/40 text-xs font-mono">138****8888</span>
                    </div>
                    <p className="text-white/40 text-[10px] leading-relaxed max-w-[90%] uppercase tracking-tighter">上海市静安区南京西路1266号恒隆广场一期 VIP 会所</p>
                </div>
            </div>
        </section>

        <section className="space-y-6">
            <span className="text-[10px] text-white/30 font-bold uppercase tracking-[0.4em] border-b border-white/5 pb-2 block">Bill Manifest</span>
            <div className="bg-white/[0.03] border border-gold-500/10 rounded-[2.5rem] overflow-hidden">
                <div className="bg-gold-500/10 p-8 border-b border-gold-500/20">
                    <h3 className="text-gold-500 font-serif font-bold text-xl italic leading-none">{card.decision}</h3>
                </div>
                
                <div className="p-8 space-y-8">
                    <div className="space-y-5">
                        {card.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-end">
                                <div className="flex flex-col">
                                    <span className="text-white text-xs font-bold uppercase tracking-widest">{item.name}</span>
                                    <span className="text-white/20 text-[9px] uppercase mt-1">× {item.quantity}</span>
                                </div>
                                <span className="text-white font-serif font-bold text-sm">¥{item.price * item.quantity}</span>
                            </div>
                        ))}
                    </div>

                    <div className="pt-8 border-t border-white/5 space-y-6">
                        <div className="flex justify-between items-end">
                            <div className="flex flex-col">
                                <span className="text-[10px] text-white/20 uppercase tracking-widest mb-1 block">Total Amount</span>
                                <span className="text-gold-500 text-4xl font-serif font-bold tracking-tighter">¥{card.totalPrice.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
      </div>

      <div className="p-10 pb-safe-bottom bg-ocean-950 border-t border-white/5 space-y-4">
        <button 
            onClick={onPay}
            className="w-full bg-gold-500 text-ocean-950 font-black h-16 rounded-full text-xs tracking-widest uppercase shadow-2xl shadow-gold-500/10 active:scale-95 transition-all"
        >
            立即支付
        </button>
      </div>
    </div>
  );
};

export default OrderConfirmation;
