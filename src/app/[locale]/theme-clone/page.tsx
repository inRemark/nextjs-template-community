/**
 * Theme Clone Page
 * 主题克隆功能主页面
 */

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { PortalLayout } from '@/shared/layout/portal-layout';
import { ExtractForm } from '@/features/theme-clone/components/ExtractForm';
import { ColorPalette } from '@/features/theme-clone/components/ColorPalette';
import { FontList } from '@/features/theme-clone/components/FontList';
import { ExportPanel } from '@/features/theme-clone/components/ExportPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Palette, Type, Download, AlertCircle, Sparkles, Image as ImageIcon } from 'lucide-react';
import type {
  ThemeExtractionResult,
  ExtractOptions,
} from '@/features/theme-clone/types';

export default function ThemeClonePage() {
  const t = useTranslations('theme-clone.themeClone');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ThemeExtractionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleExtract = async (url: string, options: ExtractOptions) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/theme-clone/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, options }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Extraction failed');
      }

      const data: ThemeExtractionResult = await response.json();
      
      // 调试：查看截图数据
      if (options.screenshot) {
        // eslint-disable-next-line no-console
        console.log('Screenshot data received:', {
          hasScreenshot: !!data.screenshot,
          screenshotLength: data.screenshot?.length || 0,
          screenshotPrefix: data.screenshot?.substring(0, 50),
        });
      }
      
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('form.extracting'));
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
        {/* 上部：输入区域 */}
        <div className="mb-12">
          <div className="max-w-2xl mx-auto">
            <ExtractForm onExtract={handleExtract} loading={loading} />
          </div>

          {/* 错误提示 */}
          {error && (
            <Alert variant="destructive" className="mt-6 max-w-2xl mx-auto">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* 下部：结果展示区域 */}
        {result ? (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* 左侧：截图预览 */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="h-5 w-5 text-primary" />
                      <CardTitle>{t('preview.title')}</CardTitle>
                    </div>
                    {result.screenshot && (
                      <Badge variant="secondary">
                        {(result.screenshot.length / 1024).toFixed(0)} {t('preview.fileSize')}
                      </Badge>
                    )}
                  </div>
                  <CardDescription>
                    {result.url}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {result.screenshot ? (
                    <div className="rounded-lg overflow-hidden border">
                      <img
                        src={result.screenshot}
                        alt="Website screenshot"
                        className="w-full"
                        onError={(e) => {
                          // eslint-disable-next-line no-console
                          console.error('Screenshot failed to load');
                          const target = e.currentTarget;
                          target.style.display = 'none';
                          const error = document.createElement('div');
                          error.className = 'p-4 bg-red-50 text-red-600 text-sm';
                          error.textContent = '截图加载失败';
                          target.parentElement?.appendChild(error);
                        }}
                        onLoad={() => {
                          // eslint-disable-next-line no-console
                          console.log('Screenshot loaded successfully');
                        }}
                      />
                    </div>
                  ) : (
                    <div className="p-12 rounded-lg border border-dashed text-center text-muted-foreground">
                      <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-20" />
                      <p>{t('preview.noScreenshot')}</p>
                    </div>
                  )}
                  <div className="mt-4 text-xs text-muted-foreground">
                    {t('preview.generatedTime')}{new Date(result.timestamp).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 右侧：数据展示 */}
            <div className="space-y-6">
                {/* 统计信息卡片 */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <CardTitle>{t('statistics.title')}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-3xl font-bold text-primary">{result.colors.length}</p>
                      <p className="text-sm text-muted-foreground mt-1">{t('statistics.colors')}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-3xl font-bold text-primary">{result.fonts.length}</p>
                      <p className="text-sm text-muted-foreground mt-1">{t('statistics.fonts')}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-3xl font-bold text-primary">
                        {result.cssVariables.length}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">{t('statistics.cssVariables')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>{t('results.title')}</CardTitle>
                  <CardDescription>
                    {t('results.description')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="colors" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="colors">
                        <Palette className="h-4 w-4 mr-2" />
                        {t('results.colorsTab')}
                      </TabsTrigger>
                      <TabsTrigger value="fonts">
                        <Type className="h-4 w-4 mr-2" />
                        {t('results.fontsTab')}
                      </TabsTrigger>
                      <TabsTrigger value="export">
                        <Download className="h-4 w-4 mr-2" />
                        {t('results.exportTab')}
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="colors" className="mt-6">
                      <ColorPalette colors={result.colors} />
                    </TabsContent>

                    <TabsContent value="fonts" className="mt-6">
                      <FontList fonts={result.fonts} />
                    </TabsContent>

                    <TabsContent value="export" className="mt-6">
                      <ExportPanel result={result} />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <Palette className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
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
