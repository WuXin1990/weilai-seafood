
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
      {/* 顶部：直播动态状态 */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-30 pt-safe px-8 flex justify-between items-center h-20"
      >
        <div className="flex items-center gap-2 bg-red-600/10 border border-red-500/30 px-3 py-1 rounded-md">
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full live-pulse"></div>
            <span className="text-[10px] text-red-100 font-black tracking-widest">LIVE · 直播间同步中</span>
        </div>
        <button onClick={onOpenProfile} className="w-10 h-10 rounded-full glass-premium flex items-center justify-center border border-gold-500/20 active:scale-90 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C5A059" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </button>
      </motion.div>

      {/* 品牌视觉中心 */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-10 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="relative mb-10"
        >
            <div className="absolute inset-0 bg-gold-500/15 blur-[80px] rounded-full animate-pulse"></div>
            <div className="w-44 h-44 rounded-full border-2 border-gold-500/30 p-2 relative z-10">
                <img 
                    src="https://images.unsplash.com/photo-1559827260-dc66d52bef19?q=80&w=600" 
                    className="w-full h-full object-cover rounded-full grayscale hover:grayscale-0 transition-all duration-[2s]" 
                    alt="Main Luxury Product" 
                />
            </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
            <h1 className="text-white text-7xl font-serif font-bold tracking-tighter leading-none">
                魏来<span className="gold-text-shimmer italic font-normal block mt-2 text-6xl">海鲜</span>
            </h1>
            <div className="h-[1px] w-12 bg-gold-500/40 mx-auto"></div>
            <p className="text-white/40 text-[9px] tracking-[0.8em] font-light uppercase py-2">
                FROM LIVE TO LUXURY
            </p>
            <div className="text-[10px] text-gold-400 font-bold tracking-[0.2em]">直 播 间 官 方 选 品 店</div>
        </motion.div>
      </div>

      {/* 底部交互区：直播粉丝专享卡片 */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="relative z-20 px-8 pb-safe mb-10"
      >
        <div className="glass-premium p-8 rounded-[2rem] space-y-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <span className="text-[10px] text-white/60 font-bold tracking-widest uppercase">直播粉丝专属管家</span>
                <div className="flex items-center gap-1">
                    <span className="text-gold-500 text-[10px] font-black">在线</span>
                    <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                </div>
            </div>
            
            <button 
                onClick={onStartChat} 
                className="btn-luxury w-full bg-gold-500 text-ocean-950 h-16 rounded-2xl flex items-center justify-center active:scale-95 transition-all shadow-[0_15px_40px_rgba(197,160,89,0.4)]"
            >
                <div className="flex items-center gap-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    <span className="text-[13px] font-black tracking-[0.4em]">1对1 选品咨询</span>
                </div>
            </button>

            <div className="grid grid-cols-2 gap-4">
                <button 
                    onClick={onEnterStore}
                    className="h-14 rounded-xl border border-white/10 glass-premium text-white/80 text-[11px] font-bold tracking-widest flex items-center justify-center gap-2 active:bg-white/5 transition-all"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C5A059" strokeWidth="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/></svg>
                    逛鱼市
                </button>
                <button 
                    onClick={onEnterDiscovery}
                    className="h-14 rounded-xl border border-white/10 glass-premium text-white/80 text-[11px] font-bold tracking-widest flex items-center justify-center gap-2 active:bg-white/5 transition-all"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C5A059" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                    食味志
                </button>
            </div>
        </div>
      </motion.div>
    </div>
  );
};

export default WelcomeScreen;
