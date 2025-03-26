/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Ensure compatibility with older browsers
  transpilePackages: [
    // Add any packages that need transpilation for Safari 10
  ],
  // Polyfill support for older browsers
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Client-side polyfills if needed
      config.resolve.fallback = {
        ...config.resolve.fallback,
      };
    }
    return config;
  }
};

module.exports = nextConfig;