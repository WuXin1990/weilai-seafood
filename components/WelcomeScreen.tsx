
import React from 'react';

interface WelcomeScreenProps {
  onStartChat: () => void;
  onEnterStore: () => void;
  onEnterDiscovery: () => void;
  onEnterAdmin: () => void;
  onOpenProfile: () => void;
  isLoggedIn: boolean;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ 
  onStartChat, 
  onEnterStore, 
  onEnterDiscovery, 
  onOpenProfile 
}) => {
  return (
    <div className="flex flex-col h-full w-full bg-transparent relative overflow-hidden">
      {/* 沉浸式海洋动态装饰 */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* 海底光芒 */}
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[200%] h-[100%] bg-[radial-gradient(ellipse_at_50%_0%,rgba(56,189,248,0.15)_0%,transparent_70%)] opacity-60"></div>
        {/* 动态坐标 */}
        <div className="absolute top-[20%] right-10 flex flex-col items-end opacity-20">
            <span className="text-[8px] font-mono tracking-widest uppercase">LAT: 58° 14' 22" N</span>
            <span className="text-[8px] font-mono tracking-widest uppercase mt-1">LNG: 153° 28' 31" W</span>
        </div>
      </div>

      {/* 顶部状态：直播联动视觉 */}
      <div className="relative z-20 pt-safe-top px-10 flex justify-between items-center py-8">
        <div className="flex items-center gap-3 bg-red-600/10 border border-red-500/20 px-4 py-2 rounded-full backdrop-blur-md">
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></div>
            <span className="text-[10px] text-red-100 font-black tracking-[0.2em] uppercase">魏来直播间 · 实时采捕中</span>
        </div>
        <button onClick={onOpenProfile} className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center glass-v2 active:scale-90 transition-all shadow-2xl">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C5A059" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </button>
      </div>

      {/* 品牌核心：强化海鲜生命力 */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-10 text-center">
        {/* 核心海鲜视觉：冰鲜质感图 (使用帝王蟹实拍氛围图) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[52%] w-[120%] aspect-square opacity-60 pointer-events-none mix-blend-screen animate-pulse duration-[5000ms]">
            <img 
                src="https://images.unsplash.com/photo-1559827260-dc66d52bef19?q=80&w=1200" 
                className="w-full h-full object-contain scale-125 filter drop-shadow-[0_0_50px_rgba(30,58,138,0.5)]" 
                alt="Seafood Hero" 
            />
        </div>

        <div className="relative animate-reveal" style={{ animationDelay: '0.2s' }}>
            <div className="flex flex-col items-center mb-10">
                <div className="w-px h-16 bg-gradient-to-b from-transparent via-gold-500/50 to-transparent mb-6"></div>
                <span className="text-gold-500 text-[11px] font-bold tracking-[0.8em] uppercase mb-4">深 蓝 秘 境 · 极 鲜 私 藏</span>
                <h1 className="text-white text-7xl sm:text-8xl font-serif font-bold tracking-tighter leading-none mb-4 drop-shadow-2xl">
                    魏来<span className="text-gold-500 italic font-normal ml-2">海鲜</span>
                </h1>
                <div className="flex items-center gap-3 text-white/40">
                    <div className="h-px w-6 bg-white/20"></div>
                    <span className="text-[12px] tracking-[0.6em] font-light uppercase">寻 味 万 顷 碧 波</span>
                    <div className="h-px w-6 bg-white/20"></div>
                </div>
            </div>
        </div>

        <div className="max-w-xs animate-reveal" style={{ animationDelay: '0.4s' }}>
            <p className="text-white/30 text-[11px] leading-loose tracking-[0.3em] font-light italic">
                “ 每一只帝王蟹 <br/> 都承载着北冰洋寒流的敬意 ”
            </p>
        </div>
      </div>

      {/* 操作区：按钮增强海洋科技感 */}
      <div className="relative z-20 px-10 pb-24 space-y-6 animate-reveal" style={{ animationDelay: '0.6s' }}>
        <button 
          onClick={onStartChat} 
          className="w-full bg-gold-500 text-ocean-950 h-16 rounded-full flex items-center justify-center active:bg-gold-600 transition-all group shadow-[0_20px_60px_rgba(197,160,89,0.3)] border border-white/20 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          <div className="flex items-center gap-4 relative z-10">
              <div className="bg-ocean-950/20 rounded-full p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </div>
              <span className="text-[14px] font-black tracking-[0.5em]">联络 AI 私人管家</span>
          </div>
        </button>

        <div className="grid grid-cols-2 gap-5">
            <button 
                onClick={onEnterStore}
                className="h-14 rounded-full border border-white/10 glass-v2 text-white/90 text-[11px] font-bold tracking-[0.3em] active:bg-white/10 transition-all flex items-center justify-center gap-3 group"
            >
                <div className="w-5 h-5 flex items-center justify-center bg-gold-500/10 rounded-lg group-hover:bg-gold-500/20 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C5A059" strokeWidth="2.5"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                </div>
                探秘鱼市
            </button>
            <button 
                onClick={onEnterDiscovery}
                className="h-14 rounded-full border border-white/10 glass-v2 text-white/90 text-[11px] font-bold tracking-[0.3em] active:bg-white/10 transition-all flex items-center justify-center gap-3 group"
            >
                <div className="w-5 h-5 flex items-center justify-center bg-gold-500/10 rounded-lg group-hover:bg-gold-500/20 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C5A059" strokeWidth="2.5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                </div>
                生活期刊
            </button>
        </div>
      </div>

      {/* 底部版权：增加仪式感 */}
      <div className="absolute bottom-8 left-0 w-full flex flex-col items-center gap-3 opacity-20">
        <div className="w-16 h-px bg-white/30"></div>
        <span className="text-[9px] tracking-[1.5em] font-bold italic text-white uppercase">Wei Lai Seafood · Since 1998</span>
      </div>
    </div>
  );
};

export default WelcomeScreen;
