
import React, { useState, useEffect } from 'react';
import { User, Order, Address, Coupon, Product, Post, RedeemItem, Review } from '../types';
import OrderDetailModal from './OrderDetailModal';
import ProductCard from './ProductCard';
import { geminiService } from '../services/geminiService';
import { REDEEM_ITEMS } from '../constants';

interface UserCenterProps {
  user: User | null;
  orders: Order[];
  addresses: Address[];
  coupons: Coupon[];
  products: Product[]; 
  posts?: Post[];
  onLogin: (user: User) => void;
  onLogout: () => void;
  onBack: () => void;
  onContactSupport: () => void;
  onUpdateProfile: (name: string) => void;
  onAddAddress: (address: Address) => void;
  onUpdateAddress: (address: Address) => void;
  onDeleteAddress: (id: string) => void;
  onRecharge: (amount: number, bonus: number) => void;
  onCheckIn: () => void; 
  onClaimCoupon: (id: string) => void; 
  onAddToCart: (product: Product) => void; 
  onCancelOrder: (orderId: string) => void; 
  onConfirmReceipt: (orderId: string) => void; 
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;
  onAddReview?: (productId: string, content: string, rating: number) => void; 
  onRemoveSubscription?: (productId: string) => void;
  onToggleFavoriteProduct?: (productId: string) => void;
  onRedeem?: (item: RedeemItem) => void; 
}

type UserView = 'main' | 'orders' | 'addresses' | 'profile' | 'settings' | 'recharge' | 'coupons' | 'health_plan' | 'likes' | 'subscriptions' | 'favorites' | 'points_mall' | 'my_reviews'; 
type OrderTab = 'all' | 'pending' | 'shipped' | 'completed';

interface RechargePlan {
    id: number;
    price: number;
    bonus: number;
    name: string;
    tag?: string;
}

const RECHARGE_PLANS: RechargePlan[] = [
    { id: 1, price: 2000, bonus: 100, name: '初见礼' },
    { id: 2, price: 5000, bonus: 388, name: '贵宾礼', tag: '推荐' },
    { id: 3, price: 10000, bonus: 888, name: '尊享礼' },
    { id: 4, price: 50000, bonus: 5888, name: '至尊礼' },
];

const RechargeSuccess: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    return (
        <div className="absolute inset-0 z-[100] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center animate-fade-in" onClick={onComplete}>
             <div className="absolute inset-0 overflow-hidden pointer-events-none">
                 {[...Array(30)].map((_, i) => (
                     <div key={i} className="absolute w-2 h-2 bg-gold-500 rounded-full animate-confetti" style={{
                         left: `${Math.random() * 100}%`,
                         top: `-20px`,
                         animationDelay: `${Math.random()}s`,
                         animationDuration: `${1.5 + Math.random()}s`
                     }}></div>
                 ))}
             </div>
             
             <div className="relative transform animate-scale-in text-center">
                 <div className="w-24 h-24 bg-gold-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_50px_rgba(245,158,11,0.5)] border-4 border-gold-300">
                     <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                 </div>
                 <h2 className="text-3xl font-serif text-gold-500 font-bold mb-2">充值成功</h2>
                 <p className="text-white text-sm opacity-80">尊贵的权益已到账</p>
             </div>
             <p className="absolute bottom-20 text-gray-500 text-xs animate-pulse">点击任意处关闭</p>
             
             <style>{`
                 @keyframes confetti {
                     0% { transform: translateY(0) rotate(0deg); opacity: 1; }
                     100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
                 }
                 .animate-confetti { animation: confetti linear forwards; }
             `}</style>
        </div>
    );
};

// ... (VIPPrivilegesModal remains mostly same) ...
const VIPPrivilegesModal: React.FC<{ isOpen: boolean; onClose: () => void; currentLevel: string }> = ({ isOpen, onClose, currentLevel }) => {
    if (!isOpen) return null;
    return (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-gradient-to-b from-ocean-800 to-ocean-900 border border-gold-500/30 w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
                <div className="p-6 text-center border-b border-ocean-700 bg-gold-600/10">
                    <h3 className="text-xl font-serif text-gold-500 font-bold">尊享会员权益</h3>
                    <p className="text-xs text-gray-400 mt-1">升级解锁更多奢华服务</p>
                </div>
                
                <div className="p-5 space-y-4">
                    {[
                        { level: 'black_gold', name: '黑金会员', color: 'text-gold-500', icon: '👑', benefits: ['全场 98 折优惠', '优先发货通道', '专属 1v1 客服管家'] },
                        { level: 'diamond', name: '钻石会员', color: 'text-blue-400', icon: '💎', benefits: ['全场 99 折优惠', '优先发货通道'] },
                    ].map(tier => (
                        <div key={tier.level} className={`p-4 rounded-xl border ${currentLevel === tier.level ? 'bg-gold-500/10 border-gold-500/50' : 'bg-ocean-800 border-ocean-700 opacity-60'}`}>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">{tier.icon}</span>
                                    <span className={`font-bold ${tier.color}`}>{tier.name}</span>
                                </div>
                                {currentLevel === tier.level && <span className="text-[10px] bg-gold-500 text-black px-2 py-0.5 rounded font-bold">当前等级</span>}
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {tier.benefits.map((b, i) => (
                                    <div key={i} className="flex items-center gap-1.5 text-xs text-gray-300">
                                        <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                                        {b}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-4 border-t border-ocean-700">
                    <button onClick={onClose} className="w-full bg-ocean-800 text-gray-400 py-3 rounded-full text-sm font-medium hover:text-white">关闭</button>
                </div>
            </div>
        </div>
    );
};

const UserCenter: React.FC<UserCenterProps> = ({ 
    user, orders, addresses, coupons, products, posts = [],
    onLogin, onLogout, onBack, onContactSupport,
    onUpdateProfile, onAddAddress, onUpdateAddress, onDeleteAddress,
    onRecharge, onCheckIn, onClaimCoupon, onAddToCart, onCancelOrder, onConfirmReceipt, showToast, onAddReview, onRemoveSubscription, onToggleFavoriteProduct, onRedeem
}) => {
  const [currentView, setCurrentView] = useState<UserView>('main');
  const [isLoading, setIsLoading] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false); 
  const [showVIPDetails, setShowVIPDetails] = useState(false); 
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isFlipped, setIsFlipped] = useState(false);
  
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [activeOrderTab, setActiveOrderTab] = useState<OrderTab>('all');

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (isFlipped) return;
      const card = e.currentTarget;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -10; 
      const rotateY = ((x - centerX) / centerX) * 10;
      setTilt({ x: rotateX, y: rotateY });
  };

  const handleCardClick = () => {
      if (navigator.vibrate) navigator.vibrate(20);
      setIsFlipped(!isFlipped);
      setTilt({ x: 0, y: 0 });
  };

  const handleSimulateLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      onLogin({
        id: 'u-888',
        name: '魏来贵宾',
        phone: '138****8888',
        avatar: 'https://api.iconify.design/lucide:user.svg?color=%23f59e0b',
        level: 'black_gold',
        balance: 8888.00,
        points: 5200,
        claimedCouponIds: [],
        subscriptionIds: [],
        favoriteProductIds: [],
        lastCheckInDate: ''
      });
      setIsLoading(false);
    }, 1000);
  };

  if (!user) {
    return (
      <div className="h-full w-full bg-ocean-900 relative overflow-hidden flex flex-col items-center justify-center p-6 animate-fade-in-up">
        <button onClick={onBack} className="absolute top-safe-top left-4 p-2 text-gray-400 hover:text-white z-20"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg></button>
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gold-600 to-amber-700 flex items-center justify-center shadow-[0_0_40px_rgba(245,158,11,0.3)] mb-8 border-4 border-ocean-800">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.47-3.46 6-7 6s-7.06-2.53-8.5-6Z"/><path d="M18 12v.5"/><path d="M16 17.93a9.77 9.77 0 0 1 0-11.86"/></svg>
        </div>
        <h2 className="text-3xl font-serif text-white mb-2 tracking-wider">魏来海鲜</h2>
        <p className="text-gold-500/80 text-sm tracking-[0.2em] mb-12 uppercase font-light">Premium Member Club</p>
        <button onClick={handleSimulateLogin} disabled={isLoading} className="w-full bg-white text-ocean-900 font-bold py-4 rounded-full shadow-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
            {isLoading ? <svg className="animate-spin h-5 w-5 text-ocean-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : '手机号一键登录'}
        </button>
      </div>
    );
  }

  const renderHeader = (title: string, onBackOverride?: () => void) => (
    <div className="relative z-10 pt-safe-top px-4 pb-4 flex items-center justify-between bg-ocean-900 flex-shrink-0">
         <button onClick={onBackOverride || onBack} className="p-2 -ml-2 text-white/80 hover:text-white"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg></button>
         <h1 className="text-white font-serif tracking-wide text-lg">{title}</h1>
         <div className="w-10"></div>
    </div>
  );

  // --- SUB-VIEWS ---
  if (currentView === 'orders') {
      const filteredOrders = orders.filter(o => {
          if (activeOrderTab === 'all') return true;
          return o.status === activeOrderTab;
      });

      return (
          <div className="h-full w-full bg-ocean-900 flex flex-col">
              {renderHeader('我的订单', () => setCurrentView('main'))}
              
              <div className="bg-ocean-900 px-4 flex gap-6 overflow-x-auto no-scrollbar flex-shrink-0 border-b border-white/5">
                  {(['all', 'pending', 'shipped', 'completed'] as OrderTab[]).map(tab => (
                      <button 
                          key={tab}
                          onClick={() => setActiveOrderTab(tab)}
                          className={`py-3 text-sm relative transition-colors ${activeOrderTab === tab ? 'text-gold-500 font-bold' : 'text-gray-400'}`}
                      >
                          {tab === 'all' ? '全部' : tab === 'pending' ? '待发货' : tab === 'shipped' ? '待收货' : '已完成'}
                          {activeOrderTab === tab && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-gold-500 rounded-full"></div>}
                      </button>
                  ))}
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-ocean-900 pb-[calc(20px+env(safe-area-inset-bottom))]">
                  {filteredOrders.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20 text-gray-500 gap-4">
                          <p>暂无相关订单</p>
                      </div>
                  ) : (
                      filteredOrders.map(order => (
                          <div key={order.id} className="bg-ocean-800/40 rounded-xl p-4 border border-white/5" onClick={() => setSelectedOrder(order)}>
                              <div className="flex justify-between items-center mb-3">
                                  <span className="text-xs text-gray-400 font-mono tracking-tight">{order.date}</span>
                                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${order.status === 'completed' ? 'text-green-400' : order.status === 'pending' ? 'text-gold-500' : 'text-blue-400'}`}>
                                      {order.status === 'pending' ? '待发货' : order.status === 'shipped' ? '运输中' : order.status === 'completed' ? '已完成' : '已取消'}
                                  </span>
                              </div>
                              <div className="flex gap-4">
                                  <div className="relative">
                                      <img src={order.items[0].image} className="w-16 h-16 rounded-lg object-cover bg-ocean-900" />
                                      {order.items.length > 1 && <div className="absolute bottom-0 right-0 bg-black/60 text-white text-[9px] px-1 rounded-tl-md">+{order.items.length - 1}</div>}
                                  </div>
                                  <div className="flex-1 flex flex-col justify-between py-0.5">
                                      <div className="text-white text-sm font-medium line-clamp-1">{order.items[0].name}</div>
                                      <div className="flex justify-between items-end">
                                          <span className="text-gray-400 text-xs">共 {order.items.reduce((a,b)=>a+b.quantity,0)} 件</span>
                                          <div className="text-xs text-gray-300">实付 <span className="text-gold-500 font-bold text-base font-serif">¥{order.total}</span></div>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      ))
                  )}
              </div>
              <OrderDetailModal 
                  isOpen={!!selectedOrder} 
                  order={selectedOrder} 
                  onClose={() => setSelectedOrder(null)} 
                  onCancel={(id) => { onCancelOrder(id); setSelectedOrder(null); }} 
                  onConfirm={(id) => { onConfirmReceipt(id); setSelectedOrder(null); }} 
                  onBuyAgain={(o) => { onAddToCart(products.find(p=>p.id===o.items[0].productId)!); setSelectedOrder(null); }} 
                  onContactSupport={onContactSupport}
                  onAddReview={onAddReview}
              />
          </div>
      );
  }

  // --- Main Dashboard ---
  return (
    <div className="h-full w-full bg-ocean-900 flex flex-col overflow-hidden relative">
      <style>{`
        @keyframes shine {
            0% { transform: translateX(-150%) skewX(-15deg); }
            50% { transform: translateX(150%) skewX(-15deg); }
            100% { transform: translateX(150%) skewX(-15deg); }
        }
        .animate-shine { animation: shine 4s infinite; }
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
      
      <div className="absolute top-0 w-full h-64 bg-gradient-to-b from-ocean-800 to-ocean-900 z-0"></div>
      <div className="relative z-10 pt-safe-top px-4 pb-4 flex items-center justify-between flex-shrink-0">
         <button onClick={onBack} className="p-2 -ml-2 text-white/80 hover:text-white"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg></button>
         <h1 className="text-white font-serif tracking-wide">会员中心</h1>
         <button onClick={() => onLogout()} className="p-2 -mr-2 text-gray-400 hover:text-white"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg></button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-[calc(20px+env(safe-area-inset-bottom))] relative z-10 no-scrollbar">
          {/* Black Gold Card */}
          <div className="perspective-1000 w-full aspect-[1.8] mb-6 relative group cursor-pointer" onClick={handleCardClick}>
              <div 
                className={`w-full h-full relative transform-style-3d transition-transform duration-700 ease-out shadow-2xl rounded-2xl ${isFlipped ? 'rotate-y-180' : ''}`}
                style={!isFlipped ? { transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` } : {}}
                onMouseMove={handleMouseMove}
              >
                  {/* FRONT */}
                  <div className="absolute inset-0 w-full h-full backface-hidden rounded-2xl p-6 flex flex-col justify-between overflow-hidden border border-gold-500/20 shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
                       style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #000 100%)' }}>
                       
                       <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                       <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shine pointer-events-none"></div>
                       
                       <div className="flex items-start justify-between relative z-10">
                           <div className="flex items-center gap-3">
                               <img src={user.avatar} className="w-10 h-10 rounded-full border border-gold-500/50" />
                               <div><h3 className="text-gold-100 font-bold text-lg font-serif">{user.name}</h3><div className="text-[10px] text-gold-500 border border-gold-500/30 px-1.5 rounded w-fit">黑金会员</div></div>
                           </div>
                           <img src={`https://api.iconify.design/lucide:gem.svg?color=%23f59e0b`} className="w-6 h-6 opacity-80" />
                       </div>

                       <div className="relative z-10 flex justify-between items-end">
                           <div>
                               <p className="text-gray-500 text-[10px] mb-1">余额 Balance</p>
                               <p className="text-2xl text-gold-400 font-serif font-bold">¥ {user.balance.toLocaleString()}</p>
                           </div>
                           <button onClick={(e) => { e.stopPropagation(); onCheckIn(); }} className="bg-gold-500 text-ocean-900 text-xs font-bold px-4 py-1.5 rounded-full hover:bg-gold-400 transition-colors shadow-lg">签到</button>
                       </div>
                  </div>

                  {/* BACK */}
                  <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-2xl p-6 flex flex-col items-center justify-center border border-gold-500/20 bg-black">
                       <h3 className="text-gold-500 font-serif font-bold mb-4">会员身份码</h3>
                       <div className="bg-white p-2 rounded relative overflow-hidden">
                           <img src={`https://api.iconify.design/ion:qr-code-outline.svg?color=000000`} className="w-24 h-24 opacity-90" />
                           <div className="absolute top-0 left-0 w-full h-1 bg-red-500/50 animate-scan"></div>
                       </div>
                       <p className="text-gray-500 text-xs mt-3 font-mono">NO. {user.id.toUpperCase()}</p>
                  </div>
              </div>
          </div>

          {/* Stats Bar */}
          <div className="bg-ocean-800/50 rounded-xl p-4 mb-6 border border-white/5 flex justify-between">
                <button className="flex-1 flex flex-col items-center gap-1" onClick={() => setCurrentView('orders')}><span className="text-lg font-bold text-white font-serif">{orders.filter(o => o.status === 'pending').length}</span><span className="text-xs text-gray-400">待发货</span></button>
                <div className="w-[1px] bg-white/5"></div>
                <button className="flex-1 flex flex-col items-center gap-1" onClick={() => setCurrentView('coupons')}><span className="text-lg font-bold text-white font-serif">{user.claimedCouponIds?.length || 0}</span><span className="text-xs text-gray-400">优惠券</span></button>
                <div className="w-[1px] bg-white/5"></div>
                <button className="flex-1 flex flex-col items-center gap-1" onClick={() => setCurrentView('favorites')}><span className="text-lg font-bold text-white font-serif">{user.favoriteProductIds?.length || 0}</span><span className="text-xs text-gray-400">收藏</span></button>
          </div>

          {/* Menu List */}
          <div className="space-y-2">
              {[
                  { label: '我的订单', icon: '📦', action: () => setCurrentView('orders') },
                  { label: '收货地址', icon: '📍', action: () => setCurrentView('addresses') },
                  { label: '联系管家', icon: '💬', action: onContactSupport }
              ].map((item, i) => (
                  <button key={i} onClick={item.action} className="w-full flex items-center justify-between p-4 bg-ocean-800/40 rounded-xl hover:bg-ocean-800/60 transition-colors border border-white/5">
                      <div className="flex items-center gap-3">
                          <span className="text-lg">{item.icon}</span>
                          <span className="text-sm text-white">{item.label}</span>
                      </div>
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"></path></svg>
                  </button>
              ))}
          </div>
      </div>
      
      <VIPPrivilegesModal isOpen={showVIPDetails} onClose={() => setShowVIPDetails(false)} currentLevel={user.level} />
    </div>
  );
};

export default UserCenter;
