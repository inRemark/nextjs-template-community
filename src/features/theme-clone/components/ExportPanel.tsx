/**
 * Export Panel Component
 * 导出面板组件
 */

'use client';

import { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Download, Copy, Check, Loader2 } from 'lucide-react';
import type {
  ThemeExtractionResult,
  ExportFormat,
} from '@/features/theme-clone/types';

interface ExportPanelProps {
  result: ThemeExtractionResult;
}

export function ExportPanel({ result }: ExportPanelProps) {
  const [loading, setLoading] = useState(false);
  const [copiedFormat, setCopiedFormat] = useState<ExportFormat | null>(null);

  const exportFormats: Array<{
    format: ExportFormat;
    label: string;
    description: string;
    icon: string;
  }> = [
    {
      format: 'tailwind',
      label: 'Tailwind CSS',
      description: 'tailwind.config.ts',
      icon: '🎨',
    },
    { format: 'css', label: 'CSS 变量', description: 'theme.css', icon: '📝' },
    { format: 'mui', label: 'Material-UI', description: 'theme.ts', icon: '⚙️' },
    {
      format: 'json',
      label: 'JSON Token',
      description: 'design-tokens.json',
      icon: '💾',
    },
    { format: 'scss', label: 'SCSS', description: 'theme.scss', icon: '🎯' },
  ];

  const handleExport = async (format: ExportFormat, action: 'download' | 'copy') => {
    setLoading(true);

    try {
      const response = await fetch('/api/theme-clone/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          extractionId: result.id,
          format,
          extractionData: result,
        }),
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const data = await response.json();

      if (action === 'download') {
        // 下载文件
        const blob = new Blob([data.code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = data.filename;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        // 复制到剪贴板
        await navigator.clipboard.writeText(data.code);
        setCopiedFormat(format);
        setTimeout(() => setCopiedFormat(null), 2000);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('导出失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">导出配置</h3>
        <span className="text-sm text-muted-foreground">
          选择框架导出主题代码
        </span>
      </div>

      <div className="grid gap-4">
        {exportFormats.map(({ format, label, description, icon }) => {
          const isCopied = copiedFormat === format;

          return (
            <div
              key={format}
              className="flex items-center justify-between p-4 rounded-lg border hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{icon}</span>
                <div>
                  <h4 className="font-semibold">{label}</h4>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleExport(format, 'copy')}
                  disabled={loading}
                >
                  {isCopied ? (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      已复制
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1" />
                      复制
                    </>
                  )}
                </Button>

                <Button
                  size="sm"
                  onClick={() => handleExport(format, 'download')}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-1" />
                  )}
                  下载
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
