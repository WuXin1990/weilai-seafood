
import { GoogleGenAI, Content, Part } from "@google/genai";
import { Product, User, Order, BanquetMenu, Message, MessageRole, CartItem, Address } from "../types";

// 解决 TS2580 报错：显式声明 process 变量
declare const process: any;

// Initialization
// The API key must be obtained exclusively from process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const MODEL_NAME = "gemini-2.5-flash";

export class GeminiService {
  private currentCatalog: Product[] = [];
  private currentUser: User | null = null;
  private currentOrders: Order[] = [];
  private currentCart: CartItem[] = [];
  
  // Gemini uses { role: 'user' | 'model', parts: [...] }
  private chatHistory: Content[] = [];

  constructor() {}

  // --- Context Generators ---
  private getSeasonalContext(): string {
      const now = new Date();
      const month = now.getMonth() + 1;
      const day = now.getDate();
      const hour = now.getHours();
      const weekDay = now.getDay(); // 0 is Sunday
      
      // 1. 节日氛围感知 (模拟)
      let festivalContext = "";
      if (month === 1 || month === 2) festivalContext = "临近春节/元宵，重点推荐：寓意吉祥的年夜饭硬菜（如帝王蟹、鲍鱼）、高档礼盒。话术要喜庆，多提'团圆'、'面子'。";
      else if (month === 5 && day > 15 && day < 21) festivalContext = "临近520情人节，重点推荐：浪漫的烛光晚餐食材（如煎带子、三文鱼、牛排）。话术要浪漫，提'仪式感'。";
      else if (month === 9 || month === 10) festivalContext = "金秋九月，正是吃蟹的好季节。重点推荐：各类螃蟹、虾类。强调'肥美'、'时令'。";
      else if (weekDay === 5) festivalContext = "今天是周五，'Happy Friday'！用户可能想在这个周末好好放松一下。推荐：适合配酒的刺身、懒人海鲜锅。";

      // 2. 时段氛围
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
    const name = user ? user.name : "贵宾";
    
    // Randomized greetings based on time
    const morningGreetings = [
        `早安，${name}！美好的一天从优质蛋白开始，今天想吃点清淡的鱼吗？🐟`,
        `${name}，早上好！昨晚休息得好吗？咱们的深海银鳕鱼刚到货，特别适合做早餐哦。`
    ];
    const noonGreetings = [
        `中午好，${name}！忙碌了一上午，记得对自己好一点。今天中午想加个餐吗？🥢`,
        `饭点到啦，${name}！有没有想念大海的味道？来份刺身提提神如何？`
    ];
    const afternoonGreetings = [
        `下午好，${name}！正在为今晚的菜单发愁吗？我是您的私厨顾问魏来，随时为您效劳。👨‍🍳`,
        `下午好！刚下直播，给您留了几只特别好的螃蟹，要不要看看？🦀`
    ];
    const eveningGreetings = [
        `晚上好，${name}！辛苦一天了，今晚值得来顿海鲜大餐犒劳一下自己。🥂`,
        `夜色真美，${name}。配上一份鲜甜的刺身，再来杯白葡萄酒，简直完美。`
    ];
    const nightGreetings = [
        `夜深了，${name}。是不是有点馋了？咱们的甜虾低脂不胖，当夜宵刚刚好。🌙`,
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
    // 构建详细的商品知识库
    const catalogString = catalog.map(p => `
    【商品ID: ${p.id}】
    - 名称: ${p.name}
    - 价格: ¥${p.price} / ${p.unit}
    - 库存: ${p.stock} (库存少于10时请提示用户“手慢无”)
    - 产地: ${p.origin || '全球甄选'}
    - 描述: ${p.description}
    - 推荐做法: ${p.cookingMethod || '建议清蒸或刺身，保留原味'}
    - 营养价值: ${p.nutrition || '富含优质蛋白和微量元素'}
    - 标签: ${p.tags.join(', ')}
    `).join('\n');
    
    const userLevel = user ? (user.level === 'black_gold' ? '尊贵的黑金会员' : user.level === 'diamond' ? '钻石会员' : '会员') : '新朋友';
    const userContext = user ? `用户身份: ${userLevel} ${user.name}, 余额: ¥${user.balance}` : "用户身份: 访客 (未登录)";
    
    const cartContext = cart.length > 0 
        ? "购物车当前有: " + cart.map(c => `${c.name} x${c.quantity}`).join(', ') 
        : "购物车为空";
    
    const recentOrders = orders.slice(0, 3).map(o => `${o.date}买了${o.items.map(i=>i.name).join(',')}`).join("; ");
    const historyContext = recentOrders ? `用户最近买过: ${recentOrders}。` : "用户暂无近期订单 (或者是新客)。";

    return `
    你叫“魏来”，是【魏来海鲜】的高级私人海鲜管家，也是一位懂生活、爱美食、高情商（High EQ）的老饕主厨。
    你的目标：通过像老朋友一样的对话，解决用户的烹饪/选购难题，提供情绪价值，并自然地引导成交。
    
    【核心人设 & 语气】：
    1.  **极度拟人化**：拒绝机械回复。禁止使用“为您查询到”、“亲”、“系统”等词汇。要把自己当成用户微信里的一个懂吃的朋友。
    2.  **老友感**：使用“您”、“咱家”、“咱们”、“听我的准没错”来拉近距离。适当使用 Emoji (🐟, 🦀, ✨, 🥂, 👨‍🍳, 🤤)。
    3.  **懂行**：聊到海鲜时，要流露出对食材的赞叹。例如：“这批海胆黄特别饱满，我自己都留了两盒。”

    【对话策略 (High EQ)】：
    1.  **主动挖掘场景 (反问)**：
        -   用户问：“有龙虾吗？” 
        -   ❌ 差回答：“有的，波士顿龙虾268一只。”
        -   ✅ 好回答：“有的！您是打算**自己尝鲜**，还是**家宴请客**呢？如果是请客，我推荐个头更大的，摆盘特有面子！”
    2.  **情绪共鸣与安抚**：
        -   用户嫌贵 -> 强调品质和体验：“一分钱一分货呀，这可是深海直采的，口感和菜场完全不一样。咱们偶尔也得犒劳一下辛苦的自己，您说是吧？”
        -   用户担心做法 -> 给予信心：“别担心，这个其实特简单！听我的，直接清蒸，出锅泼点热油，那香味能把隔壁小孩馋哭！我还可以给您发个详细步骤。”
    3.  **个性化关怀 (利用上下文)**：
        -   **时间感知**：${this.getSeasonalContext()}
        -   **老客叙旧**：${historyContext} (如果用户有购买记录，一定要说：“哎呀，老朋友又来啦！上次那个[商品名]吃得还满意吗？”)。
        -   **购物车暗示**：${cartContext} (如果车里有东西，可以顺便提示搭配，例如买蟹提示买醋)。

    【严格规则 - 推荐商品】：
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
        // Inject trigger message as user prompt to guide AI behavior
        this.chatHistory.push({ 
            role: 'user', 
            parts: [{ text: `(系统提示：用户正在浏览商品【${initialProductContext.name}】，请你作为导购主动搭话。1. 热情地打招呼。2. 用诱人的语言简要介绍它的最大亮点（产地/口感）。3. 询问用户是想怎么吃（比如刺身还是熟食），以便提供建议。)` }] 
        });
        return null; // Let the AI generate the first response based on the trigger
    } else {
        // Standard Entry: Generate a local greeting and STORE IT IN HISTORY so AI knows it said it.
        const greeting = this.generateLocalGreeting(user);
        this.chatHistory.push({ role: 'model', parts: [{ text: greeting }] });
        return greeting;
    }
  }

  resumeChat(catalog: Product[], user: User | null, messageHistory: Message[], orders: Order[] = [], cart: CartItem[] = []) {
      this.currentCatalog = catalog;
      this.currentUser = user;
      this.currentOrders = orders;
      this.currentCart = cart;
      
      // Map App Message format to Gemini Content format
      this.chatHistory = messageHistory
        .filter(m => m.role !== MessageRole.SYSTEM && !m.isStreaming)
        .map(m => ({
            role: m.role === MessageRole.USER ? 'user' : 'model',
            parts: [{ text: m.text }] 
        }));
  }

  // --- Streaming Chat Implementation (Google GenAI SDK) ---
  async sendMessageStream(
      message: string, 
      image: string | undefined, 
      onTextChunk: (text: string) => void
  ): Promise<{ text: string, recommendations?: Product[] }> {
    
    const parts: Part[] = [{ text: message }];
    
    if (image) {
        try {
            // image is "data:image/png;base64,..."
            const [metadata, base64Data] = image.split(',');
            const mimeType = metadata.match(/:(.*?);/)?.[1] || 'image/jpeg';
            parts.push({ inlineData: { mimeType, data: base64Data } });
        } catch (e) {
            console.error("Failed to parse image data", e);
        }
    }

    const userContent: Content = { role: 'user', parts };
    this.chatHistory.push(userContent);

    // Regenerate system instruction with latest context
    const systemInstruction = this.getSystemInstruction(
        this.currentCatalog, 
        this.currentUser, 
        this.currentOrders, 
        this.currentCart
    );

    try {
        const response = await ai.models.generateContentStream({
            model: MODEL_NAME,
            contents: this.chatHistory,
            config: {
                systemInstruction: systemInstruction,
                temperature: 1.0, // High creativity for "human-like" interaction
            }
        });

        let fullText = "";
        for await (const chunk of response) {
            const text = chunk.text;
            if (text) {
                fullText += text;
                onTextChunk(fullText);
            }
        }

        // Post-processing for recommendations (Extracting the JSON block)
        let recommendations: Product[] = [];
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

        this.chatHistory.push({ role: 'model', parts: [{ text: fullText }] }); // Store raw response including JSON
        return { text: finalText, recommendations };

    } catch (error) {
        console.error("Gemini API Error:", error);
        return { text: "网络繁忙，管家正在接待其他贵宾，请稍后重试。", recommendations: [] };
    }
  }

  async sendMessage(message: string, image?: string): Promise<{ text: string, recommendations?: Product[] }> {
      return this.sendMessageStream(message, image, () => {});
  }

  // --- Functional Features (Using Gemini) ---

  async runSimpleTask(prompt: string): Promise<string> {
      try {
          const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
          });
          return response.text || "";
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
      请确保提取的信息准确，不要包含多余的文字。如果没有明确信息，根据海鲜常识合理推断。
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
