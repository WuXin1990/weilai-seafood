
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AppState, Product, Message, MessageRole, DecisionState, RecommendationCard
} from './types';
import { SEAFOOD_CATALOG } from './constants';
import { geminiService } from './services/geminiService';
import WelcomeScreen from './components/WelcomeScreen';
import { ChatInterface } from './components/ChatInterface';
import OrderConfirmation from './components/OrderConfirmation';
import PaymentScreen from './components/PaymentScreen';
import SuccessScreen from './components/SuccessScreen';
import Storefront from './components/Storefront';
import ToastContainer, { ToastMessage } from './components/Toast';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.WELCOME);
  const [products] = useState<Product[]>(SEAFOOD_CATALOG);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [currentRecommendation, setCurrentRecommendation] = useState<RecommendationCard | null>(null);

  const triggerVibrate = (type: 'light' | 'medium' | 'success' = 'light') => {
    // 模拟 Taro/Wechat 的震动 API
    if (window.navigator.vibrate) {
      const patterns = { light: 10, medium: 30, success: [20, 50, 20] };
      window.navigator.vibrate(patterns[type]);
    }
  };

  const showToast = useCallback((text: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, text, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  const handleStartChat = () => {
    triggerVibrate('medium');
    setAppState(AppState.CHAT);
    if (messages.length === 0) {
      const greeting = geminiService.startChat();
      setMessages([{ id: Date.now().toString(), role: MessageRole.MODEL, text: greeting }]);
    }
  };

  const handleSendMessage = async (text: string) => {
    const newMessage: Message = { id: Date.now().toString(), role: MessageRole.USER, text };
    setMessages(prev => [...prev, newMessage]);
    setIsLoadingChat(true);

    try {
      const result = await geminiService.sendMessage(text, products);
      triggerVibrate('light');
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: MessageRole.MODEL, 
        text: result.text,
        recommendationCard: result.card
      }]);
    } catch (error) {
      showToast("管家正在连线深海信号，请稍后再试", 'error');
    } finally {
      setIsLoadingChat(false);
    }
  };

  const pageVariants = {
    initial: { opacity: 0, scale: 0.98 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.02 }
  };

  return (
    <div className="h-full w-full bg-ocean-950 text-white overflow-hidden relative font-sans select-none">
      <ToastContainer toasts={toasts} onDismiss={(id) => setToasts(t => t.filter(x => x.id !== id))} />

      <AnimatePresence mode="wait">
        <motion.div
          key={appState}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="h-full w-full"
        >
          {appState === AppState.WELCOME && (
            <WelcomeScreen
              onStartChat={handleStartChat}
              onEnterStore={() => { triggerVibrate(); setAppState(AppState.STORE); }}
              onEnterDiscovery={() => showToast("极鲜日志：正在加载深海故事...", "info")}
              onOpenProfile={() => showToast("正在调取贵宾权益...", "info")}
            />
          )}

          {appState === AppState.STORE && (
            <Storefront 
                products={products}
                onAddToCart={(p) => { triggerVibrate('light'); showToast(`已将 ${p.name} 放入购物袋`, "success"); }}
                onBack={() => setAppState(AppState.WELCOME)}
                cartCount={0}
                onOpenCart={() => showToast("购物袋正在备货中", "info")}
                onOpenProfile={() => {}}
                user={null}
                onProductClick={(p) => showToast(`正在获取 ${p.name} 的产地实拍`, "info")}
                cart={[]}
            />
          )}

          {appState === AppState.CHAT && (
            <ChatInterface
              messages={messages}
              isLoading={isLoadingChat}
              onSendMessage={handleSendMessage}
              productCatalog={products}
              onBack={() => setAppState(AppState.WELCOME)}
              onConfirmOrder={(card) => {
                triggerVibrate('success');
                setCurrentRecommendation(card);
                setAppState(AppState.CONFIRMATION);
              }}
              conversationState={DecisionState.INIT}
            />
          )}

          {appState === AppState.CONFIRMATION && currentRecommendation && (
              <OrderConfirmation 
                card={currentRecommendation}
                onBack={() => setAppState(AppState.CHAT)}
                onPay={() => { triggerVibrate('medium'); setAppState(AppState.PAYMENT); }}
              />
          )}

          {appState === AppState.PAYMENT && currentRecommendation && (
              <PaymentScreen 
                totalPrice={currentRecommendation.totalPrice}
                onSuccess={() => {
                  triggerVibrate('success');
                  setAppState(AppState.SUCCESS);
                }}
              />
          )}

          {appState === AppState.SUCCESS && (
              <SuccessScreen 
                onHome={() => {
                    setAppState(AppState.WELCOME);
                    setMessages([]);
                }}
                onContact={() => showToast("黑金管家已收到指令", "info")}
              />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default App;
