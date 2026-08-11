import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true, 
  poweredByHeader: false, 

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "://githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "*.codesandbox.io",
      },
    ],
  },

  experimental: {
    optimizePackageImports: ["@codesandbox/sandpack-react", "lucide-react", "zod"],
  },

  webpack: (config, { isServer, dev }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }

    if (!dev) {
      config.devtool = false;
    }

    return config;
  },
};

export default nextConfig;
