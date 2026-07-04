import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: ".next-build",
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-pg", "pg", "pdfkit"],
};

export default nextConfig;
