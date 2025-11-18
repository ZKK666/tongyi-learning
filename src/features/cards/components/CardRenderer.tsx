/**
 * 卡片渲染器
 *
 * 职责：
 * - 根据卡片类型动态渲染对应组件
 * - 处理未注册的卡片类型
 * - 支持懒加载和错误边界
 */
import { Suspense } from 'react';
import { Spin, Alert } from 'antd';
import { cardRegistry } from '../registry';
import type { CardSegment } from '@/shared/types';

interface CardRendererProps {
  segment: CardSegment;
}

/**
 * 卡片加载占位
 */
function CardLoading() {
  return (
    <div className="p-4 flex justify-center items-center min-h-[100px] bg-gray-50 dark:bg-gray-800 rounded-lg">
      <Spin tip="加载中..." />
    </div>
  );
}

/**
 * 错误卡片
 */
function ErrorCard({ message }: { message: string }) {
  return (
    <Alert
      type="error"
      message="卡片加载失败"
      description={message}
      className="my-2"
    />
  );
}

/**
 * 卡片渲染器组件
 *
 * 根据 segment.cardType 查找注册表并渲染对应组件
 */
export function CardRenderer({ segment }: CardRendererProps) {
  const config = cardRegistry[segment.cardType];

  // 未注册的卡片类型
  if (!config) {
    return (
      <ErrorCard message={`未知卡片类型: ${segment.cardType}`} />
    );
  }

  const { component: Component, meta } = config;

  return (
    <div className="my-2">
      <Suspense fallback={<CardLoading />}>
        <Component
          payload={segment.payload}
          meta={meta}
        />
      </Suspense>
    </div>
  );
}
