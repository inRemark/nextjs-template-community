"use client";

import { useState, useEffect } from 'react';
import { Button } from '@shared/ui/button';
import { Moon, Sun, Monitor } from 'lucide-react';
import { cn } from '@shared/utils';
import { useTheme } from '@shared/theme';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="w-8 h-8" suppressHydrationWarning>
        <Sun className="w-4 h-4" />
      </Button>
    );
  }

  const cycleTheme = () => {
    const themes = ['light', 'dark', 'system'] as const;
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const getIcon = () => {
    if (theme === 'light') return <Sun className="w-4 h-4" />;
    if (theme === 'dark') return <Moon className="w-4 h-4" />;
    return <Monitor className="w-4 h-4" />;
  };

  const getTooltip = () => {
    if (theme === 'light') return '当前：明色主题 · 点击切换到暗色主题';
    if (theme === 'dark') return '当前：暗色主题 · 点击切换到系统主题';
    return '当前：跟随系统 · 点击切换到明色主题';
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="w-8 h-8"
      onClick={cycleTheme}
      title={getTooltip()}
    >
      {getIcon()}
    </Button>
  );
}

// 主题切换按钮组（可选）
export function ThemeToggleGroup() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);


  if (!mounted) {
    return (
      <div className="flex items-center border rounded-md p-1">
        <Button variant="ghost" size="sm" className="h-7 px-2">
          <Sun className="w-3 h-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center border rounded-md p-1 bg-background">
      <Button
        variant={theme === 'light' ? 'secondary' : 'ghost'}
        size="sm"
        className={cn(
          "h-7 px-2",
          theme === 'light' && "bg-primary/10 text-primary"
        )}
        onClick={() => setTheme('light')}
        title={theme === 'light' ? '当前：明色主题' : '切换到明色主题'}
      >
        <Sun className="w-3 h-3" />
      </Button>
      <Button
        variant={theme === 'dark' ? 'secondary' : 'ghost'}
        size="sm"
        className={cn(
          "h-7 px-2",
          theme === 'dark' && "bg-primary/10 text-primary"
        )}
        onClick={() => setTheme('dark')}
        title={theme === 'dark' ? '当前：暗色主题' : '切换到暗色主题'}
      >
        <Moon className="w-3 h-3" />
      </Button>
      <Button
        variant={theme === 'system' ? 'secondary' : 'ghost'}
        size="sm"
        className={cn(
          "h-7 px-2",
          theme === 'system' && "bg-primary/10 text-primary"
        )}
        onClick={() => setTheme('system')}
        title={theme === 'system' ? '当前：跟随系统' : '切换到跟随系统'}
      >
        <Monitor className="w-3 h-3" />
      </Button>
    </div>
  );
}
