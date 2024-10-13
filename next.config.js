/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  webpack: (config) => {
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
    };
    config.resolve.fallback = { fs: false, net: false, tls: false };
    config.externals.push("pino-pretty", "lokijs", "encoding");
    //config.externals.push("encoding");
    // config.externals.push('pino-pretty');
    return config;
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
};
module.exports = nextConfig;
