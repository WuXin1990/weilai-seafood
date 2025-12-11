
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
    : (data as Post).content.substring(0, 30) + '...';

  return (
    <div className="absolute inset-0 z-[70] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative w-full max-w-sm bg-white rounded-2xl overflow-hidden shadow-2xl animate-scale-in flex flex-col">
        {/* Poster Content - Designed to look like an image */}
        <div className="bg-white p-0 relative">
            <div className="h-72 w-full relative">
                <img src={imageSrc} className="w-full h-full object-cover" alt="Share" />
                <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                    <div className="text-white">
                        <p className="text-[10px] tracking-widest uppercase text-gold-400 mb-1">Wei Lai Premium Seafood</p>
                        <h3 className="font-serif font-bold text-xl leading-tight line-clamp-2">{title}</h3>
                    </div>
                </div>
            </div>
            
            <div className="p-5 flex justify-between items-end bg-[#f8f8f8]">
                <div>
                    <p className="text-gray-500 text-xs mb-2">长按识别二维码，查看详情</p>
                    {type === 'product' ? (
                        <p className="text-gold-600 font-serif text-3xl font-bold">{subText}</p>
                    ) : (
                        <p className="text-gray-800 text-sm font-medium w-40 leading-snug">{subText}</p>
                    )}
                    
                    <div className="flex items-center gap-2 mt-5">
                        <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden border border-white shadow-sm">
                            {user ? <img src={user.avatar} className="w-full h-full object-cover" /> : <div className="bg-gold-500 w-full h-full flex items-center justify-center text-white text-xs">客</div>}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] text-gray-400 transform scale-90 origin-left">来自黑金会员的推荐</span>
                            <span className="text-xs font-bold text-gray-800">{user ? user.name : '魏来贵宾'}</span>
                        </div>
                    </div>
                </div>
                
                {/* Fake QR Code */}
                <div className="flex flex-col items-center gap-1 bg-white p-2 rounded-lg shadow-sm border border-gray-100">
                    <div className="w-16 h-16">
                        <img src={`https://api.iconify.design/ion:qr-code-outline.svg?color=000000`} className="w-full h-full opacity-80" />
                    </div>
                    <span className="text-[8px] text-gray-400">魏来海鲜</span>
                </div>
            </div>
        </div>

        {/* Actions */}
        <div className="bg-white p-4 border-t border-gray-100 flex gap-3">
            <button onClick={onClose} className="flex-1 py-3 text-gray-500 text-sm font-medium hover:bg-gray-50 rounded-lg transition-colors">取消</button>
            <button 
                onClick={handleSaveClick} 
                disabled={isSaving}
                className="flex-1 py-3 bg-gradient-to-r from-gold-600 to-gold-500 text-white text-sm font-bold rounded-lg shadow-lg hover:shadow-gold-500/30 transition-all flex items-center justify-center gap-2"
            >
                {isSaving ? (
                    <>
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        生成中...
                    </>
                ) : '保存图片到相册'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
