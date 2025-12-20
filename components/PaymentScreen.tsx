
import React, { useEffect, useState } from 'react';

interface PaymentScreenProps {
  totalPrice: number;
  onSuccess: () => void;
}

const PaymentScreen: React.FC<PaymentScreenProps> = ({ totalPrice, onSuccess }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onSuccess, 800);
          return 100;
        }
        return prev + 2;
      });
    }, 50);
    return () => clearInterval(timer);
  }, [onSuccess]);

  return (
    <div className="h-full w-full bg-ocean-950 flex flex-col items-center justify-center p-12 space-y-16 animate-fade-in overflow-hidden relative">
      {/* Decorative Matrix Background */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#C5A059 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>

      <div className="relative">
        {/* Rotating Rings - Geometric Decoration */}
        <div className="w-40 h-40 border border-gold-500/10 absolute inset-0 animate-spin" style={{ animationDuration: '8s' }}></div>
        <div className="w-40 h-40 border-t border-gold-500 absolute inset-0 animate-spin" style={{ animationDuration: '2s' }}></div>
        
        {/* Core Icon */}
        <div className="w-40 h-40 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C5A059" strokeWidth="1" className="animate-pulse">
                <rect x="3" y="11" width="18" height="11" rx="0" strokeWidth="1.5"/><path d="M7 11V7a5 5 0 0 1 10 0v4" strokeWidth="1.5"/>
            </svg>
        </div>
      </div>

      <div className="text-center space-y-6">
        <div className="space-y-1">
            <span className="text-[9px] text-gold-500 font-black uppercase tracking-[0.5em] block">Secure Gateway</span>
            <h2 className="text-white text-xs font-light tracking-[0.3em] uppercase opacity-40">正在调起微信支付安全通道</h2>
        </div>
        
        <div className="flex flex-col items-center pt-4">
            <span className="text-white/20 text-[8px] uppercase tracking-[0.4em] mb-2">Total Payable</span>
            <span className="text-white text-4xl font-serif font-bold italic tracking-tighter">¥{totalPrice.toLocaleString()}</span>
        </div>
      </div>

      {/* Luxury Minimalist Progress Bar */}
      <div className="w-full max-w-[240px] space-y-3">
        <div className="h-[1px] w-full bg-white/5 relative overflow-hidden">
            <div 
                className="h-full bg-gold-500 transition-all duration-300 ease-out shadow-[0_0_15px_rgba(197,160,89,0.5)]"
                style={{ width: `${progress}%` }}
            ></div>
        </div>
        <div className="flex justify-between text-[8px] text-white/20 uppercase tracking-[0.5em] font-mono">
            <span className="animate-pulse">Encrypting</span>
            <span>{progress}%</span>
        </div>
      </div>

      <div className="absolute bottom-16 text-center">
        <p className="text-[8px] text-white/10 font-bold tracking-[0.6em] uppercase italic">
            Wei Lai HK · Private Banking Security
        </p>
      </div>
    </div>
  );
};

export default PaymentScreen;
