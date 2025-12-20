
import { Product, Member, RedeemItem } from './types';

export const SEAFOOD_CATALOG: Product[] = [
  {
    id: "SKU123",
    skuId: "SKU123",
    name: "阿拉斯加帝王蟹",
    description: "4-5kg 巨型规格，捕捞自 200 米深海冷域。每一只都由主厨亲自过秤，肉质丰腴如雪，鲜甜回甘。",
    price: 2580,
    unit: "只",
    image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?q=80&w=1200",
    tags: ["深海", "直播推荐", "鲜活直达"],
    stock: 12,
    category: 'crab_shrimp',
    isLive: true,
    origin: '阿拉斯加冷域'
  },
  {
    id: "SKU124",
    skuId: "SKU124",
    name: "澳洲野生黑边鲍",
    description: "单头重达 500g+ 的“海洋黑金”。产自塔斯马尼亚纯净海域，口感极度爽脆，是滋补礼赠的顶配选择。",
    price: 1580,
    unit: "对",
    image: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?q=80&w=1200",
    tags: ["野生", "黑金级", "稀缺"],
    stock: 24,
    category: 'shell',
    origin: '澳洲塔斯马尼亚'
  },
  {
    id: "SKU125",
    skuId: "SKU125",
    name: "极地紫海胆",
    description: "刺身界的顶级艺术品。颗粒饱满，色泽金黄，入口即化，带有浓郁的海盐奶香。每日空运，仅限当日品鉴。",
    price: 888,
    unit: "份",
    image: "https://images.unsplash.com/photo-1598511726623-d3434190c680?q=80&w=1200",
    tags: ["5A 级", "产地直飞", "刺身至尊"],
    stock: 15,
    category: 'shell',
    origin: '北海道冷域'
  },
  {
    id: "SKU126",
    skuId: "SKU126",
    name: "蓝鳍金枪鱼大腹",
    description: "大腹（Otoro）部位，油脂丰盈如霜。主厨刀工现片，入口瞬时爆发油脂香气。",
    price: 1280,
    unit: "份",
    image: "https://images.unsplash.com/photo-1501595091296-3a9f4fe68241?q=80&w=1200",
    tags: ["霜降油脂", "空运直达"],
    stock: 8,
    category: 'fish',
    origin: '长崎县'
  }
];

export const WELCOME_MESSAGE = "尊客，欢迎来到魏来海鲜。我是您的私人管家，正实时连通全球海域。请问您今日的用餐场景是？";

export const SCENE_BUTTONS = ["自家品鉴", "商务宴请", "节日礼赠"];

export const CATEGORY_NAMES: Record<string, string> = {
  fish: '深海甄选 · 鱼类',
  crab_shrimp: '鲜活直供 · 虾蟹',
  shell: '极鲜珍味 · 贝类'
};

export const MOCK_MEMBERS: Member[] = [
  {
    id: "u-888",
    name: "魏来贵宾",
    avatar: "https://api.iconify.design/lucide:user.svg?color=%23f59e0b",
    level: "black_gold",
    balance: 8888,
    claimedCouponIds: [],
    phone: "138****8888",
    points: 5200,
    totalSpent: 12800,
    favoriteProductIds: []
  }
];

export const REDEEM_ITEMS: RedeemItem[] = [
  { id: 'r1', name: '极鲜姜醋', points: 500, image: 'https://images.unsplash.com/photo-1598511726623-d3434190c680?q=80&w=400' }
];
