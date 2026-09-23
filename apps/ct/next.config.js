const { configureWebpack } = require('@medml/config/next');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Cornerstone viewport creation conflicts with double-mount
  transpilePackages: [
    "@medml/ct-mri-viewer",
    "@medml/ui",
    "@medml/layout",
    "@medml/store",
    "@medml/shared",
  ],
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Embedder-Policy', value: 'credentialless' },
        ],
      },
      {
        source: '/pacs/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=3600' },
        ],
      },
    ];
  },
  webpack: (config, options) => {
    const updatedConfig = configureWebpack(config, {
      ...options,
      appDir: __dirname,
    });

    updatedConfig.resolve = updatedConfig.resolve || {};
    updatedConfig.resolve.fallback = {
      ...(updatedConfig.resolve.fallback || {}),
      fs: false,
    };

    updatedConfig.experiments = {
      ...updatedConfig.experiments,
      asyncWebAssembly: true,
    };

    updatedConfig.module = updatedConfig.module || {};
    updatedConfig.module.rules = updatedConfig.module.rules || [];
    updatedConfig.module.rules.push({
      test: /\.wasm$/,
      type: "asset/resource",
    });

    return updatedConfig;
  },
};

module.exports = nextConfig;
