/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/proxy/:path*",
        destination: "http://4.224.186.213/evaluation-service/:path*",
      },
    ];
  },
};
module.exports = nextConfig;
