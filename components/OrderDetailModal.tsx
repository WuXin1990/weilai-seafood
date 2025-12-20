
import React from 'react';
import { Order } from '../types';

interface OrderDetailModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onCancel: (orderId: string) => void;
  onConfirm: (orderId: string) => void;
  onBuyAgain: (order: Order) => void;
  onContactSupport: () => void;
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ order, isOpen, onClose, onCancel, onConfirm, onBuyAgain, onContactSupport }) => {
  if (!isOpen || !order) return null;

  return (
    <div className="absolute inset-0 z-50 bg-ocean-950 flex flex-col animate-slide-in-right text-white overflow-hidden">
      <div className="pt-safe-top px-8 pb-10 bg-gold-500 text-ocean-950">
        <div className="flex justify-between items-center mb-8">
            <button onClick={onClose} className="p-2 -ml-4"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg></button>
            <button onClick={onContactSupport} className="text-[10px] font-black uppercase tracking-widest border-b border-ocean-950/20">Contact Service</button>
        </div>
        <h2 className="text-4xl font-serif font-bold italic tracking-tighter uppercase">{order.status}</h2>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60 mt-1">Order Status Track</p>
      </div>

      <div className="flex-1 overflow-y-auto px-8 pt-10 pb-40 no-scrollbar space-y-12">
        <section className="space-y-4">
            <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest border-b border-white/5 pb-2 block">Delivery Logistics</span>
            <div className="relative pl-6 space-y-8 before:absolute before:left-0.5 before:top-2 before:bottom-2 before:w-px before:bg-gold-500/20">
                <div className="relative">
                    <div className="absolute -left-[23px] top-1.5 w-1.5 h-1.5 bg-gold-500"></div>
                    <h4 className="text-xs font-bold text-white mb-1">正在极速配货</h4>
                    <p className="text-[10px] text-white/40 leading-relaxed uppercase tracking-tighter">Wei Lai Private Kitchen is preparing your seafood selection with 5C storage care.</p>
                </div>
                <div className="relative opacity-30">
                    <div className="absolute -left-[23px] top-1.5 w-1.5 h-1.5 bg-white"></div>
                    <h4 className="text-xs font-bold text-white mb-1">顺丰冷链揽收</h4>
                    <p className="text-[10px] text-white/40 leading-relaxed">Wait for pick-up from SF Cold-Chain express.</p>
                </div>
            </div>
        </section>

        <section className="space-y-6">
            <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest border-b border-white/5 pb-2 block">Product Details</span>
            <div className="space-y-6">
                {order.items.map((item, idx) => (
                    <div key={idx} className="flex gap-4 border-b border-white/5 pb-6">
                        <div className="w-16 h-20 bg-black border border-white/5 flex-shrink-0">
                            <img src={item.image} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 flex flex-col justify-between py-1">
                            <h4 className="text-xs font-bold text-white tracking-wide uppercase">{item.name}</h4>
                            <div className="flex justify-between items-end">
                                <span className="text-[10px] text-white/30 uppercase tracking-widest">Qty: {item.quantity}</span>
                                <span className="text-gold-500 font-serif font-bold">¥{item.price}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>

        <section className="pt-10 border-t border-dashed border-white/10 space-y-4">
            <div className="flex justify-between items-end">
                <div className="flex flex-col">
                    <span className="text-[10px] text-white/30 uppercase tracking-widest mb-2 block">Total Amount</span>
                    <span className="text-gold-500 font-serif text-3xl font-bold">¥ {order.total.toLocaleString()}</span>
                </div>
                <div className="text-right">
                    <span className="text-[8px] text-white/20 uppercase block mb-1">Order Ref</span>
                    <span className="text-[10px] font-mono text-white/40">{order.id}</span>
                </div>
            </div>
        </section>
      </div>

      <div className="p-8 pb-safe-bottom glass border-t border-white/5 flex gap-4">
        {order.status === 'pending' && (
            <button onClick={() => onCancel(order.id)} className="flex-1 py-4 border border-white/10 text-[10px] font-bold tracking-[0.3em] uppercase transition-all">Cancel Order</button>
        )}
        <button onClick={() => onBuyAgain(order)} className="flex-1 py-4 bg-gold-500 text-ocean-950 text-xs font-black tracking-[0.3em] uppercase">Buy Again</button>
      </div>
    </div>
  );
};

export default OrderDetailModal;
