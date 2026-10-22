import withPWAInit, { runtimeCaching } from '@ducanh2912/next-pwa';

// Database-backed API responses must always come from the network. The default
// next-pwa rules cache same-origin GET /api requests for up to one day.
const runtimeCachingWithoutApi = runtimeCaching.filter(
  (entry) => entry.options?.cacheName !== 'apis'
);

const withPWA = withPWAInit({
  dest: 'public',
  // Admin pages and their action handlers must always use the newest bundle.
  cacheOnFrontEndNav: false,
  aggressiveFrontEndNavCaching: false,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === 'development', // Disable PWA in development for better dev experience
  workboxOptions: {
    disableDevLogs: true,
    runtimeCaching: runtimeCachingWithoutApi,
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {},
  images: {
    remotePatterns: [
      // Cloudinary - media storage untuk foto sepeda
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      // Domain eksternal lainnya yang digunakan di app
      {
        protocol: 'https',
        hostname: 'bikes.categories.city',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      // Umum untuk development / placeholder
      {
        protocol: 'https',
        hostname: '**',
        pathname: '/**',
      },
    ],
  },
};

export default withPWA(nextConfig);
