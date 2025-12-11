
import React from 'react';

interface WelcomeScreenProps {
  onStartChat: () => void;
  onEnterStore: () => void;
  onEnterDiscovery: () => void; // New prop
  onEnterAdmin: () => void;
  onOpenProfile: () => void;
  isLoggedIn: boolean;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStartChat, onEnterStore, onEnterDiscovery, onEnterAdmin, onOpenProfile, isLoggedIn }) => {
  return (
    <div className="flex flex-col h-screen w-full bg-ocean-900 relative overflow-hidden">
      {/* Deep Sea Atmospheric Background */}
      <div className="absolute top-0 left-0 w-full h-full bg-ocean-900 z-0">
          {/* Static Texture */}
          <div className="absolute inset-0 opacity-50 bg-[url('https://images.unsplash.com/photo-1559827260-dc66d52bef19?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center pointer-events-none mix-blend-overlay" />
          
          {/* Dynamic Caustics (Light Rays) */}
          <div className="absolute inset-0 z-0 opacity-30 animate-caustics-layer-1 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.1),transparent_70%)]"></div>
          <div className="absolute inset-0 z-0 opacity-20 animate-caustics-layer-2 bg-[radial-gradient(circle_at_60%_20%,rgba(245,158,11,0.05),transparent_60%)]"></div>
          
          {/* Vignette & Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-ocean-900/30 via-transparent to-ocean-900 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-full h-2/3 bg-gradient-to-t from-ocean-900 via-ocean-900/90 to-transparent pointer-events-none" />
      </div>

      <style>{`
        @keyframes float-logo {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }
        .animate-float-logo { animation: float-logo 6s ease-in-out infinite; }
        
        @keyframes caustics-1 {
            0% { transform: scale(1) translate(0, 0); opacity: 0.3; }
            50% { transform: scale(1.1) translate(-10px, 10px); opacity: 0.4; }
            100% { transform: scale(1) translate(0, 0); opacity: 0.3; }
        }
        @keyframes caustics-2 {
            0% { transform: scale(1.1) translate(0, 0); opacity: 0.2; }
            50% { transform: scale(1) translate(10px, -5px); opacity: 0.3; }
            100% { transform: scale(1.1) translate(0, 0); opacity: 0.2; }
        }
        .animate-caustics-layer-1 { animation: caustics-1 12s infinite ease-in-out alternate; }
        .animate-caustics-layer-2 { animation: caustics-2 18s infinite ease-in-out alternate-reverse; }
      `}</style>

      {/* Top Bar - Increased Top Padding */}
      <div className="absolute top-0 w-full z-20 pt-[calc(env(safe-area-inset-top)+24px)] px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 opacity-80">
              <span className="h-[1px] w-8 bg-gold-500/50"></span>
              <span className="text-[10px] tracking-[0.2em] text-gold-500 uppercase font-serif">EST. 2026</span>
          </div>
          <button 
            onClick={onOpenProfile}
            className="flex items-center gap-2 bg-white/5 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 hover:bg-white/10 transition-colors"
          >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${isLoggedIn ? 'bg-gold-500 text-ocean-900' : 'bg-white/20 text-white'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <span className="text-[10px] text-white/80 font-medium tracking-wide">{isLoggedIn ? '会员中心' : '登录'}</span>
          </button>
      </div>

      {/* Center Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 -mt-20">
          
          {/* Logo */}
          <div className="mb-8 relative animate-float-logo">
              <div className="absolute inset-0 bg-gold-500/20 blur-[50px] rounded-full"></div>
              <div className="w-28 h-28 rounded-full border border-gold-500/20 flex items-center justify-center bg-gradient-to-br from-ocean-800/40 to-black/40 backdrop-blur-sm shadow-[0_0_60px_rgba(245,158,11,0.1)] ring-1 ring-white/10">
                 <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.47-3.46 6-7 6s-7.06-2.53-8.5-6Z"/><path d="M18 12v.5"/><path d="M16 17.93a9.77 9.77 0 0 1 0-11.86"/><path d="M7 10.67C7 8 5.58 5.97 2.73 5.5c-1 1.5-1 5 .23 6.5-1.24 1.5-1.24 5-.23 6.5C5.58 18.03 7 16 7 13.33v-2.66Z"/></svg>
              </div>
          </div>
          
          <h1 className="font-serif text-5xl text-white mb-3 tracking-widest drop-shadow-2xl">
              魏来<span className="text-gold-500">海鲜</span>
          </h1>
          <p className="text-gray-400 text-xs tracking-[0.4em] uppercase mb-10 font-light opacity-80">Premium Seafood Selection</p>

          {/* Live Badge */}
          <div className="flex items-center gap-2 bg-red-900/30 border border-red-500/20 px-4 py-1.5 rounded-full backdrop-blur-sm animate-pulse">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span className="text-red-200 text-[10px] font-medium tracking-widest uppercase">抖音直播间 · 专属通道</span>
          </div>
      </div>
      
      {/* Bottom Actions - Glass Cards */}
      <div className="relative z-20 pb-safe-bottom w-full px-6 mb-8">
          <div className="grid grid-cols-2 gap-3 mb-3">
              {/* AI Chat */}
              <button 
                onClick={onStartChat}
                className="group relative h-32 bg-ocean-800/40 backdrop-blur-md rounded-2xl border border-white/5 p-5 flex flex-col justify-between overflow-hidden transition-all hover:bg-ocean-800/60 active:scale-[0.98]"
              >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gold-500/10 rounded-full blur-2xl -mr-5 -mt-5 transition-opacity group-hover:opacity-100 opacity-50"></div>
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-gold-500/30 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  </div>
                  <div className="text-left">
                      <span className="block text-white font-serif text-lg font-medium">AI 管家</span>
                      <span className="block text-[10px] text-gray-400 mt-1">1v1 智能导购服务</span>
                  </div>
              </button>

              {/* Storefront */}
              <button 
                onClick={onEnterStore}
                className="group relative h-32 bg-gradient-to-br from-gold-600/90 to-amber-700/90 backdrop-blur-md rounded-2xl border border-white/10 p-5 flex flex-col justify-between overflow-hidden transition-all hover:brightness-110 active:scale-[0.98] shadow-[0_10px_30px_rgba(217,119,6,0.2)]"
              >
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                  <div className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center border border-white/10">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                  </div>
                  <div className="text-left">
                      <span className="block text-white font-serif text-lg font-bold">进入商城</span>
                      <span className="block text-[10px] text-white/70 mt-1">臻味典藏 · 限时特惠</span>
                  </div>
              </button>
          </div>

          {/* Discovery Button - Enhanced Glass Card */}
          <button 
            onClick={onEnterDiscovery}
            className="w-full h-14 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center gap-3 relative overflow-hidden group active:scale-[0.99] transition-all hover:bg-white/10"
          >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-gray-300 group-hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
              </div>
              <span className="text-gray-300 text-xs font-medium tracking-wide group-hover:text-white transition-colors">探索 · 美食灵感社区</span>
          </button>

          <button 
              onClick={onEnterAdmin} 
              className="mt-6 mx-auto flex items-center gap-2 text-[9px] text-gray-600 hover:text-gold-500 transition-colors px-4 py-2 opacity-50 hover:opacity-100"
           >
               商家管理入口
           </button>
      </div>
    </div>
  );
};

export default WelcomeScreen;
