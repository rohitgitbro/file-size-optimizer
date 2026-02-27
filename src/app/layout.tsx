import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { AppThemeProvider } from "@/context/ThemeContext";
import { QueryProvider } from "@/context/QueryProvider";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#1a237e",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "GovFormTools | Free Image Optimizer & Images to PDF Converter",
  description: "Free online tools to compress images and convert images to PDF. 100% private — all processing happens in your browser. No uploads, no data stored.",
  keywords: "image compressor, images to pdf, compress image online, convert jpg to pdf, png to pdf, reduce image size, photo optimizer",
  openGraph: {
    title: "GovFormTools | Free Image Optimizer & Images to PDF Converter",
    description: "Free online tools — compress images and convert images to PDF. 100% private, runs in your browser.",
    type: "website",
    locale: "en_IN",
    siteName: "GovFormTools",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <QueryProvider>
            <AppThemeProvider>
              {children}
            </AppThemeProvider>
          </QueryProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}

