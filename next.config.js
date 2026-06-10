/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['static.wikia.nocookie.net'],
  },
  // Отключаем обработку CSS через PostCSS
  webpack: (config) => {
    return config;
  },
}

module.exports = nextConfig