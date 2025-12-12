
import { Product, User, Order, BanquetMenu, Message, MessageRole, CartItem, Address } from "../types";

// NOTE: We no longer import @google/genai here directly for the client side.
// The logic has moved to /api/chat.js to solve VPN/Network issues.

export class GeminiService {
  private currentCatalog: Product[] = [];
  private currentUser: User | null = null;
  private currentOrders: Order[] = [];
  private currentCart: CartItem[] = [];
  
  // History is now simple objects sent to API
  private chatHistory: { role: string, parts: { text?: string }[] }[] = [];

  constructor() {}

  // --- Context Generators (Keep frontend logic for context generation) ---
  private getSeasonalContext(): string {
      const now = new Date();
      const month = now.getMonth() + 1;
      const day = now.getDate();
      const hour = now.getHours();
      
      // ... (Simplified for brevity, same logic as before) ...
      let timeContext = "";
      if (hour >= 5 && hour < 10) timeContext = "清晨";
      else if (hour >= 10 && hour < 14) timeContext = "午间";
      else if (hour >= 14 && hour < 17) timeContext = "下午";
      else if (hour >= 17 && hour < 21) timeContext = "晚间";
      else timeContext = "深夜";

      return `当前时间段:${timeContext} (月:${month}/日:${day})`;
  }

  generateLocalGreeting(user: User | null): string {
    const name = user ? user.name : "家人"; 
    const liveGreetings = [
        `欢迎回家，${name}！刚下直播，我是魏来的AI助理。`,
        `${name}您好！是不是刚才直播间没抢过瘾？这里是私域VIP通道。`,
        `哈喽${name}！我是您的专属海鲜管家。`
    ];
    return liveGreetings[Math.floor(Math.random() * liveGreetings.length)];
  }

  private getSystemInstruction(catalog: Product[], user: User | null, orders: Order[] = [], cart: CartItem[]) {
    const catalogString = catalog.map(p => `ID:${p.id},名:${p.name},价:${p.price},存:${p.stock},标:${p.tags.join(',')}`).join('\n');
    const userContext = user ? `用户:${user.name},等级:${user.level}` : "用户:访客";
    const cartContext = cart.length > 0 ? "车内:" + cart.map(c => c.name).join(',') : "车空";
    
    return `你叫“魏来”，是【魏来海鲜】的高级私人海鲜管家。
    人设：拟人化，称呼用户“家人/老板”，带直播间氛围。
    环境：${this.getSeasonalContext()}
    用户：${userContext}
    购物车：${cartContext}
    商品库：
    ${catalogString}
    若推荐商品，最后必须附带JSON: \`\`\`json { "recommendedProductIds": ["id"] } \`\`\`
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
        return null; 
    } else {
        const greeting = this.generateLocalGreeting(user);
        // We push to local history for continuity
        this.chatHistory.push({ role: 'model', parts: [{ text: greeting }] });
        return greeting;
    }
  }

  resumeChat(catalog: Product[], user: User | null, messageHistory: Message[], orders: Order[] = [], cart: CartItem[] = []) {
      this.currentCatalog = catalog;
      this.currentUser = user;
      this.currentOrders = orders;
      this.currentCart = cart;
      
      // Reconstruct history compatible with API
      this.chatHistory = messageHistory
        .filter(m => m.role !== MessageRole.SYSTEM && !m.isStreaming)
        .map(m => ({
            role: m.role === MessageRole.USER ? 'user' : 'model',
            parts: [{ text: m.text }] 
        }));
  }

  // --- Fetch Implementation (Proxy to Vercel) ---
  async sendMessageStream(
      message: string, 
      image: string | undefined, 
      onTextChunk: (text: string) => void
  ): Promise<{ text: string, recommendations?: Product[] }> {
    
    const systemInstruction = this.getSystemInstruction(
        this.currentCatalog, 
        this.currentUser, 
        this.currentOrders, 
        this.currentCart
    );

    try {
        // Call our own backend API (Proxy)
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message,
                image,
                history: this.chatHistory, // Send history to maintain context
                systemInstruction
            })
        });

        if (!response.ok || !response.body) {
            throw new Error('Network response was not ok');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullText = "";

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            fullText += chunk;
            onTextChunk(fullText);
        }

        // Parse Recommendations (Same logic)
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
                console.error("JSON Parse Error", e);
            }
        }

        // Update Local History
        const userParts: any[] = [{ text: message }];
        // We don't send heavy image back to history to save bandwidth/tokens usually, or handle it carefully
        this.chatHistory.push({ role: 'user', parts: userParts }); 
        this.chatHistory.push({ role: 'model', parts: [{ text: fullText }] });

        return { text: finalText, recommendations };

    } catch (error) {
        console.error("AI Service Error:", error);
        return { 
            text: "网络连接似乎有点问题 (请确保部署在Vercel且环境变量配置正确)。", 
            recommendations: [] 
        };
    }
  }

  async sendMessage(message: string, image?: string): Promise<{ text: string, recommendations?: Product[] }> {
      return this.sendMessageStream(message, image, () => {});
  }

  // --- Helpers (Simple Fetch) ---
  async runSimpleTask(prompt: string): Promise<string> {
      // Use the same streaming endpoint but non-streamed for simplicity or create a separate one
      // For now, we reuse sendMessageStream and ignore stream updates
      const res = await this.sendMessageStream(prompt, undefined, () => {});
      return res.text;
  }

  // ... (Other helpers use runSimpleTask, so they are updated automatically) ...
  async planBanquet(products: Product[], people: number, budget: number, preference: string): Promise<BanquetMenu> {
      const prompt = `任务:制定海鲜宴席菜单。现有商品:${products.map(p => `${p.id}:${p.name}:¥${p.price}`).join('; ')}。要求:${people}人,预算¥${budget},偏好:${preference}。返回JSON:{ "title": "", "description": "", "items": [{ "productId": "", "quantity": 1 }] }`;
      const text = await this.runSimpleTask(prompt);
      try {
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
      } catch (e) { return { title: "定制失败", description: "", items: [], totalPrice: 0 }; }
  }

  async smartSearchProducts(query: string, products: Product[]): Promise<string[]> {
      const prompt = `商品:${products.map(p => `${p.id}:${p.name} ${p.tags}`).join(';')}。搜索:"${query}"。返回JSON:{ "matchedIds": [] }`;
      const text = await this.runSimpleTask(prompt);
      try { return JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim()).matchedIds || []; } catch (e) { return []; }
  }

  async parseProductInfo(text: string): Promise<Partial<Product>> {
      const prompt = `提取商品JSON(name,price,stock,category,description,tags,nutrition,cookingMethod):"${text}"`;
      const textRes = await this.runSimpleTask(prompt);
      try { return JSON.parse(textRes.replace(/```json/g, '').replace(/```/g, '').trim()); } catch (e) { return {}; }
  }

  async parseAddressInfo(text: string): Promise<Partial<Address>> {
      const prompt = `提取地址JSON(name,phone,province,city,detail):"${text}"`;
      const textRes = await this.runSimpleTask(prompt);
      try { return JSON.parse(textRes.replace(/```json/g, '').replace(/```/g, '').trim()); } catch (e) { return {}; }
  }

  async generateBusinessReport(orders: Order[], products: Product[]): Promise<string> {
      return await this.runSimpleTask(`生成日报。订单数:${orders.length}。语气专业。`);
  }

  async generateUserReview(productName: string, tags: string[], mood: string): Promise<string> {
      return await this.runSimpleTask(`写好评:${productName},关键词:${tags},心情:${mood}。`);
  }
}

export const geminiService = new GeminiService();
