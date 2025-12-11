
import React, { useState } from 'react';
import { Order, Product } from '../types';
import ReviewCreator from './ReviewCreator';

interface OrderDetailModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onCancel: (orderId: string) => void;
  onConfirm: (orderId: string) => void;
  onBuyAgain: (order: Order) => void;
  onContactSupport: () => void;
  onAddReview?: (productId: string, content: string, rating: number) => void; // Optional for now
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ order, isOpen, onClose, onCancel, onConfirm, onBuyAgain, onContactSupport, onAddReview }) => {
  const [reviewProduct, setReviewProduct] = useState<{id: string, name: string} | null>(null);

  if (!isOpen || !order) return null;

  // Visual Map Component for Logistics
  const LogisticsMap = () => (
    <div className="h-32 bg-ocean-900 rounded-xl mb-4 border border-ocean-700 relative overflow-hidden group">
        {/* Abstract Map Background */}
        <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'radial-gradient(circle, #334155 1px, transparent 1px)',
            backgroundSize: '20px 20px'
        }}></div>
        {/* Path Line */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <path d="M 40 80 Q 150 20 280 60" fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="6 4" className="animate-dash" />
        </svg>
        {/* Delivery Guy Icon Animation */}
        <div className="absolute top-0 left-0 animate-delivery-move" style={{ offsetPath: 'path("M 40 80 Q 150 20 280 60")', offsetDistance: '0%' }}>
             <div className="bg-gold-500 text-ocean-900 p-1.5 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.8)] relative z-10">
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
             </div>
             {/* Pulse Ring */}
             <div className="absolute inset-0 bg-gold-500 rounded-full animate-ping opacity-50"></div>
        </div>
        
        {/* Pins */}
        <div className="absolute left-8 bottom-8 w-3 h-3 bg-gray-500 rounded-full border-2 border-ocean-900"></div>
        <div className="absolute right-8 bottom-12 w-3 h-3 bg-green-500 rounded-full border-2 border-ocean-900 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
        
        <div className="absolute bottom-2 right-2 text-[9px] text-gray-500 font-mono">LIVE TRACKING</div>
        
        <style>{`
            @keyframes dash { to { stroke-dashoffset: -20; } }
            .animate-dash { animation: dash 1s linear infinite; }
            @keyframes deliveryMove { 
                0% { offset-distance: 0%; }
                100% { offset-distance: 100%; }
            }
            .animate-delivery-move { 
                animation: deliveryMove 8s linear infinite alternate;
            }
        `}</style>
    </div>
  );

  // Generate dynamic logistics steps
  const getLogisticsSteps = (orderDate: string) => {
      // Mock logic: Order Date -> +0.5 day Picked Up -> +1 day In Transit -> +1.5 day Delivering
      // If status is 'pending', we show fewer steps.
      const baseTime = new Date(orderDate).getTime();
      const oneDay = 24 * 60 * 60 * 1000;
      
      const steps = [
          { time: '10:30', date: new Date(baseTime + oneDay * 2).toLocaleDateString(), status: '派送中', desc: '顺丰冷链专送员 [王师傅] 正在为您派送，请保持电话畅通。', active: true },
          { time: '06:45', date: new Date(baseTime + oneDay * 1.5).toLocaleDateString(), status: '运输中', desc: '快件已到达 [上海静安集散中心]', active: false },
          { time: '22:10', date: new Date(baseTime + oneDay).toLocaleDateString(), status: '已发货', desc: '包裹已揽收，且已放置干冰/冰袋。', active: false },
      ];

      if (order.status === 'pending') {
          return []; // Handled separately
      }
      return steps;
  };

  const renderLogistics = () => {
      if (order.status === 'pending') {
          return (
              <div className="bg-ocean-800 rounded-xl p-4 mb-4 border border-ocean-700 relative overflow-hidden shadow-lg">
                  <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-gold-500/20 flex items-center justify-center flex-shrink-0 border border-gold-500/30">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                      </div>
                      <div>
                          <h4 className="text-gold-500 font-bold mb-1">仓库正在极速配货中</h4>
                          <p className="text-gray-400 text-xs leading-relaxed">预计今日 16:00 前发出，全程顺丰冷链。生鲜产品请保持电话畅通。</p>
                      </div>
                  </div>
              </div>
          );
      }

      if (order.status === 'cancelled') {
          return (
              <div className="bg-ocean-800 rounded-xl p-4 mb-4 border border-ocean-700 shadow-lg">
                  <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="gray" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                      </div>
                      <div>
                          <h4 className="text-gray-300 font-bold mb-1">订单已取消</h4>
                          <p className="text-gray-500 text-xs">如需帮助请联系客服。</p>
                      </div>
                  </div>
              </div>
          );
      }

      const steps = getLogisticsSteps(order.date);

      return (
          <div className="bg-ocean-800 rounded-xl p-5 mb-4 border border-ocean-700 shadow-lg">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>
                  物流轨迹 ({order.trackingNumber || 'SF88888888'})
              </h3>
              
              {/* Add Map Visual */}
              <LogisticsMap />

              <div className="space-y-6 pl-2 relative">
                  <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-ocean-700"></div>
                  {steps.map((step, idx) => (
                      <div key={idx} className="relative flex gap-4">
                          <div className={`w-3 h-3 rounded-full border-2 z-10 mt-1 flex-shrink-0 bg-ocean-900 ${step.active ? 'border-gold-500 shadow-[0_0_10px_rgba(245,158,11,0.5)] bg-gold-500 animate-pulse' : 'border-gray-600 bg-gray-600'}`}></div>
                          <div>
                              <div className="flex items-center gap-2 mb-1">
                                  <span className={`text-sm font-bold ${step.active ? 'text-gold-500' : 'text-gray-400'}`}>{step.status}</span>
                                  <span className="text-xs text-gray-500">{step.date} {step.time}</span>
                              </div>
                              <p className="text-xs text-gray-400 leading-relaxed">{step.desc}</p>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      );
  };

  const getStatusColor = () => {
      switch (order.status) {
          case 'pending': return 'from-gold-600 to-amber-700';
          case 'shipped': return 'from-blue-600 to-indigo-700';
          case 'completed': return 'from-green-600 to-emerald-700';
          case 'cancelled': return 'from-gray-600 to-gray-700';
      }
  };

  const getStatusText = () => {
      switch (order.status) {
          case 'pending': return '待发货';
          case 'shipped': return '商家已发货';
          case 'completed': return '交易完成';
          case 'cancelled': return '交易取消';
      }
  };

  return (
    <div className="absolute inset-0 z-50 bg-ocean-900 flex flex-col animate-slide-in-right">
        {/* Header / Status Bar */}
        <div className={`relative px-6 pt-safe-top pb-12 bg-gradient-to-r ${getStatusColor()}`}>
            <div className="flex items-center justify-between mb-6">
                <button onClick={onClose} className="p-2 -ml-2 text-white hover:bg-white/10 rounded-full transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg></button>
                <div className="flex items-center gap-4">
                    <button onClick={onContactSupport} className="text-white/80 hover:text-white flex flex-col items-center gap-0.5"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg><span className="text-[9px]">客服</span></button>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <h2 className="text-3xl font-serif text-white font-bold tracking-wide">{getStatusText()}</h2>
            </div>
            {order.status === 'shipped' && <p className="text-white/80 text-sm mt-2">您的包裹距离您还有 3.5km，预计今日送达</p>}
            {order.status === 'pending' && <p className="text-white/80 text-sm mt-2">商家正在核对订单信息</p>}
        </div>

        {/* Content Container - Overlapping Header */}
        <div className="flex-1 -mt-6 bg-ocean-900 rounded-t-3xl relative overflow-y-auto px-4 pt-6 pb-[calc(5rem+env(safe-area-inset-bottom))] space-y-4 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
            
            {/* Address */}
            <div className="bg-ocean-800 rounded-xl p-4 border border-ocean-700 flex items-start gap-3 shadow-sm">
                <div className="w-8 h-8 rounded-full bg-ocean-700 flex items-center justify-center text-gray-400 mt-1"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></div>
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-bold">{order.customerName}</span>
                        <span className="text-gray-400 text-sm">138****8888</span>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed">上海市 静安区 南京西路1266号 恒隆广场写字楼一期</p>
                </div>
            </div>

            {/* Logistics (Conditional) */}
            {renderLogistics()}

            {/* Item List */}
            <div className="bg-ocean-800 rounded-xl p-4 border border-ocean-700 space-y-4 shadow-sm">
                {order.items.map((item, idx) => (
                    <div key={idx} className="flex gap-3">
                        <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover bg-ocean-900 border border-ocean-700" />
                        <div className="flex-1 flex flex-col justify-between py-0.5">
                            <h4 className="text-white font-medium line-clamp-1">{item.name}</h4>
                            <div className="flex justify-between items-end">
                                <div>
                                    <span className="text-gray-400 text-xs">x{item.quantity}</span>
                                    {/* Review Button for Individual Item if Completed */}
                                    {order.status === 'completed' && onAddReview && (
                                        <button 
                                            onClick={() => setReviewProduct({id: item.productId, name: item.name})}
                                            className="ml-2 text-[10px] text-gold-500 border border-gold-500/30 px-2 py-0.5 rounded-full hover:bg-gold-500/10"
                                        >
                                            去评价
                                        </button>
                                    )}
                                </div>
                                <span className="text-white font-medium">¥{item.price}</span>
                            </div>
                        </div>
                    </div>
                ))}
                
                <div className="border-t border-ocean-700 pt-3 space-y-2">
                    <div className="flex justify-between text-sm"><span className="text-gray-400">商品总价</span><span className="text-white">¥{order.originalTotal || order.total}</span></div>
                    {order.discountAmount && order.discountAmount > 0 && (
                        <div className="flex justify-between text-sm"><span className="text-gold-500">优惠 ({order.couponName || '活动'})</span><span className="text-gold-500">-¥{order.discountAmount}</span></div>
                    )}
                    <div className="flex justify-between text-sm"><span className="text-gray-400">运费</span><span className="text-white">¥0</span></div>
                    <div className="flex justify-between items-center pt-2 text-base"><span className="text-white font-bold">实付款</span><span className="text-gold-500 font-serif text-xl font-bold">¥{order.total}</span></div>
                </div>
            </div>

            {/* Order Info */}
            <div className="bg-ocean-800 rounded-xl p-4 border border-ocean-700 space-y-2 text-xs text-gray-500 shadow-sm">
                <div className="flex justify-between"><span>订单编号</span><span className="text-gray-300 font-mono">{order.id}</span></div>
                <div className="flex justify-between"><span>下单时间</span><span className="text-gray-300">{order.date} 14:23:45</span></div>
                <div className="flex justify-between"><span>支付方式</span><span className="text-gray-300">{order.paymentMethod === 'balance' ? '会员余额' : '微信支付'}</span></div>
            </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-ocean-900 border-t border-ocean-800 p-3 pb-[calc(1rem+env(safe-area-inset-bottom))] flex justify-end gap-3 shadow-[0_-5px_10px_rgba(0,0,0,0.3)] relative z-20">
            {order.status === 'pending' && (
                <button onClick={() => onCancel(order.id)} className="px-4 py-2 rounded-full border border-ocean-600 text-gray-400 text-sm hover:text-white hover:border-ocean-500 transition-colors">取消订单</button>
            )}
            {order.status === 'shipped' && (
                <>
                    <button className="px-4 py-2 rounded-full border border-ocean-600 text-gray-300 text-sm hover:text-white hover:border-ocean-500 transition-colors">查看物流</button>
                    <button onClick={() => onConfirm(order.id)} className="px-4 py-2 rounded-full bg-gold-600 text-ocean-900 font-bold text-sm hover:bg-gold-500 transition-colors shadow-lg shadow-gold-600/20">确认收货</button>
                </>
            )}
            {(order.status === 'completed' || order.status === 'cancelled') && (
                <button onClick={() => onBuyAgain(order)} className="px-4 py-2 rounded-full border border-gold-600 text-gold-500 text-sm hover:bg-gold-600/10 transition-colors">再来一单</button>
            )}
        </div>

        {/* Review Creator Modal */}
        <ReviewCreator 
            productName={reviewProduct?.name || ''}
            isOpen={!!reviewProduct}
            onClose={() => setReviewProduct(null)}
            onSubmit={(content, rating) => {
                if (reviewProduct && onAddReview) {
                    onAddReview(reviewProduct.id, content, rating);
                    setReviewProduct(null);
                }
            }}
        />
    </div>
  );
};

export default OrderDetailModal;
