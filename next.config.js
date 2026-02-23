/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Required for Docker production builds
  basePath: '/piyabordee-shop',
  assetPrefix: '/piyabordee-shop',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

module.exports = nextConfig
