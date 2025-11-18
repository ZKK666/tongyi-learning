/**
 * 图片预览组件
 *
 * 显示待发送的图片列表，支持删除
 */
import { CloseOutlined } from '@ant-design/icons';

interface ImageFile {
  id: string;
  preview: string;
  name: string;
  size: number;
  compressed?: boolean;
}

interface ImagePreviewProps {
  images: ImageFile[];
  onRemove: (id: string) => void;
}

/**
 * 格式化文件大小
 */
function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1024 / 1024).toFixed(1) + ' MB';
}

/**
 * 图片预览组件
 */
export function ImagePreview({ images, onRemove }: ImagePreviewProps) {
  if (images.length === 0) return null;

  return (
    <div className="flex gap-2 p-2 overflow-x-auto">
      {images.map((image) => (
        <div
          key={image.id}
          className="relative flex-shrink-0 group"
        >
          {/* 图片预览 */}
          <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <img
              src={image.preview}
              alt={image.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* 删除按钮 */}
          <button
            onClick={() => onRemove(image.id)}
            className="
              absolute -top-2 -right-2
              w-5 h-5 rounded-full
              bg-red-500 text-white
              flex items-center justify-center
              opacity-0 group-hover:opacity-100
              transition-opacity
              hover:bg-red-600
            "
          >
            <CloseOutlined className="text-xs" />
          </button>

          {/* 文件信息 */}
          <div className="mt-1 text-xs text-gray-500 truncate max-w-20">
            {formatSize(image.size)}
            {image.compressed && (
              <span className="text-green-500 ml-1">压缩</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
