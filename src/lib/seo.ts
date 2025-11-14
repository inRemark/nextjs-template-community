
import type { Metadata } from 'next';
import type { Locale } from '@/i18n/config';
import { seoConfig } from '@/config/seo';

interface PageSeoMessages {
  title: string;
  description: string;
  keywords?: string;
}

interface LocalizedMetadataOptions {
  locale: Locale;
  page: string;
  messages: {
    seo?: {
      [key: string]: PageSeoMessages;
    };
  };
  path?: string;
}

/**
 * Generate localized metadata
 */
export function generateLocalizedMetadata({
  locale,
  page,
  messages,
  path = '',
}: LocalizedMetadataOptions): Metadata {
  const seoMessages = messages.seo?.[page];
  
  if (!seoMessages) {
    console.warn(`SEO messages not found for page: ${page}`);
    return {};
  }

  const { title, description, keywords } = seoMessages;
  const baseUrl = seoConfig.siteUrl;
  const currentUrl = `${baseUrl}/${locale}${path}`;

  // Generate hreflang links
  const languages = seoConfig.locales.reduce(
    (acc, lang) => {
      acc[lang] = `${baseUrl}/${lang}${path}`;
      return acc;
    },
    {} as Record<string, string>
  );

  return {
    title,
    description,
    keywords: keywords?.split(',').map((k) => k.trim()),
    
    // Canonical URL
    alternates: {
      canonical: currentUrl,
      languages: {
        ...languages,
        'x-default': `${baseUrl}/${seoConfig.defaultLocale}${path}`,
      },
    },

    // Open Graph
    openGraph: {
      title,
      description,
      url: currentUrl,
      locale,
      type: 'website',
      siteName: seoConfig.openGraph.siteName,
      images: seoConfig.openGraph.images.map((img) => ({
        ...img,
        url: `${baseUrl}${img.url}`,
      })),
    },

    // Twitter Card
    twitter: {
      card: seoConfig.twitter.card,
      title,
      description,
      site: seoConfig.twitter.site,
      creator: seoConfig.twitter.creator,
      images: seoConfig.openGraph.images.map((img) => `${baseUrl}${img.url}`),
    },

    // other metadata
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

/**
 * generate simple metadata without localization
 */
export function generateSimpleMetadata(
  title: string,
  description: string,
  locale: Locale
): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      locale,
      type: 'website',
    },
  };
}

/**
 * Page path configuration mapping, used to automatically infer page paths
 */
const PAGE_PATHS: Record<string, string> = {
  home: '',
  about: '/about',
  pricing: '/pricing',
  articles: '/articles',
  blog: '/blog',
  help: '/help',
};

/**
 * Create a page metadata generator (factory function)
 * Used to reduce duplicate code and unify SEO metadata generation logic
 *
 * @param pageName - The name of the page, which needs to correspond to seo[pageName] in the translation file
 * @param customPath - Custom path (optional), if not provided, it will be inferred from PAGE_PATHS
 * @returns generateMetadata function
 * 
 * @example
 * // use default path
 * export const generateMetadata = createPageMetadataGenerator('articles');
 * 
 * @example
 * // use custom path
 * export const generateMetadata = createPageMetadataGenerator('articles', '/articles');
 */
export function createPageMetadataGenerator(
  pageName: string,
  customPath?: string
) {
  const path = customPath ?? PAGE_PATHS[pageName] ?? `/${pageName}`;

  return async function generateMetadata({
    params,
  }: {
    params: Promise<{ locale: string }>;
  }): Promise<Metadata> {
    const { locale } = await params;
    const { getMessages } = await import('next-intl/server');
    const messages = await getMessages();

    return generateLocalizedMetadata({
      locale: locale as Locale,
      page: pageName,
      messages: messages as any,
      path,
    });
  };
}
