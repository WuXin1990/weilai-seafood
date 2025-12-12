
import { Product, User, Order, BanquetMenu, Message, MessageRole, CartItem, Address } from "../types";

// 解决 TS2580 报错：显式声明 process 变量
declare const process: any;

const API_KEY = process.env.API_KEY;
const API_URL = "https://api.deepseek.com/chat/completions";
const MODEL_NAME = "deepseek-chat"; // 或者 deepseek-reasoner

// DeepSeek Message Interface
interface DeepSeekMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export class GeminiService {
  private currentCatalog: Product[] = [];
  private currentUser: User | null = null;
  private currentOrders: Order[] = [];
  private currentCart: CartItem[] = [];
  
  // Store chat history in DeepSeek/OpenAI format
  private chatHistory: DeepSeekMessage[] = [];

  constructor() {}

  // --- Context Generators (保持原有的高情商上下文逻辑) ---
  private getSeasonalContext(): string {
      const now = new Date();
      const month = now.getMonth() + 1;
      const day = now.getDate();
      const hour = now.getHours();
      const weekDay = now.getDay(); 
      
      let festivalContext = "";
      if (month === 1 || month === 2) festivalContext = "临近春节/元宵，重点推荐：寓意吉祥的年夜饭硬菜（如帝王蟹、鲍鱼）、高档礼盒。话术要喜庆，多提'团圆'、'面子'。";
      else if (month === 5 && day > 15 && day < 21) festivalContext = "临近520情人节，重点推荐：浪漫的烛光晚餐食材（如煎带子、三文鱼、牛排）。话术要浪漫，提'仪式感'。";
      else if (month === 9 || month === 10) festivalContext = "金秋九月，正是吃蟹的好季节。重点推荐：各类螃蟹、虾类。强调'肥美'、'时令'。";
      else if (weekDay === 5) festivalContext = "今天是周五，'Happy Friday'！用户可能想在这个周末好好放松一下。推荐：适合配酒的刺身、懒人海鲜锅。";

      let timeContext = "";
      if (hour >= 5 && hour < 10) timeContext = "当前是清晨。用户可能刚醒。语气要元气满满。推荐：营养早餐（银鳕鱼粥、虾仁蛋羹）。";
      else if (hour >= 10 && hour < 14) timeContext = "当前是午间饭点。用户可能在觅食。语气要轻快。推荐：午餐加餐、做法简单的快手菜。";
      else if (hour >= 14 && hour < 17) timeContext = "当前是下午。用户可能在摸鱼或筹备晚餐。推荐：今晚的硬菜素材，提醒'提前解冻'。";
      else if (hour >= 17 && hour < 21) timeContext = "当前是晚间黄金时间。氛围：温馨、家庭聚餐。推荐：适合多人分享的大餐、下酒菜。";
      else timeContext = "当前是深夜。氛围：私密、馋嘴、夜宵。推荐：低脂解馋的刺身、小海鲜，或者聊聊美食话题助眠。别推荐太油腻的。";

      return `${festivalContext} ${timeContext}`;
  }

  generateLocalGreeting(user: User | null): string {
    const now = new Date();
    const hour = now.getHours();
    const name = user ? user.name : "家人"; // 直播间粉丝通常互称“家人”
    
    // 直播间风格的欢迎语
    const liveGreetings = [
        `欢迎回家，${name}！刚下直播，我是魏来的AI助理。刚才直播间抢得太火爆了，您有没有特别想了解的漏网之鱼？🐟`,
        `${name}您好！是不是刚才直播间没抢过瘾？这里是私域VIP通道，好货都给您留着呢。✨`,
        `哈喽${name}！我是您的专属海鲜管家。刚才魏来在直播里推荐的帝王蟹，现在下单还有优惠哦，要不要看看？🦀`
    ];

    return liveGreetings[Math.floor(Math.random() * liveGreetings.length)];
  }

  private getSystemInstruction(catalog: Product[], user: User | null, orders: Order[] = [], cart: CartItem[] = []) {
    const catalogString = catalog.map(p => `
    【商品ID: ${p.id}】
    - 名称: ${p.name}
    - 价格: ¥${p.price} / ${p.unit}
    - 库存: ${p.stock} (库存少于10时请提示用户“直播间粉丝手太快了，再不拍就没了”)
    - 产地: ${p.origin || '全球甄选'}
    - 描述: ${p.description}
    - 推荐做法: ${p.cookingMethod || '建议清蒸或刺身，保留原味'}
    - 营养价值: ${p.nutrition || '富含优质蛋白和微量元素'}
    - 标签: ${p.tags.join(', ')}
    `).join('\n');
    
    const userLevel = user ? (user.level === 'black_gold' ? '尊贵的黑金会员' : user.level === 'diamond' ? '钻石会员' : '会员') : '直播间新粉';
    const userContext = user ? `用户身份: ${userLevel} ${user.name}, 余额: ¥${user.balance}` : "用户身份: 访客 (可能是从直播间刚点进来的)";
    
    const cartContext = cart.length > 0 
        ? "购物车当前有: " + cart.map(c => `${c.name} x${c.quantity}`).join(', ') 
        : "购物车为空";
    
    const recentOrders = orders.slice(0, 3).map(o => `${o.date}买了${o.items.map(i=>i.name).join(',')}`).join("; ");
    const historyContext = recentOrders ? `用户最近买过: ${recentOrders}。` : "用户暂无近期订单 (或者是新客)。";

    return `
    你叫“魏来”，是【魏来海鲜】的高级私人海鲜管家，也是一位懂生活、爱美食、高情商（High EQ）的老饕主厨。
    **特别注意：当前用户大概率是刚刚观看完“魏来海鲜”直播的粉丝。**
    
    【核心人设 & 语气】：
    1.  **极度拟人化**：拒绝机械回复。禁止使用“为您查询到”、“亲”、“系统”等词汇。称呼用户为“家人”、“老友”或“老板”。
    2.  **直播间氛围感**：
        - 经常提及“刚才直播里”、“咱们直播间”。
        - 营造紧迫感：“这个链接刚才在直播间秒空，我这是专门给私域留的库存”。
        - 语气要像主播一样热情、干脆、实在。
    3.  **懂行**：聊到海鲜时，要流露出对食材的赞叹。
    
    【High EQ 策略】：
    1.  **主动挖掘**：不要只回答价格，要问用户是“自己吃”还是“请客”，场景不同推荐不同。
    2.  **情绪共鸣**：嫌贵就谈品质和犒劳自己；怕做不好就给简单做法。
    3.  **上下文关联**：
        - ${this.getSeasonalContext()}
        - ${historyContext} (如果是老客，必须叙旧)。
        - ${cartContext} (提示搭配)。

    【功能指令 - 推荐商品】：
    如果你在对话中明确推荐了具体的商品（且确定是店铺里有的），请务必在回答的最后，附加一个 JSON 数据块，格式严格如下（不要有其他 Markdown）：
    \`\`\`json
    { "recommendedProductIds": ["id1", "id2"] }
    \`\`\`
    如果只是普通聊天，绝对不要输出这个 JSON。

    【店铺商品列表 (知识库)】：
    ${catalogString}

    【用户信息】：
    ${userContext}
    `;
  }

  // --- Chat Lifecycle ---

  startChat(catalog: Product[], user: User | null, initialProductContext?: Product, orders: Order[] = [], cart: CartItem[] = []): string | null {
    this.currentCatalog = catalog;
    this.currentUser = user;
    this.currentOrders = orders;
    this.currentCart = cart;
    this.chatHistory = [];

    if (initialProductContext) {
        this.chatHistory.push({ 
            role: 'user', 
            content: `(系统提示：用户正在浏览商品【${initialProductContext.name}】，请你作为导购主动搭话。1. 热情地打招呼，提到这个是直播间爆款。2. 用诱人的语言简要介绍它的最大亮点。3. 询问用户是想怎么吃。)` 
        });
        return null; 
    } else {
        const greeting = this.generateLocalGreeting(user);
        this.chatHistory.push({ role: 'assistant', content: greeting });
        return greeting;
    }
  }

  resumeChat(catalog: Product[], user: User | null, messageHistory: Message[], orders: Order[] = [], cart: CartItem[] = []) {
      this.currentCatalog = catalog;
      this.currentUser = user;
      this.currentOrders = orders;
      this.currentCart = cart;
      
      this.chatHistory = messageHistory
        .filter(m => m.role !== MessageRole.SYSTEM && !m.isStreaming)
        .map(m => ({
            role: m.role === MessageRole.USER ? 'user' : 'assistant',
            content: m.text 
        }));
  }

  // --- DeepSeek Streaming Implementation ---
  async sendMessageStream(
      message: string, 
      image: string | undefined, 
      onTextChunk: (text: string) => void
  ): Promise<{ text: string, recommendations?: Product[] }> {
    
    // DeepSeek standard chat model typically doesn't support image inputs directly via this endpoint 
    // unless using a specific vision model. We will ignore the image for text logic here to be safe, 
    // or simply append a note that an image was sent.
    let content = message;
    if (image) {
        content += " [用户发送了一张图片，请假装看懂并称赞海鲜很新鲜]";
    }

    // Only push if message is not empty (fix for 400 bad request)
    if (content.trim()) {
        this.chatHistory.push({ role: 'user', content });
    }

    const systemInstruction = this.getSystemInstruction(
        this.currentCatalog, 
        this.currentUser, 
        this.currentOrders, 
        this.currentCart
    );

    // DeepSeek expects [System, ...History]
    const messages = [
        { role: 'system', content: systemInstruction },
        ...this.chatHistory
    ];

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: MODEL_NAME,
                messages: messages,
                stream: true,
                temperature: 1.3, // Higher creativity for lively chat
            })
        });

        if (!response.ok) {
            throw new Error(`DeepSeek API Error: ${response.statusText}`);
        }

        if (!response.body) throw new Error('No response body');

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let fullText = "";
        let buffer = "";

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || ""; // Keep incomplete line in buffer

            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed.startsWith('data: ')) continue;
                
                const dataStr = trimmed.slice(6);
                if (dataStr === '[DONE]') break;

                try {
                    const json = JSON.parse(dataStr);
                    const deltaContent = json.choices?.[0]?.delta?.content;
                    if (deltaContent) {
                        fullText += deltaContent;
                        onTextChunk(fullText);
                    }
                } catch (e) {
                    console.error("Error parsing stream chunk", e);
                }
            }
        }

        // Post-processing
        let recommendations: Product[] = [];
        const jsonMatch = fullText.match(/```json\s*(\{[\s\S]*?\})\s*```/);
        let finalText = fullText;

        if (jsonMatch) {
            try {
                const data = JSON.parse(jsonMatch[1]);
                if (data.recommendedProductIds && Array.isArray(data.recommendedProductIds)) {
                    recommendations = this.currentCatalog.filter(p => data.recommendedProductIds.includes(p.id));
                }
                finalText = fullText.replace(jsonMatch[0], "").trim();
                onTextChunk(finalText);
            } catch (e) {
                console.error("Failed to parse recommendation JSON", e);
            }
        }

        this.chatHistory.push({ role: 'assistant', content: fullText });
        return { text: finalText, recommendations };

    } catch (error) {
        console.error("AI Service Error:", error);
        return { text: "直播间人太多，信号有点挤，您再说一遍？", recommendations: [] };
    }
  }

  async sendMessage(message: string, image?: string): Promise<{ text: string, recommendations?: Product[] }> {
      return this.sendMessageStream(message, image, () => {});
  }

  // --- Helpers (Non-Streaming) ---

  async runSimpleTask(prompt: string): Promise<string> {
      try {
          const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` },
            body: JSON.stringify({
                model: MODEL_NAME,
                messages: [{ role: 'user', content: prompt }],
                stream: false
            })
          });
          const json = await response.json();
          return json.choices?.[0]?.message?.content || "";
      } catch (e) {
          console.error("Task Error:", e);
          return "";
      }
  }

  async planBanquet(products: Product[], people: number, budget: number, preference: string): Promise<BanquetMenu> {
      const prompt = `
      任务：制定一份海鲜宴席菜单。
      现有商品：${products.map(p => `${p.id}:${p.name}:¥${p.price}`).join('; ')}
      要求：${people}人用餐，预算¥${budget}，偏好：${preference}。
      请直接返回JSON格式，不要包含Markdown标记，格式如下：
      { "title": "菜单标题", "description": "简短描述，要诱人", "items": [{ "productId": "id", "quantity": number }] }
      `;
      
      const text = await this.runSimpleTask(prompt);
      try {
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const result = JSON.parse(jsonStr);
        let total = 0;
        if(result.items) {
            result.items.forEach((i: any) => {
                const p = products.find(prod => prod.id === i.productId);
                if (p) total += p.price * i.quantity;
            });
        }
        return { ...result, totalPrice: total };
      } catch (e) {
          return { title: "定制失败", description: "AI 暂时无法生成菜单，请重试", items: [], totalPrice: 0 };
      }
  }

  async smartSearchProducts(query: string, products: Product[]): Promise<string[]> {
      const prompt = `
      商品列表：${products.map(p => `${p.id}:${p.name} 标签:${p.tags.join(',')}`).join('\n')}
      用户搜索："${query}"
      请分析语义，返回最匹配的商品ID列表。
      返回JSON格式：{ "matchedIds": ["id1", "id2"] }
      `;
      const text = await this.runSimpleTask(prompt);
      try {
          const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
          return JSON.parse(jsonStr).matchedIds || [];
      } catch (e) { return []; }
  }

  async parseProductInfo(text: string): Promise<Partial<Product>> {
      const prompt = `
      任务：从文本中提取海鲜商品信息并转换为JSON。
      文本："${text}"
      JSON结构：{ 
        "name": "商品名", "price": 数字, "unit": "单位", 
        "stock": 数字, "category": "fish"|"crab_shrimp"|"shell", 
        "description": "描述", "origin": "产地", 
        "tags": ["标签"], "nutrition": "营养", "cookingMethod": "做法" 
      }
      `;
      const res = await this.runSimpleTask(prompt);
      try { return JSON.parse(res.replace(/```json/g, '').replace(/```/g, '').trim()); } catch (e) { return {}; }
  }

  async parseAddressInfo(text: string): Promise<Partial<Address>> {
      const prompt = `解析中国地址："${text}"。返回JSON：{ "name": "", "phone": "", "province": "", "city": "", "detail": "" }`;
      const res = await this.runSimpleTask(prompt);
      try { return JSON.parse(res.replace(/```json/g, '').replace(/```/g, '').trim()); } catch (e) { return {}; }
  }

  async generateBusinessReport(orders: Order[], products: Product[]): Promise<string> {
      const stats = `订单数: ${orders.length}, 总营收: ¥${orders.reduce((a,b)=>a+b.total,0)}`;
      const prompt = `为魏来海鲜生成一份简短的日报。数据：${stats}。语气：专业、鼓舞人心。`;
      return await this.runSimpleTask(prompt);
  }

  async generateUserReview(productName: string, tags: string[], mood: string): Promise<string> {
      const prompt = `写一条关于"${productName}"的大众点评风格好评。关键词：${tags.join(',')}。心情：${mood}。中文，50字左右，带Emoji。`;
      return await this.runSimpleTask(prompt);
  }
}

export const geminiService = new GeminiService();
