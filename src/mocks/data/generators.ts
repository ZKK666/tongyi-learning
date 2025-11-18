/**
 * MOCK 数据生成器
 *
 * 提供各种类型的模拟数据生成
 */

/**
 * 生成天气数据
 */
export function generateWeatherData(city: string = '上海') {
  const weathers = ['晴', '多云', '阴', '小雨', '大雨'];
  const randomWeather = weathers[Math.floor(Math.random() * weathers.length)] || '晴';

  return {
    city,
    temperature: Math.floor(Math.random() * 20) + 10,
    weather: randomWeather,
    humidity: Math.floor(Math.random() * 40) + 40,
    wind: `${['东', '南', '西', '北'][Math.floor(Math.random() * 4)]}风 ${Math.floor(Math.random() * 5) + 1}级`,
    forecast: [
      {
        date: '明天',
        weather: weathers[Math.floor(Math.random() * weathers.length)] || '多云',
        high: Math.floor(Math.random() * 10) + 20,
        low: Math.floor(Math.random() * 10) + 10,
      },
      {
        date: '后天',
        weather: weathers[Math.floor(Math.random() * weathers.length)] || '小雨',
        high: Math.floor(Math.random() * 10) + 18,
        low: Math.floor(Math.random() * 10) + 8,
      },
    ],
  };
}

/**
 * 生成 KPI 数据
 */
export function generateKpiData() {
  return {
    title: '今日核心指标',
    dateRange: new Date().toISOString().split('T')[0],
    items: [
      {
        label: '订单数',
        value: Math.floor(Math.random() * 10000) + 5000,
        trend: 'up' as const,
        deltaText: `+${(Math.random() * 10).toFixed(1)}%`,
      },
      {
        label: 'GMV',
        value: Math.floor(Math.random() * 1000000) + 500000,
        unit: '元',
        trend: 'up' as const,
        deltaText: `+${(Math.random() * 15).toFixed(1)}%`,
      },
      {
        label: '转化率',
        value: Math.random() * 5 + 2,
        unit: '%',
        trend: Math.random() > 0.5 ? 'up' as const : 'down' as const,
        deltaText: `${Math.random() > 0.5 ? '+' : '-'}${(Math.random() * 2).toFixed(1)}%`,
      },
      {
        label: '客单价',
        value: Math.floor(Math.random() * 200) + 100,
        unit: '元',
        trend: 'flat' as const,
        deltaText: '0%',
      },
      {
        label: '退款率',
        value: Math.random() * 3 + 1,
        unit: '%',
        trend: 'down' as const,
        deltaText: `-${(Math.random() * 1).toFixed(1)}%`,
      },
      {
        label: '复购率',
        value: Math.random() * 20 + 30,
        unit: '%',
        trend: 'up' as const,
        deltaText: `+${(Math.random() * 3).toFixed(1)}%`,
      },
    ],
  };
}

/**
 * 预设的 AI 回复模板
 */
export const REPLY_TEMPLATES = {
  // 打招呼
  greeting: `你好！我是通义千问，很高兴为你服务。

我可以帮助你：
- 回答各种问题
- 编写和解释代码
- 创作文字内容
- 分析数据和图表
- 查询天气、新闻等信息

有什么我可以帮助你的吗？`,

  // 代码示例
  code: `好的，我来为你写一个示例代码。

这是一个 **React Hook** 实现的防抖函数：

\`\`\`typescript
import { useState, useEffect, useRef } from 'react';

/**
 * 防抖 Hook
 * @param value 要防抖的值
 * @param delay 延迟时间（毫秒）
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

// 使用示例
function SearchInput() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery) {
      // 执行搜索
      search(debouncedQuery);
    }
  }, [debouncedQuery]);

  return (
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="搜索..."
    />
  );
}
\`\`\`

**关键点说明**：

1. 使用 \`setTimeout\` 延迟更新值
2. 在 \`useEffect\` 的清理函数中取消定时器
3. 依赖项包含 \`value\` 和 \`delay\`

这样可以避免频繁触发搜索请求，提升性能。`,

  // 长文本（测试打字机效果）
  longText: `这是一段较长的文本，用于测试打字机效果的流畅性。

## 关于人工智能

人工智能（Artificial Intelligence，简称 AI）是计算机科学的一个分支，旨在创建能够执行通常需要人类智能的任务的系统。

### 主要应用领域

1. **自然语言处理**：让计算机理解和生成人类语言
2. **计算机视觉**：使机器能够"看到"并理解图像
3. **机器学习**：让系统从数据中学习并改进
4. **机器人技术**：创建能够与物理世界交互的系统

### 发展历程

| 年代 | 里程碑 |
|------|--------|
| 1950s | 图灵测试提出 |
| 1960s | 专家系统出现 |
| 1990s | 机器学习兴起 |
| 2010s | 深度学习突破 |
| 2020s | 大语言模型时代 |

### 未来展望

> AI 将继续改变我们的生活方式，从医疗诊断到自动驾驶，从个人助手到科学研究。

---

希望这些信息对你有帮助！如果你想了解更多，请随时提问。`,

  // 表格数据
  table: `好的，我来为你整理一份数据表格：

## 2024年各季度销售数据

| 季度 | 销售额（万元） | 同比增长 | 环比增长 | 主要产品 |
|------|---------------|----------|----------|----------|
| Q1 | 1,234 | +12.5% | - | 智能手机 |
| Q2 | 1,456 | +15.2% | +18.0% | 平板电脑 |
| Q3 | 1,678 | +18.7% | +15.2% | 智能手表 |
| Q4 | 2,012 | +22.3% | +19.9% | 耳机配件 |

**数据分析**：

1. 全年销售额持续增长，Q4 达到峰值
2. 同比增长率逐季提升，显示良好的发展势头
3. 智能手表和耳机配件成为新的增长点

如需更详细的分析，请告诉我。`,

  // 数学公式
  math: `让我来解释一下这个数学概念。

## 二次方程求根公式

对于一般形式的二次方程：

$$ax^2 + bx + c = 0$$

其中 $a \\neq 0$，求根公式为：

$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$

### 判别式

设 $\\Delta = b^2 - 4ac$，则：

- 当 $\\Delta > 0$ 时，方程有两个不相等的实根
- 当 $\\Delta = 0$ 时，方程有两个相等的实根
- 当 $\\Delta < 0$ 时，方程没有实根

### 示例

求解 $x^2 - 5x + 6 = 0$

这里 $a=1, b=-5, c=6$

$\\Delta = (-5)^2 - 4(1)(6) = 25 - 24 = 1 > 0$

所以：
- $x_1 = \\frac{5 + 1}{2} = 3$
- $x_2 = \\frac{5 - 1}{2} = 2$

验证：$(x-2)(x-3) = x^2 - 5x + 6$ ✓`,
};

/**
 * 根据用户输入匹配回复模板
 */
export function matchReplyTemplate(input: string): {
  text: string;
  needsCard: boolean;
  cardType?: string;
  cardData?: unknown;
} {
  const lowerInput = input.toLowerCase();

  // 天气查询
  if (/天气|气温|下雨|温度|weather/.test(lowerInput)) {
    const cityMatch = input.match(/(\S+)(?:的)?天气/);
    const city = cityMatch?.[1] || '上海';
    return {
      text: `正在为你查询${city}的天气信息...`,
      needsCard: true,
      cardType: 'weather',
      cardData: generateWeatherData(city),
    };
  }

  // KPI/指标查询
  if (/指标|数据|GMV|订单|销售|转化率|业绩/.test(lowerInput)) {
    return {
      text: '正在为你查询今日业务指标...',
      needsCard: true,
      cardType: 'kpi',
      cardData: generateKpiData(),
    };
  }

  // 代码相关
  if (/代码|编程|函数|实现|写一个/.test(lowerInput)) {
    return {
      text: REPLY_TEMPLATES.code,
      needsCard: false,
    };
  }

  // 表格数据
  if (/表格|数据表|统计|报表/.test(lowerInput)) {
    return {
      text: REPLY_TEMPLATES.table,
      needsCard: false,
    };
  }

  // 数学问题
  if (/数学|公式|方程|求解|计算/.test(lowerInput)) {
    return {
      text: REPLY_TEMPLATES.math,
      needsCard: false,
    };
  }

  // 打招呼
  if (/你好|hi|hello|嗨|在吗/.test(lowerInput)) {
    return {
      text: REPLY_TEMPLATES.greeting,
      needsCard: false,
    };
  }

  // 长文本测试
  if (/长文本|测试|AI|人工智能/.test(lowerInput)) {
    return {
      text: REPLY_TEMPLATES.longText,
      needsCard: false,
    };
  }

  // 默认回复
  return {
    text: `这是一个很好的问题！让我来为你详细解答。

根据你的问题"${input.slice(0, 50)}${input.length > 50 ? '...' : ''}"，我的理解是：

1. 首先，我们需要明确问题的核心要点
2. 其次，分析可能的解决方案
3. 最后，给出具体的建议

如果你需要更具体的帮助，可以：
- 提供更多上下文信息
- 询问具体的技术细节
- 要求我生成相关代码

还有其他问题吗？`,
    needsCard: false,
  };
}
