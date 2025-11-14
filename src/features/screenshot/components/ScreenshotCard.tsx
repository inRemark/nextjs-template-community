/**
 * ScreenshotCard Component
 * 单个截图卡片
 */

'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Checkbox } from '@/shared/ui/checkbox';
import { Download, Eye, CheckCircle2, XCircle, Copy, Check } from 'lucide-react';
import type { ScreenshotResult } from '../types';
import { extractWebsiteName, generateFilename } from '../utils/helpers';
import { downloadSingleImage } from '../services/zip.service';

interface ScreenshotCardProps {
  screenshot: ScreenshotResult;
  onPreview: () => void;
  selected?: boolean;
  onSelect?: (selected: boolean) => void;
}

export function ScreenshotCard({
  screenshot,
  onPreview,
  selected = false,
  onSelect,
}: ScreenshotCardProps) {
  const [copied, setCopied] = useState(false);

  const websiteName = extractWebsiteName(screenshot.url);
  const filename = generateFilename(screenshot.url, screenshot.viewport, screenshot.timestamp);

  const handleDownload = () => {
    if (screenshot.status === 'success' && screenshot.screenshot) {
      downloadSingleImage(screenshot.screenshot, filename);
    }
  };

  const handleCopyUrl = async () => {
    await navigator.clipboard.writeText(screenshot.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getViewportLabel = (viewport: string): string => {
    const labels: Record<string, string> = {
      desktop: '桌面',
      tablet: '平板',
      mobile: '手机',
    };
    return labels[viewport] || viewport;
  };

  return (
    <Card
      className={`group overflow-hidden transition-all hover:shadow-lg ${
        selected ? 'ring-2 ring-primary' : ''
      }`}
    >
      <CardContent className="p-0">
        {/* 缩略图 */}
        <div className="relative aspect-[4/3] bg-muted overflow-hidden">
          {screenshot.status === 'success' && screenshot.screenshot ? (
            <>
              <img
                src={screenshot.screenshot}
                alt={`${websiteName} - ${screenshot.viewport}`}
                className="w-full h-full object-cover object-top"
              />
              {/* Hover 操作层 */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={onPreview}
                  className="gap-2"
                >
                  <Eye className="h-4 w-4" />
                  预览
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleDownload}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  下载
                </Button>
              </div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center space-y-2">
                <XCircle className="h-12 w-12 text-red-500 mx-auto" />
                <p className="text-sm text-muted-foreground">截图失败</p>
                {screenshot.error && (
                  <p className="text-xs text-red-500 max-w-[200px] mx-auto">
                    {screenshot.error}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* 选择框 */}
          {onSelect && screenshot.status === 'success' && (
            <div className="absolute top-2 left-2">
              <Checkbox
                checked={selected}
                onCheckedChange={onSelect}
                className="bg-white/90 backdrop-blur"
              />
            </div>
          )}

          {/* 状态标识 */}
          <div className="absolute top-2 right-2">
            {screenshot.status === 'success' ? (
              <Badge variant="secondary" className="bg-green-500/90 text-white">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                成功
              </Badge>
            ) : (
              <Badge variant="destructive" className="bg-red-500/90">
                <XCircle className="h-3 w-3 mr-1" />
                失败
              </Badge>
            )}
          </div>
        </div>

        {/* 信息区 */}
        <div className="p-4 space-y-3">
          {/* 网站名称 */}
          <div className="space-y-1">
            <h3 className="font-semibold text-sm truncate" title={websiteName}>
              {websiteName}
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyUrl}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors truncate flex-1 text-left"
                title={screenshot.url}
              >
                {screenshot.url}
              </button>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={handleCopyUrl}
              >
                {copied ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>

          {/* 元数据 */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {getViewportLabel(screenshot.viewport)}
              </Badge>
              {screenshot.status === 'success' && (
                <span>{formatFileSize(screenshot.fileSize)}</span>
              )}
            </div>
            {screenshot.status === 'success' && (
              <span className="font-mono">
                {screenshot.width} x {screenshot.height || '?'}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
