/**
 * Font List Component
 * 字体列表展示组件
 */

'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import type { FontInfo } from '@/features/theme-clone/types';

interface FontListProps {
  fonts: FontInfo[];
}

export function FontList({ fonts }: FontListProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">字体系统</h3>
        <span className="text-sm text-muted-foreground">
          共 {fonts.length} 个字体
        </span>
      </div>

      <div className="space-y-3">
        {fonts.map((font, index) => {
          const isCopied = copiedIndex === index;
          const fontFamily = font.family.split(',')[0].replace(/['"]/g, '');

          return (
            <div
              key={index}
              className="group p-4 rounded-lg border hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                {/* 字体信息 */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h4
                      className="text-xl font-semibold"
                      style={{ fontFamily: font.family }}
                    >
                      {fontFamily}
                    </h4>
                    {index === 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        主字体
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span>大小: {font.size}</span>
                    <span>字重: {font.weight}</span>
                    <span>行高: {font.lineHeight}</span>
                    <span>使用: {font.count} 次</span>
                  </div>

                  {/* 字体回退栈 */}
                  <details className="text-sm">
                    <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                      查看完整字体栈
                    </summary>
                    <code className="mt-2 block p-2 rounded bg-muted text-xs">
                      {font.family}
                    </code>
                  </details>
                </div>

                {/* 复制按钮 */}
                <button
                  onClick={() => copyToClipboard(font.family, index)}
                  className="p-2 rounded hover:bg-accent transition-colors"
                  title="复制字体族"
                >
                  {isCopied ? (
                    <Check className="h-5 w-5 text-green-600" />
                  ) : (
                    <Copy className="h-5 w-5" />
                  )}
                </button>
              </div>

              {/* 字体预览 */}
              <div className="mt-4 p-4 rounded-md bg-accent/50">
                <p
                  className="text-sm"
                  style={{
                    fontFamily: font.family,
                    fontSize: font.size,
                    fontWeight: font.weight,
                    lineHeight: font.lineHeight,
                  }}
                >
                  The quick brown fox jumps over the lazy dog.
                </p>
                <p
                  className="text-sm mt-1"
                  style={{
                    fontFamily: font.family,
                    fontSize: font.size,
                    fontWeight: font.weight,
                    lineHeight: font.lineHeight,
                  }}
                >
                  快速的棕色狐狸跳过懒狗。
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
