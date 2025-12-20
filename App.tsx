
import React, { useState } from 'react';
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
  const [conversationState, setConversationState] = useState<DecisionState>(DecisionState.INIT);
  const [products] = useState<Product[]>(SEAFOOD_CATALOG);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [currentRecommendation, setCurrentRecommendation] = useState<RecommendationCard | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, text, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  const handleStartChat = () => {
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
      const { text: responseText, card } = await geminiService.sendMessage(text, products);

      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: MessageRole.MODEL, 
        text: responseText,
        recommendationCard: card
      }]);

    } catch (error) {
      showToast("魏来管家信号微弱，请重试", 'error');
    } finally {
      setIsLoadingChat(false);
    }
  };

  const handleConfirmOrder = (card: RecommendationCard) => {
    setCurrentRecommendation(card);
    setAppState(AppState.CONFIRMATION);
  };

  const handlePay = () => {
    setAppState(AppState.PAYMENT);
  };

  const handlePaymentSuccess = () => {
    setAppState(AppState.SUCCESS);
    showToast("交易成功，魏来为您备货", "success");
  };

  return (
    <div className="h-full w-full bg-ocean-950 text-white overflow-hidden relative font-sans">
      <ToastContainer toasts={toasts} onDismiss={(id) => setToasts(t => t.filter(x => x.id !== id))} />

      {appState === AppState.WELCOME && (
        <WelcomeScreen
          onStartChat={handleStartChat}
          onEnterStore={() => setAppState(AppState.STORE)}
          onEnterDiscovery={() => showToast("生活美学期刊筹备中", "info")}
          onEnterAdmin={() => showToast("店长管理端请在 PC 端登录", "info")}
          onOpenProfile={() => showToast("会员中心升级中", "info")}
          isLoggedIn={false}
        />
      )}

      {appState === AppState.STORE && (
        <Storefront 
            products={products}
            onAddToCart={(p) => showToast(`已将 ${p.name} 加入购物袋`, "success")}
            onBack={() => setAppState(AppState.WELCOME)}
            cartCount={0}
            onOpenCart={() => showToast("购物袋明细展示中", "info")}
            onOpenProfile={() => {}}
            user={null}
            onProductClick={(p) => showToast(`正在加载 ${p.name} 详情`, "info")}
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
          onConfirmOrder={handleConfirmOrder}
          conversationState={conversationState}
        />
      )}

      {appState === AppState.CONFIRMATION && currentRecommendation && (
          <OrderConfirmation 
            card={currentRecommendation}
            onBack={() => setAppState(AppState.CHAT)}
            onPay={handlePay}
          />
      )}

      {appState === AppState.PAYMENT && currentRecommendation && (
          <PaymentScreen 
            totalPrice={currentRecommendation.totalPrice}
            onSuccess={handlePaymentSuccess}
          />
      )}

      {appState === AppState.SUCCESS && (
          <SuccessScreen 
            onHome={() => {
                setAppState(AppState.WELCOME);
                setMessages([]);
                setConversationState(DecisionState.INIT);
            }}
            onContact={() => showToast("正在为您连接黑金管家...", "info")}
          />
      )}
    </div>
  );
};

export default App;
