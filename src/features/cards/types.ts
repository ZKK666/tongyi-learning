/**
 * 卡片系统类型定义
 */
import { ComponentType, LazyExoticComponent } from 'react';

/**
 * 卡片元数据
 */
export interface CardMeta {
  /** 卡片类型标识 */
  type: string;
  /** 卡片标题 */
  title: string;
  /** 卡片图标 */
  icon: string;
  /** 卡片描述 */
  description: string;
  /** 卡片能力 */
  capabilities: {
    /** 是否支持展开/折叠 */
    expandable?: boolean;
    /** 是否支持交互 */
    interactive?: boolean;
    /** 是否支持导出 */
    exportable?: boolean;
  };
  /** 是否延迟加载 */
  lazyLoad?: boolean;
}

/**
 * 卡片组件 Props
 */
export interface CardProps<T = unknown> {
  /** 卡片数据 */
  payload: T;
  /** 卡片元数据 */
  meta: CardMeta;
}

/**
 * 卡片注册项
 */
export interface CardRegistryItem {
  /** 卡片组件 */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: LazyExoticComponent<ComponentType<any>> | ComponentType<any>;
  /** 卡片元数据 */
  meta: CardMeta;
}

/**
 * 卡片注册表类型
 */
export type CardRegistry = Record<string, CardRegistryItem>;

/**
 * 天气卡片数据
 */
export interface WeatherPayload {
  city: string;
  temperature: number;
  weather: string;
  humidity: number;
  wind: string;
  forecast?: Array<{
    date: string;
    weather: string;
    high: number;
    low: number;
  }>;
}

/**
 * KPI 卡片数据
 */
export interface KpiPayload {
  title: string;
  dateRange: string;
  items: Array<{
    label: string;
    value: number;
    unit?: string;
    trend: 'up' | 'down' | 'flat';
    deltaText?: string;
  }>;
}
