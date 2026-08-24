import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // sharp doesn't run on Cloudflare Workers — route optimization
    // through Cloudflare's Image Resizing instead. See src/lib/utils/image-loader.ts.
    loader: "custom",
    loaderFile: "./src/lib/utils/image-loader.ts",
  },
};

export default nextConfig;
