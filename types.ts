
// Types for Wei Lai Seafood App

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  stock: number;
}

export interface RecommendationItem {
  name: string;
  spec: string;
  quantity: number;
  price: number;
  // Added optional properties to support order history and checkout logic
  image?: string;
  skuId?: string;
  productId?: string;
}

export interface RecommendationCard {
  decision: string;
  reason: string;
  items: RecommendationItem[];
  totalPrice: number;
  ctaText: string;
}

export enum MessageRole {
  USER = 'user',
  MODEL = 'model',
  SYSTEM = 'system'
}

export interface Message {
  id: string;
  role: MessageRole;
  text: string;
  recommendationCard?: RecommendationCard;
  isStreaming?: boolean;
}

export enum DecisionState {
  INIT = 'INIT',
  SCENE = 'SCENE',
  KEY_PARAM = 'KEY_PARAM',
  DECISION = 'DECISION',
  CONFIRM = 'CONFIRM',
  END = 'END'
}

export interface Product {
  id: string;
  skuId: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  image: string;
  tags: string[];
  stock: number;
  category: string;
  variants?: ProductVariant[];
  isLive?: boolean;
  origin?: string;
  cookingMethod?: string;
  nutrition?: string;
}

export interface CartItem extends Product {
  quantity: number;
  selectedVariantId?: string;
  selectedVariantName?: string;
}

export enum AppState {
  WELCOME = 'WELCOME',
  CHAT = 'CHAT',
  STORE = 'STORE',
  CONFIRMATION = 'CONFIRMATION',
  PAYMENT = 'PAYMENT',
  SUCCESS = 'SUCCESS'
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  level: string;
  balance: number;
  claimedCouponIds: string[];
  phone?: string;
  points?: number;
}

export interface Order {
  id: string;
  status: 'pending' | 'shipped' | 'completed' | 'cancelled';
  total: number;
  date: string;
  items: RecommendationItem[];
  paymentMethod: 'wechat' | 'balance';
}

export interface Member extends User {
  totalSpent: number;
  favoriteProductIds: string[];
}

export interface RedeemItem {
  id: string;
  name: string;
  points: number;
  image: string;
}

export interface Coupon {
  id: string;
  title: string;
  discount: number;
  minSpend: number;
  expiryDate: string;
}

export interface Address {
  id: string;
  receiverName: string;
  phone: string;
  address: string;
  isDefault?: boolean;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  image: string;
  likes: number;
  isLiked: boolean;
  productId: string;
  author: {
    name: string;
    avatar: string;
  };
}

// Added StoreConfig interface for AdminDashboard
export interface StoreConfig {
  isLiveMode: boolean;
  liveAnnouncement: string;
}
