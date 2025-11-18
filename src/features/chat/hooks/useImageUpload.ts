/**
 * 图片上传 Hook
 *
 * 职责：
 * - 处理拖拽上传
 * - 处理粘贴上传
 * - 图片压缩
 * - 生成预览
 *
 * 技术要点：
 * - Canvas 压缩
 * - FileReader 预览
 * - DataTransfer API
 */
import { useState, useCallback, useRef } from 'react';
import { createLogger } from '@/shared/utils';

const logger = createLogger('ImageUpload');

interface ImageFile {
  id: string;
  file: File;
  preview: string;
  name: string;
  size: number;
  compressed?: boolean;
}

interface UseImageUploadOptions {
  maxSize?: number; // 最大文件大小（字节），默认 5MB
  maxWidth?: number; // 最大宽度，默认 1920
  maxHeight?: number; // 最大高度，默认 1080
  quality?: number; // 压缩质量，默认 0.8
  maxFiles?: number; // 最大文件数，默认 5
  onError?: (error: string) => void;
}

/**
 * 压缩图片
 */
async function compressImage(
  file: File,
  maxWidth: number,
  maxHeight: number,
  quality: number
): Promise<{ blob: Blob; compressed: boolean }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      let { width, height } = img;
      let compressed = false;

      // 计算缩放比例
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
        compressed = true;
      }

      canvas.width = width;
      canvas.height = height;

      if (!ctx) {
        reject(new Error('无法创建 Canvas 上下文'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            // 如果压缩后更大，使用原图
            if (blob.size >= file.size && !compressed) {
              resolve({ blob: file, compressed: false });
            } else {
              resolve({ blob, compressed: true });
            }
          } else {
            reject(new Error('压缩失败'));
          }
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => reject(new Error('图片加载失败'));

    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsDataURL(file);
  });
}

/**
 * 生成预览 URL
 */
function createPreview(file: File | Blob): string {
  return URL.createObjectURL(file);
}

/**
 * 图片上传 Hook
 */
export function useImageUpload(options: UseImageUploadOptions = {}) {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8,
    maxFiles = 5,
    onError,
  } = options;

  const [images, setImages] = useState<ImageFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  /**
   * 处理单个文件
   */
  const processFile = useCallback(
    async (file: File): Promise<ImageFile | null> => {
      // 检查文件类型
      if (!file.type.startsWith('image/')) {
        onError?.('只支持上传图片文件');
        return null;
      }

      // 检查文件大小
      if (file.size > maxSize) {
        onError?.(`文件大小不能超过 ${Math.round(maxSize / 1024 / 1024)}MB`);
        return null;
      }

      try {
        // 压缩图片
        const { blob, compressed } = await compressImage(
          file,
          maxWidth,
          maxHeight,
          quality
        );

        const compressedFile = new File([blob], file.name, {
          type: blob.type,
        });

        if (compressed) {
          logger.info('Image compressed', {
            originalSize: file.size,
            compressedSize: blob.size,
            ratio: ((1 - blob.size / file.size) * 100).toFixed(1) + '%',
          });
        }

        return {
          id: `img_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          file: compressedFile,
          preview: createPreview(compressedFile),
          name: file.name,
          size: compressedFile.size,
          compressed,
        };
      } catch (error) {
        logger.error('Image processing failed', { error });
        onError?.('图片处理失败');
        return null;
      }
    },
    [maxSize, maxWidth, maxHeight, quality, onError]
  );

  /**
   * 添加图片
   */
  const addImages = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);

      // 检查数量限制
      if (images.length + fileArray.length > maxFiles) {
        onError?.(`最多只能上传 ${maxFiles} 张图片`);
        return;
      }

      setIsUploading(true);

      try {
        const results = await Promise.all(fileArray.map(processFile));
        const validImages = results.filter(Boolean) as ImageFile[];

        setImages((prev) => [...prev, ...validImages]);
      } finally {
        setIsUploading(false);
      }
    },
    [images.length, maxFiles, processFile, onError]
  );

  /**
   * 移除图片
   */
  const removeImage = useCallback((id: string) => {
    setImages((prev) => {
      const image = prev.find((img) => img.id === id);
      if (image) {
        URL.revokeObjectURL(image.preview);
      }
      return prev.filter((img) => img.id !== id);
    });
  }, []);

  /**
   * 清空所有图片
   */
  const clearImages = useCallback(() => {
    images.forEach((img) => URL.revokeObjectURL(img.preview));
    setImages([]);
  }, [images]);

  /**
   * 处理拖拽
   */
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        addImages(files);
      }
    },
    [addImages]
  );

  /**
   * 处理粘贴
   */
  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const items = e.clipboardData.items;
      const imageFiles: File[] = [];

      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            imageFiles.push(file);
          }
        }
      }

      if (imageFiles.length > 0) {
        e.preventDefault();
        addImages(imageFiles);
      }
    },
    [addImages]
  );

  /**
   * 打开文件选择器
   */
  const openFileSelector = useCallback(() => {
    inputRef.current?.click();
  }, []);

  /**
   * 处理文件选择
   */
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        addImages(files);
      }
      // 重置 input，允许重复选择同一文件
      e.target.value = '';
    },
    [addImages]
  );

  return {
    images,
    isUploading,
    inputRef,
    addImages,
    removeImage,
    clearImages,
    handleDrop,
    handlePaste,
    handleFileChange,
    openFileSelector,
  };
}
