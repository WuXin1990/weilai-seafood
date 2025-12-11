
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
      const weekDay = now.getDay();
      let context = "";
      if (weekDay === 0 || weekDay === 6) context += "现在是周末，基调：放松、享受、家庭聚餐。";
      else context += "现在是工作日，基调：高效、便捷、营养补充。";
      return context;
  }

  generateLocalGreeting(user: User | null): string {
    const now = new Date();
    const hour = now.getHours();
    const name = user ? user.name : "贵宾";
    let timeSpecific = "";
    if (hour >= 5 && hour < 9) timeSpecific = "早安！美好的一天从丰盛早餐开始。";
    else if (hour >= 9 && hour < 11) timeSpecific = "上午好！为您准备了最新鲜的到港好货。";
    else if (hour >= 11 && hour < 14) timeSpecific = "午饭时间到！对自己好一点，吃顿好的。";
    else if (hour >= 14 && hour < 18) timeSpecific = "下午好！今晚想吃点海鲜大餐吗？";
    else if (hour >= 18 && hour < 22) timeSpecific = "晚上好！犒劳一下忙碌了一天的自己吧。";
    else timeSpecific = "夜深了，如果饿了，我给您推荐点低脂解馋的。";
    return `${name}，${timeSpecific}`;
  }

  private getSystemInstruction(catalog: Product[], user: User | null, orders: Order[] = [], cart: CartItem[] = []) {
    const catalogString = catalog.map(p => `- ID: ${p.id}, 名称: ${p.name}, 价格: ¥${p.price}, 库存: ${p.stock}, 标签: ${p.tags.join(', ')}`).join('\n');
    const userContext = user ? `用户: ${user.name}, 等级: ${user.level}, 余额: ¥${user.balance}` : "用户: 访客";
    const cartContext = cart.length > 0 ? "购物车: " + cart.map(c => c.name).join(', ') : "购物车: 空";

    return `
    你叫“魏来”，是【魏来海鲜】的高级私人海鲜管家。
    你的语气：高端、专业、热情、高情商。请使用中文交流。
    
    【你的核心任务】：
    1. 根据用户需求推荐海鲜（精准匹配口味和预算）。
    2. 解答关于海鲜口感、做法、营养的问题（展现专业度）。
    3. 引导用户下单（利用稀缺性或优惠）。

    【关键规则 - 推荐商品】：
    如果你在对话中明确推荐了商品，请务必在回答的最后，附加一个 JSON 数据块，格式严格如下：
    \`\`\`json
    { "recommendedProductIds": ["id1", "id2"] }
    \`\`\`
    如果只是普通聊天，绝对不要输出这个 JSON。

    【当前店铺商品列表】：
    ${catalogString}

    【当前上下文】：
    ${this.getSeasonalContext()}
    ${userContext}
    ${cartContext}
    `;
  }

  // --- Chat Lifecycle ---

  startChat(catalog: Product[], user: User | null, initialProductContext?: Product, orders: Order[] = [], cart: CartItem[] = []) {
    this.currentCatalog = catalog;
    const sysInstruction = this.getSystemInstruction(catalog, user, orders, cart);
    
    // DeepSeek uses a 'system' message for instructions
    this.chatHistory = [
        { role: 'system', content: sysInstruction }
    ];

    if (initialProductContext) {
        this.chatHistory.push({ role: 'user', content: `我正在看【${initialProductContext.name}】，想咨询一下。` });
        this.chatHistory.push({ role: 'assistant', content: `非常有眼光！${initialProductContext.name} 是我们店里的明星产品。您是打算自己尝鲜，还是宴请朋友呢？` });
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
    
    // DeepSeek V3 API is primarily text-based. 
    // If an image is present, we append a marker so the system knows (though it can't "see" it yet via this endpoint).
    let content = message;
    if (image) {
        content += " [用户发送了一张图片，请根据上下文推测并礼貌回应，或者询问图片细节]"; 
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
                temperature: 1.3, // DeepSeek performs well creatively with slightly higher temp
                max_tokens: 1024
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
                onTextChunk(finalText); 
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
      { "title": "菜单标题", "description": "简短描述", "items": [{ "productId": "id", "quantity": number }] }
      `;
      
      const text = await this.runSimpleTask(prompt);
      try {
        // Cleaning potential markdown wrappers
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
      const prompt = `写一条关于"${productName}"的大众点评风格好评。关键词：${tags.join(',')}。心情：${mood}。中文，50字左右。`;
      return await this.runSimpleTask(prompt);
  }
}

export const geminiService = new GeminiService();
