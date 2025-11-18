/**
 * MSW Handlers 聚合导出
 *
 * 所有 API mock handlers 在此统一导出
 */
import { authHandlers } from './auth';
import { chatHandlers } from './chat';
import { sessionHandlers } from './session';

export const handlers = [
  ...authHandlers,
  ...chatHandlers,
  ...sessionHandlers,
];
