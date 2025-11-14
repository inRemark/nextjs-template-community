/**
 * 简化版主题提取测试 - 单个网站
 */

import puppeteer from 'puppeteer';
import { writeFileSync } from 'fs';

async function main() {
  // eslint-disable-next-line no-console
  console.log('🚀 启动简化版主题提取测试\n');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
    ],
  });
  
  const page = await browser.newPage();
  
  try {
    await page.setViewport({ width: 1920, height: 1080 });
    
    // eslint-disable-next-line no-console
    console.log('访问 https://vercel.com...');
    await page.goto('https://vercel.com', {
      waitUntil: 'domcontentloaded',
      timeout: 15000,
    });
    
    // eslint-disable-next-line no-console
    console.log('等待页面加载...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // eslint-disable-next-line no-console
    console.log('提取颜色...');
    const colors = await page.evaluate(() => {
      const colorMap = new Map<string, number>();
      const elements = document.querySelectorAll('*');
      
      elements.forEach((el) => {
        const style = window.getComputedStyle(el);
        const color = style.color;
        const bgColor = style.backgroundColor;
        
        if (color && color !== 'rgba(0, 0, 0, 0)') {
          colorMap.set(color, (colorMap.get(color) || 0) + 1);
        }
        if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
          colorMap.set(bgColor, (colorMap.get(bgColor) || 0) + 1);
        }
      });
      
      return Array.from(colorMap.entries())
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    });
    
    // eslint-disable-next-line no-console
    console.log('提取字体...');
    const fonts = await page.evaluate(() => {
      const fontMap = new Map<string, number>();
      const elements = document.querySelectorAll('*');
      
      elements.forEach((el) => {
        const style = window.getComputedStyle(el);
        const fontFamily = style.fontFamily;
        
        if (fontFamily) {
          fontMap.set(fontFamily, (fontMap.get(fontFamily) || 0) + 1);
        }
      });
      
      return Array.from(fontMap.entries())
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
    });
    
    // eslint-disable-next-line no-console
    console.log('提取 CSS 变量...');
    const cssVars = await page.evaluate(() => {
      const root = document.documentElement;
      const styles = getComputedStyle(root);
      const vars: Array<{ name: string; value: string }> = [];
      
      for (let i = 0; i < styles.length; i++) {
        const prop = styles[i];
        if (prop.startsWith('--')) {
          vars.push({
            name: prop,
            value: styles.getPropertyValue(prop).trim(),
          });
        }
      }
      
      return vars;
    });
    
    const result = {
      website: 'Vercel',
      url: 'https://vercel.com',
      timestamp: new Date().toISOString(),
      colors,
      fonts,
      cssVariables: cssVars,
    };
    
    // eslint-disable-next-line no-console
    console.log('\n✅ 提取完成！');
    // eslint-disable-next-line no-console
    console.log(`颜色数量: ${colors.length}`);
    // eslint-disable-next-line no-console
    console.log(`字体数量: ${fonts.length}`);
    // eslint-disable-next-line no-console
    console.log(`CSS 变量数量: ${cssVars.length}`);
    
    // eslint-disable-next-line no-console
    console.log('\n前 5 个颜色:');
    colors.slice(0, 5).forEach((c, i) => {
      // eslint-disable-next-line no-console
      console.log(`  ${i + 1}. ${c.value} (使用 ${c.count} 次)`);
    });
    
    // eslint-disable-next-line no-console
    console.log('\n前 3 个字体:');
    fonts.slice(0, 3).forEach((f, i) => {
      // eslint-disable-next-line no-console
      console.log(`  ${i + 1}. ${f.value} (使用 ${f.count} 次)`);
    });
    
    if (cssVars.length > 0) {
      // eslint-disable-next-line no-console
      console.log('\nCSS 变量示例:');
      cssVars.slice(0, 5).forEach((v) => {
        // eslint-disable-next-line no-console
        console.log(`  ${v.name}: ${v.value}`);
      });
    }
    
    // 保存结果
    const outputPath = process.cwd() + '/scripts/simple-test-result.json';
    writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf-8');
    // eslint-disable-next-line no-console
    console.log(`\n📄 结果已保存到: ${outputPath}`);
    
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('错误:', error);
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
