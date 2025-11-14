/**
 * Theme Clone Feature - Type Definitions
 * 主题克隆功能的类型定义
 */

/**
 * 颜色信息
 */
export interface ColorInfo {
  value: string; // RGB/HEX 值
  count: number; // 使用次数
  type: 'color' | 'backgroundColor' | 'borderColor';
  semantic?: 'primary' | 'secondary' | 'background' | 'text' | 'accent'; // 语义分类
}

/**
 * 字体信息
 */
export interface FontInfo {
  family: string; // 字体族
  size: string; // 字号
  weight: string; // 字重
  lineHeight: string; // 行高
  count: number; // 使用次数
  source?: 'google' | 'system' | 'custom'; // 字体来源
}

/**
 * CSS 变量
 */
export interface CSSVariable {
  name: string; // 变量名（如 --primary-color）
  value: string; // 变量值
}

/**
 * 设计 Token
 */
export interface DesignToken {
  spacing: Array<{ value: string; count: number }>; // 间距
  radius: Array<{ value: string; count: number }>; // 圆角
  shadows: Array<{ value: string; count: number }>; // 阴影
}

/**
 * 提取选项
 */
export interface ExtractOptions {
  screenshot?: boolean; // 是否生成截图
  darkMode?: boolean; // 是否检测暗黑模式
  viewport?: 'mobile' | 'tablet' | 'desktop'; // 视口尺寸
  fullPage?: boolean; // 是否全页面截图
}

/**
 * 提取结果
 */
export interface ThemeExtractionResult {
  id: string; // 唯一 ID
  url: string; // 目标网址
  timestamp: string; // 提取时间
  colors: ColorInfo[]; // 颜色列表
  fonts: FontInfo[]; // 字体列表
  cssVariables: CSSVariable[]; // CSS 变量
  tokens: DesignToken; // 设计 Token
  screenshot?: string; // 截图 URL
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string; // 错误信息
}

/**
 * 导出格式
 */
export type ExportFormat = 'tailwind' | 'mui' | 'css' | 'json' | 'scss';

/**
 * 导出结果
 */
export interface ExportResult {
  format: ExportFormat;
  code: string; // 生成的代码
  filename: string; // 文件名
}

/**
 * 提取请求
 */
export interface ExtractRequest {
  url: string;
  options?: ExtractOptions;
}

/**
 * 导出请求
 */
export interface ExportRequest {
  extractionId: string;
  format: ExportFormat;
}
