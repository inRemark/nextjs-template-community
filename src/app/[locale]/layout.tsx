import { Inter } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { AuthProviders } from '@features/auth/components/auth-providers';
import { BreakpointProvider } from '@shared/theme/breakpoint-provider';
import { ReactQueryProvider } from '@/lib/react-query';
import { ThemeProvider } from '@shared/theme/context';

const inter = Inter({ subsets: ['latin'] });

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // 验证 locale
  if (!routing.locales.includes(locale as 'zh' | 'en' | 'ja')) {
    notFound();
  }

  // 获取翻译消息
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme') || 'system';
                const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                const shouldBeDark = theme === 'dark' || (theme === 'system' && isSystemDark);
                window.__THEME_PREFERENCE__ = { theme, shouldBeDark };
                document.documentElement.classList.toggle('dark', shouldBeDark);
              } catch (e) {
                const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                window.__THEME_PREFERENCE__ = { theme: 'system', shouldBeDark: isSystemDark };
                document.documentElement.classList.toggle('dark', isSystemDark);
              }
            `,
          }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            <ReactQueryProvider>
              <BreakpointProvider>
                  <AuthProviders>{children}</AuthProviders>
              </BreakpointProvider>
            </ReactQueryProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
