/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  devIndicators: {
    appIsrStatus: false,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        pathname: '/api/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://picsum.photos https://images.unsplash.com https://ui-avatars.com; connect-src 'self' http://127.0.0.1:9000 http://localhost:9000 http://localhost:8080 http://kyd-gateway:8080 https://*; font-src 'self' data:; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self';"
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), microphone=(), camera=(), payment=(), usb=()'
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          }
        ]
      }
    ]
  },
  async rewrites() {
    // Inside Docker, we want the internal service name. Outside, we want localhost.
    const gateway = process.env.GATEWAY_INTERNAL_URL || process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:9000';
    console.log('[Next.js Config] GATEWAY URL:', gateway);
    
    return [
      {
        source: '/api/v1/:path*',
        destination: `${gateway}/api/v1/:path*`,
      },
      {
        source: '/api/:path*',
        destination: `${gateway}/api/:path*`,
      },
    ]
  }
}

export default nextConfig
