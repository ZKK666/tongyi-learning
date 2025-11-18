/**
 * KPI 指标卡片组件
 *
 * 显示业务核心指标，支持趋势展示
 */
import { Card } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, MinusOutlined } from '@ant-design/icons';
import type { CardProps, KpiPayload } from '../../types';

/**
 * 格式化数值
 */
function formatValue(value: number, unit?: string): string {
  if (value >= 10000) {
    return `${(value / 10000).toFixed(1)}万${unit || ''}`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K${unit || ''}`;
  }
  return `${value}${unit || ''}`;
}

/**
 * 趋势图标组件
 */
function TrendIcon({ trend }: { trend: 'up' | 'down' | 'flat' }) {
  switch (trend) {
    case 'up':
      return <ArrowUpOutlined className="text-green-500" />;
    case 'down':
      return <ArrowDownOutlined className="text-red-500" />;
    default:
      return <MinusOutlined className="text-gray-400" />;
  }
}

/**
 * 单个 KPI 项
 */
function KpiItem({
  item,
}: {
  item: KpiPayload['items'][0];
}) {
  return (
    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div className="text-xs text-gray-500 mb-1">{item.label}</div>
      <div className="flex items-end justify-between">
        <div className="text-xl font-semibold">
          {formatValue(item.value, item.unit)}
        </div>
        {item.deltaText && (
          <div className="flex items-center gap-1 text-xs">
            <TrendIcon trend={item.trend} />
            <span
              className={
                item.trend === 'up'
                  ? 'text-green-500'
                  : item.trend === 'down'
                  ? 'text-red-500'
                  : 'text-gray-400'
              }
            >
              {item.deltaText}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * KPI 卡片组件
 */
export default function KpiCard({ payload }: CardProps<KpiPayload>) {
  const { title, dateRange, items } = payload;

  return (
    <Card
      className="shadow-sm"
      styles={{
        body: { padding: '16px' }
      }}
    >
      {/* 标题区域 */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-base">{title}</h3>
        <span className="text-xs text-gray-400">{dateRange}</span>
      </div>

      {/* KPI 指标网格 */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((item, index) => (
          <KpiItem key={index} item={item} />
        ))}
      </div>
    </Card>
  );
}
