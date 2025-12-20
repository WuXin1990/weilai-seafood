
import React, { useState } from 'react';
import { Product, Post, User } from '../types';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'product' | 'post';
  data: Product | Post | null;
  user: User | null;
  onSave: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, type, data, user, onSave }) => {
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen || !data) return null;

  const handleSaveClick = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      onSave();
      onClose();
    }, 1500);
  };

  const imageSrc = type === 'product' ? (data as Product).image : (data as Post).image;
  const title = type === 'product' ? (data as Product).name : (data as Post).title;
  const subText = type === 'product' 
    ? `¥${(data as Product).price} / ${(data as Product).unit}` 
    : (data as Post).content.substring(0, 45) + '...';

  return (
    <div className="absolute inset-0 z-[70] flex items-center justify-center p-6 overflow-hidden">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      
      <div className="relative w-full max-w-sm bg-ocean-950 border border-gold-500/20 shadow-2xl animate-scale-in flex flex-col">
        {/* Poster Content */}
        <div className="bg-white p-0 relative flex flex-col">
            <div className="h-[40vh] w-full relative overflow-hidden bg-black">
                <img src={imageSrc} className="w-full h-full object-cover opacity-90" alt="Share" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6">
                    <p className="text-[10px] tracking-[0.4em] uppercase text-gold-500 font-black mb-2">Wei Lai Premium</p>
                    <h3 className="font-serif font-bold text-2xl text-white leading-tight italic">{title}</h3>
                </div>
            </div>
            
            <div className="p-8 flex flex-col gap-6 bg-ocean-950 border-t border-gold-500/20">
                <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                        <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] mb-4">Selection Detail</p>
                        {type === 'product' ? (
                            <p className="text-gold-500 font-serif text-3xl font-bold italic">{subText}</p>
                        ) : (
                            <p className="text-white/60 text-xs font-light leading-relaxed italic">{subText}</p>
                        )}
                    </div>
                    
                    {/* QR Code Area - Squared */}
                    <div className="flex flex-col items-center gap-2 bg-white/5 border border-white/10 p-3 shrink-0">
                        <div className="w-16 h-16 relative">
                            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#C5A059" strokeWidth="1"><path d="M3 3h6v6H3V3z"/><path d="M15 3h6v6h-6V3z"/><path d="M3 15h6v6H3v-6z"/><path d="M15 15h6v6h-6v-6z"/><path d="M12 9v6"/><path d="M9 12h6"/></svg>
                        </div>
                        <span className="text-[7px] text-gold-500 uppercase tracking-widest font-black">Wei Lai HK</span>
                    </div>
                </div>
                
                <div className="flex items-center gap-4 pt-6 border-t border-white/5">
                    <div className="w-10 h-10 border border-gold-500/30 overflow-hidden bg-black flex-shrink-0">
                        {user ? <img src={user.avatar} className="w-full h-full object-cover" /> : <div className="bg-gold-500 w-full h-full"></div>}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[8px] text-white/20 uppercase tracking-[0.3em]">Ambassador</span>
                        <span className="text-xs font-serif font-bold text-white tracking-widest">{user ? user.name : '魏来贵宾'}</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Actions */}
        <div className="p-6 bg-ocean-950 flex gap-4">
            <button onClick={onClose} className="flex-1 py-4 border border-white/10 text-white/40 text-[10px] font-bold uppercase tracking-widest">取消</button>
            <button 
                onClick={handleSaveClick} 
                disabled={isSaving}
                className="flex-1 py-4 bg-gold-500 text-ocean-950 text-[10px] font-black uppercase tracking-[0.3em] shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
                {isSaving ? '生成中...' : '保存至相册'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
