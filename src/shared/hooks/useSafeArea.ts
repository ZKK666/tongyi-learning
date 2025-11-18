/**
 * 安全区域 Hook
 *
 * 职责：
 * - 获取设备安全区域边距
 * - 处理刘海屏、圆角屏适配
 * - 监听软键盘弹出/收起
 *
 * 使用场景：
 * - 移动端底部输入框定位
 * - 全面屏适配
 */
import { useState, useEffect } from 'react';

/**
 * 安全区域边距
 */
interface SafeArea {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

/**
 * 获取当前安全区域值
 */
function getSafeArea(): SafeArea {
  if (typeof window === 'undefined') {
    return { top: 0, bottom: 0, left: 0, right: 0 };
  }

  const style = getComputedStyle(document.documentElement);

  return {
    top: parseInt(style.getPropertyValue('--safe-area-inset-top') || '0', 10),
    bottom: parseInt(style.getPropertyValue('--safe-area-inset-bottom') || '0', 10),
    left: parseInt(style.getPropertyValue('--safe-area-inset-left') || '0', 10),
    right: parseInt(style.getPropertyValue('--safe-area-inset-right') || '0', 10),
  };
}

/**
 * 安全区域 Hook
 *
 * @returns 安全区域边距对象
 *
 * @example
 * function BottomBar() {
 *   const safeArea = useSafeArea();
 *
 *   return (
 *     <div style={{ paddingBottom: safeArea.bottom }}>
 *       <input placeholder="输入消息..." />
 *     </div>
 *   );
 * }
 */
export function useSafeArea(): SafeArea {
  const [safeArea, setSafeArea] = useState<SafeArea>(getSafeArea);

  useEffect(() => {
    const updateSafeArea = () => {
      setSafeArea(getSafeArea());
    };

    // 监听 visual viewport 变化（软键盘弹出/收起）
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateSafeArea);
      window.visualViewport.addEventListener('scroll', updateSafeArea);
    }

    // 监听窗口大小变化
    window.addEventListener('resize', updateSafeArea);

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateSafeArea);
        window.visualViewport.removeEventListener('scroll', updateSafeArea);
      }
      window.removeEventListener('resize', updateSafeArea);
    };
  }, []);

  return safeArea;
}

/**
 * 键盘高度 Hook
 *
 * 用于获取移动端软键盘的高度
 *
 * @returns 键盘高度（像素）
 *
 * @example
 * function ChatInput() {
 *   const keyboardHeight = useKeyboardHeight();
 *
 *   return (
 *     <div style={{ marginBottom: keyboardHeight }}>
 *       <input />
 *     </div>
 *   );
 * }
 */
export function useKeyboardHeight(): number {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    if (!window.visualViewport) {
      return;
    }

    const handleResize = () => {
      // 键盘高度 = 窗口高度 - visual viewport 高度
      const height = window.innerHeight - (window.visualViewport?.height || window.innerHeight);
      setKeyboardHeight(Math.max(0, height));
    };

    window.visualViewport.addEventListener('resize', handleResize);

    return () => {
      window.visualViewport?.removeEventListener('resize', handleResize);
    };
  }, []);

  return keyboardHeight;
}
