
import React from 'react';
import { motion } from 'framer-motion';

interface WelcomeScreenProps {
  onStartChat: () => void;
  onEnterStore: () => void;
  onEnterDiscovery: () => void;
  onOpenProfile: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ 
  onStartChat, 
  onEnterStore, 
  onEnterDiscovery, 
  onOpenProfile 
}) => {
  return (
    <div className="flex flex-col h-full w-full bg-transparent relative overflow-hidden">
      {/* 动态背景：深海光斑 */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gold-500/10 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 blur-[150px] rounded-full"></div>
      </div>

      {/* 顶部：直播状态 */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-20 pt-safe px-8 flex justify-between items-center h-20"
      >
        <div className="flex items-center gap-3 bg-red-600/10 border border-red-500/30 px-4 py-1.5 rounded-full">
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></div>
            <span className="text-[10px] text-red-100 font-black tracking-widest uppercase">Live · 正在直播</span>
        </div>
        <button onClick={onOpenProfile} className="w-10 h-10 rounded-full glass-premium flex items-center justify-center border border-gold-500/20 active:scale-90 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C5A059" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </button>
      </motion.div>

      {/* 品牌视觉中心 */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-10 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="relative mb-12"
        >
            <div className="absolute inset-0 bg-gold-500/20 blur-[60px] rounded-full"></div>
            <img 
                src="https://images.unsplash.com/photo-1559827260-dc66d52bef19?q=80&w=1200" 
                className="w-48 h-48 object-cover rounded-full border border-gold-500/30 shadow-2xl relative z-10 grayscale hover:grayscale-0 transition-all duration-1000" 
                alt="Main Product" 
            />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
            <h1 className="text-white text-6xl font-serif font-bold tracking-tighter leading-none">
                魏来<span className="gold-text-shimmer italic font-normal ml-2">海鲜</span>
            </h1>
            <p className="text-white/40 text-[10px] tracking-[0.6em] font-light uppercase border-t border-b border-white/5 py-4">
                从 直 播 间 到 您 的 舌 尖
            </p>
            <div className="text-[9px] text-gold-500/60 tracking-[0.3em] font-bold">深 海 极 鲜 · 私 域 专 供</div>
        </motion.div>
      </div>

      {/* 底部交互区：直播粉丝专享 */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="relative z-20 px-8 pb-safe mb-12 space-y-4"
      >
        <div className="glass-premium p-6 rounded-3xl space-y-6">
            <div className="flex justify-between items-center">
                <span className="text-[11px] text-white/50 font-bold tracking-widest uppercase">粉丝专席</span>
                <span className="text-[9px] text-gold-500 font-black">今日已配货 128 份</span>
            </div>
            
            <button 
                onClick={onStartChat} 
                className="w-full bg-gold-500 text-ocean-950 h-14 rounded-2xl flex items-center justify-center active:scale-95 transition-all shadow-[0_15px_30px_rgba(197,160,89,0.3)] group relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                <div className="flex items-center gap-3 relative z-10">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    <span className="text-[12px] font-black tracking-[0.3em]">咨询直播间专属管家</span>
                </div>
            </button>

            <div className="grid grid-cols-2 gap-4">
                <button 
                    onClick={onEnterStore}
                    className="h-12 rounded-xl border border-white/10 glass-premium text-white/80 text-[10px] font-bold tracking-widest flex items-center justify-center gap-2 active:bg-white/5 transition-all"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C5A059" strokeWidth="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/></svg>
                    直达鱼市
                </button>
                <button 
                    onClick={onEnterDiscovery}
                    className="h-12 rounded-xl border border-white/10 glass-premium text-white/80 text-[10px] font-bold tracking-widest flex items-center justify-center gap-2 active:bg-white/5 transition-all"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C5A059" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                    食味日志
                </button>
            </div>
        </div>
      </motion.div>
    </div>
  );
};

export default WelcomeScreen;
