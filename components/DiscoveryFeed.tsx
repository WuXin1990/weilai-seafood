
import React, { useState } from 'react';
import { Post, Product, User } from '../types';

interface DiscoveryFeedProps {
  posts: Post[];
  products: Product[];
  onProductClick: (product: Product) => void;
  onBack: () => void;
  onOpenStore: () => void;
  user: User | null;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onToggleLike: (postId: string) => void;
}

const DiscoveryFeed: React.FC<DiscoveryFeedProps> = ({ posts, products, onProductClick, onBack, onToggleLike }) => {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  return (
    <div className="flex flex-col h-full bg-ocean-950 text-white relative animate-fade-in overflow-hidden">
      <div className="fixed top-0 left-0 w-full z-30 pt-safe-top px-6 pb-4 glass flex justify-between items-center border-b border-white/5">
        <button onClick={onBack} className="text-white/40">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <span className="text-[10px] font-serif font-bold tracking-[0.5em] uppercase text-gold-500">生活美学 · 甄选</span>
        <div className="w-5"></div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pt-24 pb-32">
        <div className="columns-2 gap-px bg-white/5 p-px">
            {posts.map(post => (
                <div 
                    key={post.id} 
                    onClick={() => setSelectedPost(post)}
                    className="break-inside-avoid bg-ocean-950 relative group cursor-pointer mb-px"
                >
                    <div className="relative overflow-hidden aspect-[4/5]">
                        <img src={post.image} className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all"></div>
                    </div>
                    <div className="p-4 bg-ocean-950">
                        <h3 className="text-[10px] font-bold tracking-widest line-clamp-1 mb-2 uppercase">{post.title}</h3>
                        <div className="flex justify-between items-center text-[8px] text-white/30 tracking-widest">
                            <span className="uppercase">{post.author.name}</span>
                            <span className="flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill={post.isLiked ? "currentColor" : "none"} stroke="currentColor"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                                {post.likes}
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>

      {selectedPost && (
          <div className="fixed inset-0 z-50 bg-ocean-950 flex flex-col animate-slide-in-up">
              <div className="flex-1 overflow-y-auto no-scrollbar pb-40">
                  <div className="relative aspect-square w-full">
                      <img src={selectedPost.image} className="w-full h-full object-cover" />
                      <button 
                        onClick={() => setSelectedPost(null)}
                        className="absolute top-safe-top left-6 p-3 bg-black/40 border border-white/10 text-white"
                      >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
                      </button>
                  </div>
                  <div className="p-8 space-y-8">
                      <div className="space-y-2">
                        <span className="text-gold-500 font-serif italic text-xs tracking-widest">Selected Journal</span>
                        <h1 className="text-3xl font-serif font-bold tracking-tight italic">{selectedPost.title}</h1>
                      </div>
                      <p className="text-sm text-white/60 leading-relaxed font-light whitespace-pre-wrap">{selectedPost.content}</p>
                      
                      {products.find(p => p.id === selectedPost.productId) && (
                          <div 
                            className="bg-white/5 border border-gold-500/20 p-6 flex items-center justify-between group cursor-pointer"
                            onClick={() => onProductClick(products.find(p => p.id === selectedPost.productId)!)}
                          >
                              <div className="flex gap-4 items-center">
                                  <div className="w-12 h-16 bg-black border border-white/5 overflow-hidden">
                                      <img src={products.find(p => p.id === selectedPost.productId)!.image} className="w-full h-full object-cover" />
                                  </div>
                                  <div>
                                      <h4 className="text-xs font-bold uppercase tracking-widest">{products.find(p => p.id === selectedPost.productId)!.name}</h4>
                                      <p className="text-gold-500 font-serif font-bold mt-1">¥ {products.find(p => p.id === selectedPost.productId)!.price}</p>
                                  </div>
                              </div>
                              <button className="text-[10px] text-gold-500 font-black uppercase tracking-[0.3em] group-hover:translate-x-1 transition-transform">View Detail →</button>
                          </div>
                      )}
                  </div>
              </div>
              
              <div className="fixed bottom-0 left-0 w-full p-6 glass border-t border-white/5 flex gap-4">
                  <button 
                    onClick={() => onToggleLike(selectedPost.id)}
                    className="flex-1 py-4 border border-white/10 text-xs font-bold tracking-[0.3em] uppercase transition-all"
                  >
                      {selectedPost.isLiked ? '♥ Liked' : '♡ Like It'}
                  </button>
                  <button className="flex-1 py-4 bg-gold-500 text-ocean-950 text-xs font-black tracking-[0.3em] uppercase">Share Journal</button>
              </div>
          </div>
      )}
    </div>
  );
};

export default DiscoveryFeed;
