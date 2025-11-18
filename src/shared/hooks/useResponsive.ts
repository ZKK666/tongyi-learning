/**
 * 响应式断点检测 Hook
 *
 * 职责：
 * - 监听窗口大小变化
 * - 提供当前断点信息
 * - 便捷的设备类型判断
 *
 * 使用场景：
 * - 条件渲染不同布局
 * - 移动端/PC端差异化逻辑
 */
import { useState, useEffect } from 'react';
import { UI } from '../constants';

/**
 * 断点类型
 */
type Breakpoint = 'mobile' | 'tablet' | 'desktop';

/**
 * 响应式状态
 */
interface ResponsiveState {
  /** 当前断点 */
  breakpoint: Breakpoint;
  /** 是否为移动端 */
  isMobile: boolean;
  /** 是否为平板 */
  isTablet: boolean;
  /** 是否为桌面端 */
  isDesktop: boolean;
  /** 窗口宽度 */
  width: number;
  /** 窗口高度 */
  height: number;
}

/**
 * 根据窗口宽度获取断点
 */
function getBreakpoint(width: number): Breakpoint {
  if (width < UI.MOBILE_BREAKPOINT) {
    return 'mobile';
  }
  if (width < UI.TABLET_BREAKPOINT) {
    return 'tablet';
  }
  return 'desktop';
}

/**
 * 响应式断点检测 Hook
 *
 * @returns 响应式状态对象
 *
 * @example
 * function MyComponent() {
 *   const { isMobile, breakpoint } = useResponsive();
 *
 *   return isMobile ? <MobileLayout /> : <DesktopLayout />;
 * }
 */
export function useResponsive(): ResponsiveState {
  const [state, setState] = useState<ResponsiveState>(() => {
    // 服务端渲染兼容
    if (typeof window === 'undefined') {
      return {
        breakpoint: 'desktop',
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        width: 1920,
        height: 1080,
      };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    const breakpoint = getBreakpoint(width);

    return {
      breakpoint,
      isMobile: breakpoint === 'mobile',
      isTablet: breakpoint === 'tablet',
      isDesktop: breakpoint === 'desktop',
      width,
      height,
    };
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const breakpoint = getBreakpoint(width);

      setState({
        breakpoint,
        isMobile: breakpoint === 'mobile',
        isTablet: breakpoint === 'tablet',
        isDesktop: breakpoint === 'desktop',
        width,
        height,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return state;
}
