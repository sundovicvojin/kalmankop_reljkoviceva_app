import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "./globals.css";

const siteTitle = "KALMAN KOP - Reljkoviceva 59";
const description = "Premium interaktivni birac stanova za objekat Reljkoviceva 59.";

function metadataBase() {
  const fallback = "https://reljkoviceva59.kalmankop.rs";
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return new URL(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`);
  }
  return new URL(fallback);
}

export const metadata: Metadata = {
  metadataBase: metadataBase(),
  title: siteTitle,
  description,
  icons: {
    icon: [{ url: "/brand/kalman-logo-placeholder.svg", type: "image/svg+xml" }],
    shortcut: ["/brand/kalman-logo-placeholder.svg"],
    apple: [{ url: "/brand/kalman-logo-placeholder.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    title: siteTitle,
    description,
    type: "website",
    images: [{ url: "/og.svg", width: 1200, height: 630, alt: siteTitle }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description,
    images: ["/og.svg"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#080806",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html lang="sr">
      <body data-nonce={nonce}>{children}</body>
    </html>
  );
}
