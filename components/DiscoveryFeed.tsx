
import React, { useState, useRef, useEffect } from 'react';
import { Post, Product, Comment, User } from '../types';
import ShareModal from './ShareModal';

interface DiscoveryFeedProps {
  posts: Post[];
  products: Product[];
  onProductClick: (product: Product) => void;
  onBack: () => void;
  onOpenStore: () => void;
  user: User | null;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onToggleLike: (postId: string) => void;
  onComment: (postId: string, content: string) => void;
  onConsult: (product: Product) => void; 
}

interface HeartParticle {
    id: number;
    x: number;
    y: number;
    size: number;
    drift: number;
    color: string;
}

const DiscoveryFeed: React.FC<DiscoveryFeedProps> = ({ 
    posts, products, onProductClick, onBack, onOpenStore, user, showToast, onToggleLike, onComment, onConsult 
}) => {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [animatingLikes, setAnimatingLikes] = useState<Record<string, boolean>>({});
  const [bigHeartAnimations, setBigHeartAnimations] = useState<Record<string, boolean>>({});
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [hearts, setHearts] = useState<HeartParticle[]>([]);
  
  const commentsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      if (selectedPost && commentsEndRef.current) {
          commentsEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
  }, [selectedPost?.comments.length]);

  const addHeart = (x: number, y: number) => {
      const newHearts: HeartParticle[] = [];
      const colors = ['#f59e0b', '#ef4444', '#ec4899', '#ffffff'];
      for (let i = 0; i < 8; i++) {
          newHearts.push({
              id: Date.now() + i,
              x: x + (Math.random() - 0.5) * 60,
              y: y - Math.random() * 30,
              size: 0.5 + Math.random() * 1.5,
              drift: (Math.random() - 0.5) * 80,
              color: colors[Math.floor(Math.random() * colors.length)]
          });
      }
      setHearts(prev => [...prev, ...newHearts]);
      setTimeout(() => {
          setHearts(prev => prev.filter(h => !newHearts.some(nh => nh.id === h.id)));
      }, 1000);
  };

  const toggleLike = (e: React.MouseEvent, postId: string) => {
      e.stopPropagation();
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      triggerLikeAnimation(postId, rect.left + rect.width / 2, rect.top + rect.height / 2);
      onToggleLike(postId);
      if (navigator.vibrate) navigator.vibrate(10);
  };

  const triggerLikeAnimation = (postId: string, x: number, y: number) => {
      setAnimatingLikes(prev => ({...prev, [postId]: true}));
      addHeart(x, y);
      setTimeout(() => setAnimatingLikes(prev => ({...prev, [postId]: false})), 500);
  };

  const handleDoubleTap = (e: React.MouseEvent, postId: string) => {
      e.stopPropagation();
      e.preventDefault();
      
      setBigHeartAnimations(prev => ({...prev, [postId]: true}));
      setTimeout(() => setBigHeartAnimations(prev => ({...prev, [postId]: false})), 800);

      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const x = e.clientX;
      const y = e.clientY;
      
      triggerLikeAnimation(postId, x, y);
      
      const post = posts.find(p => p.id === postId);
      if (post && !post.isLiked) {
          onToggleLike(postId);
      }
      if (navigator.vibrate) navigator.vibrate([10, 50, 10]);
  };

  const handleClosePost = () => setSelectedPost(null);

  const handleBuyFromPost = (e: React.MouseEvent, productId: string) => {
      e.stopPropagation();
      const product = products.find(p => p.id === productId);
      if (product) {
          onProductClick(product);
      }
  };

  const handleConsultFromPost = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!selectedPost) return;
      const product = products.find(p => p.id === selectedPost.productId);
      if (product) {
          onConsult(product);
      }
  };

  const handleSendComment = () => {
      if (!commentInput.trim()) return;
      if (selectedPost) {
          onComment(selectedPost.id, commentInput);
          setCommentInput('');
      }
  };

  const filteredPosts = posts.filter(post => {
      if (activeCategory === 'all') return true;
      const product = products.find(p => p.id === post.productId);
      return product && product.category === activeCategory;
  });

  return (
    <div className="flex flex-col h-full bg-ocean-900 relative pt-safe-top overflow-hidden">
      <style>{`
        @keyframes heartPop {
            0% { transform: scale(1); }
            50% { transform: scale(1.4); }
            100% { transform: scale(1); }
        }
        .animate-heart-pop { animation: heartPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        
        @keyframes floatUp {
            0% { transform: translate(0, 0) scale(1); opacity: 1; }
            100% { transform: translate(var(--drift), -150px) scale(0); opacity: 0; }
        }
        .animate-float-up-particle { animation: floatUp 0.8s ease-out forwards; }
        
        @keyframes bigHeartBurst {
            0% { transform: scale(0) rotate(-45deg); opacity: 0; }
            40% { transform: scale(1.2) rotate(0deg); opacity: 1; }
            50% { transform: scale(1.0) rotate(0deg); opacity: 1; }
            60% { transform: scale(1.1) rotate(0deg); opacity: 1; }
            100% { transform: scale(0) rotate(0deg); opacity: 0; }
        }
        .animate-big-heart { animation: bigHeartBurst 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
      `}</style>

      {/* Floating Particles Container */}
      <div className="fixed inset-0 pointer-events-none z-[100]">
          {hearts.map(h => (
              <div 
                key={h.id}
                className="absolute animate-float-up-particle"
                style={{ 
                    left: h.x, 
                    top: h.y,
                    '--drift': `${h.drift}px`,
                    color: h.color
                } as React.CSSProperties}
              >
                  <svg xmlns="http://www.w3.org/2000/svg" width={20 * h.size} height={20 * h.size} viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
              </div>
          ))}
      </div>

      {/* Header */}
      <div className="absolute top-0 left-0 w-full z-20 px-4 pt-[calc(env(safe-area-inset-top)+10px)] pb-3 flex items-center justify-between bg-gradient-to-b from-ocean-900 via-ocean-900/80 to-transparent">
          <button onClick={onBack} className="p-2 -ml-2 rounded-full bg-black/20 backdrop-blur border border-white/10 text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <div className="flex gap-4">
              <button className="text-white font-bold text-base border-b-2 border-gold-500 pb-1">推荐</button>
              <button className="text-gray-400 font-medium text-base hover:text-white transition-colors" onClick={onOpenStore}>商城</button>
          </div>
          <button onClick={onOpenStore} className="p-2 rounded-full bg-black/20 backdrop-blur border border-white/10 text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          </button>
      </div>

      {/* Main Feed */}
      <div className="flex-1 overflow-y-auto no-scrollbar pt-20 pb-20 px-2">
          {/* Category Pills */}
          <div className="flex gap-2 mb-4 px-2 overflow-x-auto no-scrollbar">
              <button onClick={() => setActiveCategory('all')} className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${activeCategory === 'all' ? 'bg-gold-500 text-ocean-900' : 'bg-white/10 text-gray-300'}`}>全部</button>
              <button onClick={() => setActiveCategory('fish')} className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${activeCategory === 'fish' ? 'bg-gold-500 text-ocean-900' : 'bg-white/10 text-gray-300'}`}>🐟 鱼类料理</button>
              <button onClick={() => setActiveCategory('crab_shrimp')} className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${activeCategory === 'crab_shrimp' ? 'bg-gold-500 text-ocean-900' : 'bg-white/10 text-gray-300'}`}>🦀 虾蟹盛宴</button>
          </div>

          <div className="columns-2 gap-2 space-y-2">
              {filteredPosts.map(post => (
                  <div 
                    key={post.id} 
                    onClick={() => setSelectedPost(post)}
                    className="break-inside-avoid bg-ocean-800 rounded-xl overflow-hidden relative group cursor-pointer border border-white/5"
                  >
                      <div className="relative">
                          <img src={post.image} alt={post.title} className="w-full h-auto object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                      </div>
                      <div className="p-3">
                          <h3 className="text-white text-xs font-bold leading-snug line-clamp-2 mb-2">{post.title}</h3>
                          <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                  {post.author.avatar ? (
                                      <img src={post.author.avatar} className="w-4 h-4 rounded-full border border-white/20" />
                                  ) : (
                                      <div className="w-4 h-4 rounded-full bg-gold-500"></div>
                                  )}
                                  <span className="text-[9px] text-gray-400 truncate max-w-[60px]">{post.author.name}</span>
                              </div>
                              <button 
                                onClick={(e) => toggleLike(e, post.id)} 
                                className="flex items-center gap-1 group/like"
                              >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill={post.isLiked ? "#ef4444" : "none"} stroke={post.isLiked ? "#ef4444" : "gray"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${animatingLikes[post.id] ? 'animate-heart-pop' : ''} group-active/like:scale-125`}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                                  <span className="text-[9px] text-gray-400">{post.likes}</span>
                              </button>
                          </div>
                      </div>
                  </div>
              ))}
          </div>
      </div>

      {/* Post Detail Overlay */}
      {selectedPost && (
          <div className="fixed inset-0 z-50 bg-black flex flex-col animate-scale-in">
              {/* Top Nav (Overlay) */}
              <div className="absolute top-0 left-0 w-full z-20 px-4 pt-[calc(env(safe-area-inset-top)+10px)] flex justify-between items-center pointer-events-none">
                  <button onClick={handleClosePost} className="pointer-events-auto p-2 rounded-full bg-black/20 backdrop-blur border border-white/10 text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                  </button>
                  <button onClick={() => setIsShareModalOpen(true)} className="pointer-events-auto p-2 rounded-full bg-black/20 backdrop-blur border border-white/10 text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>
                  </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto no-scrollbar relative" onClick={(e) => handleDoubleTap(e, selectedPost.id)}>
                  
                  {/* Full Image */}
                  <div className="w-full relative">
                      <img src={selectedPost.image} className="w-full h-auto min-h-[50vh] object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-ocean-900"></div>
                      
                      {/* Big Heart Animation Overlay */}
                      {bigHeartAnimations[selectedPost.id] && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <svg className="w-32 h-32 text-red-500 animate-big-heart drop-shadow-2xl" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                          </div>
                      )}
                  </div>

                  {/* Post Content */}
                  <div className="px-5 pt-4 pb-48 -mt-20 relative z-10 bg-gradient-to-b from-transparent via-ocean-900 to-ocean-900 min-h-[50vh]">
                      <h1 className="text-2xl font-serif font-bold text-white mb-4 leading-snug">{selectedPost.title}</h1>
                      
                      <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-2">
                              <img src={selectedPost.author.avatar} className="w-8 h-8 rounded-full border border-gold-500/50" />
                              <div>
                                  <p className="text-sm font-bold text-white">{selectedPost.author.name}</p>
                                  <p className="text-[10px] text-gray-400">发布于 {selectedPost.comments[0]?.date || '刚刚'}</p>
                              </div>
                          </div>
                          <button 
                            className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-colors ${selectedPost.isLiked ? 'bg-red-500/10 border-red-500 text-red-500' : 'bg-white/10 border-white/20 text-white'}`}
                            onClick={(e) => toggleLike(e, selectedPost.id)}
                          >
                              {selectedPost.isLiked ? '已赞' : '关注'}
                          </button>
                      </div>

                      <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap mb-8">
                          {selectedPost.content}
                      </p>

                      <div className="border-t border-white/5 pt-6">
                          <h3 className="text-sm font-bold text-gray-400 mb-4">共 {selectedPost.comments.length} 条评论</h3>
                          <div className="space-y-4">
                              {selectedPost.comments.map(comment => (
                                  <div key={comment.id} className="flex gap-3">
                                      <div className="w-8 h-8 rounded-full bg-ocean-800 flex items-center justify-center text-xs text-gray-500 flex-shrink-0">
                                          {comment.userName[0]}
                                      </div>
                                      <div>
                                          <div className="flex items-center gap-2">
                                              <span className="text-xs text-gray-400 font-bold">{comment.userName}</span>
                                              <span className="text-[10px] text-gray-600">{comment.date}</span>
                                          </div>
                                          <p className="text-xs text-gray-300 mt-0.5">{comment.content}</p>
                                      </div>
                                  </div>
                              ))}
                              <div ref={commentsEndRef} />
                          </div>
                      </div>
                  </div>
              </div>

              {/* Floating Product Capsule - THE CONVERSION DRIVER */}
              <div className="absolute bottom-20 left-4 right-4 z-20 animate-fade-in-up">
                  {products.find(p => p.id === selectedPost.productId) && (() => {
                      const linkedProduct = products.find(p => p.id === selectedPost.productId)!;
                      return (
                          <div 
                            className="bg-ocean-900/90 backdrop-blur-xl border border-gold-500/30 rounded-xl p-2.5 pr-4 flex items-center gap-3 shadow-[0_10px_40px_rgba(0,0,0,0.5)] cursor-pointer active:scale-[0.98] transition-transform"
                            onClick={(e) => handleBuyFromPost(e, linkedProduct.id)}
                          >
                              <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-white/10">
                                  <img src={linkedProduct.image} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5 mb-0.5">
                                      <span className="bg-gold-500 text-ocean-900 text-[9px] font-bold px-1 rounded-sm">文中同款</span>
                                      <span className="text-gold-400 text-[10px]">{linkedProduct.stock < 10 ? `仅剩${linkedProduct.stock}件` : '现货'}</span>
                                  </div>
                                  <h4 className="text-white text-xs font-medium truncate">{linkedProduct.name}</h4>
                                  <span className="text-white font-serif font-bold text-sm">¥{linkedProduct.price}</span>
                              </div>
                              <div className="flex gap-2">
                                   <button 
                                      onClick={handleConsultFromPost}
                                      className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-gold-500 hover:text-ocean-900 transition-colors border border-white/5"
                                   >
                                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                                   </button>
                                   <button className="bg-gradient-to-r from-gold-600 to-gold-500 text-ocean-900 text-xs font-bold px-4 py-1.5 rounded-full shadow-lg shadow-gold-500/20">
                                      去购买
                                   </button>
                              </div>
                          </div>
                      );
                  })()}
              </div>

              {/* Bottom Comment Input */}
              <div className="absolute bottom-0 w-full bg-ocean-900 border-t border-white/10 p-3 pb-[calc(10px+env(safe-area-inset-bottom))] flex items-center gap-3 z-20">
                  <input 
                      type="text" 
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      placeholder="说点什么..." 
                      className="flex-1 bg-ocean-800 text-white text-xs px-4 py-2.5 rounded-full outline-none focus:border-gold-500 border border-transparent transition-colors"
                      onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
                  />
                  <div className="flex items-center gap-4 px-2">
                      <button onClick={(e) => toggleLike(e, selectedPost.id)} className="flex flex-col items-center gap-0.5 text-gray-400 hover:text-red-500">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={selectedPost.isLiked ? "#ef4444" : "none"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                          <span className="text-[9px]">{selectedPost.likes}</span>
                      </button>
                      <button onClick={() => setIsShareModalOpen(true)} className="flex flex-col items-center gap-0.5 text-gray-400 hover:text-white">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>
                          <span className="text-[9px]">分享</span>
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Share Modal */}
      <ShareModal 
          isOpen={isShareModalOpen} 
          onClose={() => setIsShareModalOpen(false)}
          type="post"
          data={selectedPost}
          user={user}
          onSave={() => showToast('海报已保存', 'success')}
      />
    </div>
  );
};

export default DiscoveryFeed;
