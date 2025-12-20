
import React from 'react';
import { User, Order } from '../types';

interface UserCenterProps {
  user: User | null;
  orders: Order[];
  onBack: () => void;
  onLogout: () => void;
}

const UserCenter: React.FC<UserCenterProps> = ({ user, orders, onBack, onLogout }) => {
  return (
    <div className="flex flex-col h-full bg-ocean-950 text-white relative animate-fade-in overflow-hidden">
      {/* 顶部极简 Header */}
      <div className="pt-safe-top px-6 pb-4 flex items-center justify-between">
        <button onClick={onBack} className="text-white/40">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <span className="text-[10px] font-serif font-bold tracking-[0.4em] uppercase text-gold-500">Member Exclusive</span>
        <button onClick={onLogout} className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Logout</button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-10 no-scrollbar">
        {/* 会员实体卡模拟 */}
        <div className="w-full aspect-[1.6/1] bg-gradient-to-br from-[#1a1a1a] to-black border border-gold-500/30 p-8 flex flex-col justify-between relative shadow-2xl mb-12 group">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
            <div className="flex justify-between items-start relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gold-500/10 border border-gold-500/40 flex items-center justify-center font-serif text-xl font-bold text-gold-500">
                        {user?.name?.[0] || 'V'}
                    </div>
                    <div>
                        <h3 className="text-lg font-serif font-bold tracking-widest text-white">{user?.name || '魏来贵宾'}</h3>
                        <span className="text-[8px] text-gold-500/60 uppercase tracking-widest font-bold">Black Gold Elite</span>
                    </div>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C5A059" strokeWidth="1" className="opacity-40 animate-pulse"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            </div>
            
            <div className="relative z-10 flex justify-between items-end">
                <div>
                    <span className="text-[8px] text-white/20 uppercase tracking-[0.2em] mb-1 block">Account Balance</span>
                    <div className="text-2xl font-serif font-bold text-gold-500 tracking-tighter">¥ {user?.balance?.toLocaleString() || '0.00'}</div>
                </div>
                <div className="text-right">
                    <span className="text-[8px] text-white/20 uppercase tracking-[0.2em] mb-1 block">Member ID</span>
                    <span className="text-[10px] font-mono text-white/60">WL-8888-9999</span>
                </div>
            </div>
        </div>

        {/* 订单捷径 */}
        <div className="space-y-4">
            <h3 className="text-[10px] font-bold text-gold-500 uppercase tracking-[0.3em] border-b border-gold-500/10 pb-2 mb-6">Recent Activities</h3>
            <div className="grid grid-cols-1 gap-4">
                {orders.length === 0 ? (
                    <div className="text-center py-20 text-white/10 italic text-xs tracking-widest">No transaction history found.</div>
                ) : (
                    orders.map(o => (
                        <div key={o.id} className="bg-white/5 p-6 border border-white/5 flex justify-between items-center group active:bg-gold-500/5 transition-all">
                            <div>
                                <span className="text-[8px] text-white/30 uppercase font-mono block mb-1">{o.date}</span>
                                <h4 className="text-xs font-bold text-white tracking-wide">#{o.id} · {o.items[0]?.name}</h4>
                            </div>
                            <div className="text-right">
                                <span className="text-gold-500 font-serif font-bold text-sm block">¥ {o.total}</span>
                                <span className="text-[8px] text-white/20 uppercase tracking-widest">{o.status}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default UserCenter;
