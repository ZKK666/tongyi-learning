/**
 * 工具调用渲染组件
 *
 * 职责：
 * - 显示工具调用的状态（pending/running/done/error）
 * - 可展开查看输入输出详情
 * - 提供视觉反馈（动画、颜色）
 *
 * 技术要点：
 * - 状态机可视化
 * - 平滑动画过渡
 * - 响应式布局
 */
import { useState } from 'react';
import { Collapse, Tag, Spin, Typography } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  ClockCircleOutlined,
  CodeOutlined,
  RightOutlined,
} from '@ant-design/icons';
import type { ToolCallSegment, ToolCallStatus } from '@/shared/types';

const { Text } = Typography;

interface ToolCallRendererProps {
  segment: ToolCallSegment;
}

/**
 * 获取状态对应的图标
 */
function getStatusIcon(status: ToolCallStatus) {
  switch (status) {
    case 'pending':
      return <ClockCircleOutlined className="text-gray-400" />;
    case 'running':
      return <Spin indicator={<LoadingOutlined spin />} size="small" />;
    case 'done':
      return <CheckCircleOutlined className="text-green-500" />;
    case 'error':
      return <CloseCircleOutlined className="text-red-500" />;
  }
}

/**
 * 获取状态对应的标签颜色
 */
function getStatusColor(status: ToolCallStatus): string {
  switch (status) {
    case 'pending':
      return 'default';
    case 'running':
      return 'processing';
    case 'done':
      return 'success';
    case 'error':
      return 'error';
  }
}

/**
 * 获取状态对应的文本
 */
function getStatusText(status: ToolCallStatus): string {
  switch (status) {
    case 'pending':
      return '等待中';
    case 'running':
      return '执行中';
    case 'done':
      return '已完成';
    case 'error':
      return '失败';
  }
}

/**
 * 格式化 JSON 显示
 */
function formatJson(data: unknown): string {
  try {
    return JSON.stringify(data, null, 2);
  } catch {
    return String(data);
  }
}

/**
 * 工具调用渲染组件
 */
export function ToolCallRenderer({ segment }: ToolCallRendererProps) {
  const [expanded, setExpanded] = useState(false);

  const {
    toolDisplayName,
    status,
    input,
    output,
    error,
    startTime,
    endTime,
  } = segment;

  // 计算执行时间
  const duration =
    startTime && endTime
      ? Math.round(
          (new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000
        )
      : null;

  return (
    <div className="my-2 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      {/* 头部 */}
      <div
        className={`
          flex items-center justify-between px-3 py-2 cursor-pointer
          bg-gray-50 dark:bg-gray-800
          hover:bg-gray-100 dark:hover:bg-gray-700
          transition-colors
        `}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          {getStatusIcon(status)}
          <CodeOutlined className="text-gray-500" />
          <span className="font-medium text-sm">{toolDisplayName}</span>
          <Tag color={getStatusColor(status)} className="ml-2">
            {getStatusText(status)}
          </Tag>
          {duration !== null && (
            <Text type="secondary" className="text-xs">
              {duration}s
            </Text>
          )}
        </div>

        <RightOutlined
          className={`
            text-gray-400 text-xs transition-transform
            ${expanded ? 'rotate-90' : ''}
          `}
        />
      </div>

      {/* 详情（可展开） */}
      <Collapse
        activeKey={expanded ? ['details'] : []}
        ghost
        items={[
          {
            key: 'details',
            showArrow: false,
            label: null,
            children: (
              <div className="p-3 bg-white dark:bg-gray-900 space-y-3">
                {/* 输入参数 */}
                {input && Object.keys(input).length > 0 && (
                  <div>
                    <Text type="secondary" className="text-xs block mb-1">
                      输入参数
                    </Text>
                    <pre className="text-xs bg-gray-50 dark:bg-gray-800 p-2 rounded overflow-auto max-h-32">
                      {formatJson(input)}
                    </pre>
                  </div>
                )}

                {/* 输出结果 */}
                {status === 'done' && output !== undefined && (
                  <div>
                    <Text type="secondary" className="text-xs block mb-1">
                      输出结果
                    </Text>
                    <pre className="text-xs bg-gray-50 dark:bg-gray-800 p-2 rounded overflow-auto max-h-48">
                      {formatJson(output)}
                    </pre>
                  </div>
                )}

                {/* 错误信息 */}
                {status === 'error' && error && (
                  <div>
                    <Text type="danger" className="text-xs block mb-1">
                      错误信息
                    </Text>
                    <pre className="text-xs bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-2 rounded overflow-auto">
                      {error}
                    </pre>
                  </div>
                )}
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
