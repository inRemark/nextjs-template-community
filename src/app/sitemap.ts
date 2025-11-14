import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001';

  // 定义所有主要页面路由
  const routes = [
    '',
    '/about',
    '/about/privacy',
    '/about/terms',
    '/about/cookies',
    '/blog',
    '/help',
    '/pricing',
    '/articles',
    '/auth/login',
    '/auth/register',
  ];

  // 为每个语言生成所有路由的sitemap条目
  const sitemapEntries: MetadataRoute.Sitemap = [];

  routing.locales.forEach((locale) => {
    routes.forEach((route) => {
      const url = `${baseUrl}/${locale}${route}`;
      sitemapEntries.push({
        url,
        lastModified: new Date(),
        changeFrequency: route === '' ? 'weekly' : 'monthly',
        priority: route === '' ? 1 : 0.8,
        alternates: {
          languages: routing.locales.reduce(
            (acc, lang) => {
              acc[lang as 'zh' | 'en' | 'ja'] = `${baseUrl}/${lang}${route}`;
              return acc;
            },
            {} as Record<'zh' | 'en' | 'ja', string>
          ),
        },
      });
    });
  });

  return sitemapEntries;
}
