
import React, { useState } from 'react';
import { CartItem, Order, Address, User } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  user: User | null;
  onCompleteOrder: (order: Order) => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, cart, user, onCompleteOrder }) => {
  const [step, setStep] = useState<'review' | 'paying'>('review');

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 0;
  const total = subtotal + shipping;

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-[70] flex items-end justify-center pointer-events-none">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm pointer-events-auto animate-fade-in" onClick={onClose} />
      
      <div className="bg-ocean-950 w-full h-[85%] border-t border-gold-500/20 shadow-2xl overflow-hidden flex flex-col relative animate-slide-in-up pointer-events-auto">
        <div className="px-8 pt-8 pb-4 flex justify-between items-center shrink-0">
            <h2 className="text-lg font-serif font-bold tracking-[0.4em] uppercase text-gold-500">订单支付单</h2>
            <button onClick={onClose} className="text-white/20 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6 no-scrollbar space-y-12">
            {/* 收货地址 */}
            <section className="space-y-4">
                <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest border-b border-white/5 pb-2 block">Delivery Address</span>
                <div className="flex justify-between items-start">
                    <div>
                        <div className="text-sm font-bold text-white mb-1">魏来贵宾 · 138****8888</div>
                        <p className="text-xs text-white/40 leading-relaxed max-w-[80%]">上海市静安区南京西路1266号恒隆广场一期 VIP 会所</p>
                    </div>
                    <button className="text-[10px] text-gold-500/60 uppercase font-bold border-b border-gold-500/20">Change</button>
                </div>
            </section>

            {/* 明细清单 */}
            <section className="space-y-6">
                <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest border-b border-white/5 pb-2 block">Bill Detail</span>
                <div className="space-y-4">
                    {cart.map(item => (
                        <div key={item.id} className="flex justify-between items-end">
                            <div>
                                <h4 className="text-xs font-bold text-white mb-1">{item.name}</h4>
                                <span className="text-[10px] text-white/20 uppercase font-mono tracking-tighter">Qty: {item.quantity} · Price: ¥{item.price}</span>
                            </div>
                            <span className="text-xs font-serif font-bold text-white">¥{item.price * item.quantity}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* 汇总 */}
            <section className="pt-10 border-t border-dashed border-white/10 space-y-4">
                <div className="flex justify-between text-xs text-white/40">
                    <span className="uppercase tracking-widest">Subtotal</span>
                    <span className="font-mono">¥{subtotal}</span>
                </div>
                <div className="flex justify-between text-xs text-white/40">
                    <span className="uppercase tracking-widest">Shipping</span>
                    <span className="font-mono">¥{shipping}</span>
                </div>
                <div className="flex justify-between items-end pt-4">
                    <span className="text-xs font-bold text-white uppercase tracking-[0.3em]">Total Amount</span>
                    <div className="text-4xl font-serif font-bold text-gold-500">¥ {total.toLocaleString()}</div>
                </div>
            </section>
        </div>

        {/* 支付动作 */}
        <div className="p-8 pb-safe-bottom bg-black/40 backdrop-blur-md">
            <button 
                onClick={() => {
                    setStep('paying');
                    setTimeout(() => {
                        onCompleteOrder({
                            id: `WL-${Date.now()}`,
                            status: 'pending',
                            total: total,
                            date: new Date().toLocaleDateString(),
                            items: cart.map(c => ({
                                skuId: c.skuId,
                                productId: c.id,
                                name: c.name,
                                spec: c.unit,
                                quantity: c.quantity,
                                price: c.price,
                                // Added image property to match updated RecommendationItem interface
                                image: c.image
                            })),
                            paymentMethod: 'wechat'
                        });
                        onClose();
                    }, 1500);
                }}
                disabled={step === 'paying'}
                className="w-full bg-gold-500 text-ocean-950 py-5 font-black text-xs uppercase tracking-[0.5em] shadow-[0_30px_60px_rgba(197,160,89,0.3)] disabled:opacity-50 transition-all active:scale-[0.98]"
            >
                {step === 'paying' ? '支付安全处理中...' : '立即确认并支付'}
            </button>
            <p className="text-center text-[8px] text-white/20 mt-4 uppercase tracking-widest italic">Wei Lai Seafood Secure Checkout</p>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
