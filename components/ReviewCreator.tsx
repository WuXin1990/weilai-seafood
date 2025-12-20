
import React, { useState } from 'react';
import { geminiService } from '../services/geminiService';

interface ReviewCreatorProps {
  productName: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (content: string, rating: number) => void;
}

const TAGS = ['肉质饱满', '非常新鲜', '发货神速', '包装精美', '送礼体面', '个头很大', '口感鲜甜', '性价比高'];

const ReviewCreator: React.FC<ReviewCreatorProps> = ({ productName, isOpen, onClose, onSubmit }) => {
  const [rating, setRating] = useState(5);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [content, setContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const toggleTag = (tag: string) => {
      setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const handleAIGenerate = async () => {
      if (selectedTags.length === 0) {
          return;
      }
      setIsGenerating(true);
      const review = await geminiService.generateUserReview(productName, selectedTags, 'excited');
      setContent(review);
      setIsGenerating(false);
  };

  return (
    <div className="absolute inset-0 z-[70] flex items-end justify-center pointer-events-none">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm pointer-events-auto animate-fade-in" onClick={onClose} />
      
      <div className="bg-ocean-950 w-full border-t border-gold-500/20 shadow-2xl overflow-hidden flex flex-col relative animate-slide-in-up pointer-events-auto">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-ocean-950">
            <h2 className="text-white font-serif text-lg tracking-[0.2em] uppercase">评价甄选商品</h2>
            <button onClick={onClose} className="text-white/20 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
        </div>

        <div className="p-8 space-y-8">
            <div className="text-center">
                <span className="text-[10px] text-gold-500 uppercase tracking-[0.4em] mb-1 block">Product Subject</span>
                <h3 className="text-white font-serif font-bold text-xl italic">{productName}</h3>
            </div>

            {/* Stars - Use specialized gold stars */}
            <div className="flex justify-center gap-4">
                {[1, 2, 3, 4, 5].map(star => (
                    <button key={star} onClick={() => setRating(star)} className="transition-transform active:scale-90">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={star <= rating ? "#C5A059" : "none"} stroke={star <= rating ? "#C5A059" : "#ffffff20"} strokeWidth="1.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    </button>
                ))}
            </div>

            {/* Tags - Straight edge boxes */}
            <div className="flex flex-wrap justify-center gap-2">
                {TAGS.map(tag => (
                    <button 
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`text-[10px] px-4 py-2 border transition-all uppercase tracking-widest ${selectedTags.includes(tag) ? 'bg-gold-500 border-gold-500 text-ocean-950 font-black' : 'bg-white/5 border-white/10 text-white/40'}`}
                    >
                        {tag}
                    </button>
                ))}
            </div>

            {/* Text Area */}
            <div className="relative">
                <textarea 
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="分享您的尊享品尝体验..."
                    className="w-full h-32 bg-white/5 border border-white/10 p-4 text-white text-xs focus:border-gold-500 outline-none no-scrollbar resize-none font-light leading-relaxed"
                />
                <button 
                    onClick={handleAIGenerate}
                    disabled={isGenerating}
                    className="absolute bottom-4 right-4 bg-ocean-950 border border-gold-500/30 text-gold-500 text-[9px] px-3 py-1.5 flex items-center gap-2 tracking-widest uppercase hover:bg-gold-500 hover:text-ocean-950 transition-all disabled:opacity-50"
                >
                    {isGenerating ? (
                        <span className="animate-pulse">AI 构思中...</span>
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                            AI 润色文本
                        </>
                    )}
                </button>
            </div>

            <button 
                onClick={() => { if(content) onSubmit(content, rating); }}
                disabled={!content}
                className="w-full bg-gold-500 text-ocean-950 font-black py-5 text-xs uppercase tracking-[0.5em] shadow-[0_20px_40px_rgba(197,160,89,0.2)] disabled:opacity-20 transition-all active:scale-[0.98]"
            >
                提交尊享评价
            </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewCreator;
