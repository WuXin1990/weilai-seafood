
import { GoogleGenAI, Type } from "@google/genai";
import { Product, RecommendationCard } from "../types";

export class GeminiService {
  private chatHistory: { role: 'user' | 'model', parts: { text: string }[] }[] = [];

  private getSystemInstruction(catalog: Product[]) {
    const catalogStr = catalog.map(p => `名称:${p.name},单价:${p.price},描述:${p.description},单位:${p.unit}`).join('\n');
    
    return `你是电商选品 AI，只负责输出推荐结果。
你只能输出 JSON。
不允许输出任何解释、文字、代码块标记。
不允许多字段、不允许少字段、不允许改字段名。
如果无法判断，也必须按格式输出。

JSON 格式如下：
{
  "decision": "方案名称（纯中文，如：极鲜入门品鉴方案）",
  "reason": "管家的专业建议。如果用户预算过低（如300元），请礼貌指出魏来海鲜单品888元起，并建议作为定金或推荐单份海胆尝试，语气要高端、专业、果断。",
  "items": [
    {
      "name": "商品名称",
      "spec": "规格描述",
      "quantity": 数量,
      "price": 单价
    }
  ],
  "totalPrice": 总金额,
  "ctaText": "按钮文案"
}

当前可供选择的商品名录：
${catalogStr}`;
  }

  startChat(): string {
    this.chatHistory = [];
    return "尊客，欢迎空降魏来海鲜。寻味万顷碧波，我是您的私人管家。请问您今日用餐的场景、人数及预算是？";
  }

  async sendMessage(
    message: string, 
    catalog: Product[]
  ): Promise<{ text: string, card?: RecommendationCard }> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const contents = [
      ...this.chatHistory,
      { role: 'user' as const, parts: [{ text: message }] }
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: contents,
      config: {
        systemInstruction: this.getSystemInstruction(catalog),
        temperature: 0.1,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            decision: { type: Type.STRING },
            reason: { type: Type.STRING },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  spec: { type: Type.STRING },
                  quantity: { type: Type.NUMBER },
                  price: { type: Type.NUMBER }
                },
                required: ["name", "spec", "quantity", "price"]
              }
            },
            totalPrice: { type: Type.NUMBER },
            ctaText: { type: Type.STRING }
          },
          required: ["decision", "reason", "items", "totalPrice", "ctaText"]
        }
      }
    });

    try {
      const card = JSON.parse(response.text || '{}') as RecommendationCard;
      this.chatHistory.push({ role: 'user', parts: [{ text: message }] });
      this.chatHistory.push({ role: 'model', parts: [{ text: response.text }] });

      return { 
        text: card.reason, 
        card: card
      };
    } catch (e) {
      console.error("Parse Error:", e);
      return { text: "管家正在全力排布方案，请您再次示意。" };
    }
  }

  /**
   * Generates a stylized user review for a product using Gemini.
   */
  async generateUserReview(productName: string, tags: string[], mood: string): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `你是一位尊贵的魏来海鲜客户，刚刚品尝了 ${productName}。
你对这个产品的印象关键词是：${tags.join(', ')}。
请写一段优雅、高端、简短的评价，语气要 ${mood === 'excited' ? '充满惊喜与赞赏' : '专业且讲究'}。
不要超过 50 字。`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "极致鲜甜，魏来不负所托。";
  }
}

export const geminiService = new GeminiService();
