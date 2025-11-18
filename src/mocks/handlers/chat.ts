/**
 * 对话相关 API Mock Handlers
 *
 * 实现流式对话的 SSE 模拟
 */
import { http, HttpResponse } from 'msw';
import { matchReplyTemplate } from '../data/generators';

export const chatHandlers = [
  // 流式对话接口
  http.post('/api/chat/stream', async ({ request }) => {
    const body = await request.json() as {
      messages: Array<{ role: string; content: string }>;
      sessionId: string;
    };

    const userMessage = body.messages[body.messages.length - 1]?.content || '';

    // 使用模板匹配系统生成回复
    const reply = matchReplyTemplate(userMessage);
    const replyText = reply.text;

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      start(controller) {
        let index = 0;
        const messageId = `msg_${Date.now()}`;

        // 计算基础速度：普通字符30ms，较长文本加快到20ms
        const baseDelay = replyText.length > 500 ? 20 : 30;

        const outputNextChar = () => {
          if (index < replyText.length) {
            // 逐字符输出
            const char = replyText.charAt(index);
            const chunk = {
              id: messageId,
              delta: char,
              segments: null,
            };
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`)
            );
            index++;

            // 计算下一个字符的延迟（标点符号稍作停顿）
            let delay = baseDelay;
            if (/[。！？\n]/.test(char)) {
              delay = 100; // 句末停顿
            } else if (/[，、；：]/.test(char)) {
              delay = 60; // 逗号等停顿
            } else if (/[.!?]/.test(char)) {
              delay = 80; // 英文句末
            }

            setTimeout(outputNextChar, delay);
          } else {
            // 输出完毕
            const finalChunk: Record<string, unknown> = {
              id: messageId,
              delta: '',
              finish_reason: 'stop',
            };

            // 如果需要卡片，添加卡片数据
            if (reply.needsCard && reply.cardType && reply.cardData) {
              finalChunk.segments = [
                {
                  type: 'card',
                  cardType: reply.cardType,
                  payload: reply.cardData,
                },
              ];
            }

            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(finalChunk)}\n\n`)
            );
            controller.close();
          }
        };

        // 开始输出
        outputNextChar();
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
    const reply = matchReplyTemplate(userMessage);

    // 模拟延迟
    await new Promise((resolve) => setTimeout(resolve, 500));

    const response: Record<string, unknown> = {
      id: `msg_${Date.now()}`,
      role: 'assistant',
      content: reply.text,
      createdAt: new Date().toISOString(),
    };

    // 添加卡片数据
    if (reply.needsCard && reply.cardType && reply.cardData) {
      response.segments = [
        {
          type: 'card',
          cardType: reply.cardType,
          payload: reply.cardData,
        },
      ];
    }

    return HttpResponse.json(response);
  }),
];
