
import React, { useState } from 'react';
import { Product, Order, StoreConfig } from '../types';

interface AdminDashboardProps {
  products: Product[];
  orders: Order[];
  onExit: () => void;
  onUpdateStoreConfig: (config: StoreConfig) => void;
  storeConfig: StoreConfig;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ products, orders, onExit, storeConfig, onUpdateStoreConfig }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'config'>('overview');

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;

  return (
    <div className="flex flex-col h-full bg-black text-white font-sans overflow-hidden">
      {/* 侧边/顶部导航 */}
      <div className="pt-safe-top px-8 pb-6 border-b border-gold-500/10 flex justify-between items-center bg-ocean-950">
        <div className="flex items-center gap-4">
            <h1 className="text-lg font-serif font-bold tracking-widest text-gold-500 uppercase">WEILAI BOSS</h1>
            <div className="w-[1px] h-4 bg-white/10"></div>
            <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">店长决策台</span>
        </div>
        <button onClick={onExit} className="text-xs text-white/40 hover:text-white transition-colors">退出管理</button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* 左侧菜单 */}
        <div className="w-20 border-r border-white/5 flex flex-col items-center py-10 gap-10">
            <button onClick={() => setActiveTab('overview')} className={`text-xs transition-colors ${activeTab === 'overview' ? 'text-gold-500' : 'text-white/20'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect width="7" height="7" x="3" y="3" rx="0"/><rect width="7" height="7" x="14" y="3" rx="0"/><rect width="7" height="7" x="14" y="14" rx="0"/><rect width="7" height="7" x="3" y="14" rx="0"/></svg>
            </button>
            <button onClick={() => setActiveTab('orders')} className={`text-xs transition-colors ${activeTab === 'orders' ? 'text-gold-500' : 'text-white/20'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            </button>
            <button onClick={() => setActiveTab('config')} className={`text-xs transition-colors ${activeTab === 'config' ? 'text-gold-500' : 'text-white/20'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
        </div>

        {/* 主内容区 */}
        <div className="flex-1 overflow-y-auto p-10 no-scrollbar bg-ocean-950">
            {activeTab === 'overview' && (
                <div className="space-y-12 animate-fade-in">
                    <div className="grid grid-cols-3 gap-6">
                        <div className="bg-white/5 p-8 border border-white/5">
                            <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-4 block">Total Sales</span>
                            <div className="text-3xl font-serif font-bold text-gold-500">¥ {totalRevenue.toLocaleString()}</div>
                        </div>
                        <div className="bg-white/5 p-8 border border-white/5">
                            <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-4 block">Pending Delivery</span>
                            <div className="text-3xl font-serif font-bold text-white">{pendingOrders}</div>
                        </div>
                        <div className="bg-white/5 p-8 border border-white/5">
                            <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-4 block">Active Stock</span>
                            <div className="text-3xl font-serif font-bold text-white">{products.reduce((a, b) => a + b.stock, 0)}</div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-xs font-bold text-gold-500 uppercase tracking-widest border-b border-gold-500/10 pb-2">库存动态库存监控</h3>
                        <div className="grid grid-cols-1 gap-1">
                            {products.slice(0, 5).map(p => (
                                <div key={p.id} className="flex justify-between items-center py-4 px-6 bg-white/[0.02] border-b border-white/5">
                                    <span className="text-xs text-white/80">{p.name}</span>
                                    <div className="flex items-center gap-4">
                                        <div className="w-32 h-1 bg-white/10 relative">
                                            <div className={`absolute top-0 left-0 h-full ${p.stock < 10 ? 'bg-red-500' : 'bg-gold-500'}`} style={{ width: `${Math.min(100, (p.stock/100)*100)}%` }}></div>
                                        </div>
                                        <span className="text-[10px] font-mono font-bold">{p.stock}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'config' && (
                <div className="max-w-md animate-fade-in space-y-8">
                    <h3 className="text-lg font-serif font-bold text-gold-500 italic">直播引流配置</h3>
                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5">
                            <span className="text-xs font-bold tracking-widest uppercase">开启直播间联动模式</span>
                            <button 
                                onClick={() => onUpdateStoreConfig({...storeConfig, isLiveMode: !storeConfig.isLiveMode})}
                                className={`w-12 h-6 flex items-center px-1 transition-colors ${storeConfig.isLiveMode ? 'bg-gold-500' : 'bg-white/10'}`}
                            >
                                <div className={`w-4 h-4 bg-black transition-transform ${storeConfig.isLiveMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
                            </button>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] text-white/40 font-bold uppercase tracking-widest">直播公告文案</label>
                            <input 
                                type="text"
                                value={storeConfig.liveAnnouncement}
                                onChange={(e) => onUpdateStoreConfig({...storeConfig, liveAnnouncement: e.target.value})}
                                className="w-full bg-white/5 border border-white/10 p-4 text-xs text-white focus:outline-none focus:border-gold-500"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
