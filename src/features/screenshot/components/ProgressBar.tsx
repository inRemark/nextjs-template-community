/**
 * ProgressBar Component
 * 进度条显示
 */

'use client';

import { useTranslations } from 'next-intl';
import { Progress } from '@/shared/ui/progress';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import type { ProgressInfo } from '../types';

interface ProgressBarProps {
  progress: ProgressInfo;
}

export function ProgressBar({ progress }: ProgressBarProps) {
  const t = useTranslations('screenshot.screenshot');
  const { current, total, percentage, currentUrl, currentViewport, success, failed } = progress;

  return (
    <div className="space-y-4 p-6 bg-muted/50 rounded-lg border">
      {/* 进度条 */}
      <div className="space-y-2">
        <div className="flex items-center justify-center text-sm">
          <div className="text-center">
            <span className="font-medium block">
              {t('progress.title')}
            </span>
            <span className="text-muted-foreground text-xs mt-1">
              {current} / {total} ({percentage}%)
            </span>
          </div>
        </div>
        <Progress value={percentage} className="h-2" />
      </div>

      {/* 当前处理 */}
      {currentUrl && (
        <div className="flex items-center justify-center gap-2 text-sm">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span className="text-muted-foreground">正在处理:</span>
          <span className="font-mono truncate">{currentUrl}</span>
          {currentViewport && (
            <span className="text-muted-foreground">({currentViewport})</span>
          )}
        </div>
      )}

      {/* 统计 */}
      <div className="flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle2 className="h-4 w-4" />
          <span>{t('progress.successLabel')}: {success}</span>
        </div>
        {failed > 0 && (
          <div className="flex items-center gap-2 text-red-600">
            <XCircle className="h-4 w-4" />
            <span>{t('progress.failureLabel')}: {failed}</span>
          </div>
        )}
      </div>
    </div>
  );
}
