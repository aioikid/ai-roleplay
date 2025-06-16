/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: false,
  experimental: {
    turbo: {
      enabled: true
    }
  },
  compiler: {
    // これで完全にSWCを無効化（Babelに戻す）
    legacyBabel: true
  }
}

module.exports = nextConfig
