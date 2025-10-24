import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,

  // ✅ Tambahkan ini agar Next.js bisa load gambar dari Supabase Storage
  images: {
    domains: [
      // Ganti ini dengan domain project Supabase kamu
      "zwlnyfpxtnfcrcbnxtmh.supabase.co",
    ],
  },
};

export default nextConfig;
