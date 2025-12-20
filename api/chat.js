
export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const { message, history, systemInstruction, response_format, stream } = await req.json();
    
    const messages = [
      { role: 'system', content: systemInstruction },
      ...(history || []),
      { role: 'user', content: message }
    ];

    // 默认开启流式，除非显式指定为 false (例如获取 JSON 卡片时)
    const isStream = stream !== false;

    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: messages,
        temperature: 0.1, // 降低随机性有利于获取稳定的 JSON 结果
        response_format: response_format || undefined,
        stream: isStream
      })
    });

    if (!response.ok) {
      const errorMsg = await response.text();
      console.error("DeepSeek API Upstream Error:", response.status, errorMsg);
      return new Response(errorMsg, {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (isStream) {
      return new Response(response.body, {
        headers: {
          'Content-Type': 'text/event-stream; charset=utf-8',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } else {
      const resultData = await response.json();
      return new Response(JSON.stringify(resultData), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error("Proxy Runtime Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
