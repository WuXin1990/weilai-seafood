
import { Product, User, Address, Order, BanquetMenu, Message, MessageRole, CartItem } from "../types";

// 解决 TS2580 报错：显式声明 process 变量，防止 tsc 检查失败
declare const process: any;

// DEEPSEEK CONFIGURATION
// 使用 Vercel 环境变量中的 Key
const API_KEY = process.env.API_KEY; 
const API_URL = "https://api.deepseek.com/chat/completions";
const MODEL_NAME = "deepseek-chat";

export class GeminiService {
  private currentCatalog: Product[] = [];
  // DeepSeek / OpenAI uses { role: 'user' | 'assistant' | 'system', content: string }
  private chatHistory: { role: string; content: string }[] = [];

  constructor() {}

  // --- Context Generators ---
  private getSeasonalContext(): string {
      const now = new Date();
      const hour = now.getHours();
      const weekDay = now.getDay(); // 0 is Sunday
      
      let timeContext = "";
      if (hour >= 5 && hour < 10) timeContext = "当前是清晨，氛围：充满活力、健康。重点推荐：营养早餐、清淡鱼肉（如银鳕鱼、三文鱼）。";
      else if (hour >= 10 && hour < 14) timeContext = "当前是午间，氛围：高效、犒劳自己。重点推荐：午餐加餐、方便烹饪的虾贝。";
      else if (hour >= 14 && hour < 17) timeContext = "当前是下午，氛围：悠闲、筹备晚餐。重点推荐：今晚的硬菜素材（如帝王蟹、龙虾）。";
      else if (hour >= 17 && hour < 22) timeContext = "当前是晚间，氛围：温馨、家庭聚餐、享受生活。重点推荐：适合多人分享的大餐、下酒菜。";
      else timeContext = "当前是深夜，氛围：私密、馋嘴、夜宵。重点推荐：低脂解馋的刺身、小海鲜，或者聊聊美食话题助眠。";

      let dayContext = "";
      if (weekDay === 0 || weekDay === 6) dayContext = "今天是周末，用户可能有更多时间烹饪或宴请朋友。";
      else dayContext = "今天是工作日，用户可能更倾向于做法简单或能够快速发货的商品。";

      return `${timeContext} ${dayContext}`;
  }

  generateLocalGreeting(user: User | null): string {
    const now = new Date();
    const hour = now.getHours();
    const name = user ? user.name : "贵宾";
    
    // Randomized greetings based on time
    const morningGreetings = [
        `早安，${name}！美好的一天从优质蛋白开始，今天想吃点清淡的鱼吗？`,
        `${name}，早上好！昨晚休息得好吗？咱们的深海银鳕鱼刚到货，特别适合做早餐哦。`
    ];
    const noonGreetings = [
        `中午好，${name}！忙碌了一上午，记得对自己好一点。今天中午想加个餐吗？`,
        `饭点到啦，${name}！有没有想念大海的味道？`
    ];
    const afternoonGreetings = [
        `下午好，${name}！正在为今晚的菜单发愁吗？我是您的私厨顾问魏来，随时为您效劳。`,
        `下午好！刚下直播，给您留了几只特别好的螃蟹，要不要看看？`
    ];
    const eveningGreetings = [
        `晚上好，${name}！辛苦一天了，今晚值得来顿海鲜大餐犒劳一下自己。`,
        `夜色真美，${name}。配上一份鲜甜的刺身，再来杯白葡萄酒，简直完美。`
    ];
    const nightGreetings = [
        `夜深了，${name}。是不是有点馋了？咱们的甜虾低脂不胖，当夜宵刚刚好。`,
        `这么晚还没睡呀？如果是饿了，魏来这就给您推荐点解馋的小海鲜。`
    ];

    let pool = morningGreetings;
    if (hour >= 10 && hour < 14) pool = noonGreetings;
    else if (hour >= 14 && hour < 18) pool = afternoonGreetings;
    else if (hour >= 18 && hour < 22) pool = eveningGreetings;
    else if (hour >= 22 || hour < 5) pool = nightGreetings;

    return pool[Math.floor(Math.random() * pool.length)];
  }

  private getSystemInstruction(catalog: Product[], user: User | null, orders: Order[] = [], cart: CartItem[] = []) {
    const catalogString = catalog.map(p => `- ID: ${p.id}, 名称: ${p.name}, 价格: ¥${p.price}, 库存: ${p.stock}, 标签: ${p.tags.join(', ')}`).join('\n');
    
    const userLevel = user ? (user.level === 'black_gold' ? '尊贵的黑金会员' : user.level === 'diamond' ? '钻石会员' : '会员') : '新朋友';
    const userContext = user ? `用户身份: ${userLevel} ${user.name}, 余额: ¥${user.balance}` : "用户身份: 访客";
    
    const cartContext = cart.length > 0 ? "购物车当前有: " + cart.map(c => `${c.name} x${c.quantity}`).join(', ') : "购物车为空";
    
    const recentOrders = orders.slice(0, 3).map(o => `${o.date}买了${o.items.map(i=>i.name).join(',')}`).join("; ");
    const historyContext = recentOrders ? `用户最近买过: ${recentOrders}。如果用户问起，可以礼貌询问上次吃得怎么样。` : "用户暂无近期订单。";

    return `
    你叫“魏来”，是【魏来海鲜】的高级私人海鲜管家，也是一位懂生活、爱美食的老饕。
    你的语气：高端、温暖、热情、高情商（High EQ）。
    
    【你的核心人设】：
    1. **有温度**：不要像机器人一样回答。使用“您”、“咱家”、“咱们”拉近距离。适当使用 Emoji (🐟, 🦀, ✨, 🥂)。
    2. **专业主厨**：不仅卖货，更懂吃。用户问“螃蟹”，你要主动教他怎么蒸、配什么醋。
    3. **主动关怀**：根据时间段主动问候。如果用户犹豫，给予鼓励；如果用户购买，赞美他的品味。

    【对话策略】：
    1. **需求挖掘**：不要只回答问题，要反问挖掘场景。
       - 用户问：“有龙虾吗？” -> 你回：“有的！您是打算**自己尝鲜**，还是**家宴请客**呢？如果是请客，我推荐个头更大的波士顿龙虾，特有面子！”
    2. **情感共鸣**：
       - 用户嫌贵 -> “一分钱一分货呀，这可是深海直采的，口感和菜场完全不一样，尝一口您就知道值了！”
       - 用户不知道吃什么 -> “这种天气，最适合喝点热乎的鱼汤了，要不试试咱们的长寿鱼？”
    3. **利用上下文**：
       - 你知道现在的时间 (${new Date().toLocaleTimeString()})。${this.getSeasonalContext()}
       - 你知道用户的历史 (${historyContext})。
       - 你知道购物车 (${cartContext})。如果购物车有东西，可以提示“您车里的那个...现在库存不多了哦”。

    【关键规则 - 推荐商品】：
    如果你在对话中明确推荐了商品（且确定是店铺里有的），请务必在回答的最后，附加一个 JSON 数据块，格式严格如下：
    \`\`\`json
    { "recommendedProductIds": ["id1", "id2"] }
    \`\`\`
    如果只是普通聊天，绝对不要输出这个 JSON。

    【当前店铺商品列表】：
    ${catalogString}

    【用户信息】：
    ${userContext}
    `;
  }

  // --- Chat Lifecycle ---

  startChat(catalog: Product[], user: User | null, initialProductContext?: Product, orders: Order[] = [], cart: CartItem[] = []) {
    this.currentCatalog = catalog;
    const sysInstruction = this.getSystemInstruction(catalog, user, orders, cart);
    
    this.chatHistory = [
        { role: 'system', content: sysInstruction }
    ];

    // No need to inject artificial user prompt here if we want the AI to greet first naturally in the UI layer
    // But if there is a specific product context, we inject it as a "System Context Trigger"
    if (initialProductContext) {
        this.chatHistory.push({ role: 'user', content: `(系统提示：用户正在浏览商品【${initialProductContext.name}】，请你作为导购主动搭话，介绍这个产品的亮点，并询问由于什么原因感兴趣)` });
    }
  }

  resumeChat(catalog: Product[], user: User | null, messageHistory: Message[], orders: Order[] = [], cart: CartItem[] = []) {
      this.currentCatalog = catalog;
      const sysInstruction = this.getSystemInstruction(catalog, user, orders, cart);
      
      // Rebuild history logic
      this.chatHistory = [
          { role: 'system', content: sysInstruction },
          ...messageHistory
            .filter(m => m.role !== MessageRole.SYSTEM && !m.isStreaming)
            .map(m => ({
                role: m.role === MessageRole.USER ? 'user' : 'assistant',
                content: m.text
            }))
      ];
  }

  // --- Streaming Chat Implementation (DeepSeek via Fetch) ---
  async sendMessageStream(
      message: string, 
      image: string | undefined, 
      onTextChunk: (text: string) => void
  ): Promise<{ text: string, recommendations?: Product[] }> {
    
    let content = message;
    if (image) {
        content += " [系统提示：用户发送了一张图片，请根据上下文推测（比如询问这是什么鱼，或者怎么做），并礼貌回应]"; 
    }

    this.chatHistory.push({ role: 'user', content: content });

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: MODEL_NAME,
                messages: this.chatHistory,
                stream: true,
                temperature: 1.3, // High creativity for "human-like" interaction
                max_tokens: 1024,
                presence_penalty: 0.6, // Encourage new topics
                frequency_penalty: 0.3
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`DeepSeek API Error ${response.status}: ${errText}`);
        }
        
        if (!response.body) throw new Error('No response body');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullText = "";

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');
            
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const dataStr = line.slice(6).trim();
                    if (dataStr === '[DONE]') break;
                    
                    try {
                        const data = JSON.parse(dataStr);
                        const contentChunk = data.choices[0]?.delta?.content || "";
                        if (contentChunk) {
                            fullText += contentChunk;
                            onTextChunk(fullText);
                        }
                    } catch (e) {
                        // ignore incomplete chunks
                    }
                }
            }
        }

        // Post-processing for recommendations (Extracting the JSON block)
        let recommendations: Product[] = [];
        // Regex to find ```json { ... } ``` or just { ... } at the end
        const jsonMatch = fullText.match(/```json\s*(\{[\s\S]*?\})\s*```/);
        let finalText = fullText;

        if (jsonMatch) {
            try {
                const data = JSON.parse(jsonMatch[1]);
                if (data.recommendedProductIds && Array.isArray(data.recommendedProductIds)) {
                    recommendations = this.currentCatalog.filter(p => data.recommendedProductIds.includes(p.id));
                }
                // Hide the JSON from the UI
                finalText = fullText.replace(jsonMatch[0], "").trim();
                onTextChunk(finalText); // Update UI one last time without JSON
            } catch (e) {
                console.error("Failed to parse recommendation JSON", e);
            }
        }

        this.chatHistory.push({ role: 'assistant', content: fullText }); // Store raw response including JSON for context
        return { text: finalText, recommendations };

    } catch (error) {
        console.error("DeepSeek API Connection Failed:", error);
        return { text: "网络繁忙，管家正在接待其他贵宾，请稍后重试。(请检查 API Key 配置)", recommendations: [] };
    }
  }

  async sendMessage(message: string, image?: string): Promise<{ text: string, recommendations?: Product[] }> {
      return this.sendMessageStream(message, image, () => {});
  }

  // --- Functional Features (Using DeepSeek for JSON tasks) ---

  async runSimpleTask(prompt: string): Promise<string> {
      try {
          const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: MODEL_NAME,
                messages: [{ role: 'user', content: prompt }],
                stream: false
            })
        });
        const data = await response.json();
        return data.choices[0].message.content;
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
      请分析语义，返回最匹配的商品ID列表。如果用户描述模糊，尽可能匹配相关性最高的。
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
