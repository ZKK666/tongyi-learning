/**
 * 常量配置
 *
 * 集中管理项目中的常量值
 */

/**
 * API 相关常量
 */
export const API = {
  /** API 基础路径 */
  BASE_URL: '/api',
  /** 请求超时时间（毫秒） */
  TIMEOUT: 30000,
  /** 流式请求超时时间（毫秒） */
  STREAM_TIMEOUT: 120000,
} as const;

/**
 * 存储相关常量
 */
export const STORAGE_KEYS = {
  /** 认证信息 */
  AUTH: 'auth',
  /** 用户配置 */
  SETTINGS: 'settings',
  /** 会话列表 */
  SESSIONS: 'sessions',
  /** 消息缓存前缀 */
  MESSAGES_PREFIX: 'messages_',
  /** 主题设置 */
  THEME: 'theme',
} as const;

/**
 * UI 相关常量
 */
export const UI = {
  /** 侧边栏宽度（像素） */
  SIDEBAR_WIDTH: 260,
  /** 移动端断点（像素） */
  MOBILE_BREAKPOINT: 768,
  /** 平板断点（像素） */
  TABLET_BREAKPOINT: 1024,
  /** 消息最大长度 */
  MAX_MESSAGE_LENGTH: 4000,
  /** 会话标题最大长度 */
  MAX_SESSION_TITLE_LENGTH: 50,
} as const;

/**
 * 动画相关常量
 */
export const ANIMATION = {
  /** 流式输出速度（毫秒/字符） */
  STREAM_SPEED: 30,
  /** 侧边栏过渡时间（毫秒） */
  SIDEBAR_TRANSITION: 300,
  /** 消息淡入时间（毫秒） */
  MESSAGE_FADE_IN: 300,
} as const;

/**
 * 卡片类型
 */
export const CARD_TYPES = {
  WEATHER: 'weather',
  KPI: 'kpi',
  SEARCH: 'search',
  CODE: 'code',
  IMAGE: 'image',
  TABLE: 'table',
  CHART: 'chart',
} as const;

/**
 * 消息角色显示名称
 */
export const ROLE_NAMES = {
  user: '你',
  assistant: '通义千问',
  system: '系统',
} as const;

/**
 * 工具调用触发关键词
 */
export const TOOL_KEYWORDS = {
  /** 天气查询关键词 */
  WEATHER: ['天气', '气温', '下雨', '下雪', '温度', 'weather'],
  /** KPI 查询关键词 */
  KPI: ['指标', '数据', 'GMV', '订单', '转化率', '销售额'],
  /** 搜索关键词 */
  SEARCH: ['搜索', '查找', '帮我找', '搜一下'],
} as const;

/**
 * 错误消息
 */
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '网络连接失败，请检查网络后重试',
  TIMEOUT_ERROR: '请求超时，请稍后重试',
  AUTH_ERROR: '登录已过期，请重新登录',
  UNKNOWN_ERROR: '发生未知错误，请稍后重试',
  MESSAGE_TOO_LONG: `消息长度不能超过 ${UI.MAX_MESSAGE_LENGTH} 字符`,
} as const;

/**
 * 成功消息
 */
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: '登录成功',
  LOGOUT_SUCCESS: '已退出登录',
  COPY_SUCCESS: '复制成功',
  DELETE_SUCCESS: '删除成功',
  SAVE_SUCCESS: '保存成功',
} as const;
