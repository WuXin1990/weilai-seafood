
import React from 'react';
import { RecommendationCard } from '../types';

interface SuccessScreenProps {
  upsellCard?: RecommendationCard;
  onHome: () => void;
  onContact: () => void;
}

const SuccessScreen: React.FC<SuccessScreenProps> = ({ upsellCard, onHome, onContact }) => {
  return (
    <div className="h-full w-full bg-ocean-950 flex flex-col items-center justify-center p-10 animate-fade-in relative overflow-hidden">
      {/* 氛围灯光 */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(197,160,89,0.04),transparent_70%)] animate-pulse"></div>

      <div className="relative z-10 w-full flex flex-col items-center max-w-sm">
        <div className="w-22 h-22 bg-gold-500 flex items-center justify-center mb-12 shadow-[0_25px_70px_rgba(197,160,89,0.25)] animate-scale-in rounded-full">
            <svg className="w-11 h-11 text-ocean-950" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path d="M20 6 9 17l-5-5"></path></svg>
        </div>
        
        <h1 className="text-4xl font-serif font-bold text-gold-500 mb-3 italic tracking-tight">支付成功</h1>
        <p className="text-white/30 text-[11px] tracking-[0.6em] mb-20 font-bold">极 鲜 备 货 中</p>

        {/* 物流承诺 */}
        <div className="w-full bg-white/[0.03] border border-gold-500/10 p-8 mb-10 space-y-5 rounded-[2.5rem]">
            <div className="flex items-start gap-6">
                <div className="w-12 h-12 rounded-2xl border border-gold-500/20 flex items-center justify-center text-gold-500 shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><rect x="5" y="16" width="4" height="4"/><rect x="15" y="16" width="4" height="4"/></svg>
                </div>
                <div className="space-y-1.5">
                    <h4 className="text-white text-[13px] font-bold tracking-widest italic">魏来海鲜 · 专属冷链</h4>
                    <p className="text-white/30 text-[10px] leading-relaxed tracking-widest font-light">顺丰空运冷链，预计明晨 10:00 前送达。主厨已备好随单赠送的特调姜醋。</p>
                </div>
            </div>
        </div>

        {/* 随单推荐 */}
        {upsellCard && (
            <div className="w-full bg-white/[0.02] border border-gold-500/30 p-8 mb-16 relative overflow-hidden group active:bg-gold-500/5 transition-all rounded-[2.5rem]">
                <div className="absolute top-0 right-0 bg-gold-500 text-ocean-950 text-[8px] font-bold px-4 py-1.5 tracking-widest">主厨配餐</div>
                <h3 className="text-gold-500 font-serif font-bold text-base mb-2.5 italic">{upsellCard.decision}</h3>
                <p className="text-white/40 text-[10px] mb-8 line-clamp-2 leading-relaxed tracking-widest font-light">{upsellCard.reason}</p>
                <div className="flex justify-between items-end">
                    <div className="flex flex-col">
                        <span className="text-white/10 text-[8px] tracking-[0.3em] mb-1.5">尊享加购价</span>
                        <span className="text-gold-500 font-serif font-bold text-xl">¥{upsellCard.totalPrice}</span>
                    </div>
                    <button className="border border-gold-500/40 text-gold-500 text-[10px] px-8 py-3 rounded-full hover:bg-gold-500 hover:text-ocean-950 transition-all font-bold tracking-[0.3em]">
                        随单带走
                    </button>
                </div>
            </div>
        )}

        {/* 底部按钮 */}
        <div className="w-full space-y-5">
            <button 
                onClick={onHome} 
                className="w-full bg-gold-500 text-ocean-950 font-bold py-5 rounded-full text-[12px] tracking-[0.5em] shadow-[0_25px_50px_rgba(197,160,89,0.2)] active:scale-95 transition-all"
            >
                返回主页
            </button>
            <button 
                onClick={onContact}
                className="w-full border border-white/5 text-white/20 py-5 rounded-full text-[11px] font-bold tracking-[0.3em] hover:text-white/60 transition-colors"
            >
                联络黑金管家服务
            </button>
        </div>
      </div>
      
      <div className="absolute bottom-10 opacity-5">
        <span className="text-[10px] font-bold tracking-[1.2em] italic">深蓝秘境 · 极鲜私藏</span>
      </div>
    </div>
  );
};

export default SuccessScreen;
