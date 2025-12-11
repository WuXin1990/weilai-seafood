
export interface Review {
  id: string;
  userName: string;
  avatar: string;
  rating: number; // 1-5
  content: string;
  date: string;
  images?: string[];
}

export interface ProductVariant {
  id: string;
  name: string; // e.g., "Large (2kg)", "Small (1kg)"
  price: number;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // Base price or range start
  unit: string; // e.g., "per kg", "per box"
  image: string;
  tags: string[];
  stock: number; // Total stock or base stock
  category: 'fish' | 'crab_shrimp' | 'shell';
  origin?: string; // Origin of the seafood
  cookingMethod?: string; // Suggested cooking
  nutrition?: string; // New: Nutritional value
  isLive?: boolean; // New: Is currently being featured in live stream
  reviews?: Review[]; // New: Customer reviews
  variants?: ProductVariant[]; // New: Multi-spec variants
}

export interface Comment {
  id: string;
  userName: string;
  avatar: string;
  content: string;
  date: string;
}

export interface Post {
  id: string;
  productId: string; // Link to product for purchase
  title: string;
  content: string; // Full content
  image: string;
  author: {
    name: string;
    avatar: string;
  };
  likes: number;
  isLiked?: boolean;
  comments: Comment[]; // New: Social comments
}

export interface Address {
  id: string;
  name: string;
  phone: string;
  province: string;
  city: string;
  detail: string;
  isDefault: boolean;
}

export interface Coupon {
  id: string;
  name: string;
  type: 'fixed' | 'percent'; 
  value: number; 
  minOrderAmount: number;
  description: string;
}

export interface OrderItemSnapshot {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  variantId?: string; // New
  variantName?: string; // New
}

export interface Order {
  id: string;
  userId?: string; // Link to user
  customerName: string;
  status: 'pending' | 'shipped' | 'completed' | 'cancelled';
  total: number;
  originalTotal?: number; // Price before discount
  discountAmount?: number; // Deduction
  couponName?: string; // Name of used coupon
  date: string;
  items: OrderItemSnapshot[]; // REFACTORED: Now stores detailed snapshots
  paymentMethod?: 'wechat' | 'balance'; 
  trackingNumber?: string; 
  note?: string; // New: Order remarks
}

export interface ShippingTemplate {
  id: string;
  name: string;
  type: 'free' | 'weight' | 'flat';
  baseFee: number;
  description: string;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  level: 'black_gold' | 'diamond' | 'platinum';
  balance: number;
  points: number;
  claimedCouponIds?: string[]; // IDs of coupons owned by user
  subscriptionIds?: string[]; // New: IDs of products user subscribed to for stock alerts
  favoriteProductIds?: string[]; // IDs of favorite products
  lastCheckInDate?: string; // YYYY-MM-DD
}

export interface Member {
  id: string;
  name: string;
  level: 'black_gold' | 'diamond' | 'platinum';
  totalSpent: number;
  avatar: string;
}

// NEW: Store Configuration for Admin Control
export interface StoreConfig {
  liveAnnouncement: string;
  flashSaleEndTime: string; // ISO Date String
  isLiveMode: boolean;
}

// NEW: Banquet Menu Structure
export interface BanquetMenu {
  title: string;
  description: string;
  totalPrice: number;
  items: {
    productId: string;
    quantity: number;
  }[];
}

// NEW: Redeem Item for Points Mall
export interface RedeemItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  type: 'coupon' | 'physical';
  value?: number; // for coupons
  image?: string;
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
  image?: string; // New: Base64 image string
  isStreaming?: boolean;
  recommendedProducts?: Product[];
  menu?: BanquetMenu; // New: AI generated menu
  productContext?: Product; // New: The product user is asking about
}

export interface CartItem extends Product {
  quantity: number;
  selectedVariantId?: string; // New: For multi-spec
  selectedVariantName?: string; // New: For display
}

export enum AppState {
  WELCOME = 'WELCOME',
  CHAT = 'CHAT',
  STORE = 'STORE',
  DISCOVERY = 'DISCOVERY', // New State
  ADMIN = 'ADMIN',
  CHECKOUT = 'CHECKOUT', 
  USER_CENTER = 'USER_CENTER'
}
