/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: false,  // ← SWCバイナリエラー回避策
  experimental: {
    turbo: {
      enabled: true
    }
  }
}

module.exports = nextConfig
