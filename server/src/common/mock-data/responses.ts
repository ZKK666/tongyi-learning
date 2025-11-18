/**
 * Mock 响应数据
 *
 * 说明：
 * - 根据用户输入的关键词返回不同类型的响应
 * - 模拟真实 AI 的多样化回复
 * - 便于测试各种消息类型的渲染
 */

/**
 * 默认文本回复
 */
export const DEFAULT_RESPONSE = `这是一个很好的问题！让我来详细解释一下。

在软件开发中，我们需要考虑以下几个关键因素：

1. **代码可读性** - 良好的命名和注释
2. **可维护性** - 模块化设计
3. **性能优化** - 避免不必要的计算

希望这个回答对你有帮助！如有其他问题，请随时提问。`;

/**
 * 代码示例回复
 *
 * 学习要点：
 * - 使用模板字符串保留格式
 * - 包含 Markdown 代码块语法
 */
export const CODE_RESPONSE = `好的，这是一个 TypeScript 示例：

\`\`\`typescript
// 定义一个异步函数来获取用户数据
async function fetchUserData(userId: string): Promise<User> {
  try {
    const response = await fetch(\`/api/users/\${userId}\`);

    if (!response.ok) {
      throw new Error('获取用户数据失败');
    }

    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// 使用示例
const user = await fetchUserData('123');
console.log(user.name);
\`\`\`

这段代码展示了：
- 类型注解
- 错误处理
- async/await 语法`;

/**
 * React 组件示例
 */
export const REACT_RESPONSE = `这是一个 React 函数组件示例：

\`\`\`tsx
import { useState, useEffect } from 'react';

interface Props {
  title: string;
  onSubmit: (value: string) => void;
}

export function SearchInput({ title, onSubmit }: Props) {
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSubmit(value);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="search-container">
      <h2>{title}</h2>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="输入搜索内容..."
      />
      <button onClick={handleSubmit} disabled={loading}>
        {loading ? '搜索中...' : '搜索'}
      </button>
    </div>
  );
}
\`\`\`

关键点：
- 使用 TypeScript 定义 Props 接口
- useState 管理本地状态
- 异步操作的 loading 状态处理`;

/**
 * 简短回复（用于简单问候）
 */
export const GREETING_RESPONSE = `你好！我是通义千问，很高兴为你服务。

我可以帮助你：
- 回答技术问题
- 编写和解释代码
- 进行文档翻译
- 提供学习建议

请问有什么我可以帮助你的吗？`;

/**
 * 根据用户输入匹配响应
 *
 * 学习要点：
 * - 使用正则表达式匹配关键词
 * - 返回对应的 Mock 内容
 * - 这种模式在测试和原型开发中很常见
 *
 * @param userMessage 用户输入的消息
 * @returns 匹配的响应内容
 */
export function getResponseByKeyword(userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase();

  // 代码相关
  if (/代码|code|typescript|javascript|函数|function/.test(lowerMessage)) {
    return CODE_RESPONSE;
  }

  // React 相关
  if (/react|组件|component|hook|useState/.test(lowerMessage)) {
    return REACT_RESPONSE;
  }

  // 问候
  if (/你好|hello|hi|嗨|hey/.test(lowerMessage)) {
    return GREETING_RESPONSE;
  }

  // 默认响应
  return DEFAULT_RESPONSE;
}

/**
 * 初始会话数据
 */
export const INITIAL_SESSIONS = [
  {
    id: 'session-1',
    title: 'React 性能优化讨论',
    messageCount: 3,
  },
  {
    id: 'session-2',
    title: 'TypeScript 类型体操',
    messageCount: 5,
  },
];

/**
 * Mock 用户数据
 */
export const MOCK_USER = {
  id: 'user-1',
  name: '测试用户',
  email: 'test@example.com',
  avatar: undefined,
};
