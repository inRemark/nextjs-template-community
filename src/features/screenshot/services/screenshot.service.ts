/**
 * Screenshot Service
 * 截图服务（复用 Theme Clone 的 Puppeteer 配置）
 */

import puppeteer, { Browser } from 'puppeteer';
import type { ViewportConfig, ScreenshotResult } from '../types';

/**
 * 视口预设配置
 */
export const VIEWPORT_PRESETS: Record<string, ViewportConfig> = {
  desktop: {
    name: 'desktop',
    width: 1920,
    height: 1080,
  },
  tablet: {
    name: 'tablet',
    width: 768,
    height: 1024,
  },
  mobile: {
    name: 'mobile',
    width: 375,
    height: 667,
  },
};

/**
 * 单个截图
 */
async function captureSingleScreenshot(
  url: string,
  viewport: ViewportConfig,
  fullPage: boolean
): Promise<Omit<ScreenshotResult, 'id' | 'timestamp'>> {
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
    await page.setViewport({
      width: viewport.width,
      height: viewport.height,
    });

    // 访问网站
    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    // 等待页面加载
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // 截图
    const screenshot = await page.screenshot({
      fullPage,
      type: 'png',
      encoding: 'base64',
    });

    const screenshotData = `data:image/png;base64,${screenshot}`;

    // 计算文件大小
    const fileSize = Math.round((screenshot.length * 3) / 4);

    await page.close();

    return {
      url,
      viewport: viewport.name,
      screenshot: screenshotData,
      width: viewport.width,
      height: fullPage ? 0 : viewport.height, // 全页面高度未知
      fileSize,
      status: 'success',
    };
  } catch (error) {
    return {
      url,
      viewport: viewport.name,
      screenshot: '',
      width: 0,
      height: 0,
      fileSize: 0,
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * 批量截图
 */
export async function batchScreenshot(
  urls: string[],
  viewports: ViewportConfig[],
  fullPage: boolean,
  onProgress?: (current: number, total: number) => void
): Promise<ScreenshotResult[]> {
  const results: ScreenshotResult[] = [];
  const total = urls.length * viewports.length;
  let current = 0;

  for (const url of urls) {
    for (const viewport of viewports) {
      const result = await captureSingleScreenshot(url, viewport, fullPage);
      
      results.push({
        id: `${url}_${viewport.name}_${Date.now()}`,
        ...result,
        timestamp: new Date().toISOString(),
      });

      current++;
      if (onProgress) {
        onProgress(current, total);
      }
    }
  }

  return results;
}
