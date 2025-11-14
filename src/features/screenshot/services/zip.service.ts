/**
 * ZIP Service
 * ZIP 打包服务
 */

import JSZip from 'jszip';
import type { ScreenshotResult } from '../types';
import { extractWebsiteName, generateFilename } from '../utils/helpers';

/**
 * 将 Base64 转换为 Blob
 */
function base64ToBlob(base64: string): Blob {
  const parts = base64.split(';base64,');
  const contentType = parts[0].split(':')[1];
  const raw = window.atob(parts[1]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);

  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }

  return new Blob([uInt8Array], { type: contentType });
}

/**
 * 创建 manifest.json
 */
function createManifest(screenshots: ScreenshotResult[]): string {
  const manifest = {
    created_at: new Date().toISOString(),
    total_screenshots: screenshots.length,
    screenshots: screenshots.map((s) => ({
      url: s.url,
      viewport: s.viewport,
      resolution: `${s.width}x${s.height}`,
      filename: generateFilename(s.url, s.viewport, s.timestamp),
      size: s.fileSize,
      status: s.status,
    })),
  };

  return JSON.stringify(manifest, null, 2);
}

/**
 * 打包截图为 ZIP
 */
export async function packScreenshotsToZip(
  screenshots: ScreenshotResult[],
  groupByWebsite = true
): Promise<Blob> {
  const zip = new JSZip();

  // 添加 manifest.json
  zip.file('manifest.json', createManifest(screenshots));

  // 按网站分组
  if (groupByWebsite) {
    const grouped = screenshots.reduce((acc, screenshot) => {
      const websiteName = extractWebsiteName(screenshot.url);
      if (!acc[websiteName]) {
        acc[websiteName] = [];
      }
      acc[websiteName].push(screenshot);
      return acc;
    }, {} as Record<string, ScreenshotResult[]>);

    // 为每个网站创建文件夹
    Object.entries(grouped).forEach(([websiteName, items]) => {
      const folder = zip.folder(websiteName);
      if (folder) {
        items.forEach((item) => {
          if (item.status === 'success' && item.screenshot) {
            const filename = `${item.viewport}.png`;
            const blob = base64ToBlob(item.screenshot);
            folder.file(filename, blob);
          }
        });
      }
    });
  } else {
    // 不分组，直接放在根目录
    screenshots.forEach((screenshot) => {
      if (screenshot.status === 'success' && screenshot.screenshot) {
        const filename = generateFilename(
          screenshot.url,
          screenshot.viewport,
          screenshot.timestamp
        );
        const blob = base64ToBlob(screenshot.screenshot);
        zip.file(filename, blob);
      }
    });
  }

  // 生成 ZIP
  return await zip.generateAsync({ type: 'blob' });
}

/**
 * 下载 ZIP 文件
 */
export function downloadZip(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 下载单张图片
 */
export function downloadSingleImage(
  base64: string,
  filename: string
): void {
  const link = document.createElement('a');
  link.href = base64;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
