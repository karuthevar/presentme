/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["pdf-parse", "mammoth"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

module.exports = nextConfig;
