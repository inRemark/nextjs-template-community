/**
 * SEO configuration
 * Define the basic SEO settings and multilingual support for the website
 */

import type { Locale } from '@/i18n/config';

export const seoConfig = {
  // Default title
  defaultTitle: 'AiCoder',
  
  // Title template
  titleTemplate: '%s | AiCoder',
  
  // Default description
  defaultDescription: 'Professional AI-powered coding assistant platform',
  
  // Site URL
  siteUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://aicoder.com',
  
  // Supported locales
  locales: ['zh', 'en', 'ja'] as const,
  
  // Default locale
  defaultLocale: 'zh' as Locale,
  
  // Open Graph default configuration
  openGraph: {
    type: 'website',
    siteName: 'AiCoder',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AiCoder - AI Coding Assistant',
      },
    ],
  },
  
  // Twitter Card default configuration
  twitter: {
    card: 'summary_large_image',
    site: '@aicoder',
    creator: '@aicoder',
  },
} as const;
