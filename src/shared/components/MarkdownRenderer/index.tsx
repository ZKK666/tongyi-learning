/**
 * Markdown 渲染组件
 *
 * 职责：
 * - 安全地渲染 Markdown 内容
 * - 代码块语法高亮
 * - 支持 GFM（GitHub Flavored Markdown）
 *
 * 安全考虑：
 * - 使用 react-markdown 默认的安全渲染
 * - 代码块内容进行转义处理
 */
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CopyOutlined, CheckOutlined } from '@ant-design/icons';
import { useState } from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * 代码块组件
 */
function CodeBlock({
  language,
  code,
}: {
  language: string;
  code: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-4">
      {/* 语言标签和复制按钮 */}
      <div className="absolute top-0 right-0 flex items-center gap-2 px-3 py-1.5 text-xs text-gray-400">
        {language && (
          <span className="uppercase">{language}</span>
        )}
        <button
          onClick={handleCopy}
          className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-white"
        >
          {copied ? (
            <CheckOutlined className="text-green-400" />
          ) : (
            <CopyOutlined />
          )}
        </button>
      </div>

      {/* 代码高亮 */}
      <SyntaxHighlighter
        language={language || 'text'}
        style={oneDark}
        customStyle={{
          margin: 0,
          borderRadius: '8px',
          padding: '16px',
          paddingTop: '32px',
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

/**
 * Markdown 渲染组件
 *
 * @example
 * <MarkdownRenderer content="# Hello\n\nThis is **bold** text." />
 */
export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={`markdown-body ${className || ''}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // 代码块渲染
          code({ inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            const code = String(children).replace(/\n$/, '');

            // 行内代码
            if (inline) {
              return (
                <code
                  className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-sm"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            // 代码块
            return <CodeBlock language={language} code={code} />;
          },

          // 链接渲染（新窗口打开）
          a({ href, children }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-700 underline"
              >
                {children}
              </a>
            );
          },

          // 表格渲染
          table({ children }) {
            return (
              <div className="overflow-x-auto my-4">
                <table className="min-w-full border-collapse border border-gray-200 dark:border-gray-700">
                  {children}
                </table>
              </div>
            );
          },

          th({ children }) {
            return (
              <th className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-left font-medium">
                {children}
              </th>
            );
          },

          td({ children }) {
            return (
              <td className="px-4 py-2 border border-gray-200 dark:border-gray-700">
                {children}
              </td>
            );
          },

          // 列表渲染
          ul({ children }) {
            return (
              <ul className="list-disc list-inside my-2 space-y-1">
                {children}
              </ul>
            );
          },

          ol({ children }) {
            return (
              <ol className="list-decimal list-inside my-2 space-y-1">
                {children}
              </ol>
            );
          },

          // 引用块
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-primary-500 pl-4 my-4 text-gray-600 dark:text-gray-400 italic">
                {children}
              </blockquote>
            );
          },

          // 标题
          h1({ children }) {
            return <h1 className="text-2xl font-bold mt-6 mb-4">{children}</h1>;
          },
          h2({ children }) {
            return <h2 className="text-xl font-bold mt-5 mb-3">{children}</h2>;
          },
          h3({ children }) {
            return <h3 className="text-lg font-bold mt-4 mb-2">{children}</h3>;
          },

          // 段落
          p({ children }) {
            return <p className="my-2 leading-relaxed">{children}</p>;
          },

          // 水平线
          hr() {
            return <hr className="my-6 border-gray-200 dark:border-gray-700" />;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
