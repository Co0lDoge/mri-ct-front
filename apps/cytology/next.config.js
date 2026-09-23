const { configureWebpack } = require('@medml/config/next');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@medml/ui',
    '@medml/store',
    '@medml/shared',
    '@medml/auth',
    '@medml/layout',
    '@medml/cytology-upload',
    '@medml/cytology_upload',
  ],
  
  webpack: (config, options) => {
    return configureWebpack(config, { ...options, appDir: __dirname });
  },
};

module.exports = nextConfig;


