/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    deviceSizes: [420, 640, 750, 828, 1080],
    // domains: ["res.cloudinary.com"],
    // loader: "cloudinary",
    // path: "https://res.cloudinary.com/hajiudin/image/fetch/",
    imageSizes: [300, 400, 640],
    domains: ["v5.airtableusercontent.com"],
  },
};

module.exports = nextConfig;
