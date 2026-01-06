/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";
const publicApiUrl = process.env.NEXT_PUBLIC_API_URL || "";

if (isProd && !publicApiUrl) {
  throw new Error("NEXT_PUBLIC_API_URL is required in production.");
}

if (isProd && !publicApiUrl.startsWith("https://")) {
  throw new Error("NEXT_PUBLIC_API_URL must start with https:// in production.");
}

const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    const backend = (publicApiUrl || process.env.BACKEND_URL || "http://localhost:3000").replace(/\/$/, "");
    return [
      { source: "/api/:path*", destination: `${backend}/api/:path*` },
      { source: "/uploads/:path*", destination: `${backend}/uploads/:path*` },
      { source: "/downloads/:path*", destination: `${backend}/downloads/:path*` },
    ];
  },
};

module.exports = nextConfig;
