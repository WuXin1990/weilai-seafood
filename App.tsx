
import React, { useState, useEffect } from 'react';
import {
  AppState, Product, User, CartItem, Order, Message, MessageRole,
  Address, Coupon, ShippingTemplate, Post, StoreConfig, BanquetMenu, RedeemItem,
  Comment, ProductVariant
} from './types';
import {
  SEAFOOD_CATALOG, INITIAL_ORDERS, INITIAL_ADDRESSES, INITIAL_SHIPPING_TEMPLATES,
  INITIAL_COUPONS, INITIAL_STORE_CONFIG, INITIAL_POSTS, WELCOME_MESSAGE
} from './constants';
import { geminiService } from './services/geminiService';
import WelcomeScreen from './components/WelcomeScreen';
import Storefront from './components/Storefront';
import { ChatInterface } from './components/ChatInterface';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import AdminDashboard from './components/AdminDashboard';
import UserCenter from './components/UserCenter';
import { ProductDetailModal } from './components/ProductDetailModal';
import ToastContainer, { ToastMessage } from './components/Toast';
import DiscoveryFeed from './components/DiscoveryFeed';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.WELCOME);
  
  // Data State with Persistence
  const [products, setProducts] = useState<Product[]>(() => {
      const saved = localStorage.getItem('products');
      return saved ? JSON.parse(saved) : SEAFOOD_CATALOG;
  });
  const [orders, setOrders] = useState<Order[]>(() => {
      const saved = localStorage.getItem('orders');
      return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });
  const [user, setUser] = useState<User | null>(() => {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
  });
  const [cart, setCart] = useState<CartItem[]>(() => {
      const saved = localStorage.getItem('cart');
      return saved ? JSON.parse(saved) : [];
  });
  const [addresses, setAddresses] = useState<Address[]>(() => {
      const saved = localStorage.getItem('addresses');
      return saved ? JSON.parse(saved) : INITIAL_ADDRESSES;
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Chat State
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  
  // Non-persisted Data State
  const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS);
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [shippingTemplates, setShippingTemplates] = useState<ShippingTemplate[]>(INITIAL_SHIPPING_TEMPLATES);
  const [storeConfig, setStoreConfig] = useState<StoreConfig>(INITIAL_STORE_CONFIG);
  
  // UI State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Persistence Effects
  useEffect(() => localStorage.setItem('products', JSON.stringify(products)), [products]);
  useEffect(() => localStorage.setItem('orders', JSON.stringify(orders)), [orders]);
  useEffect(() => {
      if (user) localStorage.setItem('user', JSON.stringify(user));
      else localStorage.removeItem('user');
  }, [user]);
  useEffect(() => localStorage.setItem('cart', JSON.stringify(cart)), [cart]);
  useEffect(() => localStorage.setItem('addresses', JSON.stringify(addresses)), [addresses]);

  // Helper: Toast
  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, text, type }]);
    setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const dismissToast = (id: string) => {
      setToasts(prev => prev.filter(t => t.id !== id));
  };

  // --- Handlers ---

  const handleStartChat = (initialProductContext?: Product) => {
    setAppState(AppState.CHAT);
    
    // Initialize session with current cart context
    // Logic: if messages are empty, we start fresh. If not, we resume to update context.
    if (messages.length === 0) {
         geminiService.startChat(products, user, undefined, orders, cart);
         
         // If starting fresh without specific product, show welcome
         if (!initialProductContext) {
             const greeting = geminiService.generateLocalGreeting(user);
             setMessages([{
                 id: Date.now().toString(),
                 role: MessageRole.MODEL,
                 text: greeting
             }]);
         }
    } else {
        // If session exists (messages exist), update context by resuming
        geminiService.resumeChat(products, user, messages, orders, cart);
    }

    // If consulting about a specific product
    if (initialProductContext) {
        handleSendMessage(`我想了解一下【${initialProductContext.name}】`, initialProductContext.image, initialProductContext);
    }
  };

  const handleSendMessage = async (text: string, image?: string, productContext?: Product) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role: MessageRole.USER,
      text,
      image,
      productContext // Attach context for UI rendering
    };
    setMessages(prev => [...prev, newMessage]);
    setIsLoadingChat(true);

    try {
      // Create a placeholder message for streaming
      const responseId = (Date.now() + 1).toString();
      let streamedText = "";
      
      setMessages(prev => [...prev, {
          id: responseId,
          role: MessageRole.MODEL,
          text: "",
          isStreaming: true
      }]);

      const { text: responseText, recommendations } = await geminiService.sendMessageStream(text, image, (chunk) => {
          streamedText += chunk;
          setMessages(prev => prev.map(msg => 
              msg.id === responseId 
              ? { ...msg, text: streamedText } 
              : msg
          ));
      });
      
      setMessages(prev => prev.map(msg => 
          msg.id === responseId 
          ? { ...msg, text: responseText, isStreaming: false, recommendedProducts: recommendations } 
          : msg
      ));

    } catch (error) {
      console.error(error);
      showToast("发送失败，请重试", 'error');
      setMessages(prev => prev.slice(0, -1)); // Remove placeholder if failed
    } finally {
      setIsLoadingChat(false);
    }
  };

  const handleAddMenuToCart = (menu: BanquetMenu) => {
      menu.items.forEach(item => {
          const product = products.find(p => p.id === item.productId);
          if (product) {
              handleAddToCart(product, item.quantity);
          }
      });
      showToast(`已将套餐商品加入购物袋`, 'success');
  };

  const handleAddToCart = (product: Product, quantity = 1, variant?: ProductVariant) => {
    // Determine target stock and price
    const stockLimit = variant ? variant.stock : product.stock;
    const price = variant ? variant.price : product.price;
    const variantId = variant ? variant.id : undefined;
    const variantName = variant ? variant.name : undefined;

    if (stockLimit < quantity) {
        showToast(`库存不足，仅剩 ${stockLimit} 件`, 'error');
        return;
    }
    
    setCart(prev => {
      // Check for existing item with SAME product ID AND SAME variant ID
      const existing = prev.find(item => item.id === product.id && item.selectedVariantId === variantId);
      
      if (existing) {
        // Check limit for this specific variant
        if (existing.quantity + quantity > stockLimit) {
             showToast(`库存不足`, 'error');
             return prev;
        }
        return prev.map(item => 
            (item.id === product.id && item.selectedVariantId === variantId) 
            ? { ...item, quantity: item.quantity + quantity } 
            : item
        );
      }
      
      // Add new item with variant info
      return [...prev, { 
          ...product, 
          quantity, 
          price: price, // Use variant price
          selectedVariantId: variantId, 
          selectedVariantName: variantName,
          stock: stockLimit // Track variant stock for this item
      }];
    });
  };

  const handleUpdateCartQuantity = (id: string, variantId: string | undefined, quantity: number) => {
      setCart(prev => prev.map(item => 
          (item.id === id && item.selectedVariantId === variantId) 
          ? { ...item, quantity } 
          : item
      ));
  };

  const handleRemoveFromCart = (id: string, variantId?: string) => {
      setCart(prev => prev.filter(item => !(item.id === id && item.selectedVariantId === variantId)));
  };

  const handleProductClick = (product: Product) => {
      setSelectedProduct(product);
      setIsProductModalOpen(true);
  };

  const handleCheckout = () => {
      setIsCartOpen(false);
      setIsCheckoutOpen(true);
  };

  const handleCompleteOrder = (order: Order, couponId?: string) => {
      // 1. Save Order
      setOrders(prev => [order, ...prev]);
      
      // 2. Deduct Stock Logic
      const newProducts = products.map(p => {
          // Check if any item in order belongs to this product
          const orderItemsForProduct = order.items.filter(item => item.productId === p.id);

          if (orderItemsForProduct.length === 0) return p;

          let newProduct = { ...p };

          orderItemsForProduct.forEach(item => {
              if (newProduct.variants && newProduct.variants.length > 0 && item.variantName) {
                  // Deduct from variant (Match by name as ID might not be in snapshot yet, or rely on name uniqueness for demo)
                  newProduct.variants = newProduct.variants.map(v => {
                      if (v.name === item.variantName) { 
                           return { ...v, stock: Math.max(0, v.stock - item.quantity) };
                      }
                      return v;
                  });
              } else {
                  // Deduct from base stock
                  newProduct.stock = Math.max(0, newProduct.stock - item.quantity);
              }
          });
          return newProduct;
      });
      setProducts(newProducts);

      // 3. Consume Coupon
      if (user && couponId) {
          const newClaimedIds = user.claimedCouponIds?.filter(id => id !== couponId);
          setUser({ ...user, claimedCouponIds: newClaimedIds });
      }

      setIsCheckoutOpen(false);
      setCart([]); // Clear cart
      showToast('下单成功！', 'success');
  };

  // --- Navigation Handlers ---

  const handleBackToWelcome = () => setAppState(AppState.WELCOME);
  const handleEnterStore = () => setAppState(AppState.STORE);
  const handleEnterDiscovery = () => setAppState(AppState.DISCOVERY);
  const handleEnterAdmin = () => setAppState(AppState.ADMIN);
  const handleOpenProfile = () => {
      setAppState(AppState.USER_CENTER);
  };

  const handleLogin = (u: User) => {
      setUser(u);
      showToast(`欢迎回来，${u.name}`, 'success');
  };

  const handleLogout = () => {
      setUser(null);
      setAppState(AppState.WELCOME);
      showToast('已退出登录');
  };
  
  // --- Admin Handlers ---
  const handleAddProduct = (p: Product) => setProducts(prev => [...prev, p]);
  const handleUpdateProduct = (p: Product) => setProducts(prev => prev.map(prod => prod.id === p.id ? p : prod));
  const handleDeleteProduct = (id: string) => setProducts(prev => prev.filter(prod => prod.id !== id));
  const handleUpdateOrder = (o: Order) => setOrders(prev => prev.map(ord => ord.id === o.id ? o : ord));
  const handleCreateCoupon = (c: Coupon) => setCoupons(prev => [...prev, c]);
  const handleUpdateStoreConfig = (c: StoreConfig) => setStoreConfig(c);

  // --- Social Handlers ---
  const handleToggleLikePost = (postId: string) => {
      setPosts(prev => prev.map(p => {
          if (p.id === postId) {
              return { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 };
          }
          return p;
      }));
  };

  const handleCommentPost = (postId: string, content: string) => {
      const newComment: Comment = {
          id: Date.now().toString(),
          userName: user?.name || '游客',
          avatar: user?.avatar || '',
          content,
          date: '刚刚'
      };
      setPosts(prev => prev.map(p => {
          if (p.id === postId) {
              return { ...p, comments: [newComment, ...(p.comments || [])] };
          }
          return p;
      }));
      showToast('评论已发布', 'success');
  };

  // --- User Center Handlers ---
  const handleAddAddress = (addr: Address) => setAddresses(prev => [...prev, addr]);
  const handleUpdateAddress = (addr: Address) => setAddresses(prev => prev.map(a => a.id === addr.id ? addr : a));
  const handleDeleteAddress = (id: string) => setAddresses(prev => prev.filter(a => a.id !== id));
  const handleRecharge = (amount: number, bonus: number) => {
      if (user) {
          setUser({ ...user, balance: user.balance + amount + bonus });
      }
  };
  const handleCheckIn = () => {
      if (user) {
          setUser({ ...user, points: user.points + 10, lastCheckInDate: new Date().toISOString().split('T')[0] });
          showToast('签到成功！积分 +10', 'success');
      }
  };
  const handleClaimCoupon = (id: string) => {
      if (user) {
          if (user.claimedCouponIds?.includes(id)) {
              showToast('您已领取过该优惠券', 'info');
              return;
          }
          setUser({ ...user, claimedCouponIds: [...(user.claimedCouponIds || []), id] });
          showToast('领取成功', 'success');
      }
  };
  const handleClaimCouponBatch = (ids: string[]) => {
       if (user) {
          const newIds = ids.filter(id => !user.claimedCouponIds?.includes(id));
          if(newIds.length > 0) {
              setUser({ ...user, claimedCouponIds: [...(user.claimedCouponIds || []), ...newIds] });
              showToast(`成功领取 ${newIds.length} 张优惠券`, 'success');
          }
       }
  };
  
  const handleToggleFavoriteProduct = (productId: string) => {
      if (!user) {
          showToast('请先登录', 'info');
          return;
      }
      const isFav = user.favoriteProductIds?.includes(productId);
      let newFavs = user.favoriteProductIds || [];
      if (isFav) {
          newFavs = newFavs.filter(id => id !== productId);
          showToast('已取消收藏');
      } else {
          newFavs = [...newFavs, productId];
          showToast('已收藏', 'success');
      }
      setUser({ ...user, favoriteProductIds: newFavs });
  };
  
  const handleCancelOrder = (orderId: string) => {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'cancelled' as const } : o));
      showToast('订单已取消');
  };
  
  const handleConfirmReceipt = (orderId: string) => {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'completed' as const } : o));
      showToast('已确认收货，感谢您的惠顾', 'success');
  };
  
  const handleAddReview = (productId: string, content: string, rating: number) => {
      setProducts(prev => prev.map(p => {
          if (p.id === productId) {
              const newReview = {
                  id: `r-${Date.now()}`,
                  userName: user?.name || '匿名用户',
                  avatar: user?.avatar || '',
                  rating,
                  content,
                  date: new Date().toLocaleDateString()
              };
              return { ...p, reviews: [newReview, ...(p.reviews || [])] };
          }
          return p;
      }));
      showToast('评价发布成功！', 'success');
  };
  
  const handleRedeemItem = (item: RedeemItem) => {
      if (!user) return;
      if (user.points < item.cost) {
          showToast('积分不足', 'error');
          return;
      }
      setUser({ ...user, points: user.points - item.cost });
      if (item.type === 'coupon' && item.value) {
           showToast(`兑换成功！${item.name} 已放入您的卡包`, 'success');
      } else {
           showToast(`兑换成功！我们将尽快为您安排发货`, 'success');
      }
  };

  return (
    <div className="h-[100dvh] w-full bg-ocean-900 font-sans text-white select-none overflow-hidden relative">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {appState === AppState.WELCOME && (
        <WelcomeScreen
          onStartChat={() => handleStartChat()}
          onEnterStore={handleEnterStore}
          onEnterDiscovery={handleEnterDiscovery}
          onEnterAdmin={handleEnterAdmin}
          onOpenProfile={handleOpenProfile}
          isLoggedIn={!!user}
        />
      )}

      {appState === AppState.CHAT && (
        <ChatInterface
          messages={messages}
          isLoading={isLoadingChat}
          onSendMessage={handleSendMessage}
          onAddToCart={handleAddToCart}
          productCatalog={products}
          onOpenProfile={handleOpenProfile}
          user={user}
          onProductClick={handleProductClick}
          cart={cart}
          onAddMenuToCart={handleAddMenuToCart}
          onClearChat={() => setMessages([])}
          onBack={handleBackToWelcome}
          onOpenCart={() => setIsCartOpen(true)}
        />
      )}

      {appState === AppState.STORE && (
        <Storefront
          products={products}
          onAddToCart={handleAddToCart}
          onBack={handleBackToWelcome}
          cartCount={cart.reduce((a, b) => a + b.quantity, 0)}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenProfile={handleOpenProfile}
          user={user}
          onProductClick={handleProductClick}
          cart={cart}
          onOpenDiscovery={handleEnterDiscovery}
          storeConfig={storeConfig}
          onToggleFavorite={handleToggleFavoriteProduct}
          onClaimCouponBatch={handleClaimCouponBatch}
          coupons={coupons}
        />
      )}

      {appState === AppState.DISCOVERY && (
          <DiscoveryFeed
            posts={posts} 
            products={products} 
            onProductClick={handleProductClick}
            onBack={handleBackToWelcome} 
            onOpenStore={handleEnterStore}
            user={user} 
            showToast={showToast}
            onToggleLike={handleToggleLikePost}
            onComment={handleCommentPost}
            onConsult={(product) => handleStartChat(product)}
          />
      )}

      {appState === AppState.ADMIN && (
        <AdminDashboard
          products={products}
          orders={orders}
          shippingTemplates={shippingTemplates}
          coupons={coupons}
          storeConfig={storeConfig}
          onAddProduct={handleAddProduct}
          onUpdateProduct={handleUpdateProduct}
          onDeleteProduct={handleDeleteProduct}
          onUpdateOrder={handleUpdateOrder}
          onCreateCoupon={handleCreateCoupon}
          onUpdateStoreConfig={handleUpdateStoreConfig}
          onExit={handleBackToWelcome}
          onResetData={() => {
             localStorage.clear();
             setProducts(SEAFOOD_CATALOG);
             setOrders(INITIAL_ORDERS);
             setCart([]);
             setAddresses(INITIAL_ADDRESSES);
             setUser(null);
             showToast('数据已完全重置');
          }}
          showToast={showToast}
        />
      )}

      {appState === AppState.USER_CENTER && (
          <UserCenter 
              user={user}
              orders={orders}
              addresses={addresses}
              coupons={coupons}
              products={products}
              posts={posts}
              onLogin={handleLogin}
              onLogout={handleLogout}
              onBack={handleBackToWelcome}
              onContactSupport={() => showToast('客服功能开发中...')}
              onUpdateProfile={(name) => setUser(prev => prev ? {...prev, name} : null)}
              onAddAddress={handleAddAddress}
              onUpdateAddress={handleUpdateAddress}
              onDeleteAddress={handleDeleteAddress}
              onRecharge={handleRecharge}
              onCheckIn={handleCheckIn}
              onClaimCoupon={handleClaimCoupon}
              onAddToCart={handleAddToCart}
              onCancelOrder={handleCancelOrder}
              onConfirmReceipt={handleConfirmReceipt}
              showToast={showToast}
              onAddReview={handleAddReview}
              onToggleFavoriteProduct={handleToggleFavoriteProduct}
              onRedeem={handleRedeemItem}
          />
      )}

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onRemove={handleRemoveFromCart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onCheckout={handleCheckout}
        recommendations={products.filter(p => p.isLive).slice(0, 5)} 
        onAddRecommendation={handleAddToCart}
      />
      
      <ProductDetailModal
          product={selectedProduct}
          isOpen={isProductModalOpen}
          onClose={() => setIsProductModalOpen(false)}
          onAddToCart={handleAddToCart}
          onConsultAI={(p) => { setIsProductModalOpen(false); handleStartChat(p); }}
          onNotifyMe={() => showToast('已设置到货提醒', 'success')}
          cart={cart}
          user={user}
          showToast={showToast}
          onToggleFavorite={handleToggleFavoriteProduct}
      />
      
      <CheckoutModal 
          isOpen={isCheckoutOpen} 
          onClose={() => setIsCheckoutOpen(false)} 
          cart={cart} 
          addresses={addresses} 
          shippingTemplates={shippingTemplates} 
          coupons={coupons} 
          onCompleteOrder={handleCompleteOrder} 
          clearCart={() => setCart([])} 
          user={user}
          onAddAddress={handleAddAddress}
      />
    </div>
  );
};

export default App;
