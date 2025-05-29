/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com'],
  },
  i18n: {
    locales: ['ja'],
    defaultLocale: 'ja',
  },
  compiler: {
    styledComponents: true,
  },
}

module.exports = nextConfig 