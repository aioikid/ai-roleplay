/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Netlify & Bolt 共通で安定
  reactStrictMode: true
}
export default nextConfig;