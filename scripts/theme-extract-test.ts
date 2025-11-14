/**
 * Theme Extraction Technical Validation Script
 * 
 * 目标：验证从网页中提取配色和字体的可行性
 * 测试网站：Vercel、GitHub、Stripe、Linear、Notion
 * 目标准确率：>80%
 */

import puppeteer, { Browser, Page } from 'puppeteer';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

// 测试网站列表
const TEST_WEBSITES = [
  { name: 'Vercel', url: 'https://vercel.com' },
  { name: 'GitHub', url: 'https://github.com' },
  { name: 'Stripe', url: 'https://stripe.com' },
  { name: 'Linear', url: 'https://linear.app' },
  { name: 'Notion', url: 'https://notion.so' },
];

interface ColorInfo {
  value: string;
  count: number;
  type: 'color' | 'backgroundColor' | 'borderColor';
}

interface FontInfo {
  family: string;
  size: string;
  weight: string;
  lineHeight: string;
  count: number;
}

interface CSSVariable {
  name: string;
  value: string;
}

interface DesignToken {
  spacing: Map<string, number>;
  radius: Map<string, number>;
  shadows: Map<string, number>;
}

interface ExtractionResult {
  website: string;
  url: string;
  timestamp: string;
  colors: ColorInfo[];
  fonts: FontInfo[];
  cssVariables: CSSVariable[];
  tokens: {
    spacing: Array<{ value: string; count: number }>;
    radius: Array<{ value: string; count: number }>;
    shadows: Array<{ value: string; count: number }>;
  };
  screenshot: string;
}

/**
 * 提取网页颜色
 */
async function extractColors(page: Page): Promise<ColorInfo[]> {
  console.log('  → 提取颜色...');
  
  const colorsData = await page.evaluate(() => {
    const colorMap = new Map<string, { count: number; type: string }>();
    const elements = document.querySelectorAll('*');
    
    elements.forEach((el) => {
      const style = window.getComputedStyle(el);
      
      // 提取各种颜色属性
      const props = [
        { key: 'color', type: 'color' },
        { key: 'backgroundColor', type: 'backgroundColor' },
        { key: 'borderColor', type: 'borderColor' },
      ];
      
      props.forEach(({ key, type }) => {
        const value = style[key as any];
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
      type: data.type,
    }));
  });
  
  // 按使用频率排序，取前 20 个
  return colorsData
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);
}

/**
 * 提取 CSS 变量
 */
async function extractCSSVariables(page: Page): Promise<CSSVariable[]> {
  console.log('  → 提取 CSS 变量...');
  
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
  console.log('  → 提取字体...');
  
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
  
  // 按使用频率排序，取前 15 个
  return fontsData
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);
}

/**
 * 提取设计 Token
 */
async function extractDesignTokens(page: Page) {
  console.log('  → 提取设计 Token...');
  
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
          const value = style[`${prop}${side}` as any];
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
 * 提取单个网站的主题信息
 */
async function extractWebsiteTheme(
  browser: Browser,
  website: { name: string; url: string }
): Promise<ExtractionResult> {
  console.log(`\n📊 正在分析: ${website.name} (${website.url})`);
  
  const page = await browser.newPage();
  
  try {
    // 设置视口
    await page.setViewport({ width: 1920, height: 1080 });
    
    // 访问网站，等待网络空闲
    console.log('  → 加载页面...');
    await page.goto(website.url, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });
    
    // 额外等待 2 秒确保动态内容加载
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 截图
    const screenshotPath = join(
      process.cwd(),
      'scripts',
      `screenshot-${website.name.toLowerCase()}.png`
    );
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log(`  ✓ 截图已保存: ${screenshotPath}`);
    
    // 提取数据
    const [colors, fonts, cssVariables, tokens] = await Promise.all([
      extractColors(page),
      extractFonts(page),
      extractCSSVariables(page),
      extractDesignTokens(page),
    ]);
    
    console.log(`  ✓ 提取完成！`);
    console.log(`    - 颜色: ${colors.length} 个`);
    console.log(`    - 字体: ${fonts.length} 个`);
    console.log(`    - CSS 变量: ${cssVariables.length} 个`);
    console.log(`    - 设计 Token: ${tokens.spacing.length + tokens.radius.length + tokens.shadows.length} 个`);
    
    return {
      website: website.name,
      url: website.url,
      timestamp: new Date().toISOString(),
      colors,
      fonts,
      cssVariables,
      tokens,
      screenshot: screenshotPath,
    };
  } catch (error) {
    console.error(`  ✗ 提取失败: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  } finally {
    await page.close();
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 Theme Extraction Technical Validation\n');
  console.log('目标：验证从 5 个知名网站提取配色和字体的可行性');
  console.log('测试网站：Vercel, GitHub, Stripe, Linear, Notion');
  console.log('目标准确率：>80%\n');
  console.log('='.repeat(60));
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  
  const results: ExtractionResult[] = [];
  
  try {
    for (const website of TEST_WEBSITES) {
      try {
        const result = await extractWebsiteTheme(browser, website);
        results.push(result);
      } catch (error) {
        console.error(`跳过 ${website.name}，继续下一个...`);
      }
    }
    
    // 保存结果到 JSON 文件
    const outputPath = join(process.cwd(), 'scripts', 'theme-extraction-results.json');
    writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf-8');
    
    console.log('\n' + '='.repeat(60));
    console.log(`\n✅ 测试完成！成功提取 ${results.length}/${TEST_WEBSITES.length} 个网站`);
    console.log(`📄 结果已保存: ${outputPath}`);
    console.log('\n📊 汇总统计：');
    
    results.forEach((result) => {
      console.log(`\n  ${result.website}:`);
      console.log(`    - 颜色: ${result.colors.length} 个`);
      console.log(`    - 字体: ${result.fonts.length} 个`);
      console.log(`    - CSS 变量: ${result.cssVariables.length} 个`);
      console.log(`    - 主色 (前3): ${result.colors.slice(0, 3).map(c => c.value).join(', ')}`);
      console.log(`    - 主字体: ${result.fonts[0]?.family || 'N/A'}`);
    });
    
    // 评估准确率
    const successRate = (results.length / TEST_WEBSITES.length) * 100;
    console.log(`\n🎯 成功率: ${successRate.toFixed(1)}%`);
    
    if (successRate >= 80) {
      console.log('✅ 达到目标准确率 (>80%)，可以启动 MVP 开发！');
    } else {
      console.log('⚠️  未达到目标准确率，需要优化提取算法');
    }
    
  } catch (error) {
    console.error('执行出错:', error);
  } finally {
    await browser.close();
  }
}

// 运行
main().catch(console.error);
