/**
 * Color Palette Component
 * 颜色调色板展示组件
 */

'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import type { ColorInfo } from '@/features/theme-clone/types';

interface ColorPaletteProps {
  colors: ColorInfo[];
}

export function ColorPalette({ colors }: ColorPaletteProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getColorTypeLabel = (type: ColorInfo['type']): string => {
    const labels = {
      color: '文字颜色',
      backgroundColor: '背景颜色',
      borderColor: '边框颜色',
    };
    return labels[type];
  };

  const rgbToHex = (rgb: string): string => {
    // 处理 RGB 格式：rgb(r, g, b) 或 rgba(r, g, b, a)
    const match = rgb.match(/rgba?\((\d+),?\s*(\d+),?\s*(\d+)(?:,?\s*[\d.]+)?\)/);
    if (!match) {
      // 如果已经是 HEX 格式或其他格式，直接返回
      return rgb.startsWith('#') ? rgb : rgb;
    }

    const [, r, g, b] = match;
    const hex = `#${[r, g, b]
      .map((x) => {
        const num = parseInt(x);
        const hexStr = num.toString(16);
        return hexStr.length === 1 ? '0' + hexStr : hexStr;
      })
      .join('')}`;
    
    return hex.toUpperCase();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">配色方案</h3>
        <span className="text-sm text-muted-foreground">
          共 {colors.length} 个颜色
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {colors.map((color, index) => {
          const hex = rgbToHex(color.value);
          const displayValue = hex.startsWith('#') ? hex : color.value;
          const isCopied = copiedIndex === index;

          return (
            <div
              key={index}
              className="group relative rounded-lg border overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* 颜色块 */}
              <div
                className="h-24 w-full cursor-pointer"
                style={{ backgroundColor: color.value }}
                onClick={() => copyToClipboard(displayValue, index)}
                title={`点击复制 ${displayValue}`}
              />

              {/* 信息区 */}
              <div className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <code className="text-sm font-mono truncate" title={displayValue}>
                    {displayValue}
                  </code>
                  <button
                    onClick={() => copyToClipboard(displayValue, index)}
                    className="p-1 rounded hover:bg-accent transition-colors flex-shrink-0 ml-2"
                    title="复制"
                  >
                    {isCopied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {/* 颜色类型 */}
                <div className="text-xs text-muted-foreground ">
                  {getColorTypeLabel(color.type)}
                </div>

                {/* 使用次数 */}
                <div className="text-xs text-muted-foreground ">
                  使用 {color.count} 次
                </div>

                {color.semantic && (
                  <div className="text-xs">
                    <span className="inline-block px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {color.semantic}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
