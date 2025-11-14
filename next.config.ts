import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  experimental: {
    reactCompiler: false,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  webpack: (config, { isServer }) => {
    // Add support for decorators
    config.module.rules.push({
      test: /.(tsx|ts)$/,
      issuerLayer: {
        not: ["builtin"]
      },
      use: {
        loader: "ts-loader",
        options: {
          transpileOnly: true,
          compilerOptions: {
            experimentalDecorators: true,
            emitDecoratorMetadata: true,
          },
        },
      },
    });

    // Polyfill Node.js modules for client-side if necessary
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        child_process: false,
        http: false,
        https: false,
        stream: false,
        zlib: false,
        crypto: false,
      };
    }

    return config;
  },
};

export default withNextIntl(nextConfig);