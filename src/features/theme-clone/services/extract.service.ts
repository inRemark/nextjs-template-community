/**
 * Theme Extraction Service
 * 基于 Puppeteer 的主题提取核心服务
 */

import puppeteer, { Browser, Page } from 'puppeteer';
import type {
  ColorInfo,
  FontInfo,
  CSSVariable,
  DesignToken,
  ExtractOptions,
  ThemeExtractionResult,
} from '../types';

/**
 * 提取网页颜色
 */
async function extractColors(page: Page): Promise<ColorInfo[]> {
  const colorsData = await page.evaluate(() => {
    const colorMap = new Map<string, { count: number; type: string }>();
    const elements = document.querySelectorAll('*');

    elements.forEach((el) => {
      const style = window.getComputedStyle(el);

      const props = [
        { key: 'color', type: 'color' },
        { key: 'backgroundColor', type: 'backgroundColor' },
        { key: 'borderColor', type: 'borderColor' },
      ];

      props.forEach(({ key, type }) => {
        const value = (style as Record<string, string>)[key];
        if (value && value !== 'rgba(0, 0, 0, 0)' && value !== 'transparent') {
          const existing = colorMap.get(value);
          if (existing) {
            existing.count++;
          } else {
            colorMap.set(value, { count: 1, type });
          }
        }
      });
    });

    return Array.from(colorMap.entries()).map(([value, data]) => ({
      value,
      count: data.count,
      type: data.type as 'color' | 'backgroundColor' | 'borderColor',
    }));
  });

  return colorsData.sort((a, b) => b.count - a.count).slice(0, 20);
}

/**
 * 提取 CSS 变量
 */
async function extractCSSVariables(page: Page): Promise<CSSVariable[]> {
  return await page.evaluate(() => {
    const root = document.documentElement;
    const styles = getComputedStyle(root);
    const cssVars: CSSVariable[] = [];

    for (let i = 0; i < styles.length; i++) {
      const prop = styles[i];
      if (prop.startsWith('--')) {
        cssVars.push({
          name: prop,
          value: styles.getPropertyValue(prop).trim(),
        });
      }
    }

    return cssVars;
  });
}

/**
 * 提取字体信息
 */
async function extractFonts(page: Page): Promise<FontInfo[]> {
  const fontsData = await page.evaluate(() => {
    const fontMap = new Map<string, number>();
    const elements = document.querySelectorAll('*');

    elements.forEach((el) => {
      const style = window.getComputedStyle(el);
      const fontFamily = style.fontFamily;
      const fontSize = style.fontSize;
      const fontWeight = style.fontWeight;
      const lineHeight = style.lineHeight;

      const key = `${fontFamily}|${fontSize}|${fontWeight}|${lineHeight}`;
      fontMap.set(key, (fontMap.get(key) || 0) + 1);
    });

    return Array.from(fontMap.entries()).map(([key, count]) => {
      const [family, size, weight, lineHeight] = key.split('|');
      return { family, size, weight, lineHeight, count };
    });
  });

  return fontsData.sort((a, b) => b.count - a.count).slice(0, 15);
}

/**
 * 提取设计 Token
 */
async function extractDesignTokens(page: Page): Promise<DesignToken> {
  const tokensData = await page.evaluate(() => {
    const tokens = {
      spacing: new Map<string, number>(),
      radius: new Map<string, number>(),
      shadows: new Map<string, number>(),
    };

    const elements = document.querySelectorAll('*');

    elements.forEach((el) => {
      const style = window.getComputedStyle(el);

      // 收集间距
      ['padding', 'margin'].forEach((prop) => {
        ['Top', 'Right', 'Bottom', 'Left'].forEach((side) => {
          const value = (style as Record<string, string>)[`${prop}${side}`];
          if (value && value !== '0px') {
            tokens.spacing.set(value, (tokens.spacing.get(value) || 0) + 1);
          }
        });
      });

      // 收集圆角
      const radius = style.borderRadius;
      if (radius && radius !== '0px') {
        tokens.radius.set(radius, (tokens.radius.get(radius) || 0) + 1);
      }

      // 收集阴影
      const shadow = style.boxShadow;
      if (shadow && shadow !== 'none') {
        tokens.shadows.set(shadow, (tokens.shadows.get(shadow) || 0) + 1);
      }
    });

    return {
      spacing: Array.from(tokens.spacing.entries()),
      radius: Array.from(tokens.radius.entries()),
      shadows: Array.from(tokens.shadows.entries()),
    };
  });

  return {
    spacing: tokensData.spacing
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([value, count]) => ({ value, count })),
    radius: tokensData.radius
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([value, count]) => ({ value, count })),
    shadows: tokensData.shadows
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([value, count]) => ({ value, count })),
  };
}

/**
 * 提取网站主题
 */
export async function extractWebsiteTheme(
  url: string,
  options: ExtractOptions = {}
): Promise<Omit<ThemeExtractionResult, 'id' | 'status'>> {
  let browser: Browser | null = null;

  try {
    // 启动浏览器
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
      ],
    });

    const page = await browser.newPage();

    // 设置视口
    const viewportSizes = {
      mobile: { width: 375, height: 667 },
      tablet: { width: 768, height: 1024 },
      desktop: { width: 1920, height: 1080 },
    };

    const viewport = viewportSizes[options.viewport || 'desktop'];
    await page.setViewport(viewport);

    // 访问网站
    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    // 等待页面加载
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // 提取数据
    const [colors, fonts, cssVariables, tokens] = await Promise.all([
      extractColors(page),
      extractFonts(page),
      extractCSSVariables(page),
      extractDesignTokens(page),
    ]);

    // 截图（可选）
    let screenshot: string | undefined;
    if (options.screenshot) {
      const buffer = await page.screenshot({
        fullPage: options.fullPage || false,
        type: 'png',
        encoding: 'base64',
      });
      screenshot = `data:image/png;base64,${buffer}`;
      
      // 调试：输出截图信息
      // eslint-disable-next-line no-console
      console.log('Screenshot generated:', {
        base64Length: screenshot.length,
        prefix: screenshot.substring(0, 50),
      });
    }

    await page.close();

    return {
      url,
      timestamp: new Date().toISOString(),
      colors,
      fonts,
      cssVariables,
      tokens,
      screenshot,
    };
  } catch (error) {
    throw new Error(
      `Failed to extract theme: ${error instanceof Error ? error.message : String(error)}`
    );
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
