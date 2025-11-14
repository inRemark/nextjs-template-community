/**
 * Theme Extraction Form Component
 * URL 输入表单组件
 */

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Loader2 } from 'lucide-react';
import type { ExtractOptions } from '@/features/theme-clone/types';

interface ExtractFormProps {
  onExtract: (url: string, options: ExtractOptions) => Promise<void>;
  loading?: boolean;
}

export function ExtractForm({ onExtract, loading = false }: ExtractFormProps) {
  const t = useTranslations('theme-clone.themeClone');
  const [url, setUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url.trim()) return;

    const options: ExtractOptions = {
      screenshot: true,
      viewport: 'desktop',
      fullPage: false,
    };

    await onExtract(url.trim(), options);
  };

  const exampleUrls = [
    'https://vercel.com',
    'https://linear.app',
    'https://stripe.com',
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-3">
        <Label htmlFor="url" className="text-center block text-base font-medium">
          {t('form.urlLabel')}
        </Label>
        <Input
          id="url"
          type="url"
          placeholder={t('form.urlPlaceholder')}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={loading}
          required
          className="h-14 text-lg rounded-full px-6 text-center"
        />
        <div className="flex flex-wrap justify-center gap-2 text-sm text-muted-foreground">
          <span>{t('form.exampleLabel')}</span>
          {exampleUrls.map((exampleUrl) => (
            <button
              key={exampleUrl}
              type="button"
              onClick={() => setUrl(exampleUrl)}
              className="text-primary hover:underline"
              disabled={loading}
            >
              {exampleUrl}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-center">
        <Button
          type="submit"
          size="lg"
          disabled={loading || !url.trim()}
          className="w-60"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              {t('form.extracting')}
            </>
          ) : (
            t('form.submitButton')
          )}
        </Button>
      </div>
    </form>
  );
}
