
import { GoogleGenAI, Type } from "@google/genai";
import { Product, RecommendationCard } from "../types";

export class GeminiService {
  private chatHistory: any[] = [];
  
  // Create a new instance right before each call as per guidelines
  private createAI() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  }

  private getSystemInstruction(catalog: Product[]) {
    const catalogStr = catalog.map(p => `名称:${p.name},单价:${p.price},描述:${p.description},单位:${p.unit}`).join('\n');
    
    return `你现在是“魏来海鲜”的高级选品官。
你的任务是根据用户的需求（场景、人数、预算），从下方的商品目录中挑选最合适的组合。

商品目录：
${catalogStr}

必须以 JSON 格式回复，严禁 any 多余文字：
{
  "decision": "方案名称（如：至尊龙虾宴）",
  "reason": "推荐理由（语气高端专业）",
  "items": [{"name": "商品名", "spec": "规格", "quantity": 数量, "price": 单价}],
  "totalPrice": 总计金额,
  "ctaText": "按钮文案"
}`;
  }

  startChat(): string {
    this.chatHistory = [];
    return "尊客，欢迎从直播间空降魏来海鲜。我是您的私人管家，已为您锁定了今日最鲜活的几批货。请问您今日是为哪种场景寻觅极鲜？";
  }

  async sendMessage(
    message: string, 
    catalog: Product[]
  ): Promise<{ text: string, card?: RecommendationCard }> {
    try {
      // Create fresh AI instance for each call as per guidelines
      const ai = this.createAI();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ role: 'user', parts: [{ text: message }] }],
        config: {
          systemInstruction: this.getSystemInstruction(catalog),
          responseMimeType: "application/json"
        }
      });

      const content = response.text || "{}";
      const card = JSON.parse(content) as RecommendationCard;

      return {
        text: card.reason || "已为您备好最佳方案。",
        card: card
      };
    } catch (e) {
      console.error("Gemini Error:", e);
      throw e;
    }
  }

  // Fix: Added missing generateUserReview method used in ReviewCreator.tsx
  async generateUserReview(productName: string, tags: string[], tone: string): Promise<string> {
    try {
      const ai = this.createAI();
      const prompt = `你是一个购买了“${productName}”的海鲜爱好者。请根据这些标签写一段简短的评价：${tags.join('，')}。语气应该是：${tone}。要求表达出食材的极鲜品质和魏来海鲜的高端服务感。`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });

      return response.text || "非常棒的海鲜，品质超乎想象，包装和服务都很高级。";
    } catch (e) {
      console.error("Gemini Review Error:", e);
      return "评价生成失败，请手动输入您的品鉴心得。";
    }
  }
}

export const geminiService = new GeminiService();
