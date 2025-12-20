
import { GoogleGenAI } from "@google/genai";

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const { message, image, history, systemInstruction } = await req.json();
    
    // 初始化时使用具名参数
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const contents = [];
    if (history && Array.isArray(history)) {
        contents.push(...history);
    }

    const userParts = [];
    if (image) {
        const match = image.match(/^data:(.+);base64,(.+)$/);
        if (match) {
            userParts.push({
                inlineData: {
                    mimeType: match[1],
                    data: match[2]
                }
            });
        }
    }
    if (message) {
        userParts.push({ text: message });
    }
    
    // 只有在有用户输入时才添加
    if (userParts.length > 0) {
      contents.push({ role: 'user', parts: userParts });
    }

    // 使用系统推荐的最新模型
    const modelName = 'gemini-3-flash-preview';

    const responseStream = await ai.models.generateContentStream({
      model: modelName,
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.8, // 降低随机性，保证推荐的专业性
        topP: 0.95,
        topK: 40,
      }
    });

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of responseStream) {
            const text = chunk.text;
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
        } catch (e) {
          console.error("Stream Error", e);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });

  } catch (error) {
    console.error("API Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
