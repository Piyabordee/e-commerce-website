/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Required for Docker production builds
  basePath: '/piyabordee-shop',
  assetPrefix: '/piyabordee-shop',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'via.placeholder.com' },
      { protocol: 'https', hostname: 'i.imgur.com' },
      { protocol: 'https', hostname: 'cdn.shopify.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
}

module.exports = nextConfig
