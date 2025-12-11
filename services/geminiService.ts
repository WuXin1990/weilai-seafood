
import { Product, User, Comment, Address, Order, BanquetMenu, Message, MessageRole, CartItem } from "../types";

// --- DEEPSEEK CONFIGURATION ---
const API_KEY = "sk-bf8e496d37c34159ab01933d989a2238"; // User provided key
const API_URL = "https://api.deepseek.com/chat/completions"; 

export class GeminiService {
  private currentCatalog: Product[] = [];
  private messageHistory: any[] = [];

  constructor() {
    // API Key is hardcoded for simplicity as requested by user
  }

  // --- Helper: Standard Fetch Wrapper for DeepSeek ---
  private async callDeepSeek(messages: any[], jsonMode: boolean = false): Promise<string> {
      try {
          const response = await fetch(API_URL, {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${API_KEY}`
              },
              body: JSON.stringify({
                  model: "deepseek-chat",
                  messages: messages,
                  temperature: 1.1,
                  // DeepSeek supports json_object response format
                  response_format: jsonMode ? { type: "json_object" } : { type: "text" }
              })
          });

          if (!response.ok) {
              const err = await response.text();
              console.error("DeepSeek API Error:", err);
              throw new Error(`API Error: ${response.status}`);
          }

          const data = await response.json();
          return data.choices[0].message.content;
      } catch (error) {
          console.error("Network Error:", error);
          throw error;
      }
  }

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
    你的语气：高端、专业、热情、高情商。使用中文交流。
    
    【核心任务】：
    1. 根据用户需求推荐海鲜。
    2. 解答关于海鲜口感、做法、营养的问题。
    3. 引导用户下单。

    【推荐商品规则】：
    如果你在对话中明确推荐了商品，请务必在回答的最后，附加一个 JSON 数据块，格式严格如下：
    \`\`\`json
    { "recommendedProductIds": ["id1", "id2"] }
    \`\`\`
    如果只是普通聊天，不要输出这个 JSON。

    【当前店铺商品列表】：
    ${catalogString}

    【上下文】：
    ${this.getSeasonalContext()}
    ${userContext}
    ${cartContext}
    `;
  }

  // --- Chat Lifecycle ---

  startChat(catalog: Product[], user: User | null, initialProductContext?: Product, orders: Order[] = [], cart: CartItem[] = []) {
    this.currentCatalog = catalog;
    this.messageHistory = [
        { role: "system", content: this.getSystemInstruction(catalog, user, orders, cart) }
    ];

    if (initialProductContext) {
        this.messageHistory.push({ role: "user", content: `我正在看【${initialProductContext.name}】，想咨询一下。` });
        this.messageHistory.push({ role: "assistant", content: `非常有眼光！${initialProductContext.name} 是我们店里的明星产品。您是打算自己尝鲜，还是宴请朋友呢？` });
    }
  }

  resumeChat(catalog: Product[], user: User | null, messageHistory: Message[], orders: Order[] = [], cart: CartItem[] = []) {
      this.currentCatalog = catalog;
      // Rebuild history from UI messages
      this.messageHistory = [
          { role: "system", content: this.getSystemInstruction(catalog, user, orders, cart) },
          ...messageHistory
            .filter(m => m.role !== MessageRole.SYSTEM && !m.isStreaming)
            .map(m => ({
                role: m.role === MessageRole.USER ? 'user' : 'assistant',
                content: m.text
            }))
      ];
  }

  // --- Streaming Chat Implementation (using Fetch & SSE for DeepSeek) ---
  async sendMessageStream(
      message: string, 
      image: string | undefined, 
      onTextChunk: (text: string) => void
  ): Promise<{ text: string, recommendations?: Product[] }> {
    
    // DeepSeek currently optimizes for text. Image handling would need a vision model.
    // For this implementation, we append a note if an image is present.
    let content = message;
    if (image) {
        content += " [用户上传了一张图片，请假装你能看到并根据上下文回应]";
    }

    const userMsg = { role: "user", content };
    this.messageHistory.push(userMsg);

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: this.messageHistory,
                stream: true,
                temperature: 1.1
            })
        });

        const reader = response.body?.getReader();
        const decoder = new TextDecoder("utf-8");
        let fullText = "";
        let buffer = "";

        if (!reader) throw new Error("No reader");

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || ""; // Keep incomplete line in buffer

            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed.startsWith("data: ")) continue;
                const jsonStr = trimmed.replace("data: ", "");
                if (jsonStr === "[DONE]") break;

                try {
                    const json = JSON.parse(jsonStr);
                    const content = json.choices[0]?.delta?.content || "";
                    if (content) {
                        fullText += content;
                        onTextChunk(fullText); // Update UI
                    }
                } catch (e) {
                    // Ignore parse errors for chunks
                }
            }
        }

        // Post-processing for recommendations (JSON Extraction)
        let recommendations: Product[] = [];
        const jsonMatch = fullText.match(/```json\s*(\{[\s\S]*?\})\s*```/);
        
        let finalText = fullText;
        if (jsonMatch) {
            try {
                const data = JSON.parse(jsonMatch[1]);
                if (data.recommendedProductIds && Array.isArray(data.recommendedProductIds)) {
                    recommendations = this.currentCatalog.filter(p => data.recommendedProductIds.includes(p.id));
                }
                // Remove the JSON block from display so the user doesn't see raw code
                finalText = fullText.replace(jsonMatch[0], "").trim();
                onTextChunk(finalText); // Update UI one last time without JSON
            } catch (e) {
                console.error("Failed to parse recommendation JSON", e);
            }
        }

        // Save assistant response to history
        this.messageHistory.push({ role: "assistant", content: fullText });

        return { text: finalText, recommendations };

    } catch (error) {
        console.error("DeepSeek Stream Error:", error);
        return { text: "网络信号微弱，管家正在重新连接... (请检查网络)", recommendations: [] };
    }
  }

  async sendMessage(message: string, image?: string): Promise<{ text: string, recommendations?: Product[] }> {
      return this.sendMessageStream(message, image, () => {});
  }

  // --- Functional Features using JSON Mode ---

  async planBanquet(products: Product[], people: number, budget: number, preference: string): Promise<BanquetMenu> {
      const prompt = `
      任务：制定一份海鲜宴席菜单。
      现有商品：${products.map(p => `${p.id}:${p.name}:¥${p.price}`).join('; ')}
      要求：${people}人用餐，预算¥${budget}，偏好：${preference}。
      请直接返回JSON格式：{ "title": "菜单标题", "description": "简短描述", "items": [{ "productId": "id", "quantity": number }] }
      `;
      
      try {
        const response = await this.callDeepSeek([{ role: "user", content: prompt }], true);
        const result = JSON.parse(response);
        
        let total = 0;
        result.items.forEach((i: any) => {
            const p = products.find(prod => prod.id === i.productId);
            if (p) total += p.price * i.quantity;
        });
        return { ...result, totalPrice: total };
      } catch (e) {
          console.error(e);
          return { title: "定制失败", description: "请重试", items: [], totalPrice: 0 };
      }
  }

  async smartSearchProducts(query: string, products: Product[]): Promise<string[]> {
      const prompt = `
      商品列表：${products.map(p => `${p.id}:${p.name} 标签:${p.tags.join(',')}`).join('\n')}
      用户搜索："${query}"
      任务：返回语义匹配的商品ID列表。
      返回JSON：{ "matchedIds": ["id1", "id2"] }
      `;
      try {
          const response = await this.callDeepSeek([{ role: "user", content: prompt }], true);
          return JSON.parse(response).matchedIds || [];
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
      try {
          const response = await this.callDeepSeek([{ role: "user", content: prompt }], true);
          return JSON.parse(response);
      } catch (e) { return {}; }
  }

  async parseAddressInfo(text: string): Promise<Partial<Address>> {
      const prompt = `解析中国地址："${text}"。返回JSON：{ "name": "", "phone": "", "province": "", "city": "", "detail": "" }`;
      try {
          const response = await this.callDeepSeek([{ role: "user", content: prompt }], true);
          return JSON.parse(response);
      } catch (e) { return {}; }
  }

  async generateBusinessReport(orders: Order[], products: Product[]): Promise<string> {
      const stats = `订单数: ${orders.length}, 总营收: ¥${orders.reduce((a,b)=>a+b.total,0)}`;
      const prompt = `为魏来海鲜生成一份简短的日报。数据：${stats}。语气：专业、鼓舞人心。`;
      return await this.callDeepSeek([{ role: "user", content: prompt }]);
  }

  async generateUserReview(productName: string, tags: string[], mood: string): Promise<string> {
      const prompt = `写一条关于"${productName}"的大众点评好评。关键词：${tags.join(',')}。心情：${mood}。中文。`;
      return await this.callDeepSeek([{ role: "user", content: prompt }]);
  }

  async generateDietPlan(goal: string, products: Product[]): Promise<any> {
      return { title: "定制食谱", advice: "建议咨询医生", days: [] };
  }
  
  async generateSocialComments(productName: string): Promise<Comment[]> {
      return [];
  }
}

export const geminiService = new GeminiService();
