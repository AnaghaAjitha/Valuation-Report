/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['tesseract.js', 'tesseract.js-core'],
  },
};

module.exports = nextConfig;
