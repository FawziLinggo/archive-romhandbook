import type {
  NextConfig
} from "next"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.galauit.com"
      },
      {
        protocol: "https",
        hostname: "cdn.discordapp.com"
      }
    ],

    unoptimized: true
  }
}

export default nextConfig