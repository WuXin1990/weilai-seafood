
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import WelcomeScreen from './components/WelcomeScreen';
import { ChatInterface } from './components/ChatInterface';
import Storefront from './components/Storefront';
import OrderConfirmation from './components/OrderConfirmation';
import PaymentScreen from './components/PaymentScreen';
import SuccessScreen from './components/SuccessScreen';
import ToastContainer, { ToastMessage } from './components/Toast';
import { AppState, Product, Message, MessageRole, RecommendationCard } from './types';
import { SEAFOOD_CATALOG } from './constants';
import { geminiService } from './services/geminiService';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.WELCOME);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [currentRecommendation, setCurrentRecommendation] = useState<RecommendationCard | null>(null);

  const showToast = useCallback((text: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, text, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  const handleStartChat = () => {
    setAppState(AppState.CHAT);
    if (messages.length === 0) {
      const greeting = geminiService.startChat();
      setMessages([{ id: Date.now().toString(), role: MessageRole.MODEL, text: greeting }]);
    }
  };

  const handleSendMessage = async (text: string) => {
    const userMsg: Message = { id: Date.now().toString(), role: MessageRole.USER, text };
    setMessages(prev => [...prev, userMsg]);
    setIsLoadingChat(true);

    try {
      const result = await geminiService.sendMessage(text, SEAFOOD_CATALOG);
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: MessageRole.MODEL, 
        text: result.text,
        recommendationCard: result.card
      }]);
    } catch (error) {
      showToast("管家正在连线深海信号...", 'error');
    } finally {
      setIsLoadingChat(false);
    }
  };

  return (
    <div className="h-full w-full bg-ocean-950 text-white overflow-hidden relative">
      <ToastContainer toasts={toasts} onDismiss={(id) => setToasts(t => t.filter(x => x.id !== id))} />

      <AnimatePresence mode="wait">
        <motion.div
          key={appState}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="h-full w-full"
        >
          {appState === AppState.WELCOME && (
            <WelcomeScreen
              onStartChat={handleStartChat}
              onEnterStore={() => setAppState(AppState.STORE)}
              onEnterDiscovery={() => showToast("极鲜食志正在印刷中...", "info")}
              onOpenProfile={() => showToast("正在读取贵宾特权...", "info")}
            />
          )}

          {appState === AppState.CHAT && (
            <ChatInterface
              messages={messages}
              isLoading={isLoadingChat}
              onSendMessage={handleSendMessage}
              productCatalog={SEAFOOD_CATALOG}
              onBack={() => setAppState(AppState.WELCOME)}
              onConfirmOrder={(card) => {
                setCurrentRecommendation(card);
                setAppState(AppState.CONFIRMATION);
              }}
              conversationState={null as any}
            />
          )}

          {appState === AppState.STORE && (
            <Storefront 
                products={SEAFOOD_CATALOG}
                onAddToCart={(p) => showToast(`已为您抢先锁鲜：${p.name}`, "success")}
                onBack={() => setAppState(AppState.WELCOME)}
                cartCount={0}
                onOpenCart={() => {}}
                onOpenProfile={() => {}}
                user={null}
                onProductClick={() => {}}
                cart={[]}
            />
          )}

          {appState === AppState.CONFIRMATION && currentRecommendation && (
            <OrderConfirmation 
              card={currentRecommendation}
              onBack={() => setAppState(AppState.CHAT)}
              onPay={() => setAppState(AppState.PAYMENT)}
            />
          )}

          {appState === AppState.PAYMENT && currentRecommendation && (
            <PaymentScreen 
              totalPrice={currentRecommendation.totalPrice}
              onSuccess={() => setAppState(AppState.SUCCESS)}
            />
          )}

          {appState === AppState.SUCCESS && (
            <SuccessScreen 
              onHome={() => { setAppState(AppState.WELCOME); setMessages([]); }}
              onContact={() => showToast("管家已收到您的指令", "info")}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default App;
