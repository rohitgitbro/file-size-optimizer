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
  title: "OptiFile | Free Image Optimizer & Images to PDF Converter",
  description: "Free online tools to compress images and convert images to PDF. 100% private — all processing happens in your browser. No uploads, no data stored.",
  keywords: "image compressor, images to pdf, compress image online, convert jpg to pdf, png to pdf, reduce image size, photo optimizer",
  openGraph: {
    title: "OptiFile | Free Image Optimizer & Images to PDF Converter",
    description: "Free online tools — compress images and convert images to PDF. 100% private, runs in your browser.",
    type: "website",
    locale: "en_IN",
    siteName: "OptiFile",
  },
  robots: {
    index: true,
    follow: true,
  },
};

import { cookies } from 'next/headers';
import { PaletteMode } from '@mui/material';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Read the theme from the cookie — this tells the server exactly what theme to render.
  // This is the most robust way to avoid Dark Mode hydration mismatches in MUI.
  const cookieStore = await cookies();
  const initialMode = (cookieStore.get('theme-mode')?.value as PaletteMode) || 'light';

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <QueryProvider>
            <AppThemeProvider initialMode={initialMode}>
              {children}
            </AppThemeProvider>
          </QueryProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}

