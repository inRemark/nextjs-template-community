/**
 * ScreenshotGrid Component
 * 截图网格展示
 */

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Download, CheckSquare, Square } from 'lucide-react';
import { ScreenshotCard } from './ScreenshotCard';
import { ImagePreview } from './ImagePreview';
import type { ScreenshotResult } from '../types';
import { packScreenshotsToZip, downloadZip } from '../services/zip.service';

interface ScreenshotGridProps {
  screenshots: ScreenshotResult[];
}

export function ScreenshotGrid({ screenshots }: ScreenshotGridProps) {
  const t = useTranslations('screenshot.screenshot');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [downloading, setDownloading] = useState(false);

  const successScreenshots = screenshots.filter((s) => s.status === 'success');

  // 按 URL 分组
  const groupedByUrl = Array.from(
    screenshots.reduce(
      (acc, screenshot) => {
        if (!acc.has(screenshot.url)) {
          acc.set(screenshot.url, []);
        }
        acc.get(screenshot.url)!.push(screenshot);
        return acc;
      },
      new Map<string, ScreenshotResult[]>()
    )
  );

  const handleSelectAll = () => {
    if (selectedIds.size === successScreenshots.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(successScreenshots.map((s) => s.id)));
    }
  };

  const handleSelect = (id: string, selected: boolean) => {
    const newSelected = new Set(selectedIds);
    if (selected) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const handleDownloadSelected = async () => {
    const toDownload = selectedIds.size > 0
      ? screenshots.filter((s) => selectedIds.has(s.id))
      : successScreenshots;

    if (toDownload.length === 0) return;

    setDownloading(true);
    try {
      const zip = await packScreenshotsToZip(toDownload, true);
      const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
      downloadZip(zip, `screenshots_${timestamp}.zip`);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Download failed:', error);
    } finally {
      setDownloading(false);
    }
  };

  const handlePreview = (index: number) => {
    setPreviewIndex(index);
  };

  const handleClosePreview = () => {
    setPreviewIndex(null);
  };

  const handleNextPreview = () => {
    if (previewIndex !== null && previewIndex < successScreenshots.length - 1) {
      setPreviewIndex(previewIndex + 1);
    }
  };

  const handlePrevPreview = () => {
    if (previewIndex !== null && previewIndex > 0) {
      setPreviewIndex(previewIndex - 1);
    }
  };

  const allSelected = selectedIds.size === successScreenshots.length && successScreenshots.length > 0;

  return (
    <div className="space-y-8">
      {/* 工具栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold">
            {t('results.title')}
          </h3>
          <Badge variant="secondary">
            共 {screenshots.length} {t('results.files')}
          </Badge>
          {screenshots.some((s) => s.status === 'failed') && (
            <Badge variant="destructive">
              {screenshots.filter((s) => s.status === 'failed').length} 个失败
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
            className="gap-2"
          >
            {allSelected ? (
              <>
                <CheckSquare className="h-4 w-4" />
                取消全选
              </>
            ) : (
              <>
                <Square className="h-4 w-4" />
                {t('results.selectAll')}
              </>
            )}
          </Button>
          <Button
            size="sm"
            onClick={handleDownloadSelected}
            disabled={downloading || successScreenshots.length === 0}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            {selectedIds.size > 0
              ? `下载选中 (${selectedIds.size})`
              : t('results.downloadSelected')}
          </Button>
        </div>
      </div>

      {/* 按URL分组展示 */}
      <div className="space-y-8">
        {groupedByUrl.map(([url, urlScreenshots]) => (
          <div key={url}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-semibold truncate">{url}</h4>
              <Badge variant="secondary">{urlScreenshots.length} {t('results.files')}</Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {urlScreenshots.map((screenshot, index) => (
                <ScreenshotCard
                  key={screenshot.id}
                  screenshot={screenshot}
                  onPreview={() => handlePreview(index)}
                  selected={selectedIds.has(screenshot.id)}
                  onSelect={(selected) => handleSelect(screenshot.id, selected)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 大图预览 */}
      {previewIndex !== null && (
        <ImagePreview
          images={successScreenshots}
          currentIndex={previewIndex}
          onClose={handleClosePreview}
          onNext={handleNextPreview}
          onPrev={handlePrevPreview}
        />
      )}
    </div>
  );
}
