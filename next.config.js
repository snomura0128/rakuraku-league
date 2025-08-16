/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure for Cloudflare Pages
  trailingSlash: false,
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig