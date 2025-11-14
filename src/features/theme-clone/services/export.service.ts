/**
 * Theme Export Service
 * 主题导出服务 - 生成各种框架的配置代码
 */

import type {
  ThemeExtractionResult,
  ExportFormat,
  ExportResult,
} from '../types';

/**
 * RGB 转 HEX
 */
function rgbToHex(rgb: string): string {
  const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  if (!match) return rgb;

  const [, r, g, b] = match;
  return `#${[r, g, b]
    .map((x) => {
      const hex = parseInt(x).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    })
    .join('')}`;
}

/**
 * 生成 Tailwind CSS 配置
 */
function generateTailwindConfig(result: ThemeExtractionResult): string {
  const colors = result.colors.slice(0, 8);
  const fonts = result.fonts.slice(0, 3);

  const colorConfig = colors
    .map((color, index) => {
      const hex = rgbToHex(color.value);
      const name = color.semantic || `color-${index + 1}`;
      return `        '${name}': '${hex}',`;
    })
    .join('\n');

  const fontConfig = fonts
    .map((font) => {
      const family = font.family.split(',')[0].replace(/['"]/g, '');
      return `'${family}'`;
    })
    .join(', ');

  return `// Tailwind CSS Configuration
// Generated from: ${result.url}
// Date: ${new Date(result.timestamp).toLocaleString()}

export default {
  theme: {
    extend: {
      colors: {
${colorConfig}
      },
      fontFamily: {
        sans: [${fontConfig}, 'sans-serif'],
      },
      spacing: {
        // Top ${result.tokens.spacing.length} spacing values
${result.tokens.spacing
  .map((s, i) => `        '${i + 1}': '${s.value}',`)
  .join('\n')}
      },
      borderRadius: {
        // Top ${result.tokens.radius.length} radius values
${result.tokens.radius
  .map((r, i) => `        '${i + 1}': '${r.value}',`)
  .join('\n')}
      },
    },
  },
  plugins: [],
};
`;
}

/**
 * 生成 CSS 变量
 */
function generateCSSVariables(result: ThemeExtractionResult): string {
  const colors = result.colors.slice(0, 8);
  const fonts = result.fonts.slice(0, 3);

  const colorVars = colors
    .map((color, index) => {
      const hex = rgbToHex(color.value);
      const name = color.semantic || `color-${index + 1}`;
      return `  --${name}: ${hex};`;
    })
    .join('\n');

  const fontVars = fonts
    .map((font, index) => {
      const family = font.family;
      return `  --font-${index === 0 ? 'primary' : index === 1 ? 'secondary' : 'tertiary'}: ${family};`;
    })
    .join('\n');

  return `/* CSS Variables */
/* Generated from: ${result.url} */
/* Date: ${new Date(result.timestamp).toLocaleString()} */

:root {
  /* Colors */
${colorVars}

  /* Fonts */
${fontVars}

  /* Spacing */
${result.tokens.spacing
  .slice(0, 5)
  .map((s, i) => `  --spacing-${i + 1}: ${s.value};`)
  .join('\n')}

  /* Border Radius */
${result.tokens.radius
  .slice(0, 5)
  .map((r, i) => `  --radius-${i + 1}: ${r.value};`)
  .join('\n')}

  /* Box Shadow */
${result.tokens.shadows
  .slice(0, 3)
  .map((s, i) => `  --shadow-${i + 1}: ${s.value};`)
  .join('\n')}
}
`;
}

/**
 * 生成 MUI 主题配置
 */
function generateMUITheme(result: ThemeExtractionResult): string {
  const colors = result.colors.slice(0, 8);
  const primaryColor = rgbToHex(colors[0]?.value || '#1976d2');
  const secondaryColor = rgbToHex(colors[1]?.value || '#dc004e');

  return `// Material-UI Theme Configuration
// Generated from: ${result.url}
// Date: ${new Date(result.timestamp).toLocaleString()}

import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '${primaryColor}',
    },
    secondary: {
      main: '${secondaryColor}',
    },
  },
  typography: {
    fontFamily: ${result.fonts[0]?.family || "'Roboto', 'Helvetica', 'Arial', sans-serif'"},
  },
  spacing: ${result.tokens.spacing[0]?.value.replace('px', '') || '8'},
  shape: {
    borderRadius: ${result.tokens.radius[0]?.value.replace('px', '') || '4'},
  },
});
`;
}

/**
 * 生成 JSON Token
 */
function generateJSONToken(result: ThemeExtractionResult): string {
  return JSON.stringify(
    {
      meta: {
        url: result.url,
        timestamp: result.timestamp,
        id: result.id,
      },
      colors: result.colors.slice(0, 10).map((c) => ({
        name: c.semantic || `color-${c.type}`,
        value: rgbToHex(c.value),
        type: c.type,
        usage: c.count,
      })),
      fonts: result.fonts.slice(0, 5).map((f) => ({
        family: f.family,
        size: f.size,
        weight: f.weight,
        lineHeight: f.lineHeight,
        usage: f.count,
      })),
      tokens: {
        spacing: result.tokens.spacing.slice(0, 10),
        radius: result.tokens.radius.slice(0, 10),
        shadows: result.tokens.shadows.slice(0, 5),
      },
    },
    null,
    2
  );
}

/**
 * 生成 SCSS 变量
 */
function generateSCSS(result: ThemeExtractionResult): string {
  const colors = result.colors.slice(0, 8);

  const colorVars = colors
    .map((color, index) => {
      const hex = rgbToHex(color.value);
      const name = color.semantic || `color-${index + 1}`;
      return `$${name}: ${hex};`;
    })
    .join('\n');

  return `// SCSS Variables
// Generated from: ${result.url}
// Date: ${new Date(result.timestamp).toLocaleString()}

// Colors
${colorVars}

// Fonts
$font-primary: ${result.fonts[0]?.family || 'sans-serif'};
$font-secondary: ${result.fonts[1]?.family || 'sans-serif'};

// Spacing
${result.tokens.spacing
  .slice(0, 5)
  .map((s, i) => `$spacing-${i + 1}: ${s.value};`)
  .join('\n')}

// Border Radius
${result.tokens.radius
  .slice(0, 5)
  .map((r, i) => `$radius-${i + 1}: ${r.value};`)
  .join('\n')}
`;
}

/**
 * 导出主题配置
 */
export function exportTheme(
  result: ThemeExtractionResult,
  format: ExportFormat
): ExportResult {
  const generators: Record<
    ExportFormat,
    { fn: (r: ThemeExtractionResult) => string; filename: string }
  > = {
    tailwind: {
      fn: generateTailwindConfig,
      filename: 'tailwind.config.ts',
    },
    css: {
      fn: generateCSSVariables,
      filename: 'theme-variables.css',
    },
    mui: {
      fn: generateMUITheme,
      filename: 'theme.ts',
    },
    json: {
      fn: generateJSONToken,
      filename: 'design-tokens.json',
    },
    scss: {
      fn: generateSCSS,
      filename: 'theme-variables.scss',
    },
  };

  const generator = generators[format];
  if (!generator) {
    throw new Error(`Unsupported export format: ${format}`);
  }

  return {
    format,
    code: generator.fn(result),
    filename: generator.filename,
  };
}
