
import { Product, Member, RedeemItem } from './types';

export const SEAFOOD_CATALOG: Product[] = [
  {
    id: "SKU123",
    skuId: "SKU123",
    name: "阿拉斯加帝王蟹 (4-5kg)",
    description: "捕捞自白令海峡 200 米深海冷域。每一只都经过主厨亲自过秤，肉质丰盈饱满，丝丝鲜甜回甘，是顶级宴请的不二之选。",
    price: 2580,
    unit: "只",
    image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?q=80&w=1200",
    tags: ["直播间爆款", "产地直飞", "鲜活直达"],
    stock: 12,
    category: 'crab_shrimp',
    isLive: true,
    origin: '阿拉斯加深海'
  },
  {
    id: "SKU124",
    skuId: "SKU124",
    name: "澳洲野生黑边鲍 (单头重)",
    description: "产自塔斯马尼亚纯净海域。其黑边是野生的天然标识，口感极度爽脆，富含多种微量元素，是海中“黑金”级滋补品。",
    price: 1580,
    unit: "对",
    image: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?q=80&w=1200",
    tags: ["限量供应", "黑金级", "野生"],
    stock: 24,
    category: 'shell',
    origin: '塔斯马尼亚'
  },
  {
    id: "SKU125",
    skuId: "SKU125",
    name: "极地紫海胆 (5A级)",
    description: "刺身界的艺术品。颗粒分明，色泽金黄如霜，入口即化，带有浓郁的海盐奶香味。每日空运，仅限 24 小时品鉴。",
    price: 888,
    unit: "份",
    image: "https://images.unsplash.com/photo-1598511726623-d3434190c680?q=80&w=1200",
    tags: ["5A认证", "当日空运", "刺身至尊"],
    stock: 15,
    category: 'shell',
    origin: '北海道冷域'
  },
  {
    id: "SKU126",
    skuId: "SKU126",
    name: "蓝鳍金枪鱼大腹 (Otoro)",
    description: "被称为“海中的和牛”。油脂分布均匀如霜降，入口顺滑，油脂香气在口腔瞬间爆发，是味蕾的极致奢华体验。",
    price: 1280,
    unit: "份",
    image: "https://images.unsplash.com/photo-1501595091296-3a9f4fe68241?q=80&w=1200",
    tags: ["油脂如霜", "主厨现片"],
    stock: 8,
    category: 'fish',
    origin: '长崎海域'
  }
];

export const WELCOME_MESSAGE = "尊客，欢迎空降魏来海鲜。我是您的私人管家，正实时为您连通全球深海冷域。请问您今日是为哪种场景寻觅极鲜？";

export const SCENE_BUTTONS = ["自家品鉴", "高端送礼", "商务宴请"];

export const CATEGORY_NAMES: Record<string, string> = {
  fish: '深海甄选 · 鱼类',
  crab_shrimp: '鲜活直供 · 虾蟹',
  shell: '极鲜珍味 · 贝类'
};

export const MOCK_MEMBERS: Member[] = [
  {
    id: "u-888",
    name: "魏来贵宾",
    avatar: "https://api.iconify.design/lucide:user.svg?color=%23c5a059",
    level: "black_gold",
    balance: 8888,
    claimedCouponIds: [],
    phone: "138****8888",
    points: 5200,
    totalSpent: 12800,
    favoriteProductIds: []
  }
];
