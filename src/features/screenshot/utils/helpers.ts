/**
 * Screenshot Helpers
 * 截图相关的工具函数（客户端安全）
 */

/**
 * 从 URL 提取网站名称
 */
export function extractWebsiteName(url: string): string {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    // 移除 www. 前缀
    return hostname.replace(/^www\./, '').split('.')[0];
  } catch {
    return 'unknown';
  }
}

/**
 * 生成文件名
 */
export function generateFilename(
  url: string,
  viewport: string,
  timestamp: string
): string {
  const websiteName = extractWebsiteName(url);
  const date = new Date(timestamp);
  const dateStr = date.toISOString().replace(/[:.]/g, '-').split('T')[0];
  const timeStr = date.toTimeString().split(' ')[0].replace(/:/g, '');
  
  return `${websiteName}_${viewport}_${dateStr}_${timeStr}.png`;
}
