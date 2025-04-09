import withBundleAnalyzer from "@next/bundle-analyzer"
import withPlugins from "next-compose-plugins"
import { env } from "./env.mjs"

/**
 * @type {import('next').NextConfig}
 */
const config = withPlugins([[withBundleAnalyzer({ enabled: env.ANALYZE })]], {
  reactStrictMode: true,
  experimental: { instrumentationHook: false },
  rewrites() {
    return [
      { source: "/healthz", destination: "/api/health" },
      { source: "/api/healthz", destination: "/api/health" },
      { source: "/health", destination: "/api/health" },
      { source: "/ping", destination: "/api/health" },
    ]
  },
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "levents.asia",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
      },
      {
        protocol: "https",
        hostname: "scontent.fsgn2-11.fna.fbcdn.net",
      },
      {
        protocol: "https",
        hostname: "theme.hstatic.net",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
      },
      {
        protocol: "https",
        hostname: "down-vn.img.susercontent.com",
      },
      {
        protocol: "https",
        hostname: "asset.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
})

export default config
