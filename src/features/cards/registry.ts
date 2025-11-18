/**
 * 卡片注册表
 *
 * 职责：
 * - 集中管理所有卡片类型
 * - 提供卡片配置和组件映射
 * - 支持懒加载
 *
 * 扩展方式：
 * - 添加新卡片只需在此文件添加一条配置
 * - 无需修改渲染逻辑
 */
import { lazy } from 'react';
import type { CardRegistry } from './types';

/**
 * 卡片注册表
 *
 * 新增卡片步骤：
 * 1. 在 types.ts 定义卡片数据类型
 * 2. 创建卡片组件
 * 3. 在此注册卡片
 */
export const cardRegistry: CardRegistry = {
  // 天气卡片
  weather: {
    component: lazy(() => import('./components/WeatherCard')),
    meta: {
      type: 'weather',
      title: '天气卡片',
      icon: 'cloud',
      description: '显示城市天气信息',
      capabilities: {
        expandable: true,
        interactive: true,
      },
      lazyLoad: true,
    },
  },

  // KPI 指标卡片
  kpi: {
    component: lazy(() => import('./components/KpiCard')),
    meta: {
      type: 'kpi',
      title: '业务指标卡片',
      icon: 'chart',
      description: '显示业务核心指标',
      capabilities: {
        expandable: true,
        exportable: true,
      },
      lazyLoad: true,
    },
  },

  // TODO: 后续添加更多卡片类型
  // search: { ... },
  // image: { ... },
  // chart: { ... },
};

/**
 * 获取卡片配置
 */
export function getCardConfig(cardType: string) {
  return cardRegistry[cardType];
}

/**
 * 检查卡片类型是否已注册
 */
export function isCardRegistered(cardType: string): boolean {
  return cardType in cardRegistry;
}
