/**
 * 错误边界组件
 *
 * 职责：
 * - 捕获子组件的渲染错误
 * - 显示友好的错误界面
 * - 上报错误信息
 *
 * 使用场景：
 * - 包裹可能出错的组件
 * - 全局错误处理
 */
import { Component, ErrorInfo, ReactNode } from 'react';
import { Button, Result } from 'antd';
import { createLogger } from '@/shared/utils';

const logger = createLogger('ErrorBoundary');

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * 错误边界组件
 *
 * @example
 * <ErrorBoundary fallback={<div>出错了</div>}>
 *   <MyComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 记录错误
    logger.error('Component error caught', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });

    // 调用自定义错误处理
    this.props.onError?.(error, errorInfo);

    // TODO: 上报到监控平台
    // reportError(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  override render() {
    if (this.state.hasError) {
      // 自定义 fallback
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 默认错误界面
      return (
        <Result
          status="error"
          title="页面出错了"
          subTitle={this.state.error?.message || '发生了未知错误'}
          extra={[
            <Button key="retry" type="primary" onClick={this.handleRetry}>
              重试
            </Button>,
            <Button key="home" onClick={() => window.location.href = '/'}>
              返回首页
            </Button>,
          ]}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * 全局错误处理初始化
 *
 * 在应用启动时调用，捕获未处理的错误
 */
export function initGlobalErrorHandling() {
  // 全局 JS 错误
  window.addEventListener('error', (event) => {
    logger.error('Global error', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  // 未处理的 Promise 拒绝
  window.addEventListener('unhandledrejection', (event) => {
    logger.error('Unhandled promise rejection', {
      reason: event.reason,
    });
  });
}
