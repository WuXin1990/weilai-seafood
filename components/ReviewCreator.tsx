
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
          alert('请至少选择一个标签，AI 才能帮您写哦');
          return;
      }
      setIsGenerating(true);
      const review = await geminiService.generateUserReview(productName, selectedTags, 'excited');
      setContent(review);
      setIsGenerating(false);
  };

  return (
    <div className="absolute inset-0 z-[60] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="bg-ocean-900 w-full rounded-t-2xl shadow-2xl overflow-hidden flex flex-col relative animate-slide-in-up border border-gold-500/10">
        {/* Header */}
        <div className="p-4 border-b border-ocean-800 flex items-center justify-between bg-ocean-900">
            <h2 className="text-white font-serif text-lg tracking-wide">评价商品</h2>
            <button onClick={onClose} className="text-gray-400">关闭</button>
        </div>

        <div className="p-5 space-y-6">
            {/* Product Name */}
            <h3 className="text-gold-500 font-bold text-center">{productName}</h3>

            {/* Stars */}
            <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                    <button key={star} onClick={() => setRating(star)} className="text-2xl transition-transform hover:scale-110">
                        {star <= rating ? '⭐' : '☆'}
                    </button>
                ))}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap justify-center gap-2">
                {TAGS.map(tag => (
                    <button 
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-all ${selectedTags.includes(tag) ? 'bg-gold-600 border-gold-600 text-ocean-900 font-bold' : 'bg-ocean-800 border-ocean-700 text-gray-400'}`}
                    >
                        {tag}
                    </button>
                ))}
            </div>

            {/* Text Area with AI Button */}
            <div className="relative">
                <textarea 
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="分享您的品尝体验..."
                    className="w-full h-32 bg-ocean-800 border border-ocean-700 rounded-xl p-3 text-white text-sm focus:border-gold-500 outline-none"
                />
                <button 
                    onClick={handleAIGenerate}
                    disabled={isGenerating}
                    className="absolute bottom-3 right-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg disabled:opacity-50"
                >
                    {isGenerating ? (
                        <span className="animate-pulse">✨ 构思中...</span>
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M9 5H5"/><path d="M5 19v4"/><path d="M9 23H5"/></svg>
                            AI 帮我写
                        </>
                    )}
                </button>
            </div>

            <button 
                onClick={() => { if(content) onSubmit(content, rating); }}
                disabled={!content}
                className="w-full bg-gold-600 text-ocean-900 font-bold py-3.5 rounded-full shadow-lg hover:bg-gold-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                提交评价
            </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewCreator;
