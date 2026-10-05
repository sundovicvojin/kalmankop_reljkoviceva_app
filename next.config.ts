import type { NextConfig } from "next";

// Menja se na svakom build-u, pa se posle deploy-a zaobilazi kesirani overlay/tlocrt.
const assetVersion = Date.now().toString(36);

const revalidate = [{ key: "Cache-Control", value: "public, max-age=0, must-revalidate" }];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  env: {
    NEXT_PUBLIC_ASSET_VERSION: assetVersion,
  },
  async headers() {
    return ["overlays", "floorplans", "brochures"].map((folder) => ({
      source: `/${folder}/:path*`,
      headers: revalidate,
    }));
  },
};

export default nextConfig;
