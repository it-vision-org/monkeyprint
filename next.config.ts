import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ['@imgly/background-removal'],
  webpack: (config) => {
    // Required for @imgly/background-removal ONNX/WASM support
    config.resolve.alias = {
      ...config.resolve.alias,
      'sharp$': false,
      'onnxruntime-node$': false,
    };
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'pub-a54043a6fb8443aaa3cf47aa98675227.r2.dev',
      },
      {
        protocol: 'https',
        hostname: '*.aiquickdraw.com',
      },
      {
        protocol: 'https',
        hostname: '*.kie.ai',
      },
    ],
  },
  outputFileTracingRoot: path.resolve(process.cwd()),
};

export default nextConfig;
