/**
 * 消息导出工具
 *
 * 支持导出为 Markdown 和 PDF 格式
 *
 * 技术要点：
 * - Markdown 格式化
 * - Blob 下载
 * - 打印导出 PDF
 */
import type { Message, Session } from '@/shared/types';
import { isTextSegment, isCardSegment, isToolCallSegment } from '@/shared/types';
import dayjs from 'dayjs';

/**
 * 将消息转换为 Markdown 格式
 */
export function messagesToMarkdown(
  messages: Message[],
  session?: Session
): string {
  const lines: string[] = [];

  // 标题
  if (session) {
    lines.push(`# ${session.title}`);
    lines.push('');
    lines.push(`> 导出时间：${dayjs().format('YYYY-MM-DD HH:mm:ss')}`);
    lines.push(`> 消息数量：${messages.length}`);
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  // 消息内容
  for (const message of messages) {
    const roleName = message.role === 'user' ? '用户' : '助手';
    const time = dayjs(message.createdAt).format('YYYY-MM-DD HH:mm');

    lines.push(`## ${roleName} (${time})`);
    lines.push('');

    for (const segment of message.segments) {
      if (isTextSegment(segment)) {
        lines.push(segment.text);
        lines.push('');
      } else if (isCardSegment(segment)) {
        lines.push(`> **卡片**: ${segment.cardType}`);
        lines.push('```json');
        lines.push(JSON.stringify(segment.payload, null, 2));
        lines.push('```');
        lines.push('');
      } else if (isToolCallSegment(segment)) {
        lines.push(`> **工具调用**: ${segment.toolDisplayName}`);
        if (segment.input) {
          lines.push('> 输入:');
          lines.push('```json');
          lines.push(JSON.stringify(segment.input, null, 2));
          lines.push('```');
        }
        if (segment.output) {
          lines.push('> 输出:');
          lines.push('```json');
          lines.push(JSON.stringify(segment.output, null, 2));
          lines.push('```');
        }
        lines.push('');
      }
    }

    lines.push('---');
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * 下载文件
 */
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * 导出为 Markdown 文件
 */
export function exportToMarkdown(
  messages: Message[],
  session?: Session
): void {
  const markdown = messagesToMarkdown(messages, session);
  const filename = session
    ? `${session.title}_${dayjs().format('YYYYMMDD')}.md`
    : `chat_export_${dayjs().format('YYYYMMDD')}.md`;

  downloadFile(markdown, filename, 'text/markdown;charset=utf-8');
}

/**
 * 导出为 PDF（使用浏览器打印功能）
 *
 * 注意：这是一个简化实现，使用浏览器的打印对话框
 * 生产环境建议使用专业的 PDF 生成库如 jspdf、pdfmake 等
 */
export function exportToPDF(
  messages: Message[],
  session?: Session
): void {
  // 创建打印内容
  const printContent = generatePrintHTML(messages, session);

  // 创建隐藏的 iframe
  const iframe = document.createElement('iframe');
  iframe.style.position = 'absolute';
  iframe.style.top = '-10000px';
  iframe.style.left = '-10000px';
  document.body.appendChild(iframe);

  // 写入内容
  const doc = iframe.contentDocument;
  if (doc) {
    doc.open();
    doc.write(printContent);
    doc.close();

    // 等待内容加载完成后打印
    iframe.contentWindow?.focus();
    setTimeout(() => {
      iframe.contentWindow?.print();
      // 打印完成后移除 iframe
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }, 500);
  }
}

/**
 * 生成打印用的 HTML
 */
function generatePrintHTML(messages: Message[], session?: Session): string {
  const title = session?.title || '对话导出';

  let content = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          color: #333;
        }
        h1 {
          border-bottom: 2px solid #333;
          padding-bottom: 10px;
        }
        .message {
          margin-bottom: 20px;
          page-break-inside: avoid;
        }
        .message-header {
          font-weight: bold;
          color: #666;
          font-size: 12px;
          margin-bottom: 5px;
        }
        .message-content {
          background: #f5f5f5;
          padding: 10px 15px;
          border-radius: 8px;
        }
        .user .message-content {
          background: #e3f2fd;
        }
        .assistant .message-content {
          background: #f5f5f5;
        }
        pre {
          background: #263238;
          color: #aed581;
          padding: 10px;
          border-radius: 4px;
          overflow-x: auto;
          font-size: 12px;
        }
        code {
          background: #e8e8e8;
          padding: 2px 4px;
          border-radius: 3px;
          font-size: 13px;
        }
        .meta {
          color: #666;
          font-size: 12px;
          margin-bottom: 20px;
        }
        @media print {
          body { margin: 0; padding: 15px; }
          .message { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <div class="meta">
        导出时间：${dayjs().format('YYYY-MM-DD HH:mm:ss')} |
        消息数量：${messages.length}
      </div>
  `;

  for (const message of messages) {
    const roleName = message.role === 'user' ? '用户' : '助手';
    const time = dayjs(message.createdAt).format('YYYY-MM-DD HH:mm');

    content += `
      <div class="message ${message.role}">
        <div class="message-header">${roleName} · ${time}</div>
        <div class="message-content">
    `;

    for (const segment of message.segments) {
      if (isTextSegment(segment)) {
        // 简单的 Markdown 到 HTML 转换
        const html = segment.text
          .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
          .replace(/`([^`]+)`/g, '<code>$1</code>')
          .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
          .replace(/\n/g, '<br>');
        content += html;
      } else if (isCardSegment(segment)) {
        content += `<p><em>卡片: ${segment.cardType}</em></p>`;
      } else if (isToolCallSegment(segment)) {
        content += `<p><em>工具调用: ${segment.toolDisplayName}</em></p>`;
      }
    }

    content += `
        </div>
      </div>
    `;
  }

  content += `
    </body>
    </html>
  `;

  return content;
}

/**
 * 导出工具的 React Hook
 */
export function useExportMessages() {
  const exportMarkdown = (messages: Message[], session?: Session) => {
    exportToMarkdown(messages, session);
  };

  const exportPDF = (messages: Message[], session?: Session) => {
    exportToPDF(messages, session);
  };

  return {
    exportMarkdown,
    exportPDF,
  };
}
