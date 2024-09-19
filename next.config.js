/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ["@lifi/widget"],
  webpack: (config) => {
    config.experiments = { ...config.experiments, topLevelAwait: true };
    config.resolve.fallback = { fs: false, net: false, tls: false };
    config.externals.push("pino-pretty", "lokijs", "encoding");
    // config.externals.push('pino-pretty');
    return config;
  },
};
module.exports = nextConfig;
