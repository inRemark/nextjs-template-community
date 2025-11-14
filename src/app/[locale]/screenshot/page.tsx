/**
 * Web Screenshot Page
 * 网页截图主页面
 */

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { PortalLayout } from '@/shared/layout/portal-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Camera, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';
import {
  ScreenshotForm,
  ProgressBar,
  ScreenshotGrid,
} from '@/features/screenshot/components';
import type {
  ScreenshotOptions,
  BatchScreenshotResponse,
  ProgressInfo,
} from '@/features/screenshot/types';

export default function ScreenshotPage() {
  const t = useTranslations('screenshot.screenshot');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<BatchScreenshotResponse | null>(null);
  const [progress, setProgress] = useState<ProgressInfo | null>(null);

  const handleExtract = async (urls: string[], options: ScreenshotOptions) => {
    setLoading(true);
    setError('');
    setResult(null);

    // 初始化进度
    const total = urls.length * options.viewports.length;
    setProgress({
      current: 0,
      total,
      percentage: 0,
      success: 0,
      failed: 0,
    });

    try {
      const response = await fetch('/api/screenshot/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          urls,
          options,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to capture screenshots');
      }

      const data: BatchScreenshotResponse = await response.json();
      setResult(data);

      // 更新最终进度
      setProgress({
        current: data.completed,
        total: data.total,
        percentage: 100,
        success: data.success,
        failed: data.failed,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('form.errorEmpty'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <PortalLayout
      title={t('title')}
      description={t('description')}
    >
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* 顶部：输入区域 */}
        <div className="mb-12">
          <div className="max-w-2xl mx-auto">
            <ScreenshotForm onSubmit={handleExtract} loading={loading} />
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="max-w-2xl mx-auto mt-6">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          )}
        </div>

        {/* 进度显示 */}
        {loading && progress && (
          <div className="mb-12">
            <ProgressBar progress={progress} />
          </div>
        )}

        {/* 结果展示区域 */}
        {result && (
          <div className="space-y-8">
            {/* 统计卡片 */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <CardTitle>{t('statistics.title')}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">
                      {result.total}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {t('statistics.totalCount')}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 flex items-center justify-center gap-2">
                      <CheckCircle2 className="h-7 w-7" />
                      {result.success}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {t('statistics.successCount')}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600">
                      {result.failed}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {t('statistics.failureCount')}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">
                      {(
                        result.results
                          .filter((r) => r.status === 'success')
                          .reduce((sum, r) => sum + r.fileSize, 0) /
                        (1024 * 1024)
                      ).toFixed(1)}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {t('statistics.totalSize')}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 截图结果卡片 */}
            <Card>
              <CardContent className="pt-6">
                <ScreenshotGrid screenshots={result.results} />
              </CardContent>
            </Card>
          </div>
        )}

        {/* 空状态 */}
        {!loading && !result && (
          <div className="text-center py-20">
            <Camera className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">{t('empty.title')}</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {t('empty.description')}
            </p>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
