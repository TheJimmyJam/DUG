import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeScript } from "@/components/theme-script";
import { ToastProvider } from "@/components/toast";

export const metadata: Metadata = {
  title: {
    default: "DUG — Decentralized Underwriting Group",
    template: "%s · DUG",
  },
  description:
    "A consulting marketplace for independent underwriters. Build a portfolio, earn credibility, find work — on your terms.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ),
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: "DUG — Decentralized Underwriting Group",
    description:
      "A consulting marketplace for independent underwriters. Think GitHub × Reddit × Uber, built for risk experts.",
    type: "website",
    images: [
      {
        url: "/brand/og.png",
        width: 1640,
        height: 500,
        alt: "DUG — Decentralized Underwriting Group",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DUG — Decentralized Underwriting Group",
    description:
      "A consulting marketplace for independent underwriters.",
    images: ["/brand/og.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0D1F3D" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0e1a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
