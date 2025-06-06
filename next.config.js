/** @type {import('next').NextConfig} */
module.exports = {
  webpack: (config, { isServer }) => {
    // Handle fallbacks for modules that may not be available in certain environments
    config.resolve.fallback = { fs: false, path: false };

    // If targeting the server, add some debug information for better error handling
    if (isServer) {
      console.log('Configuring webpack for the server');
      console.log('Webpack config:', config);
    }

    return config;
  },
  eslint: {
    // Ignore ESLint during the build process to avoid build failures
    ignoreDuringBuilds: true,
  },
}
