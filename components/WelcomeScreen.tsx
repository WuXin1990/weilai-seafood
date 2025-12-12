
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
    <div className="flex flex-col h-full w-full bg-ocean-900 relative overflow-hidden">
      {/* Deep Sea Atmospheric Background with Pulse */}
      <div className="absolute top-0 left-0 w-full h-full bg-ocean-900 z-0">
          {/* Static Texture */}
          <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1559827260-dc66d52bef19?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center pointer-events-none mix-blend-overlay" />
          
          {/* Dynamic Caustics (Light Rays) */}
          <div className="absolute inset-0 z-0 opacity-30 animate-caustics-layer-1 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.1),transparent_70%)]"></div>
          <div className="absolute inset-0 z-0 opacity-20 animate-caustics-layer-2 bg-[radial-gradient(circle_at_60%_20%,rgba(245,158,11,0.05),transparent_60%)]"></div>
          
          {/* Vignette & Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-ocean-900/30 via-transparent to-ocean-900 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-full h-2/3 bg-gradient-to-t from-ocean-900 via-ocean-900/95 to-transparent pointer-events-none" />
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
        
        @keyframes pulse-ring {
            0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
            70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
            100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
        .animate-pulse-ring { animation: pulse-ring 2s infinite; }
      `}</style>

      {/* Top Bar - Increased Top Padding */}
      <div className="absolute top-0 w-full z-20 pt-[calc(env(safe-area-inset-top)+24px)] px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 opacity-80">
              <span className="h-[1px] w-8 bg-gold-500/50"></span>
              <span className="text-[10px] tracking-[0.2em] text-gold-500 uppercase font-serif">PRIVATE CLUB</span>
          </div>
          <button 
            onClick={onOpenProfile}
            className="flex items-center gap-2 bg-white/5 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 hover:bg-white/10 transition-colors"
          >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${isLoggedIn ? 'bg-gradient-to-r from-gold-500 to-amber-600 text-ocean-900 shadow-lg' : 'bg-white/20 text-white'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <span className="text-[10px] text-white/80 font-medium tracking-wide">{isLoggedIn ? '黑金会员' : '登录/注册'}</span>
          </button>
      </div>

      {/* Center Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 -mt-10">
          
          {/* Logo with Glow */}
          <div className="mb-10 relative animate-float-logo">
              <div className="absolute inset-0 bg-gold-500/30 blur-[60px] rounded-full"></div>
              <div className="w-32 h-32 rounded-full border border-gold-500/30 flex items-center justify-center bg-gradient-to-br from-ocean-800/80 to-black/60 backdrop-blur-md shadow-[0_0_60px_rgba(245,158,11,0.2)] ring-1 ring-white/10 relative">
                 <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.47-3.46 6-7 6s-7.06-2.53-8.5-6Z"/><path d="M18 12v.5"/><path d="M16 17.93a9.77 9.77 0 0 1 0-11.86"/><path d="M7 10.67C7 8 5.58 5.97 2.73 5.5c-1 1.5-1 5 .23 6.5-1.24 1.5-1.24 5-.23 6.5C5.58 18.03 7 16 7 13.33v-2.66Z"/></svg>
                 
                 {/* Orbiting Dot */}
                 <div className="absolute w-full h-full rounded-full border border-white/5 animate-spin-slow pointer-events-none">
                     <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-gold-500 rounded-full shadow-[0_0_10px_#f59e0b]"></div>
                 </div>
              </div>
          </div>
          
          <h1 className="font-serif text-5xl text-white mb-4 tracking-widest drop-shadow-2xl text-center">
              魏来<span className="text-gold-500">海鲜</span>
          </h1>
          <p className="text-gray-400 text-xs tracking-[0.4em] uppercase mb-12 font-light opacity-80 text-center">Live Premium Seafood</p>

          {/* Live Badge (Floating) */}
          <div className="absolute top-28 right-8 animate-pulse-ring rounded-full">
              <div className="flex items-center gap-2 bg-red-600/90 border border-red-500/20 px-3 py-1.5 rounded-full backdrop-blur-sm shadow-xl">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                  </span>
                  <span className="text-white text-[10px] font-bold tracking-widest uppercase">LIVE</span>
              </div>
          </div>
      </div>
      
      {/* Bottom Actions - Glass Cards */}
      <div className="relative z-20 pb-safe-bottom w-full px-6 mb-8">
          
          {/* Main Action Grid */}
          <div className="grid grid-cols-2 gap-3 mb-3">
              {/* Storefront - Primary Action for Live Fans */}
              <button 
                onClick={onEnterStore}
                className="group relative h-36 bg-gradient-to-br from-gold-600 to-amber-700 backdrop-blur-md rounded-2xl border border-white/10 p-5 flex flex-col justify-between overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_10px_30px_rgba(217,119,6,0.3)] col-span-2 sm:col-span-1"
              >
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                  
                  {/* Subtle Video Icon Background */}
                  <div className="absolute right-4 top-4 opacity-20">
                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="white"><path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6zm14 0H6v12h12V6zM8 10l6 3.5L8 17v-7z"/></svg>
                  </div>

                  <div className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center border border-white/20 z-10">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                  </div>
                  <div className="text-left z-10">
                      <span className="block text-white font-serif text-xl font-bold">进入直播特卖</span>
                      <span className="block text-xs text-white/80 mt-1 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                          抢购直播同款好货
                      </span>
                  </div>
              </button>

              {/* AI Chat & Discovery */}
              <div className="grid grid-rows-2 gap-3 col-span-2 sm:col-span-1 h-36">
                  <button 
                    onClick={onStartChat}
                    className="group relative bg-ocean-800/60 backdrop-blur-md rounded-2xl border border-white/5 px-5 flex items-center justify-between overflow-hidden transition-all hover:bg-ocean-800/80 active:scale-[0.98]"
                  >
                      <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-gold-500/30 transition-colors">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                          </div>
                          <div className="text-left">
                              <span className="block text-white font-medium text-sm">AI 1v1 管家</span>
                              <span className="block text-[9px] text-gray-400">不懂就问魏来</span>
                          </div>
                      </div>
                  </button>

                  <button 
                    onClick={onEnterDiscovery}
                    className="group relative bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 px-5 flex items-center justify-between overflow-hidden transition-all hover:bg-white/10 active:scale-[0.98]"
                  >
                      <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-gray-300">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
                          </div>
                          <div className="text-left">
                              <span className="block text-white font-medium text-sm">寻味 · 社区</span>
                              <span className="block text-[9px] text-gray-400">看看大家怎么吃</span>
                          </div>
                      </div>
                  </button>
              </div>
          </div>

          <button 
              onClick={onEnterAdmin} 
              className="mt-6 mx-auto flex items-center gap-2 text-[9px] text-gray-600 hover:text-gold-500 transition-colors px-4 py-2 opacity-30 hover:opacity-100"
           >
               商家管理入口
           </button>
      </div>
    </div>
  );
};

export default WelcomeScreen;
