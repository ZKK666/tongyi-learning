/**
 * 对话相关 API Mock Handlers
 *
 * 实现流式对话的 SSE 模拟
 */
import { http, HttpResponse } from 'msw';

/**
 * 生成模拟的 AI 回复内容
 */
function generateMockReply(userMessage: string): string {
  // 根据用户消息生成不同的回复
  if (userMessage.includes('你好') || userMessage.includes('hi')) {
    return '你好！我是通义千问，很高兴为你服务。有什么我可以帮助你的吗？';
  }

  if (userMessage.includes('天气')) {
    return '正在为你查询天气信息...';
  }

  if (userMessage.includes('代码') || userMessage.includes('编程')) {
    return '我可以帮你编写代码。请告诉我你需要什么样的功能，我会尽力为你提供解决方案。\n\n```javascript\n// 示例代码\nfunction hello() {\n  console.log("Hello, World!");\n}\n```';
  }

  // 默认回复
  return '这是一个很好的问题！让我来为你详细解答...\n\n根据我的理解，这个问题涉及到多个方面：\n\n1. 首先，我们需要考虑...\n2. 其次，还要注意...\n3. 最后，总结一下...\n\n希望这个回答对你有帮助！如果还有其他问题，请随时告诉我。';
}

export const chatHandlers = [
  // 流式对话接口
  http.post('/api/chat/stream', async ({ request }) => {
    const body = await request.json() as {
      messages: Array<{ role: string; content: string }>;
      sessionId: string;
    };

    const userMessage = body.messages[body.messages.length - 1]?.content || '';
    const replyText = generateMockReply(userMessage);

    // 检测是否需要返回卡片
    const needWeatherCard = /天气|气温|下雨/.test(userMessage);

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      start(controller) {
        let index = 0;
        const messageId = `msg_${Date.now()}`;

        const interval = setInterval(() => {
          if (index < replyText.length) {
            // 逐字符输出
            const chunk = {
              id: messageId,
              delta: replyText[index],
              segments: null,
            };
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`)
            );
            index++;
          } else {
            // 输出完毕
            const finalChunk: Record<string, unknown> = {
              id: messageId,
              delta: '',
              finish_reason: 'stop',
            };

            // 如果需要天气卡片
            if (needWeatherCard) {
              finalChunk.segments = [
                {
                  type: 'card',
                  cardType: 'weather',
                  payload: {
                    city: '上海',
                    temperature: 22,
                    weather: '晴',
                    humidity: 65,
                    wind: '东南风 3级',
                    forecast: [
                      { date: '明天', weather: '多云', high: 24, low: 18 },
                      { date: '后天', weather: '小雨', high: 20, low: 15 },
                    ],
                  },
                },
              ];
            }

            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(finalChunk)}\n\n`)
            );
            controller.close();
            clearInterval(interval);
          }
        }, 30); // 30ms 一个字符
      },
    });

    return new HttpResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  }),

  // 非流式对话接口（备用）
  http.post('/api/chat/complete', async ({ request }) => {
    const body = await request.json() as {
      messages: Array<{ role: string; content: string }>;
    };

    const userMessage = body.messages[body.messages.length - 1]?.content || '';
    const replyText = generateMockReply(userMessage);

    // 模拟延迟
    await new Promise((resolve) => setTimeout(resolve, 500));

    return HttpResponse.json({
      id: `msg_${Date.now()}`,
      role: 'assistant',
      content: replyText,
      createdAt: new Date().toISOString(),
    });
  }),
];
