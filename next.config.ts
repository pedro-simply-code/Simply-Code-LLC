import type { NextConfig } from "next";
import "./src/env.js";

const isProduction = process.env.NODE_ENV === "production";

/**
 * Content Security Policy.
 *
 * Ships as `Content-Security-Policy-Report-Only` so violations are reported
 * (see `/api/csp-report`) without breaking the site during rollout. Once the
 * report stream is clean, rename the header to `Content-Security-Policy` to
 * enforce it. A nonce-based policy requires dynamic rendering; this app keeps
 * marketing pages static, so inline scripts/styles are allowed for now.
 */
function buildCsp() {
  const connectSrc = isProduction
    ? "connect-src 'self' https://utfs.io https://*.utfs.io https://*.ufs.sh https://*.uploadthing.com https://vitals.vercel-insights.com"
    : // Local dev uses HMR over websockets.
      "connect-src 'self' ws: wss: https://utfs.io https://*.utfs.io https://*.ufs.sh https://*.uploadthing.com";

  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${isProduction ? "" : " 'unsafe-eval'"} https://va.vercel-scripts.com`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://utfs.io https://*.utfs.io https://*.ufs.sh https://*.uploadthing.com https://lh3.googleusercontent.com",
    "font-src 'self' data:",
    "media-src 'self' https://utfs.io https://*.utfs.io https://*.ufs.sh https://*.uploadthing.com",
    connectSrc,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "frame-src 'none'",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    "report-uri /api/csp-report",
    "upgrade-insecure-requests",
  ].join("; ");
}

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
  { key: "Content-Security-Policy-Report-Only", value: buildCsp() },
  ...(isProduction
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]
    : []),
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "8mb",
    },
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "utfs.io" },
      { protocol: "https", hostname: "*.utfs.io" },
      { protocol: "https", hostname: "*.ufs.sh" },
      { protocol: "https", hostname: "*.uploadthing.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
};

export default nextConfig;
