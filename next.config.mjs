/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "midas-touch-creation.s3.ap-south-1.amazonaws.com",
        pathname: "/**",
      },
    ],
  },
  experimental: {},
};

export default nextConfig;
