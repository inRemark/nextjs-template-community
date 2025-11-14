/**
 * ImagePreview Component
 * 大图预览模态框
 */

'use client';

import { useEffect } from 'react';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { X, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import type { ScreenshotResult } from '../types';
import { extractWebsiteName, generateFilename } from '../utils/helpers';
import { downloadSingleImage } from '../services/zip.service';

interface ImagePreviewProps {
  images: ScreenshotResult[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export function ImagePreview({
  images,
  currentIndex,
  onClose,
  onNext,
  onPrev,
}: ImagePreviewProps) {
  const current = images[currentIndex];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        onPrev();
      } else if (e.key === 'ArrowRight') {
        onNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNext, onPrev]);

  const handleDownload = () => {
    if (current.screenshot) {
      const filename = generateFilename(current.url, current.viewport, current.timestamp);
      downloadSingleImage(current.screenshot, filename);
    }
  };

  const websiteName = extractWebsiteName(current.url);

  const getViewportLabel = (viewport: string): string => {
    const labels: Record<string, string> = {
      desktop: '桌面',
      tablet: '平板',
      mobile: '手机',
    };
    return labels[viewport] || viewport;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
      {/* 顶部工具栏 */}
      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-white font-semibold">{websiteName}</h3>
            <Badge variant="secondary">{getViewportLabel(current.viewport)}</Badge>
            <span className="text-white/70 text-sm">
              {currentIndex + 1} / {images.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              className="text-white hover:bg-white/10"
            >
              <Download className="h-4 w-4 mr-2" />
              下载
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* 图片 */}
      <div className="max-w-7xl max-h-[90vh] overflow-auto p-4">
        <img
          src={current.screenshot}
          alt={`${websiteName} - ${current.viewport}`}
          className="w-full h-auto"
        />
      </div>

      {/* 导航按钮 */}
      {currentIndex > 0 && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10 h-12 w-12"
        >
          <ChevronLeft className="h-8 w-8" />
        </Button>
      )}
      {currentIndex < images.length - 1 && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10 h-12 w-12"
        >
          <ChevronRight className="h-8 w-8" />
        </Button>
      )}

      {/* 底部信息 */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="text-white/70 text-sm space-y-1">
            <p className="truncate">URL: {current.url}</p>
            <p>
              尺寸: {current.width} x {current.height || '?'} · 
              大小: {(current.fileSize / 1024).toFixed(1)} KB
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
