/**
 * Screenshot Feature - Type Definitions
 * 截图功能的类型定义
 */

/**
 * 视口配置
 */
export interface ViewportConfig {
  name: 'desktop' | 'tablet' | 'mobile';
  width: number;
  height: number;
}

/**
 * 截图选项
 */
export interface ScreenshotOptions {
  fullPage: boolean; // 全页面截图
  viewports: ViewportConfig[]; // 视口列表
}

/**
 * 截图结果
 */
export interface ScreenshotResult {
  id: string; // 唯一 ID
  url: string; // 原始 URL
  viewport: string; // 视口类型
  screenshot: string; // Base64 图片数据
  width: number; // 实际宽度
  height: number; // 实际高度
  fileSize: number; // 文件大小（字节）
  timestamp: string; // 截图时间
  status: 'success' | 'failed';
  error?: string; // 错误信息
}

/**
 * 批量截图请求
 */
export interface BatchScreenshotRequest {
  urls: string[];
  options: ScreenshotOptions;
}

/**
 * 批量截图响应
 */
export interface BatchScreenshotResponse {
  id: string; // 批次 ID
  total: number; // 总数
  completed: number; // 已完成
  success: number; // 成功数
  failed: number; // 失败数
  results: ScreenshotResult[];
}

/**
 * 进度信息
 */
export interface ProgressInfo {
  current: number;
  total: number;
  percentage: number;
  currentUrl?: string;
  currentViewport?: string;
  success: number;
  failed: number;
  estimatedTime?: number; // 预计剩余时间（秒）
}

/**
 * 下载配置
 */
export interface DownloadConfig {
  selectedIds: string[]; // 选中的截图 ID
  format: 'zip' | 'single'; // 下载格式
  groupByWebsite: boolean; // 是否按网站分组
}
