
import { GoogleGenAI } from "@google/genai";

export const config = {
  runtime: 'edge', // Use Edge runtime for faster streaming
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const { message, image, history, systemInstruction } = await req.json();
    
    // Initialize Gemini on the server side (Vercel US Server)
    // API_KEY is safe here and network is accessible
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Construct the full history for the model
    // Note: We need to convert the simplified format back to Gemini format if needed,
    // but here we assume we pass compatible content structures or reconstruct them.
    const contents = [];
    
    if (history && Array.isArray(history)) {
        contents.push(...history);
    }

    // Current User Message
    const userParts = [];
    if (image) {
        // Handle Base64 image
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
    contents.push({ role: 'user', parts: userParts });

    const model = 'gemini-2.5-flash';

    // Call Gemini API with Streaming
    const responseStream = await ai.models.generateContentStream({
      model: model,
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 1.3,
      }
    });

    // Create a ReadableStream to stream data back to the client
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
          controller.enqueue(encoder.encode("\n[连接中断]"));
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
