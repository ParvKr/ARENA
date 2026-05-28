import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* * FIXED: Moved out of 'experimental' and renamed per the framework specification upgrade guidelines.
   * This ensures external node binary handshakes wrap smoothly on the server side.
   */
  serverExternalPackages: ['@supabase/ssr'],

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;