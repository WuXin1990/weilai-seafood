
import React, { useState, useEffect } from 'react';
import { CartItem, ShippingTemplate, Order, Address, User, Coupon, OrderItemSnapshot } from '../types';
import { geminiService } from '../services/geminiService';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  addresses: Address[]; 
  shippingTemplates: ShippingTemplate[];
  coupons: Coupon[]; 
  onCompleteOrder: (order: Order, couponId?: string) => void;
  clearCart: () => void;
  user: User | null; 
  onAddAddress: (address: Address) => void; 
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, cart, addresses, shippingTemplates, coupons, onCompleteOrder, clearCart, user, onAddAddress }) => {
  const [step, setStep] = useState<'address' | 'payment' | 'processing' | 'success'>('address');
  const [view, setView] = useState<'main' | 'addAddress'>('main'); 
  
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [selectedShipping, setSelectedShipping] = useState<ShippingTemplate>(shippingTemplates[0]);
  const [paymentMethod, setPaymentMethod] = useState<'wechat' | 'balance'>('wechat');
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null); 
  const [orderNote, setOrderNote] = useState('');

  // Address Form State
  const [addressForm, setAddressForm] = useState<Partial<Address>>({});
  const [aiAddressInput, setAiAddressInput] = useState('');
  const [isParsingAddress, setIsParsingAddress] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, boolean>>({}); // NEW: Error state
  
  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const myCouponIds = user?.claimedCouponIds || [];
  const myCoupons = coupons.filter(c => myCouponIds.includes(c.id));
  const availableCoupons = myCoupons.filter(c => subtotal >= c.minOrderAmount);

  // Helper to calculate discount
  const calculateDiscount = (coupon: Coupon | null, amount: number) => {
      if (!coupon) return 0;
      let discount = 0;
      if (coupon.type === 'fixed') {
          discount = coupon.value;
      } else {
          discount = amount * (1 - coupon.value);
      }
      return Math.min(discount, amount);
  };

  const discountAmount = calculateDiscount(selectedCoupon, subtotal);
  const discountedSubtotal = subtotal - discountAmount;
  const shippingCost = (selectedShipping.type === 'free' && discountedSubtotal >= 500) ? 0 : selectedShipping.baseFee;
  const total = discountedSubtotal + shippingCost;

  // Auto-Select Best Coupon on Open
  useEffect(() => {
      if(isOpen) {
          setStep('address');
          setView('main');
          const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];
          setSelectedAddress(defaultAddr || null);
          setPaymentMethod('wechat');
          setOrderNote('');
          setFormErrors({});

          // Smart Coupon Logic
          if (availableCoupons.length > 0) {
              const bestCoupon = availableCoupons.reduce((prev, curr) => {
                  return calculateDiscount(curr, subtotal) > calculateDiscount(prev, subtotal) ? curr : prev;
              });
              setSelectedCoupon(bestCoupon);
          } else {
              setSelectedCoupon(null);
          }
      }
  }, [isOpen, addresses, user, coupons, subtotal]); // Dependencies updated

  const handleAIParseAddress = async () => {
      if (!aiAddressInput.trim()) { alert('请粘贴地址信息'); return; }
      setIsParsingAddress(true);
      try {
          const result = await geminiService.parseAddressInfo(aiAddressInput);
          setAddressForm(prev => ({ ...prev, ...result }));
          setFormErrors({}); // Clear errors on AI fill
      } catch (e) {
          alert('识别失败，请手动填写');
      } finally {
          setIsParsingAddress(false);
      }
  };

  const handleSaveAddress = () => {
      const errors: Record<string, boolean> = {};
      if (!addressForm.name) errors.name = true;
      if (!addressForm.phone) errors.phone = true;
      if (!addressForm.detail) errors.detail = true;
      
      if (Object.keys(errors).length > 0) {
          setFormErrors(errors);
          if(navigator.vibrate) navigator.vibrate(50); // Haptic feedback
          return;
      }

      const newAddr = { ...addressForm, id: `addr-${Date.now()}` } as Address;
      onAddAddress(newAddr);
      setSelectedAddress(newAddr);
      setView('main');
      setAddressForm({});
      setAiAddressInput('');
      setFormErrors({});
  };

  const handlePay = () => {
      if (!selectedAddress) { alert('请先选择收货地址'); return; }
      if (paymentMethod === 'balance' && (!user || user.balance < total)) { alert('余额不足'); return; }

      setStep('processing');
      setTimeout(() => {
          setStep('success');
          
          const orderItems: OrderItemSnapshot[] = cart.map(item => ({
              productId: item.id,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              image: item.image,
              variantName: item.selectedVariantName
          }));

          const newOrder: Order = {
              id: `ORD-${Date.now()}`,
              customerName: selectedAddress.name,
              status: 'pending',
              total: parseFloat(total.toFixed(2)),
              originalTotal: parseFloat(subtotal.toFixed(2)),
              discountAmount: parseFloat(discountAmount.toFixed(2)),
              couponName: selectedCoupon?.name,
              date: new Date().toLocaleDateString(),
              items: orderItems,
              paymentMethod: paymentMethod,
              note: orderNote
          };
          onCompleteOrder(newOrder, selectedCoupon?.id);
          clearCart();
      }, 2000);
  };

  if (!isOpen) return null;

  if (view === 'addAddress') {
      return (
        <div className="absolute inset-0 z-50 flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" />
            <div className="bg-ocean-900 w-full rounded-t-2xl shadow-2xl overflow-hidden flex flex-col relative animate-slide-in-up border border-gold-500/10 h-[85%] z-50">
                <style>{`
                    @keyframes shake {
                        0%, 100% { transform: translateX(0); }
                        25% { transform: translateX(-5px); }
                        75% { transform: translateX(5px); }
                    }
                    .animate-shake { animation: shake 0.3s ease-in-out; }
                `}</style>
                <div className="p-4 border-b border-ocean-800 flex items-center justify-between bg-ocean-900 sticky top-0 z-10">
                    <button onClick={() => setView('main')} className="text-gray-400 hover:text-white transition-colors text-sm">取消</button>
                    <h2 className="text-white font-serif font-bold tracking-wide">新增收货地址</h2>
                    <button onClick={handleSaveAddress} className="text-gold-500 font-bold text-sm">保存</button>
                </div>
                
                <div className="p-6 space-y-6 overflow-y-auto pb-20">
                    <div className="bg-gradient-to-r from-ocean-800 to-ocean-800/50 p-4 rounded-xl border border-gold-500/30 shadow-lg relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gold-500/5 rounded-full blur-xl pointer-events-none"></div>
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-gold-500 text-xs font-bold flex items-center gap-1.5">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M9 5H5"/><path d="M5 19v4"/><path d="M9 23H5"/></svg>
                                AI 智能粘贴
                            </span>
                            <button 
                                onClick={handleAIParseAddress} 
                                disabled={isParsingAddress} 
                                className="text-[10px] bg-gold-600/90 text-ocean-900 px-3 py-1.5 rounded-full font-bold shadow hover:bg-gold-500 transition-colors disabled:opacity-50"
                            >
                                {isParsingAddress ? '识别中...' : '自动识别'}
                            </button>
                        </div>
                        <textarea 
                            value={aiAddressInput}
                            onChange={(e) => setAiAddressInput(e.target.value)}
                            placeholder="粘贴如：张三 13800000000 上海市静安区..."
                            className="w-full bg-ocean-900/50 text-white text-xs p-3 rounded-lg border border-transparent focus:border-gold-500/50 outline-none h-20 placeholder-gray-500 resize-none transition-all"
                        />
                    </div>

                    <div className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className={`text-[10px] ml-1 transition-colors ${formErrors.name ? 'text-red-500' : 'text-gray-400'}`}>收货人</label>
                                <input 
                                    type="text" 
                                    value={addressForm.name || ''} 
                                    onChange={e => { setAddressForm({...addressForm, name: e.target.value}); if(formErrors.name) setFormErrors({...formErrors, name: false}); }} 
                                    className={`w-full bg-ocean-800 text-white p-3 rounded-xl border outline-none transition-all text-sm ${formErrors.name ? 'border-red-500 animate-shake' : 'border-ocean-700 focus:border-gold-500'}`} 
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className={`text-[10px] ml-1 transition-colors ${formErrors.phone ? 'text-red-500' : 'text-gray-400'}`}>手机号码</label>
                                <input 
                                    type="tel" 
                                    value={addressForm.phone || ''} 
                                    onChange={e => { setAddressForm({...addressForm, phone: e.target.value}); if(formErrors.phone) setFormErrors({...formErrors, phone: false}); }} 
                                    className={`w-full bg-ocean-800 text-white p-3 rounded-xl border outline-none transition-all text-sm ${formErrors.phone ? 'border-red-500 animate-shake' : 'border-ocean-700 focus:border-gold-500'}`} 
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] text-gray-400 ml-1">省份</label>
                                <input 
                                    type="text" 
                                    value={addressForm.province || ''} 
                                    onChange={e => setAddressForm({...addressForm, province: e.target.value})} 
                                    className="w-full bg-ocean-800 text-white p-3 rounded-xl border border-ocean-700 outline-none focus:border-gold-500 transition-colors text-sm" 
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] text-gray-400 ml-1">城市/区县</label>
                                <input 
                                    type="text" 
                                    value={addressForm.city || ''} 
                                    onChange={e => setAddressForm({...addressForm, city: e.target.value})} 
                                    className="w-full bg-ocean-800 text-white p-3 rounded-xl border border-ocean-700 outline-none focus:border-gold-500 transition-colors text-sm" 
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className={`text-[10px] ml-1 transition-colors ${formErrors.detail ? 'text-red-500' : 'text-gray-400'}`}>详细地址 (街道、门牌号)</label>
                            <textarea 
                                value={addressForm.detail || ''} 
                                onChange={e => { setAddressForm({...addressForm, detail: e.target.value}); if(formErrors.detail) setFormErrors({...formErrors, detail: false}); }} 
                                className={`w-full bg-ocean-800 text-white p-3 rounded-xl border h-24 outline-none transition-all text-sm resize-none ${formErrors.detail ? 'border-red-500 animate-shake' : 'border-ocean-700 focus:border-gold-500'}`} 
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
      );
  }

  if (step === 'success') {
      return (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm">
              <div className="w-full max-w-xs relative perspective-1000">
                  {/* Receipt Paper */}
                  <div className="bg-[#fffdf0] text-black w-full rounded-b-lg shadow-2xl relative animate-receipt-print origin-top">
                      {/* Top Jagged Edge */}
                      <div className="absolute -top-4 left-0 w-full h-4 bg-[#fffdf0]" style={{
                          clipPath: 'polygon(0% 100%, 5% 0%, 10% 100%, 15% 0%, 20% 100%, 25% 0%, 30% 100%, 35% 0%, 40% 100%, 45% 0%, 50% 100%, 55% 0%, 60% 100%, 65% 0%, 70% 100%, 75% 0%, 80% 100%, 85% 0%, 90% 100%, 95% 0%, 100% 100%)'
                      }}></div>
                      
                      <div className="p-6 flex flex-col items-center">
                          <div className="w-12 h-12 rounded-full border-2 border-black flex items-center justify-center mb-4">
                              <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                          </div>
                          <h2 className="font-serif font-bold text-2xl tracking-wide mb-1">支付成功</h2>
                          <p className="text-xs text-gray-500 font-mono tracking-widest uppercase mb-6">Payment Successful</p>
                          
                          <div className="w-full border-t-2 border-dashed border-gray-300 my-2"></div>
                          
                          <div className="w-full space-y-2 py-4">
                              <div className="flex justify-between font-mono text-sm">
                                  <span className="text-gray-600">总金额</span>
                                  <span className="font-bold text-lg">¥{total.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between font-mono text-xs text-gray-500">
                                  <span>支付方式</span>
                                  <span>{paymentMethod === 'wechat' ? '微信支付' : '余额支付'}</span>
                              </div>
                              <div className="flex justify-between font-mono text-xs text-gray-500">
                                  <span>订单编号</span>
                                  <span>ORD-{Date.now().toString().slice(-6)}</span>
                              </div>
                          </div>

                          <div className="w-full border-t-2 border-dashed border-gray-300 my-2"></div>
                          
                          <div className="mt-4 text-center">
                              <img src={`https://api.iconify.design/ion:barcode-outline.svg?color=000000`} className="h-10 opacity-70 mx-auto" />
                              <p className="text-[10px] text-gray-400 mt-2">感谢您的惠顾 · 魏来海鲜</p>
                          </div>
                      </div>

                      <div className="absolute -bottom-4 left-0 w-full h-4 bg-[#fffdf0]" style={{
                          clipPath: 'polygon(0% 0%, 5% 100%, 10% 0%, 15% 100%, 20% 0%, 25% 100%, 30% 0%, 35% 100%, 40% 0%, 45% 100%, 50% 0%, 55% 100%, 60% 0%, 65% 100%, 70% 0%, 75% 100%, 80% 0%, 85% 100%, 90% 0%, 95% 100%, 100% 0%)'
                      }}></div>
                  </div>

                  <div className="mt-8 flex justify-center animate-fade-in-up delay-500">
                      <button onClick={onClose} className="bg-white/10 border border-white/20 text-white px-8 py-3 rounded-full font-bold hover:bg-white/20 transition-colors backdrop-blur-md">
                          完成
                      </button>
                  </div>
              </div>
              <style>{`
                  @keyframes receipt-print {
                      0% { transform: translateY(-100px) rotateX(-20deg); opacity: 0; }
                      100% { transform: translateY(0) rotateX(0deg); opacity: 1; }
                  }
                  .animate-receipt-print {
                      animation: receipt-print 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
                  }
              `}</style>
          </div>
      );
  }

  return (
    <div className="absolute inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="bg-ocean-900 w-full rounded-t-2xl shadow-2xl overflow-hidden flex flex-col relative animate-slide-in-up border border-gold-500/10 h-[85%]">
        <div className="p-4 border-b border-ocean-800 flex items-center justify-between bg-ocean-900 z-10">
            <h2 className="text-white font-serif text-lg tracking-wide">确认订单</h2>
            {step !== 'processing' && ( <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">关闭</button> )}
        </div>

        <div className="p-5 flex-1 overflow-y-auto space-y-6 bg-ocean-900 pb-20">
            {step === 'address' || step === 'payment' ? (
                <>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xs text-gray-500 uppercase tracking-wider">收货地址</h3>
                            <button onClick={() => setView('addAddress')} className="text-gold-500 text-xs flex items-center gap-1 font-medium hover:text-gold-400 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                                <span className="leading-none pt-0.5">新增地址</span>
                            </button>
                        </div>
                        {addresses.length > 0 ? addresses.map(addr => (
                            <div key={addr.id} onClick={() => setSelectedAddress(addr)} className={`p-4 rounded-xl border cursor-pointer flex justify-between items-center transition-all duration-300 ${selectedAddress?.id === addr.id ? 'bg-gold-500/10 border-gold-500 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'bg-ocean-800 border-ocean-700 hover:border-gold-500/30'}`}>
                                <div><span className="text-white font-medium">{addr.name}</span> <span className="text-gray-400 text-sm ml-2">{addr.phone}</span> <p className="text-gray-400 text-sm mt-1">{addr.province} {addr.city} {addr.detail}</p></div>
                                {selectedAddress?.id === addr.id && <svg className="w-5 h-5 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>}
                            </div>
                        )) : <div onClick={() => setView('addAddress')} className="p-6 bg-ocean-800 rounded-xl border border-dashed border-ocean-600 text-center text-gray-400 text-sm cursor-pointer hover:border-gold-500 hover:text-gold-500 transition-colors">点击添加收货地址</div>}
                    </div>

                    <div className="space-y-3">
                         <h3 className="text-xs text-gray-500 uppercase tracking-wider">商品清单</h3>
                         <div className="bg-ocean-800 rounded-xl p-3 border border-ocean-700 flex items-center gap-3 overflow-x-auto no-scrollbar">
                             {cart.map(item => ( <img key={item.id} src={item.image} className="w-12 h-12 rounded-lg object-cover flex-shrink-0 bg-ocean-900 border border-ocean-600" /> ))}
                             <div className="text-gray-500 text-xs ml-auto whitespace-nowrap px-2">共 {cart.reduce((a,b)=>a+b.quantity,0)} 件</div>
                         </div>
                    </div>

                    {/* Order Remarks */}
                    <div className="space-y-2">
                        <h3 className="text-xs text-gray-500 uppercase tracking-wider">订单备注</h3>
                        <input 
                            type="text" 
                            value={orderNote}
                            onChange={(e) => setOrderNote(e.target.value)}
                            placeholder="选填：如门牌号、特殊需求..."
                            className="w-full bg-ocean-800 text-white text-sm p-3 rounded-xl border border-ocean-700 focus:border-gold-500 outline-none placeholder-gray-600 transition-colors"
                        />
                    </div>

                    {/* Payment Method - Premium Cards */}
                    <div className="space-y-3">
                        <h3 className="text-xs text-gray-500 uppercase tracking-wider">支付方式</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {/* WeChat Pay Card */}
                            <div 
                                onClick={() => setPaymentMethod('wechat')}
                                className={`relative h-20 rounded-xl border-2 flex flex-col justify-center pl-4 cursor-pointer transition-all overflow-hidden group ${paymentMethod === 'wechat' ? 'border-green-500 bg-gradient-to-br from-green-900/40 to-green-800/20' : 'border-ocean-700 bg-ocean-800 opacity-60 hover:opacity-100'}`}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 11c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/><path d="M17 11c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/><path d="M21 12c0-3.87-3.13-7-7-7-3.87 0-7 3.13-7 7 0 1.5.48 2.89 1.3 4.02l-.8 3.48 3.56-.78A6.98 6.98 0 0 0 14 19c3.87 0 7-3.13 7-7z"/><path d="M10 16c0-2.21-1.79-4-4-4S2 13.79 2 16c0 .73.23 1.41.63 1.97l-.33 1.43 1.46-.33A3.99 3.99 0 0 0 6 20c2.21 0 4-1.79 4-4z"/></svg></div>
                                    <span className="font-bold text-white text-sm">微信支付</span>
                                </div>
                                <span className="text-[10px] text-gray-400">亿万用户的选择</span>
                                {paymentMethod === 'wechat' && <div className="absolute top-2 right-2 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center animate-scale-in"><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>}
                            </div>

                            {/* Balance Card */}
                            <div 
                                onClick={() => setPaymentMethod('balance')}
                                className={`relative h-20 rounded-xl border-2 flex flex-col justify-center pl-4 cursor-pointer transition-all overflow-hidden ${paymentMethod === 'balance' ? 'border-gold-500 bg-gradient-to-br from-gray-900 to-black' : 'border-ocean-700 bg-ocean-800 opacity-60 hover:opacity-100'}`}
                            >
                                <div className="absolute inset-0 bg-gold-500/5 pointer-events-none"></div>
                                <div className="flex items-center gap-2 mb-1 z-10">
                                    <div className="w-6 h-6 rounded-full bg-gold-600 flex items-center justify-center text-black"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 7h20v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7z"/><path d="M2 7V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v2"/><path d="M12 12h.01"/></svg></div>
                                    <span className={`font-bold text-sm ${paymentMethod === 'balance' ? 'text-gold-500' : 'text-white'}`}>会员余额</span>
                                </div>
                                <span className="text-[10px] text-gray-400 z-10">可用: ¥{user?.balance.toFixed(2) || '0.00'}</span>
                                {paymentMethod === 'balance' && <div className="absolute top-2 right-2 w-4 h-4 bg-gold-500 rounded-full flex items-center justify-center animate-scale-in"><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>}
                                {(user?.balance || 0) < total && <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-[10px] text-red-500 font-bold backdrop-blur-[1px]">余额不足</div>}
                            </div>
                        </div>
                    </div>

                    {/* Coupons */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xs text-gray-500 uppercase tracking-wider">优惠券</h3>
                            {availableCoupons.length > 0 && <span className="text-[10px] bg-red-500 text-white px-1.5 rounded">{availableCoupons.length}张可用</span>}
                        </div>
                        {availableCoupons.length > 0 ? (
                            <div className="flex gap-2 overflow-x-auto no-scrollbar">
                                <button 
                                    onClick={() => setSelectedCoupon(null)}
                                    className={`px-4 py-2 rounded-lg border text-xs whitespace-nowrap flex-shrink-0 transition-all ${!selectedCoupon ? 'border-gold-500 bg-gold-500/20 text-gold-500 font-bold' : 'border-ocean-700 bg-ocean-800 text-gray-400'}`}
                                >
                                    不使用
                                </button>
                                {availableCoupons.map(cp => (
                                    <button
                                        key={cp.id}
                                        onClick={() => setSelectedCoupon(cp)}
                                        className={`px-4 py-2 rounded-lg border text-xs whitespace-nowrap flex-shrink-0 flex flex-col transition-all relative ${selectedCoupon?.id === cp.id ? 'border-red-500 bg-red-500/20 text-red-400 font-bold shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'border-ocean-700 bg-ocean-800 text-gray-400'}`}
                                    >
                                        <span className="text-sm">{cp.name}</span>
                                        <span className="scale-90 opacity-80">{cp.type === 'fixed' ? `-¥${cp.value}` : `${cp.value * 10}折`}</span>
                                        {/* Auto-selected Badge */}
                                        {selectedCoupon?.id === cp.id && (
                                            <span className="absolute -top-2 -right-1 bg-gold-500 text-ocean-900 text-[9px] px-1 rounded font-bold animate-bounce">
                                                更优惠
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="p-3 bg-ocean-800 rounded-lg text-xs text-gray-500 text-center border border-ocean-700 border-dashed">暂无可用优惠券</div>
                        )}
                    </div>

                    <div className="border-t border-ocean-800 pt-4 space-y-2">
                        <div className="flex justify-between text-sm"><span className="text-gray-400">商品小计</span><span className="text-white">¥{subtotal.toFixed(2)}</span></div>
                        {selectedCoupon && <div className="flex justify-between text-sm animate-fade-in"><span className="text-red-400">{selectedCoupon.name}</span><span className="text-red-400">- ¥{discountAmount.toFixed(2)}</span></div>}
                        <div className="flex justify-between text-sm"><span className="text-gray-400">运费</span><span className="text-gold-500">{shippingCost === 0 ? '免运费' : `+ ¥${shippingCost}`}</span></div>
                        <div className="flex justify-between items-center pt-2 mt-2 border-t border-dashed border-ocean-800"><span className="text-white font-medium">实付款</span><span className="text-2xl text-gold-500 font-serif font-bold">¥{total.toFixed(2)}</span></div>
                    </div>
                </>
            ) : (
                // Processing State
                <div className="flex flex-col items-center justify-center py-20 space-y-6">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 rounded-full animate-spin border-ocean-700 border-t-gold-500"></div>
                        <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gold-500">¥</div>
                    </div>
                    <p className="text-gray-400 text-sm animate-pulse">正在安全支付...</p>
                </div>
            )}
        </div>

        {(step === 'address' || step === 'payment') && (
            <div className="p-4 border-t border-ocean-800 bg-ocean-900 absolute bottom-0 w-full pb-[calc(1rem+env(safe-area-inset-bottom))]">
                <button onClick={handlePay} className="w-full bg-gradient-to-r from-gold-600 to-gold-500 text-ocean-900 font-bold py-3.5 rounded-full shadow-lg hover:shadow-gold-500/20 transition-all active:scale-95">立即支付 ¥{total.toFixed(2)}</button>
            </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutModal;
