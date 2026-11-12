import type { NextConfig } from "next";

// En-têtes de sécurité appliqués à toutes les réponses.
const securityHeaders = [
  // Force HTTPS pendant 1 an (le site doit être servi en HTTPS)
  { key: "Strict-Transport-Security", value: "max-age=31536000" },
  // Interdit l'affichage du site dans une iframe (anti-clickjacking)
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'" },
  // Empêche le navigateur de deviner le type des fichiers
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
];

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
