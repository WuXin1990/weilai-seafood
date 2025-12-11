
import { Product, Order, ShippingTemplate, Address, Coupon, Post, Member, StoreConfig, RedeemItem } from './types';

export const CATEGORY_NAMES: Record<string, string> = {
  'fish': '游龙 · 臻选鱼类',
  'crab_shrimp': '甲胄 · 虾蟹尊爵',
  'shell': '贝阙 · 鲍参贝类'
};

export const LIVE_COMMENTS = [
    "刚刚下单了！", "看起来好新鲜", "流口水了🤤", "价格很划算", "发货快吗？", 
    "主播推荐的肯定没错", "已关注", "我也要买", "帝王蟹太诱人了", "求优惠券！"
];

export const INITIAL_STORE_CONFIG: StoreConfig = {
  liveAnnouncement: "🔥 抖音直播间正在热播！帝王蟹限时 5 折，手慢无！",
  flashSaleEndTime: new Date(Date.now() + 1000 * 60 * 60 * 3).toISOString(), // Default 3 hours from now
  isLiveMode: true
};

export const MOCK_MEMBERS: Member[] = [
    { id: 'u-001', name: '王总', level: 'black_gold', totalSpent: 88500, avatar: 'https://api.iconify.design/lucide:user.svg?color=gold' },
    { id: 'u-002', name: 'Linda', level: 'diamond', totalSpent: 23400, avatar: 'https://api.iconify.design/lucide:user.svg?color=blue' },
    { id: 'u-003', name: '陈先生', level: 'diamond', totalSpent: 12800, avatar: 'https://api.iconify.design/lucide:user.svg?color=blue' },
    { id: 'u-004', name: '李阿姨', level: 'platinum', totalSpent: 5600, avatar: 'https://api.iconify.design/lucide:user.svg?color=gray' },
    { id: 'u-005', name: 'Jason', level: 'black_gold', totalSpent: 45200, avatar: 'https://api.iconify.design/lucide:user.svg?color=gold' },
];

export const REDEEM_ITEMS: RedeemItem[] = [
    { id: 'r-001', name: '满500减50优惠券', description: '全场通用', cost: 500, type: 'coupon', value: 50 },
    { id: 'r-002', name: '魏来定制围裙', description: '主厨同款，做饭更有仪式感', cost: 1200, type: 'physical' },
    { id: 'r-003', name: '无门槛100元券', description: '直接抵扣', cost: 1000, type: 'coupon', value: 100 },
    { id: 'r-004', name: '波士顿龙虾一只', description: '鲜活配送 (随单发出)', cost: 5000, type: 'physical' }
];

export const INITIAL_ORDERS: Order[] = [
  { 
      id: "ORD-2024001", 
      userId: "guest", 
      customerName: "张先生 (直播间粉丝)", 
      status: "pending", 
      total: 2576, 
      date: "2024-05-20", 
      items: [
          { productId: "king-crab-01", name: "阿拉斯加帝王蟹", price: 1288, quantity: 2, image: "https://picsum.photos/id/42/800/600", variantName: "特大号 (2.5kg)" }
      ], 
      paymentMethod: 'wechat' 
  },
  { 
      id: "ORD-2024002", 
      userId: "guest", 
      customerName: "李女士", 
      status: "shipped", 
      total: 450, 
      date: "2024-05-19", 
      items: [
          { productId: "spot-prawn-01", name: "加拿大牡丹虾", price: 450, quantity: 1, image: "https://picsum.photos/id/231/800/600" }
      ], 
      paymentMethod: 'wechat', 
      trackingNumber: "SF1029384756" 
  },
  { 
      id: "ORD-2024003", 
      userId: "u-888", 
      customerName: "魏来贵宾", 
      status: "completed", 
      total: 15800, 
      date: "2024-05-18", 
      items: [
          { productId: "abalone-01", name: "澳洲野生黑边鲍鱼", price: 1580, quantity: 10, image: "https://picsum.photos/id/674/800/600" }
      ], 
      paymentMethod: 'balance' 
  },
];

export const INITIAL_ADDRESSES: Address[] = [
    { id: 'addr-1', name: '魏来贵宾', phone: '138****8888', province: '上海市', city: '上海市', detail: '静安区南京西路1266号恒隆广场', isDefault: true },
    { id: 'addr-2', name: '魏先生', phone: '139****6666', province: '北京市', city: '朝阳区', detail: '建国路87号SKP', isDefault: false },
];

export const INITIAL_SHIPPING_TEMPLATES: ShippingTemplate[] = [
  { id: "SHIP-01", name: "顺丰冷链包邮", type: "free", baseFee: 0, description: "订单满 ¥500 免运费" },
  { id: "SHIP-02", name: "标准冷链配送", type: "weight", baseFee: 45, description: "首重 ¥45，续重 ¥15/kg" },
  { id: "SHIP-03", name: "同城闪送", type: "flat", baseFee: 60, description: "仅限上海市区，2小时达" },
];

export const INITIAL_COUPONS: Coupon[] = [
    { id: "CP-NEWUSER", name: "新人见面礼", type: "fixed", value: 100, minOrderAmount: 500, description: "无门槛抵扣 (满500可用)" },
    { id: "CP-VIP98", name: "黑金尊享98折", type: "percent", value: 0.98, minOrderAmount: 2000, description: "全场通用，可叠加包邮" },
    { id: "CP-LIVE500", name: "直播间专享大额券", type: "fixed", value: 500, minOrderAmount: 5000, description: "限时领取，过期不补" }
];

export const WELCOME_MESSAGE = "尊贵的贵宾，欢迎来到魏来海鲜。我是您的私人美食顾问。今天的直播间同款帝王蟹非常抢手，您想了解一下怎么做最好吃吗？或者告诉我您的口味，我为您推荐。";

const MOCK_REVIEWS = [
    { id: 'r1', userName: '陈总', avatar: '', rating: 5, content: '非常新鲜，包装很显档次，送礼很有面子。', date: '2024-05-10' },
    { id: 'r2', userName: 'Alice', avatar: '', rating: 5, content: '个头很大，肉质鲜甜，还会回购。', date: '2024-05-12' },
    { id: 'r3', userName: '老饕客', avatar: '', rating: 4, content: '物流很快，顺丰一早就送到了，还是活的。', date: '2024-05-15' }
];

export const SEAFOOD_CATALOG: Product[] = [
  {
    id: "king-crab-01",
    name: "阿拉斯加帝王蟹",
    description: "来自深海的尊贵美味，肉质饱满，口感鲜甜。适合清蒸或炭烤，宴请首选。",
    price: 1288,
    unit: "每只",
    image: "https://picsum.photos/id/42/800/600",
    tags: ["奢华", "聚会", "鲜甜"],
    stock: 10,
    category: 'crab_shrimp',
    origin: "阿拉斯加白令海峡",
    cookingMethod: "推荐做法：\n1. 清蒸：水开后大火蒸20分钟，保留原汁原味。\n2. 避风塘炒蟹：蟹腿切段，裹淀粉炸酥，辅以蒜蓉豆豉爆炒。\n3. 蟹黄蒸蛋：利用蟹盖内的蟹黄与蛋液混合蒸制。",
    nutrition: "富含优质蛋白质、微量元素钙、镁、磷。脂肪含量极低，且多为不饱和脂肪酸，有助于心血管健康。对于术后恢复人群是极佳的滋补品。",
    isLive: true,
    reviews: MOCK_REVIEWS,
    variants: [
        { id: "kc-xl", name: "特大号 (3-3.5kg)", price: 1688, stock: 5 },
        { id: "kc-l", name: "大号 (2-2.5kg)", price: 1288, stock: 10 },
        { id: "kc-m", name: "中号 (1.5-1.8kg)", price: 988, stock: 8 }
    ]
  },
  {
    id: "bluefin-tuna-01",
    name: "蓝鳍金枪鱼大腹",
    description: "刺身之王，入口即化，油脂丰富，如霜降牛肉般的纹理。",
    price: 980,
    unit: "500g",
    image: "https://picsum.photos/id/292/800/600",
    tags: ["刺身", "极品", "油脂丰富"],
    stock: 5,
    category: 'fish',
    origin: "日本长崎",
    cookingMethod: "推荐做法：\n1. 厚切刺身：解冻至中心微硬时切片，蘸取现磨山葵和刺身酱油食用，感受油脂在口中爆发。\n2. 火炙寿司：切片铺在醋饭上，用喷枪快速炙烤表面，激发出焦香味。",
    nutrition: "DHA和EPA含量极高，被称为'脑黄金'。富含维生素D、B12及铁元素，有助于美容养颜、保护视力和提升免疫力。",
    reviews: [MOCK_REVIEWS[0], MOCK_REVIEWS[2]]
  },
  {
    id: "scallop-01",
    name: "北海道特大带子",
    description: "日本原产，刺身级品质。肉质紧实甘甜，每一口都是大海的味道。",
    price: 388,
    unit: "一盒 (1kg)",
    image: "https://picsum.photos/id/305/800/600",
    tags: ["刺身", "甘甜", "家庭常备"],
    stock: 20,
    category: 'shell',
    origin: "日本北海道",
    cookingMethod: "推荐做法：\n1. 刺身：自然解冻后切片直接食用。\n2. 黄油香煎：平底锅融化黄油，大火双面各煎30秒，撒少许黑胡椒，内里保持半生口感最佳。",
    nutrition: "高蛋白低脂肪，含有丰富的牛磺酸，有助于降低胆固醇和血压，缓解疲劳。亦含有丰富的锌元素。",
    reviews: MOCK_REVIEWS
  },
  {
    id: "lobster-01",
    name: "波士顿鲜活龙虾",
    description: "肉质Q弹紧致，这对大钳子里的肉最是鲜美。适合芝士焗或葱姜炒。",
    price: 268,
    unit: "每只 (约600g)",
    image: "https://picsum.photos/id/535/800/600",
    tags: ["鲜活", "Q弹", "性价比"],
    stock: 15,
    category: 'crab_shrimp',
    origin: "加拿大北大西洋",
    cookingMethod: "推荐做法：\n1. 芝士焗龙虾：对半切开，铺上马苏里拉芝士，烤箱200度烤15分钟。\n2. 葱姜炒：切块裹粉油炸锁水，再爆香葱姜翻炒，加入料酒提鲜。",
    nutrition: "含有丰富的虾红素（强效抗氧化剂），蛋白质含量高，肌纤维细嫩，易于消化吸收，非常适合儿童和老人食用。",
    isLive: true
  },
  {
    id: "abalone-01",
    name: "澳洲野生黑边鲍鱼",
    description: "顶级干鲍原料，鲜食同样出色。口感劲道，鲍味浓郁。",
    price: 1580,
    unit: "每只 (约400g)",
    image: "https://picsum.photos/id/674/800/600",
    tags: ["稀有", "滋补", "送礼"],
    stock: 3,
    category: 'shell',
    origin: "澳洲塔斯马尼亚",
    cookingMethod: "推荐做法：\n1. 刺身：切极薄片，冰镇食用，口感脆爽。\n2. 鲍汁捞饭：慢火煲煮8小时至软糯，淋上浓郁鲍汁。",
    nutrition: "中医认为鲍鱼滋阴补养，具有平肝潜阳的功效。现代医学证实其富含球蛋白和鲍灵素，能提高免疫力，对抗癌细胞有一定抑制作用。"
  },
  {
    id: "shrimp-01",
    name: "新西兰长寿鱼",
    description: "深海红宝石，肉质洁白细嫩，无细刺，非常适合老人小孩。",
    price: 188,
    unit: "一条 (约800g)",
    image: "https://picsum.photos/id/111/800/600",
    tags: ["健康", "细嫩", "家庭"],
    stock: 12,
    category: 'fish',
    origin: "新西兰深海",
    cookingMethod: "推荐做法：\n清蒸。鱼身抹少许盐和料酒，放姜片，水开蒸8-10分钟，取出倒掉腥水，铺上葱丝，淋蒸鱼豉油和热油即可。",
    nutrition: "低脂肪、低胆固醇，富含多种维生素和微量元素。因生长在深海，受污染极少，肉质纯净，是非常优质的蛋白质来源。"
  },
  {
    id: "salmon-01",
    name: "法罗群岛三文鱼",
    description: "来自北大西洋纯净海域，生食级品质，纹理清晰，口感丰腴。",
    price: 158,
    unit: "500g",
    image: "https://picsum.photos/id/82/800/600",
    tags: ["刺身", "热门", "鲜嫩"],
    stock: 30,
    category: 'fish',
    origin: "法罗群岛",
    cookingMethod: "推荐做法：\n1. 刺身：厚切食用，搭配柠檬汁。\n2. 香煎：撒海盐黑胡椒腌制，平底锅煎至表面金黄，内部粉红，保留汁水。",
    nutrition: "富含Omega-3不饱和脂肪酸，有助于大脑发育和视力保护，被称为'深海黄金'。同时含有丰富的维生素D和硒。"
  },
  {
    id: "spot-prawn-01",
    name: "加拿大牡丹虾",
    description: "虾中贵族，色泽艳丽，肉质香甜软糯，含有丰富的虾红素。",
    price: 450,
    unit: "1kg (约20-25只)",
    image: "https://picsum.photos/id/231/800/600",
    tags: ["刺身", "清甜", "网红"],
    stock: 8,
    category: 'crab_shrimp',
    origin: "加拿大温哥华",
    cookingMethod: "推荐做法：\n绝对推荐刺身！剥壳后直接食用，体验极致的鲜甜。虾头富含虾黄，可撒淀粉炸至酥脆，撒椒盐当下酒菜。",
    nutrition: "虾青素含量极高（抗氧化能力是维生素E的500倍），蛋白质丰富，且含有丰富的钙质，有助于骨骼健康。"
  }
];

// --- AUTO GENERATED POSTS FROM CATALOG ---
const MOCK_AUTHORS = [
    { name: '魏来主厨', avatar: 'https://api.iconify.design/lucide:chef-hat.svg?color=%23f59e0b' },
    { name: '海鲜品鉴官', avatar: 'https://api.iconify.design/lucide:star.svg?color=%23f59e0b' },
    { name: '魏来优选', avatar: 'https://api.iconify.design/lucide:heart.svg?color=%23f59e0b' },
    { name: '寻味达人', avatar: 'https://api.iconify.design/lucide:utensils.svg?color=%23f59e0b' }
];

const MOCK_COMMENTS_POOL = [
    '看着也太有食欲了！🤤', '上次买了一只，确实肉很满，好评！', '避风塘做法学到了，这就去试试。',
    '比店里便宜太多了，性价比无敌。', '真的很甜！而且虾头炸一下特别香。', '这个纹理绝了，看着就像A5和牛。',
    '发货很快，第二天就收到了。', '家里老人都很喜欢吃，很嫩。', '已经回购第三次了。', '包装很高大上，送人很有面子。'
];

const POST_TITLES = [
    (name: string) => `🔥 ${name}的神仙吃法，一口入魂！`,
    (name: string) => `教你做${name}，比米其林还好吃`,
    (name: string) => `📦 沉浸式开箱：${name}真实测评`,
    (name: string) => `家宴硬菜推荐：${name}，太有面子了`,
    (name: string) => `无限回购的${name}，鲜掉眉毛🤤`,
    (name: string) => `这就是${name}的天花板吗？爱了爱了`
];

export const INITIAL_POSTS: Post[] = SEAFOOD_CATALOG.map((product, index) => {
    // Deterministic pseudo-random generation
    const author = MOCK_AUTHORS[index % MOCK_AUTHORS.length];
    const likes = 50 + (index * 17) % 300;
    const commentCount = 1 + (index % 3);
    const comments = [];
    
    for(let i=0; i<commentCount; i++) {
        comments.push({
            id: `c-${product.id}-${i}`,
            userName: ['小馋猫', '日料控', '家庭煮夫', 'Lisa', 'Summer', '老饕客'][ (index + i) % 6 ],
            avatar: '',
            content: MOCK_COMMENTS_POOL[ (index * 2 + i) % MOCK_COMMENTS_POOL.length ],
            date: ['刚刚', '10分钟前', '1小时前', '昨天'][i % 4]
        });
    }

    const titleGenerator = POST_TITLES[index % POST_TITLES.length];
    const shortDesc = product.description.length > 40 ? product.description.substring(0, 40) + '...' : product.description;
    const cookingTip = product.cookingMethod ? product.cookingMethod.substring(0, 60).replace(/\n/g, ' ') : '建议清蒸保留原味';
    
    const content = `${shortDesc}\n\n👉 为什么推荐：\n源头直采，品质保证。${product.tags.join(' / ')}。\n\n👨‍🍳 推荐做法：\n${cookingTip}...\n\n喜欢的宝宝们赶紧冲！🛒`;

    return {
        id: `post-${product.id}`,
        productId: product.id,
        title: titleGenerator(product.name),
        content: content,
        image: product.image,
        author: author,
        likes: likes,
        isLiked: index % 3 === 0,
        comments: comments
    };
});
