/** @type {import('next').NextConfig} */
const nextConfig = {
  // Privacy-first configuration
  experimental: {
    // Disable telemetry and analytics
    telemetry: false,
    // Enable privacy-focused features
    serverComponentsExternalPackages: ['crypto-js', 'kyber-crystals'],
  },

  // Security headers for privacy protection
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline' fonts.googleapis.com; font-src 'self' fonts.gstatic.com; img-src 'self' data:; connect-src 'self';",
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'X-Privacy-Policy',
            value: 'GDPR-Plus-Compliant',
          },
          {
            key: 'X-Data-Purge',
            value: '15-seconds',
          },
        ],
      },
    ];
  },

  // Disable analytics and tracking
  analytics: false,
  
  // Webpack configuration for privacy and security
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Add privacy-focused plugins
    config.plugins.push(
      new webpack.DefinePlugin({
        'process.env.PRIVACY_MODE': JSON.stringify('strict'),
        'process.env.DATA_RETENTION': JSON.stringify('false'),
        'process.env.TRACKING_DISABLED': JSON.stringify('true'),
        'process.env.NEURODIVERSITY_OPTIMIZATION': JSON.stringify('true'),
      })
    );

    // Optimize for neurodiversity
    config.resolve.alias = {
      ...config.resolve.alias,
      '@/components': './components',
      '@/templates': './templates',
      '@/privacy': './privacy',
      '@/accessibility': './accessibility',
    };

    return config;
  },

  // Environment variables
  env: {
    PRIVACY_MODE: 'strict',
    DATA_PURGE_INTERVAL: '15',
    QUANTUM_ENCRYPTION: 'enabled',
    NEURODIVERSITY_OPTIMIZATION: 'true',
    GDPR_PLUS_COMPLIANCE: 'enabled',
  },

  // Image optimization with privacy focus
  images: {
    // Disable external image optimization to prevent data leakage
    unoptimized: true,
    // Local image domains only
    domains: [],
  },

  // Disable server-side analytics
  serverRuntimeConfig: {
    // Private runtime config (server-side only)
    analytics: false,
    tracking: false,
  },

  publicRuntimeConfig: {
    // Public runtime config (client-side)
    privacyMode: 'strict',
    neurodiversityOptimization: true,
  },

  // Optimize for accessibility and neurodiversity
  sassOptions: {
    includePaths: ['./styles'],
    prependData: `
      $adhd-friendly: true;
      $dyslexia-optimized: true;
      $asd-structured: true;
      $high-contrast: true;
      $reduced-motion: true;
    `,
  },

  // Disable unnecessary features for privacy
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  generateEtags: false,

  // Custom redirects for privacy
  async redirects() {
    return [
      {
        source: '/analytics/:path*',
        destination: '/privacy/blocked',
        permanent: true,
      },
      {
        source: '/tracking/:path*',
        destination: '/privacy/blocked',
        permanent: true,
      },
    ];
  },

  // Output configuration
  output: 'standalone',
  
  // Disable source maps in production for privacy
  productionBrowserSourceMaps: false,

  // Custom build configuration
  distDir: '.next',
  
  // Optimize for Cloud Run deployment
  trailingSlash: false,
  
  // Disable X-Powered-By header
  poweredByHeader: false,
};

module.exports = nextConfig;