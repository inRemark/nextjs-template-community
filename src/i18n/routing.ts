import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['zh', 'en', 'ja'],
  defaultLocale: 'zh',
  localePrefix: 'always', // URL always includes locale prefix
});

export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);
