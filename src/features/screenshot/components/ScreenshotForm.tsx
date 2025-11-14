/**
 * ScreenshotForm Component
 * URL 输入表单
 */

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Label } from '@/shared/ui/label';
import { Button } from '@/shared/ui/button';
import { Checkbox } from '@/shared/ui/checkbox';
import { Textarea } from '@/shared/ui/textarea';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import type { ScreenshotOptions } from '../types';

interface ScreenshotFormProps {
  onSubmit: (urls: string[], options: ScreenshotOptions) => void;
  loading?: boolean;
}

export function ScreenshotForm({ onSubmit, loading = false }: ScreenshotFormProps) {
  const t = useTranslations('screenshot.screenshot');
  const [urlText, setUrlText] = useState('');
  const [fullPage, setFullPage] = useState(false);
  const [viewports, setViewports] = useState({
    desktop: true,
    tablet: false,
    mobile: false,
  });
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 解析 URL 列表
    const urls = urlText
      .split('\n')
      .map((url) => url.trim())
      .filter((url) => url.length > 0);

    // 验证
    if (urls.length === 0) {
      setError(t('form.errorEmpty'));
      return;
    }

    if (urls.length > 10) {
      setError(t('form.errorTooMany'));
      return;
    }

    // 自动补全协议
    const processedUrls = urls.map((url) => {
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return `https://${url}`;
      }
      return url;
    });

    // 验证 URL 格式
    const invalidUrls = processedUrls.filter((url) => {
      try {
        new URL(url);
        return false;
      } catch {
        return true;
      }
    });

    if (invalidUrls.length > 0) {
      setError(`${t('form.errorInvalidFormat')}${invalidUrls.join(', ')}`);
      return;
    }

    // 检查是否选择了视口
    const selectedViewports = Object.entries(viewports)
      .filter(([, selected]) => selected)
      .map(([name]) => ({
        name: name as 'desktop' | 'tablet' | 'mobile',
        width: name === 'desktop' ? 1920 : name === 'tablet' ? 768 : 375,
        height: name === 'desktop' ? 1080 : name === 'tablet' ? 1024 : 667,
      }));

    if (selectedViewports.length === 0) {
      setError(t('form.errorNoViewport'));
      return;
    }

    // 提交
    onSubmit(processedUrls, {
      fullPage,
      viewports: selectedViewports,
    });
  };

  const validUrlCount = urlText
    .split('\n')
    .filter((url) => url.trim().length > 0).length;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* URL 输入 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="urls" className="text-base font-medium">
            {t('form.urlsLabel')}
          </Label>
          <span className="text-sm text-muted-foreground">
            {validUrlCount} {t('form.urlCount')}
          </span>
        </div>
        <Textarea
          id="urls"
          placeholder={t('form.urlsPlaceholder')}
          value={urlText}
          onChange={(e) => setUrlText(e.target.value)}
          disabled={loading}
          className="min-h-[150px] font-mono text-sm"
          required
        />
        <p className="text-xs text-muted-foreground">
          {t('form.urlsHint')}
        </p>
      </div>

      {/* 截图模式 */}
      <div className="space-y-3">
        <Label className="text-base font-medium">{t('form.screenshotModeLabel')}</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <Checkbox
              id="viewport"
              checked={!fullPage}
              onCheckedChange={(checked) => setFullPage(!checked as boolean)}
              disabled={loading}
            />
            <Label
              htmlFor="viewport"
              className="font-normal cursor-pointer select-none flex-1"
            >
              {t('form.viewportModeViewport')}
              <span className="text-muted-foreground ml-2 text-sm">
                ({t('form.viewportModeFast')})
              </span>
            </Label>
          </div>
          <div className="flex items-center space-x-3">
            <Checkbox
              id="fullpage"
              checked={fullPage}
              onCheckedChange={(checked) => setFullPage(checked as boolean)}
              disabled={loading}
            />
            <Label
              htmlFor="fullpage"
              className="font-normal cursor-pointer select-none flex-1"
            >
              {t('form.viewportModeFullpage')}
              <span className="text-muted-foreground ml-2 text-sm">
                ({t('form.viewportModeScroll')})
              </span>
            </Label>
          </div>
        </div>
      </div>

      {/* 视口尺寸 */}
      <div className="space-y-3">
        <Label className="text-base font-medium">{t('form.viewportLabel')}</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <Checkbox
              id="desktop"
              checked={viewports.desktop}
              onCheckedChange={(checked) =>
                setViewports({ ...viewports, desktop: checked as boolean })
              }
              disabled={loading}
            />
            <Label
              htmlFor="desktop"
              className="font-normal cursor-pointer select-none flex-1"
            >
              {t('form.viewportDesktop')}
              <span className="text-muted-foreground ml-2 text-sm">
                ({t('form.viewportDesktopSize')})
              </span>
            </Label>
          </div>
          <div className="flex items-center space-x-3">
            <Checkbox
              id="tablet"
              checked={viewports.tablet}
              onCheckedChange={(checked) =>
                setViewports({ ...viewports, tablet: checked as boolean })
              }
              disabled={loading}
            />
            <Label
              htmlFor="tablet"
              className="font-normal cursor-pointer select-none flex-1"
            >
              {t('form.viewportTablet')}
              <span className="text-muted-foreground ml-2 text-sm">
                ({t('form.viewportTabletSize')})
              </span>
            </Label>
          </div>
          <div className="flex items-center space-x-3">
            <Checkbox
              id="mobile"
              checked={viewports.mobile}
              onCheckedChange={(checked) =>
                setViewports({ ...viewports, mobile: checked as boolean })
              }
              disabled={loading}
            />
            <Label
              htmlFor="mobile"
              className="font-normal cursor-pointer select-none flex-1"
            >
              {t('form.viewportMobile')}
              <span className="text-muted-foreground ml-2 text-sm">
                ({t('form.viewportMobileSize')})
              </span>
            </Label>
          </div>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 提交按钮 */}
      <div className="flex justify-center">
        <Button
          type="submit"
          size="lg"
          className="w-60"
          disabled={loading || validUrlCount === 0}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              {t('form.loading')}
            </>
          ) : (
            <>{t('form.submitButton')}</>
          )}
        </Button>
      </div>
    </form>
  );
}
